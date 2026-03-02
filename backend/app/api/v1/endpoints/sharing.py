"""Progress Sharing & Referral System endpoints."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from datetime import datetime, timezone
from pydantic import BaseModel
from typing import Optional
import uuid
import hashlib

from app.db.database import get_db
from app.db.models import User, Roadmap, Progress
from app.core.security import get_current_user_id

router = APIRouter()


class ShareCardData(BaseModel):
    user_name: str
    role_target: str
    readiness_percentage: int
    skills_completed: int
    total_skills: int
    days_active: int
    share_url: str


class ReferralInfo(BaseModel):
    referral_code: str
    total_referrals: int
    successful_referrals: int
    reward_months_earned: int


# ─── Progress Sharing ─────────────────────────

@router.get("/card", response_model=dict)
async def generate_share_card(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Generate a shareable progress card for social media."""
    # Get user info
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Get active roadmap
    rm_result = await db.execute(
        select(Roadmap).where(
            Roadmap.user_id == user_id,
            Roadmap.status == "active"
        ).order_by(Roadmap.generated_at.desc())
    )
    roadmap = rm_result.scalar_one_or_none()

    if not roadmap:
        raise HTTPException(status_code=404, detail="No active roadmap found")

    # Calculate progress
    prog_result = await db.execute(
        select(Progress).where(Progress.roadmap_id == roadmap.id)
    )
    progress_items = prog_result.scalars().all()
    total_skills = len(progress_items) if progress_items else 1
    completed = sum(1 for p in progress_items if p.status == "completed")
    readiness = int((completed / total_skills) * 100) if total_skills > 0 else 0

    # Days since start
    now = datetime.now(timezone.utc)
    start = roadmap.generated_at
    if start.tzinfo is None:
        start = start.replace(tzinfo=timezone.utc)
    days_active = max((now - start).days, 1)

    share_url = f"https://pathwise.ai/share/{user_id[:8]}"

    card = ShareCardData(
        user_name=user.name.split(" ")[0] if user.name else "Learner",
        role_target=roadmap.job_title,
        readiness_percentage=readiness,
        skills_completed=completed,
        total_skills=total_skills,
        days_active=days_active,
        share_url=share_url,
    )

    return {"success": True, "data": card.model_dump()}


@router.get("/card/{share_id}", response_model=dict)
async def get_public_share_card(
    share_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Get a public progress card (no auth required)."""
    # Find user by share_id prefix
    result = await db.execute(select(User))
    users = result.scalars().all()

    target_user = None
    for u in users:
        if str(u.id)[:8] == share_id:
            target_user = u
            break

    if not target_user:
        raise HTTPException(status_code=404, detail="Share card not found")

    # Get their active roadmap
    rm_result = await db.execute(
        select(Roadmap).where(
            Roadmap.user_id == target_user.id,
            Roadmap.status == "active"
        ).order_by(Roadmap.generated_at.desc())
    )
    roadmap = rm_result.scalar_one_or_none()
    if not roadmap:
        raise HTTPException(status_code=404, detail="No active progress found")

    prog_result = await db.execute(
        select(Progress).where(Progress.roadmap_id == roadmap.id)
    )
    progress_items = prog_result.scalars().all()
    total_skills = len(progress_items) if progress_items else 1
    completed = sum(1 for p in progress_items if p.status == "completed")
    readiness = int((completed / total_skills) * 100)

    return {
        "success": True,
        "data": {
            "user_name": target_user.name.split(" ")[0] if target_user.name else "Learner",
            "role_target": roadmap.job_title,
            "readiness_percentage": readiness,
            "skills_completed": completed,
            "total_skills": total_skills,
        }
    }


# ─── Referral System ─────────────────────────

def generate_referral_code(user_id: str) -> str:
    """Generate a unique referral code from user ID."""
    hash_str = hashlib.md5(user_id.encode()).hexdigest()[:8].upper()
    return f"PW-{hash_str}"


@router.get("/referral", response_model=dict)
async def get_referral_info(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Get the current user's referral code and stats."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    referral_code = generate_referral_code(str(user.id))

    # In a full implementation, you'd track referrals in a separate table
    # For now, return the code with placeholder stats
    return {
        "success": True,
        "data": {
            "referral_code": referral_code,
            "referral_url": f"https://pathwise.ai/signup?ref={referral_code}",
            "total_referrals": 0,
            "successful_referrals": 0,
            "reward_months_earned": 0,
        }
    }


# ─── Success Stories ─────────────────────────

class SuccessStorySubmission(BaseModel):
    title: str
    story: str
    role_landed: str
    company: Optional[str] = None
    salary_range: Optional[str] = None
    months_to_job: Optional[int] = None
    linkedin_url: Optional[str] = None


@router.post("/success-story", response_model=dict)
async def submit_success_story(
    story: SuccessStorySubmission,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Submit a success story for moderation and display."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # In production, this would go to a SuccessStory model/table
    # For now, return confirmation
    return {
        "success": True,
        "message": "Thank you! Your success story has been submitted for review.",
        "data": {
            "submitted_by": user.name,
            "title": story.title,
            "status": "pending_review",
        }
    }


@router.get("/success-stories", response_model=dict)
async def get_success_stories(
    db: AsyncSession = Depends(get_db)
):
    """Get approved success stories (public endpoint)."""
    # Placeholder: in production, query SuccessStory table
    return {
        "success": True,
        "data": [
            {
                "id": "1",
                "user_name": "Sarah M.",
                "title": "From Bootcamp to Frontend Developer at Spotify",
                "role_landed": "Frontend Developer",
                "company": "Spotify",
                "months_to_job": 4,
                "readiness_achieved": 87,
                "excerpt": "PathWise helped me identify exactly which skills I was missing and gave me a clear path to follow.",
            },
            {
                "id": "2",
                "user_name": "Ahmad K.",
                "title": "Self-taught to Full-Stack Engineer",
                "role_landed": "Full-Stack Engineer",
                "company": "Careem",
                "months_to_job": 6,
                "readiness_achieved": 92,
                "excerpt": "The AI interview prep was a game-changer. I practiced responses for my specific role and nailed the interviews.",
            },
        ]
    }
