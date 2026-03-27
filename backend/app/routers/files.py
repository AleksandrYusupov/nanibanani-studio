import io
import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import Response
from PIL import Image
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import Attachment
from app.services.storage import storage_service

router = APIRouter(prefix="/api/files", tags=["files"])

THUMBNAIL_SIZE = (400, 400)


@router.get("/{attachment_id}")
async def get_file(
    attachment_id: uuid.UUID, db: AsyncSession = Depends(get_db)
):
    attachment = await db.get(Attachment, attachment_id)
    if not attachment:
        raise HTTPException(status_code=404, detail="Attachment not found")

    data = await storage_service.download_file(attachment.gcs_path)
    return Response(
        content=data,
        media_type=attachment.mime_type,
        headers={
            "Content-Disposition": f'inline; filename="{attachment.filename}"',
            "Cache-Control": "public, max-age=31536000, immutable",
        },
    )


@router.get("/{attachment_id}/thumbnail")
async def get_thumbnail(
    attachment_id: uuid.UUID,
    size: int = Query(default=400, ge=50, le=800),
    db: AsyncSession = Depends(get_db),
):
    attachment = await db.get(Attachment, attachment_id)
    if not attachment:
        raise HTTPException(status_code=404, detail="Attachment not found")

    if not attachment.mime_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Not an image")

    data = await storage_service.download_file(attachment.gcs_path)

    img = Image.open(io.BytesIO(data))
    img.thumbnail((size, size), Image.Resampling.LANCZOS)

    buf = io.BytesIO()
    img.save(buf, format="WEBP", quality=85)
    buf.seek(0)

    return Response(
        content=buf.getvalue(),
        media_type="image/webp",
        headers={"Cache-Control": "public, max-age=86400"},
    )
