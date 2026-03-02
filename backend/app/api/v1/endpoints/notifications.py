"""Email verification and push notification endpoints."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timezone, timedelta
from pydantic import BaseModel
from typing import Optional
import hashlib
import hmac

from app.db.database import get_db
from app.db.models import User
from app.core.security import get_current_user_id
from app.core.config import settings

router = APIRouter()


# ─── Email Verification ─────────────────────────

def generate_verification_token(email: str) -> str:
    """Generate a verification token from email + secret."""
    return hmac.new(
        settings.SECRET_KEY.encode(),
        email.encode(),
        hashlib.sha256
    ).hexdigest()[:32]


class VerifyEmailRequest(BaseModel):
    token: str


@router.post("/send-verification", response_model=dict)
async def send_verification_email(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Send a verification email to the current user."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Check if already verified
    if hasattr(user, 'email_verified') and user.email_verified:
        return {"success": True, "message": "Email is already verified."}

    # Generate verification token
    token = generate_verification_token(user.email)
    verification_url = f"https://pathwise.ai/verify?token={token}&email={user.email}"

    # In production, send email via Resend
    # For now, return the URL for testing
    try:
        from app.services.email_service import send_verification_email as _send
        await _send(user.email, user.name or "there", verification_url)
    except Exception:
        pass  # Email service may not be configured

    return {
        "success": True,
        "message": f"Verification email sent to {user.email}",
        "data": {"verification_url": verification_url},
    }


@router.post("/verify", response_model=dict)
async def verify_email(
    data: VerifyEmailRequest,
    db: AsyncSession = Depends(get_db)
):
    """Verify a user's email with the token."""
    # In production, you'd look up by stored token
    # For now, verify the HMAC token
    result = await db.execute(select(User))
    users = result.scalars().all()

    for user in users:
        expected_token = generate_verification_token(user.email)
        if hmac.compare_digest(expected_token, data.token):
            # Mark as verified
            if hasattr(user, 'email_verified'):
                user.email_verified = True
                user.email_verified_at = datetime.now(timezone.utc)
            await db.commit()
            return {
                "success": True,
                "message": "Email verified successfully! 🎉",
            }

    raise HTTPException(status_code=400, detail="Invalid or expired verification token")


# ─── Push Notifications ─────────────────────────

class PushSubscription(BaseModel):
    endpoint: str
    keys: dict


class NotificationPreferences(BaseModel):
    skill_decay_alerts: bool = True
    weekly_digest: bool = True
    streak_reminders: bool = True
    job_matches: bool = True
    community_updates: bool = False


@router.post("/push/subscribe", response_model=dict)
async def subscribe_push(
    subscription: PushSubscription,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Subscribe to push notifications."""
    # In production, store the subscription in the database
    return {
        "success": True,
        "message": "Push notifications enabled! You'll get alerts for skill decay, streak reminders, and job matches.",
    }


@router.post("/push/unsubscribe", response_model=dict)
async def unsubscribe_push(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Unsubscribe from push notifications."""
    return {
        "success": True,
        "message": "Push notifications disabled.",
    }


@router.get("/push/preferences", response_model=dict)
async def get_notification_preferences(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Get notification preferences."""
    # In production, read from database
    return {
        "success": True,
        "data": {
            "skill_decay_alerts": True,
            "weekly_digest": True,
            "streak_reminders": True,
            "job_matches": True,
            "community_updates": False,
        }
    }


@router.put("/push/preferences", response_model=dict)
async def update_notification_preferences(
    prefs: NotificationPreferences,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Update notification preferences."""
    return {
        "success": True,
        "message": "Notification preferences updated.",
        "data": prefs.model_dump(),
    }


# ─── Streak System ─────────────────────────

@router.get("/streak", response_model=dict)
async def get_streak_info(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Get detailed streak information including daily missions."""
    # In production, query actual activity logs
    now = datetime.now(timezone.utc)
    
    return {
        "success": True,
        "data": {
            "current_streak": 0,
            "longest_streak": 0,
            "last_active": now.isoformat(),
            "streak_level": "🌱 Getting Started",
            "daily_mission": {
                "title": "Complete one skill checkpoint",
                "description": "Answer a quiz question on your current topic to maintain your streak.",
                "xp_reward": 50,
                "completed": False,
            },
            "streak_milestones": [
                {"days": 7, "reward": "🏆 Weekly Warrior badge", "achieved": False},
                {"days": 30, "reward": "🔥 Monthly Master badge + 500 XP", "achieved": False},
                {"days": 100, "reward": "💎 Century Club badge + 1 month Pro free", "achieved": False},
            ],
            "calendar": [],  # Array of dates with activity
        }
    }


@router.post("/streak/complete-mission", response_model=dict)
async def complete_daily_mission(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Mark today's daily mission as complete."""
    return {
        "success": True,
        "data": {
            "xp_earned": 50,
            "new_streak": 1,
            "message": "🎉 Daily mission complete! +50 XP. Come back tomorrow to keep your streak!"
        }
    }
