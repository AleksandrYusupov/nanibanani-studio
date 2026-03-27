import asyncio
import base64
import io
import time
from dataclasses import dataclass

from google import genai
from google.genai import types
from PIL import Image

from app.config import settings

MODEL_MAP = {
    "nanibanani-pro": "gemini-3-pro-image-preview",
    "nanibanani-2": "gemini-3.1-flash-image-preview",
}

SUPPORTED_ASPECT_RATIOS = [
    "1:1", "2:3", "3:2", "3:4", "4:3", "4:5", "5:4", "9:16", "16:9", "21:9",
]

SUPPORTED_QUALITIES = ["1K", "2K", "4K"]

THINKING_BUDGETS = {
    "minimal": 1024,
    "long": 8192,
}


@dataclass
class TextPart:
    text: str


@dataclass
class ImagePart:
    data: bytes  # raw image bytes
    mime_type: str


GenerationResult = list[TextPart | ImagePart]


def _generate_sync(
    prompt: str,
    model_key: str,
    quality: str,
    aspect_ratio: str,
    thinking_mode: str | None,
    input_images: list[bytes] | None,
) -> GenerationResult:
    client = genai.Client(api_key=settings.GEMINI_API_KEY)
    model = MODEL_MAP[model_key]

    contents: list = [prompt]
    if input_images:
        for img_bytes in input_images:
            pil_img = Image.open(io.BytesIO(img_bytes))
            contents.append(pil_img)

    config_kwargs: dict = {
        "response_modalities": ["TEXT", "IMAGE"],
    }

    # Only add image_config if we have valid settings
    image_config_kwargs = {}
    if aspect_ratio and aspect_ratio in SUPPORTED_ASPECT_RATIOS:
        image_config_kwargs["aspect_ratio"] = aspect_ratio
    if quality and quality in SUPPORTED_QUALITIES:
        image_config_kwargs["output_image_size"] = quality

    if image_config_kwargs:
        config_kwargs["image_generation_config"] = types.ImageGenerationConfig(
            **image_config_kwargs
        )

    if model_key == "nanibanani-2" and thinking_mode and thinking_mode in THINKING_BUDGETS:
        config_kwargs["thinking_config"] = types.ThinkingConfig(
            thinking_budget=THINKING_BUDGETS[thinking_mode]
        )

    config = types.GenerateContentConfig(**config_kwargs)

    response = client.models.generate_content(
        model=model,
        contents=contents,
        config=config,
    )

    results: GenerationResult = []
    if response.candidates:
        for part in response.candidates[0].content.parts:
            if part.text is not None:
                results.append(TextPart(text=part.text))
            elif part.inline_data is not None:
                img_data = base64.b64decode(part.inline_data.data)
                results.append(
                    ImagePart(data=img_data, mime_type=part.inline_data.mime_type)
                )
    return results


async def generate_image(
    prompt: str,
    model_key: str,
    quality: str = "1K",
    aspect_ratio: str = "1:1",
    thinking_mode: str | None = None,
    input_images: list[bytes] | None = None,
) -> tuple[GenerationResult, int]:
    """Generate image(s) via Gemini API.

    Returns (results, generation_time_ms).
    """
    start = time.monotonic()
    loop = asyncio.get_event_loop()
    results = await loop.run_in_executor(
        None,
        _generate_sync,
        prompt,
        model_key,
        quality,
        aspect_ratio,
        thinking_mode,
        input_images,
    )
    elapsed_ms = int((time.monotonic() - start) * 1000)
    return results, elapsed_ms
