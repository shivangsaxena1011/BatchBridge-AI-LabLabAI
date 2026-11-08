from __future__ import annotations

import os
from pathlib import Path
from pydantic import BaseModel

try:
    from dotenv import load_dotenv
    load_dotenv(Path(__file__).resolve().parents[1] / ".env", override=False)
except ImportError:
    pass

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = Path(os.getenv("DATA_DIR", ROOT / "data"))
UPLOAD_DIR = Path(os.getenv("UPLOAD_DIR", DATA_DIR / "uploads"))
STATIC_DIR = Path(__file__).resolve().parent / "static"
DATA_DIR.mkdir(parents=True, exist_ok=True)
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

class Settings(BaseModel):
    app_env: str = os.getenv("APP_ENV", "development")
    app_name: str = "BatchBridge AI"
    app_version: str = "0.9.0"
    database_url: str = os.getenv("DATABASE_URL", f"sqlite:///{(DATA_DIR / 'batchbridge.db').as_posix()}")
    jwt_secret: str = os.getenv("JWT_SECRET", "dev-only-change-this-secret-before-deploying-please")
    jwt_expire_minutes: int = int(os.getenv("JWT_EXPIRE_MINUTES", "720"))
    cors_origins: list[str] = [x.strip() for x in os.getenv("CORS_ORIGINS", "http://localhost:8000,http://127.0.0.1:8000").split(",") if x.strip()]
    max_upload_mb: int = int(os.getenv("MAX_UPLOAD_MB", "15"))
    vultr_api_key: str | None = os.getenv("VULTR_INFERENCE_API_KEY")
    vultr_base_url: str = os.getenv("VULTR_INFERENCE_BASE_URL", "https://api.vultrinference.com/v1")
    vultr_model: str = os.getenv("VULTR_INFERENCE_MODEL", "deepseek-v4.1-flash-1017")
    vultr_timeout_seconds: float = float(os.getenv("VULTR_INFERENCE_TIMEOUT_SECONDS", "45"))
    demo_seed_password: str = os.getenv("DEMO_SEED_PASSWORD", "BatchBridgeDemo#2026")
    seed_demo_data: bool = os.getenv("SEED_DEMO_DATA", "true").lower() == "true"

settings = Settings()

if settings.app_env == "production":
    if settings.jwt_secret == "dev-only-change-this-secret-before-deploying-please" or len(settings.jwt_secret) < 32 or "replace-with-" in settings.jwt_secret:
        raise RuntimeError("Set a unique, non-placeholder JWT_SECRET (at least 32 characters) before running in production.")
    if settings.seed_demo_data and (len(settings.demo_seed_password) < 16 or "replace-with-" in settings.demo_seed_password):
        raise RuntimeError("When SEED_DEMO_DATA=true in production, set a unique DEMO_SEED_PASSWORD of at least 16 characters.")
