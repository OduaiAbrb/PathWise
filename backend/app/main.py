import os
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.starlette import StarletteIntegration
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings

# Initialize Sentry for error monitoring
SENTRY_DSN = os.getenv("SENTRY_DSN", "https://a7bd063dbf9c7df54e3bc0affa579fdb@o4510670971863040.ingest.us.sentry.io/4510670975795200")
if SENTRY_DSN:
    sentry_sdk.init(
        dsn=SENTRY_DSN,
        environment=os.getenv("SENTRY_ENVIRONMENT", "production"),
        release=os.getenv("SENTRY_RELEASE"),
        traces_sample_rate=float(os.getenv("SENTRY_TRACES_SAMPLE_RATE", "0.1")),
        profiles_sample_rate=float(os.getenv("SENTRY_PROFILES_SAMPLE_RATE", "0.1")),
        send_default_pii=True,
        default_integrations=False,  # Disable auto-detection to avoid langchain conflict
        integrations=[
            StarletteIntegration(),
            FastApiIntegration(),
        ],
    )

from app.api.v1.router import api_router
from app.db.database import engine, Base


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Create database tables
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
