"""Gamification API endpoints."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import Optional
import uuid

from app.db.database import get_db
from app.core.security import get_current_user_id
from app.services.gamification_service import (
    get_or_create_user_stats,
    record_daily_checkin,
    get_leaderboard,
    unlock_achievement,
)
from app.db.models_extended import Achievement, DailyCheckIn, Notification

router = APIRouter()


class DailyCheckInRequest(BaseModel):
    what_learned: str
    mood: str  # motivated, struggling, confident


class NotificationMarkReadRequest(BaseModel):
    notification_ids: list[str]


@router.get("/stats", response_model=dict)
async def get_user_stats(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Get user's gamification stats."""
    stats = await get_or_create_user_stats(db, user_id)
    
    # Get achievements
    result = await db.execute(
        select(Achievement).where(Achievement.user_stats_id == stats.id)
    )
    achievements = result.scalars().all()
    
    return {
        "success": True,
        "data": {
            "total_xp": stats.total_xp,
            "level": stats.level,
            "current_streak": stats.current_streak,
            "longest_streak": stats.longest_streak,
            "total_study_minutes": stats.total_study_minutes,
            "skills_completed": stats.skills_completed,
            "projects_completed": stats.projects_completed,
            "achievements": [
                {
                    "id": str(a.id),
                    "type": a.achievement_type,
                    "title": a.title,
                    "description": a.description,
                    "icon": a.icon,
                    "xp_reward": a.xp_reward,
                    "unlocked_at": a.unlocked_at.isoformat(),
                }
                for a in achievements
            ],
        }
    }


@router.post("/checkin", response_model=dict)
async def daily_checkin(
    request: DailyCheckInRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Record a daily check-in."""
    try:
        result = await record_daily_checkin(
            db,
            user_id,
            request.what_learned,
            request.mood
        )
        
        return {
            "success": True,
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/checkins", response_model=dict)
async def get_checkin_history(
    limit: int = 30,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Get user's check-in history."""
    user_uuid = uuid.UUID(user_id)
    
    result = await db.execute(
        select(DailyCheckIn)
        .where(DailyCheckIn.user_id == user_uuid)
        .order_by(DailyCheckIn.check_in_date.desc())
        .limit(limit)
    )
    checkins = result.scalars().all()
    
    return {
        "success": True,
        "data": [
            {
                "id": str(c.id),
                "what_learned": c.what_learned,
                "mood": c.mood,
                "ai_encouragement": c.ai_encouragement,
                "xp_earned": c.xp_earned,
                "check_in_date": c.check_in_date.isoformat(),
            }
            for c in checkins
        ]
    }


@router.get("/leaderboard", response_model=dict)
async def get_leaderboard_endpoint(
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
):
    """Get the XP leaderboard."""
    leaderboard = await get_leaderboard(db, limit)
    
    return {
        "success": True,
        "data": leaderboard
    }


@router.get("/notifications", response_model=dict)
async def get_notifications(
    limit: int = 50,
    unread_only: bool = False,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Get user's notifications."""
    user_uuid = uuid.UUID(user_id)
    
    query = select(Notification).where(Notification.user_id == user_uuid)
    
    if unread_only:
        query = query.where(Notification.is_read == False)
    
    query = query.order_by(Notification.created_at.desc()).limit(limit)
    
    result = await db.execute(query)
    notifications = result.scalars().all()
    
    return {
        "success": True,
        "data": [
            {
                "id": str(n.id),
                "title": n.title,
                "message": n.message,
                "type": n.notification_type,
                "is_read": n.is_read,
                "action_url": n.action_url,
                "created_at": n.created_at.isoformat(),
            }
            for n in notifications
        ]
    }


@router.post("/notifications/mark-read", response_model=dict)
async def mark_notifications_read(
    request: NotificationMarkReadRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Mark notifications as read."""
    user_uuid = uuid.UUID(user_id)
    
    for notif_id in request.notification_ids:
        try:
            notif_uuid = uuid.UUID(notif_id)
            result = await db.execute(
                select(Notification).where(
                    Notification.id == notif_uuid,
                    Notification.user_id == user_uuid
                )
            )
            notification = result.scalar_one_or_none()
            
            if notification:
                notification.is_read = True
        except ValueError:
            continue
    
    await db.commit()
    
    return {
        "success": True,
        "data": {
            "marked_count": len(request.notification_ids)
        }
    }


@router.get("/achievements/available", response_model=dict)
async def get_available_achievements(
    db: AsyncSession = Depends(get_db)
):
    """Get all available achievements."""
    from app.services.gamification_service import ACHIEVEMENTS
    
    return {
        "success": True,
        "data": [
            {
                "key": key,
                "title": data["title"],
                "description": data["description"],
                "icon": data["icon"],
                "xp": data["xp"],
            }
            for key, data in ACHIEVEMENTS.items()
        ]
    }
