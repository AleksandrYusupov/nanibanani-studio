import os
import aiofiles
from pathlib import Path

from app.config import settings


class StorageService:
    def __init__(self):
        self._root = Path(settings.LOCAL_STORAGE_PATH)
        self._root.mkdir(parents=True, exist_ok=True)

    async def upload_file(
        self, data: bytes, gcs_path: str, content_type: str
    ) -> str:
        file_path = self._root / gcs_path
        file_path.parent.mkdir(parents=True, exist_ok=True)
        async with aiofiles.open(file_path, "wb") as f:
            await f.write(data)
        return gcs_path

    async def download_file(self, gcs_path: str) -> bytes:
        file_path = self._root / gcs_path
        async with aiofiles.open(file_path, "rb") as f:
            return await f.read()

    async def delete_file(self, gcs_path: str) -> None:
        file_path = self._root / gcs_path
        if file_path.exists():
            os.remove(file_path)


storage_service = StorageService()
