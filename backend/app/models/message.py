import uuid
from datetime import datetime, timezone

from sqlalchemy import String, Text, Integer, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Message(Base):
    __tablename__ = "messages"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    conversation_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("conversations.id", ondelete="CASCADE"), index=True
    )
    role: Mapped[str] = mapped_column(String(20))  # 'user' | 'assistant'
    text_content: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Generation metadata (assistant messages only)
    model_used: Mapped[str | None] = mapped_column(String(100), nullable=True)
    quality: Mapped[str | None] = mapped_column(String(10), nullable=True)
    aspect_ratio: Mapped[str | None] = mapped_column(String(10), nullable=True)
    thinking_mode: Mapped[str | None] = mapped_column(String(20), nullable=True)
    generation_time_ms: Mapped[int | None] = mapped_column(Integer, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    conversation = relationship("Conversation", back_populates="messages")
    attachments = relationship(
        "Attachment", back_populates="message", cascade="all, delete-orphan"
    )
