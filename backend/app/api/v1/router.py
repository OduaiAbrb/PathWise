from fastapi import APIRouter

from app.api.v1.endpoints import auth, roadmap, chat, payments, gamification

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(roadmap.router, prefix="/roadmap", tags=["Roadmap"])
api_router.include_router(chat.router, prefix="/chat", tags=["AI Chat"])
api_router.include_router(payments.router, prefix="/payments", tags=["Payments"])
api_router.include_router(gamification.router, prefix="/gamification", tags=["Gamification"])
