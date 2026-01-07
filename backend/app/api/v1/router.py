from fastapi import APIRouter

from app.api.v1.endpoints import (
    auth, roadmap, chat, payments, gamification, study_buddy, 
    resume, projects, mentors, social, scheduler, income,
    readiness, jd_comparison, career
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(roadmap.router, prefix="/roadmap", tags=["Roadmap"])
api_router.include_router(chat.router, prefix="/chat", tags=["AI Chat"])
api_router.include_router(payments.router, prefix="/payments", tags=["Payments"])
api_router.include_router(gamification.router, prefix="/gamification", tags=["Gamification"])
api_router.include_router(study_buddy.router, prefix="/study-buddy", tags=["AI Study Buddy"])
api_router.include_router(resume.router, prefix="/resume", tags=["Resume & Jobs"])
api_router.include_router(projects.router, prefix="/projects", tags=["AI Projects"])
api_router.include_router(mentors.router, prefix="/mentors", tags=["Mentors"])
api_router.include_router(social.router, prefix="/social", tags=["Social Learning"])
api_router.include_router(scheduler.router, prefix="/scheduler", tags=["Smart Scheduler"])
api_router.include_router(income.router, prefix="/income", tags=["Income Tracking"])
api_router.include_router(readiness.router, prefix="/readiness", tags=["Job Readiness"])
api_router.include_router(jd_comparison.router, prefix="/jd", tags=["JD Comparison"])
api_router.include_router(career.router, prefix="/career", tags=["Career Discovery"])
