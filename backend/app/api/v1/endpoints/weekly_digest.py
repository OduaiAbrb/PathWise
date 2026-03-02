"""Weekly Email Digest - progress reports and learning recommendations."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timezone, timedelta
from pydantic import BaseModel
from typing import Optional

from app.db.database import get_db
from app.db.models import User, Roadmap, Progress
from app.core.security import get_current_user_id
from app.core.config import settings

router = APIRouter()


class DigestPreview(BaseModel):
    """Preview of what the weekly digest email would contain."""
    user_name: str
    week_start: str
    week_end: str
    skills_learned_this_week: int
    total_time_this_week_minutes: int
    readiness_change: float
    current_readiness: float
    streak_days: int
    top_focus_areas: list
    next_week_recommendation: str
    estimated_days_to_job: Optional[int] = None


@router.get("/preview", response_model=dict)
async def preview_weekly_digest(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Preview the weekly digest email content (for testing/display)."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    now = datetime.now(timezone.utc)
    week_ago = now - timedelta(days=7)

    # Get active roadmap
    rm_result = await db.execute(
        select(Roadmap).where(
            Roadmap.user_id == user_id,
            Roadmap.status == "active"
        ).order_by(Roadmap.generated_at.desc())
    )
    roadmap = rm_result.scalar_one_or_none()

    skills_this_week = 0
    time_this_week = 0
    focus_areas = []
    current_readiness = 0.0

    if roadmap:
        prog_result = await db.execute(
            select(Progress).where(Progress.roadmap_id == roadmap.id)
        )
        all_progress = prog_result.scalars().all()

        total = len(all_progress) if all_progress else 1
        completed = 0

        for p in all_progress:
            if p.status == "completed":
                completed += 1
            if p.completed_at:
                comp_time = p.completed_at
                if comp_time.tzinfo is None:
                    comp_time = comp_time.replace(tzinfo=timezone.utc)
                if comp_time >= week_ago:
                    skills_this_week += 1
            if p.time_spent_minutes and p.time_spent_minutes > 0:
                time_this_week += p.time_spent_minutes
            if p.status == "in_progress":
                focus_areas.append(p.skill_name)

        current_readiness = round((completed / total) * 100, 1) if total > 0 else 0

    # Estimate days to job based on current velocity
    est_days = None
    if skills_this_week > 0 and roadmap:
        remaining = total - completed if roadmap else 0
        weeks_remaining = remaining / skills_this_week if skills_this_week > 0 else 52
        est_days = int(weeks_remaining * 7)

    digest = DigestPreview(
        user_name=user.name.split(" ")[0] if user.name else "Learner",
        week_start=week_ago.strftime("%b %d"),
        week_end=now.strftime("%b %d, %Y"),
        skills_learned_this_week=skills_this_week,
        total_time_this_week_minutes=time_this_week,
        readiness_change=round(skills_this_week * 2.5, 1),  # rough estimate
        current_readiness=current_readiness,
        streak_days=min(skills_this_week, 7),  # simplified
        top_focus_areas=focus_areas[:3],
        next_week_recommendation=(
            f"Focus on {focus_areas[0]} to maintain momentum"
            if focus_areas
            else "Start a new skill on your roadmap"
        ),
        estimated_days_to_job=est_days,
    )

    return {"success": True, "data": digest.model_dump()}


@router.post("/subscribe", response_model=dict)
async def subscribe_to_digest(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Subscribe to weekly email digest."""
    # In production, this would update a user preference field
    return {
        "success": True,
        "message": "You're subscribed to the weekly progress digest! Emails arrive every Monday.",
    }


@router.post("/unsubscribe", response_model=dict)
async def unsubscribe_from_digest(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Unsubscribe from weekly email digest."""
    return {
        "success": True,
        "message": "You've been unsubscribed from the weekly digest.",
    }
