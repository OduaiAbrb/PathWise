from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    # App
    APP_NAME: str = "PathWise AI"
    DEBUG: bool = False
    
    # Database (SQLite for dev, PostgreSQL for production)
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "sqlite+aiosqlite:///./pathwise.db"
    )
    
    # Redis
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379")
    
    # JWT
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-super-secret-key-change-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 43200  # 30 days (30 * 24 * 60)
    REFRESH_TOKEN_EXPIRE_DAYS: int = 60  # 60 days for refresh
    
    # OpenAI (legacy, using Emergent LLM key now)
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-4o")
    
    # Emergent LLM Key (Universal key for OpenAI, Anthropic, Gemini)
    EMERGENT_LLM_KEY: str = os.getenv("EMERGENT_LLM_KEY", "")
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://pathwise.ai",
        "https://frontend-production-752a.up.railway.app",
    ]
    
    # LemonSqueezy
    LEMONSQUEEZY_API_KEY: str = os.getenv("LEMONSQUEEZY_API_KEY", "")
    LEMONSQUEEZY_WEBHOOK_SECRET: str = os.getenv("LEMONSQUEEZY_WEBHOOK_SECRET", "")
    LEMONSQUEEZY_STORE_ID: str = os.getenv("LEMONSQUEEZY_STORE_ID", "")
    
    # Email (Resend)
    RESEND_API_KEY: str = os.getenv("RESEND_API_KEY", "")
    FROM_EMAIL: str = "PathWise AI <noreply@pathwise.ai>"
    
    # NextAuth (for frontend compatibility)
    NEXTAUTH_SECRET: str = os.getenv("NEXTAUTH_SECRET", "")
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
