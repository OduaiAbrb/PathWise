"""Skill Decay System - tracks how skills degrade over time without practice."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timezone, timedelta
from pydantic import BaseModel
from typing import List, Optional

from app.db.database import get_db
from app.db.models import Progress, Roadmap
from app.core.security import get_current_user_id

router = APIRouter()

# Decay rate: lose ~2% readiness per day of no practice
DECAY_RATE_PER_DAY = 0.02
MIN_READINESS = 0.0


class SkillDecayInfo(BaseModel):
    skill_id: str
    skill_name: str
    last_practiced: Optional[str] = None
    days_since_practice: int
    original_readiness: float
    current_readiness: float
    decay_amount: float
    status: str  # "fresh", "fading", "stale", "critical"


class DecayResponse(BaseModel):
    total_skills: int
    decaying_skills: int
    critical_skills: int
    average_readiness: float
    skills: List[SkillDecayInfo]
    alert_message: Optional[str] = None


def calculate_decay(days_idle: int, base_readiness: float = 100.0) -> float:
    """Calculate skill decay based on days without practice."""
    if days_idle <= 0:
        return 0.0
    # Exponential decay: readiness = base * (1 - rate)^days
    decayed = base_readiness * (1 - DECAY_RATE_PER_DAY) ** days_idle
    return round(base_readiness - max(decayed, MIN_READINESS), 1)


def get_decay_status(days_idle: int) -> str:
    """Classify skill decay status."""
    if days_idle <= 3:
        return "fresh"
    elif days_idle <= 7:
        return "fading"
    elif days_idle <= 14:
        return "stale"
    else:
        return "critical"


@router.get("/status", response_model=dict)
async def get_skill_decay_status(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Get the current decay status for all user skills."""
    # Get all user roadmaps
    result = await db.execute(
        select(Roadmap).where(Roadmap.user_id == user_id, Roadmap.status == "active")
    )
    roadmaps = result.scalars().all()

    if not roadmaps:
        return {
            "success": True,
            "data": {
                "total_skills": 0,
                "decaying_skills": 0,
                "critical_skills": 0,
                "average_readiness": 0,
                "skills": [],
                "alert_message": None,
            }
        }

    skills_info = []
    now = datetime.now(timezone.utc)

    for roadmap in roadmaps:
        # Get progress for this roadmap
        prog_result = await db.execute(
            select(Progress).where(Progress.roadmap_id == roadmap.id)
        )
        progress_items = prog_result.scalars().all()

        for prog in progress_items:
            if prog.status == "not_started":
                continue

            # Calculate days since last activity
            last_active = prog.completed_at or roadmap.generated_at
            if last_active.tzinfo is None:
                last_active = last_active.replace(tzinfo=timezone.utc)
            days_idle = (now - last_active).days

            base_readiness = 100.0 if prog.status == "completed" else 50.0
            decay = calculate_decay(days_idle, base_readiness)
            current_readiness = max(base_readiness - decay, 0)

            skills_info.append(SkillDecayInfo(
                skill_id=prog.skill_id,
                skill_name=prog.skill_name,
                last_practiced=last_active.isoformat(),
                days_since_practice=days_idle,
                original_readiness=base_readiness,
                current_readiness=round(current_readiness, 1),
                decay_amount=decay,
                status=get_decay_status(days_idle),
            ))

    # Sort by decay (most decayed first)
    skills_info.sort(key=lambda s: s.current_readiness)

    decaying = [s for s in skills_info if s.status in ("fading", "stale", "critical")]
    critical = [s for s in skills_info if s.status == "critical"]

    avg_readiness = (
        sum(s.current_readiness for s in skills_info) / len(skills_info)
        if skills_info else 0
    )

    # Generate alert message
    alert = None
    if critical:
        names = ", ".join(s.skill_name for s in critical[:3])
        alert = f"⚠️ {len(critical)} skill(s) critically degraded: {names}. Practice now to recover!"
    elif decaying:
        alert = f"📉 {len(decaying)} skill(s) are fading. Keep practicing to maintain your readiness."

    return {
        "success": True,
        "data": {
            "total_skills": len(skills_info),
            "decaying_skills": len(decaying),
            "critical_skills": len(critical),
            "average_readiness": round(avg_readiness, 1),
            "skills": [s.model_dump() for s in skills_info],
            "alert_message": alert,
        }
    }


@router.post("/refresh/{skill_id}", response_model=dict)
async def refresh_skill(
    skill_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Mark a skill as recently practiced to reset its decay timer."""
    result = await db.execute(
        select(Progress).where(Progress.skill_id == skill_id)
    )
    progress = result.scalar_one_or_none()

    if not progress:
        raise HTTPException(status_code=404, detail="Skill not found")

    progress.completed_at = datetime.now(timezone.utc)
    await db.commit()

    return {
        "success": True,
        "message": f"Skill '{progress.skill_name}' refreshed. Decay timer reset."
    }
