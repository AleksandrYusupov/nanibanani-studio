import io
import logging
import traceback
import uuid
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from PIL import Image
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models import Conversation, Message, Attachment
from app.schemas.message import MessageResponse, SendMessageResponse
from app.services.gemini import generate_image, ImagePart, TextPart
from app.services.storage import storage_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/conversations/{conversation_id}/messages", tags=["messages"])


@router.get("", response_model=list[MessageResponse])
async def list_messages(
    conversation_id: uuid.UUID, db: AsyncSession = Depends(get_db)
):
    conv = await db.get(Conversation, conversation_id)
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    result = await db.execute(
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .options(selectinload(Message.attachments))
        .order_by(Message.created_at)
    )
    return result.scalars().all()


@router.post("", response_model=SendMessageResponse)
async def send_message(
    conversation_id: uuid.UUID,
    text: str = Form(""),
    model: Optional[str] = Form(None),
    quality: str = Form("1K"),
    aspect_ratio: str = Form("1:1"),
    thinking_mode: Optional[str] = Form(None),
    files: list[UploadFile] = File(default=[]),
    db: AsyncSession = Depends(get_db),
):
    conv = await db.get(Conversation, conversation_id)
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    # Use model from request, or fall back to conversation default
    model_key = model or conv.model

    if not text.strip() and not files:
        raise HTTPException(status_code=400, detail="Message must have text or files")

    # 1. Create user message
    user_msg = Message(
        conversation_id=conversation_id,
        role="user",
        text_content=text.strip() if text.strip() else None,
    )
    db.add(user_msg)
    await db.flush()

    # 2. Upload user files to storage and create attachments
    input_images: list[bytes] = []
    for file in files:
        file_data = await file.read()
        gcs_path = f"uploads/{conversation_id}/{user_msg.id}/{file.filename}"
        await storage_service.upload_file(file_data, gcs_path, file.content_type or "application/octet-stream")

        # Get image dimensions if it's an image
        width, height = None, None
        if file.content_type and file.content_type.startswith("image/"):
            try:
                img = Image.open(io.BytesIO(file_data))
                width, height = img.size
            except Exception:
                pass
            input_images.append(file_data)

        attachment = Attachment(
            message_id=user_msg.id,
            type="upload",
            mime_type=file.content_type or "application/octet-stream",
            filename=file.filename or "unnamed",
            gcs_path=gcs_path,
            size_bytes=len(file_data),
            width=width,
            height=height,
        )
        db.add(attachment)

    # 3. Call Gemini API
    prompt = text.strip() or "Generate an image"
    try:
        results, gen_time_ms = await generate_image(
            prompt=prompt,
            model_key=model_key,
            quality=quality,
            aspect_ratio=aspect_ratio,
            thinking_mode=thinking_mode,
            input_images=input_images if input_images else None,
        )
    except Exception as e:
        logger.error(f"Generation failed: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}")

    # 4. Create assistant message
    response_text_parts = []
    for part in results:
        if isinstance(part, TextPart):
            response_text_parts.append(part.text)

    assistant_msg = Message(
        conversation_id=conversation_id,
        role="assistant",
        text_content="\n".join(response_text_parts) if response_text_parts else None,
        model_used=model_key,
        quality=quality,
        aspect_ratio=aspect_ratio,
        thinking_mode=thinking_mode,
        generation_time_ms=gen_time_ms,
    )
    db.add(assistant_msg)
    await db.flush()

    # 5. Save generated images
    img_counter = 0
    for part in results:
        if isinstance(part, ImagePart):
            ext = "png" if "png" in part.mime_type else "jpeg"
            filename = f"generated_{img_counter}.{ext}"
            gcs_path = f"generated/{conversation_id}/{assistant_msg.id}/{filename}"
            await storage_service.upload_file(part.data, gcs_path, part.mime_type)

            width, height = None, None
            try:
                img = Image.open(io.BytesIO(part.data))
                width, height = img.size
            except Exception:
                pass

            attachment = Attachment(
                message_id=assistant_msg.id,
                type="generated",
                mime_type=part.mime_type,
                filename=filename,
                gcs_path=gcs_path,
                size_bytes=len(part.data),
                width=width,
                height=height,
            )
            db.add(attachment)
            img_counter += 1

    # 6. Update conversation title from first message
    if conv.title == "New Chat" and text.strip():
        conv.title = text.strip()[:100]

    await db.commit()

    # Reload with attachments
    user_result = await db.execute(
        select(Message)
        .where(Message.id == user_msg.id)
        .options(selectinload(Message.attachments))
    )
    assistant_result = await db.execute(
        select(Message)
        .where(Message.id == assistant_msg.id)
        .options(selectinload(Message.attachments))
    )

    return SendMessageResponse(
        user_message=user_result.scalar_one(),
        assistant_message=assistant_result.scalar_one(),
    )
