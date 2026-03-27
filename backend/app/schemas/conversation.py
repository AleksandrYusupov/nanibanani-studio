import uuid
from datetime import datetime

from pydantic import BaseModel


class ConversationCreate(BaseModel):
    title: str = "New Chat"
    model: str = "nanibanani-pro"


class ConversationUpdate(BaseModel):
    title: str | None = None
    model: str | None = None


class ConversationResponse(BaseModel):
    id: uuid.UUID
    title: str
    model: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
