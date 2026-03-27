import uuid
from datetime import datetime

from pydantic import BaseModel


class AttachmentResponse(BaseModel):
    id: uuid.UUID
    type: str
    mime_type: str
    filename: str
    size_bytes: int | None
    width: int | None
    height: int | None
    created_at: datetime

    model_config = {"from_attributes": True}


class MessageResponse(BaseModel):
    id: uuid.UUID
    conversation_id: uuid.UUID
    role: str
    text_content: str | None
    model_used: str | None
    quality: str | None
    aspect_ratio: str | None
    thinking_mode: str | None
    generation_time_ms: int | None
    created_at: datetime
    attachments: list[AttachmentResponse] = []

    model_config = {"from_attributes": True}


class SendMessageResponse(BaseModel):
    user_message: MessageResponse
    assistant_message: MessageResponse
