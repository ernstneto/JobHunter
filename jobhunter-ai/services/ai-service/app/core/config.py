"""
Application configuration loaded from environment variables.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional


class Settings(BaseSettings):
    # --- App ---
    app_name: str = "JobHunter AI Service"
    app_version: str = "0.1.0"
    debug: bool = True
    app_env: str = "development"

    # --- AI Providers ---
    groq_api_key: str = ""
    openrouter_api_key: str = ""
    openrouter_base_url: str = "https://openrouter.ai/api/v1"
    google_ai_api_key: str = ""

    # --- Database ---
    database_url: str = "sqlite+aiosqlite:///./jobhunter.db"
    postgres_host: str = "localhost"
    postgres_port: int = 5432
    postgres_db: str = "jobhunter"
    postgres_user: str = "jobhunter"
    postgres_password: str = "change_me"

    # --- Redis ---
    redis_url: str = "redis://localhost:6379"
    redis_host: str = "localhost"
    redis_port: int = 6379

    # --- Security ---
    secret_key: str = "dev-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60

    # --- Scraper ---
    jsearch_api_key: str = ""
    jsearch_api_host: str = "jsearch.p.rapidapi.com"
    serper_api_key: str = ""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )


settings = Settings()