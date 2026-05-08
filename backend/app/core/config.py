from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


BASE_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    app_name: str = Field(default="Smart Certificate Verification Platform", validation_alias="APP_NAME")
    app_version: str = Field(default="1.0.0", validation_alias="APP_VERSION")
    debug: bool = Field(default=False, validation_alias="DEBUG")
    gemini_api_key: str = Field(default="", validation_alias="GEMINI_API_KEY")
    groq_api_key: str = Field(default="", validation_alias="GROQ_API_KEY")
    openai_api_key: str = Field(default="", validation_alias="OPENAI_API_KEY")
    frontend_url: str = Field(default="http://localhost:3000", validation_alias="FRONTEND_URL")

    mongodb_uri: str = Field(default="mongodb://localhost:27017", validation_alias="MONGODB_URI")
    database_name: str = Field(default="certichain_ai", validation_alias="DATABASE_NAME")
    mongodb_server_selection_timeout_ms: int = Field(
        default=5000,
        validation_alias="MONGODB_SERVER_SELECTION_TIMEOUT_MS",
    )

    jwt_secret_key: str = Field(default="change-me-in-production", validation_alias="JWT_SECRET_KEY")
    jwt_algorithm: str = Field(default="HS256", validation_alias="JWT_ALGORITHM")
    access_token_expire_minutes: int = Field(
        default=60 * 12,
        validation_alias="ACCESS_TOKEN_EXPIRE_MINUTES",
    )

    uploads_dir: Path = BASE_DIR / "storage" / "uploads"
    heatmaps_dir: Path = BASE_DIR / "storage" / "heatmaps"
    qr_dir: Path = BASE_DIR / "storage" / "qrcodes"
    static_mount: str = "/storage"
    public_base_url: str = Field(default="http://localhost:8000", validation_alias="PUBLIC_BASE_URL")
    verify_path_prefix: str = "/verify"

    allowed_file_extensions: list[str] = Field(
        default_factory=lambda: [".png", ".jpg", ".jpeg", ".pdf"]
    )
    trusted_issuers: list[str] = Field(
        default_factory=lambda: [
            "Stanford University",
            "Massachusetts Institute of Technology",
            "Harvard University",
            "University of Oxford",
            "Google",
            "Microsoft",
            "Amazon Web Services",
            "Infosys",
            "Tata Consultancy Services",
            "Coursera",
        ]
    )
    qr_whitelist_domains: list[str] = Field(
        default_factory=lambda: ["localhost", "127.0.0.1", "certichain.local"]
    )
    qr_blacklist_domains: list[str] = Field(
        default_factory=lambda: ["bit.ly", "tinyurl.com", "malicious.example", "phish.test"]
    )

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


@lru_cache
def get_settings() -> Settings:
    return Settings()
