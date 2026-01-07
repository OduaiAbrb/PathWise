import sentry_sdk
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os

from app.core.config import settings

# Initialize Sentry for error monitoring
sentry_sdk.init(
    dsn="https://a7bd063dbf9c7df54e3bc0affa579fdb@o4510670971863040.ingest.us.sentry.io/4510670975795200",
    traces_sample_rate=1.0,
    profiles_sample_rate=1.0,
    send_default_pii=True,
    environment=os.getenv("ENVIRONMENT", "production"),
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
