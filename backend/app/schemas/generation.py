from pydantic import BaseModel


class GenerationSettings(BaseModel):
    quality: str = "1K"
    aspect_ratio: str = "1:1"
    thinking_mode: str | None = None
