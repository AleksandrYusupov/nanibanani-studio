import os
from pydantic_settings import BaseSettings


DATA_DIR = os.getenv("DATA_DIR", "/app/data")


class Settings(BaseSettings):
    GEMINI_API_KEY: str
    DATABASE_URL: str = f"sqlite+aiosqlite:///{DATA_DIR}/nanibanani.db"
    LOCAL_STORAGE: bool = True
    LOCAL_STORAGE_PATH: str = f"{DATA_DIR}/storage"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
