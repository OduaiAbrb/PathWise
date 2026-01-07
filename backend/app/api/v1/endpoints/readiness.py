"""
Job Readiness Score API Endpoints
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from typing import Optional

from app.db.database import get_db
from app.core.security import get_current_user_id
from app.services.readiness_service import readiness_service

router = APIRouter()


@router.get("/score")
async def get_readiness_score(
    roadmap_id: Optional[str] = None,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """
    Get job readiness score for the user
    
    Returns:
        - overall: Overall readiness percentage (0-100)
        - skillsCovered: Percentage of skills completed
        - projectsCompleted: Percentage of projects done
        - interviewReadiness: Interview preparation score
        - missingSkills: Top 5 skills to focus on
        - targetRole: The job title being prepared for
    """
    try:
        user_uuid = UUID(user_id)
        roadmap_uuid = UUID(roadmap_id) if roadmap_id else None
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid ID format")

    score = await readiness_service.calculate_readiness_score(
        db, user_uuid, roadmap_uuid
    )

    return {
        "success": True,
        "data": score
    }


@router.get("/next-action")
async def get_next_action(
    roadmap_id: Optional[str] = None,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """
    Get the single most important next action for the user
    
    Returns the highest priority incomplete skill with:
        - title: Action title
        - description: What to learn
        - estimatedMinutes: Time estimate
        - resourceUrl: Best resource link
        - resourceTitle: Resource name
        - skillName: The skill being learned
        - phase: Current learning phase
    """
    try:
        user_uuid = UUID(user_id)
        roadmap_uuid = UUID(roadmap_id) if roadmap_id else None
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid ID format")

    action = await readiness_service.get_next_best_action(
        db, user_uuid, roadmap_uuid
    )

    if not action:
        return {
            "success": True,
            "data": None,
            "message": "No active roadmap or all skills completed"
        }

    return {
        "success": True,
        "data": action
    }


@router.get("/weekly-report")
async def get_weekly_report(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """
    Get weekly readiness report
    
    Returns:
        - currentScore: Current readiness score
        - previousScore: Score from last week
        - change: Score change (+/-)
        - skillsUnlocked: Skills completed this week
        - weakAreas: Areas needing focus
        - nextWeekFocus: Recommended focus for next week
    """
    try:
        user_uuid = UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid ID format")

    # Get current score
    current_score = await readiness_service.calculate_readiness_score(db, user_uuid)

    # For now, return mock weekly data
    # In production, this would compare with stored historical data
    return {
        "success": True,
        "data": {
            "currentScore": current_score["overall"],
            "previousScore": max(0, current_score["overall"] - 8),  # Mock: 8% improvement
            "change": 8,
            "skillsUnlocked": 3,
            "weakAreas": current_score["missingSkills"][:3],
            "nextWeekFocus": current_score["missingSkills"][0] if current_score["missingSkills"] else "Continue current progress",
            "targetRole": current_score["targetRole"],
            "breakdown": current_score["breakdown"]
        }
    }
