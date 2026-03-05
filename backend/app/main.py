import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.core.config import settings

# Rate limiter
limiter = Limiter(key_func=get_remote_address, default_limits=["60/minute"])

# Initialize Sentry for error monitoring (optional)
try:
    import sentry_sdk
    from sentry_sdk.integrations.fastapi import FastApiIntegration
    from sentry_sdk.integrations.starlette import StarletteIntegration
    
    SENTRY_DSN = os.getenv("SENTRY_DSN")
    if SENTRY_DSN:
        sentry_sdk.init(
            dsn=SENTRY_DSN,
            environment=os.getenv("SENTRY_ENVIRONMENT", "production"),
            release=os.getenv("SENTRY_RELEASE"),
            traces_sample_rate=float(os.getenv("SENTRY_TRACES_SAMPLE_RATE", "0.1")),
            profiles_sample_rate=float(os.getenv("SENTRY_PROFILES_SAMPLE_RATE", "0.0")),
            send_default_pii=True,
            default_integrations=False,
            integrations=[
                StarletteIntegration(transaction_style="url"),
                FastApiIntegration(transaction_style="url"),
            ],
        )
        print("✓ Sentry initialized successfully")
except Exception as e:
    print(f"⚠ Sentry initialization failed: {e}")
    print("Continuing without Sentry...")

from app.api.v1.router import api_router
from app.db.database import engine, Base
from app.db import models  # Import models to register them
from app.models import portfolio  # Import new models


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Create database tables in development
    # In production we rely on Alembic migrations.
    is_dev = os.getenv("ENVIRONMENT", "development") == "development"
    auto_create = os.getenv("AUTO_CREATE_TABLES", "").lower() in {"1", "true", "yes"}
    if is_dev or auto_create:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
    yield
    # Shutdown: Clean up resources
    await engine.dispose()


app = FastAPI(
    title="PathWise AI API",
    description="AI-powered career acceleration platform API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Rate limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(api_router, prefix="/api/v1")


@app.get("/")
async def root():
    return {
        "message": "Welcome to PathWise AI API",
        "docs": "/docs",
        "version": "1.0.0",
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


@app.get("/sentry-test")
async def sentry_test():
    """Test endpoint to verify Sentry is working."""
    raise RuntimeError("Sentry backend test error - PathWise")
