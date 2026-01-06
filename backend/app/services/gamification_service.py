"""Gamification service for XP, achievements, and streaks."""
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import uuid

from app.db.models import User
from app.db.models_extended import UserStats, Achievement, DailyCheckIn, Notification


# XP rewards
XP_REWARDS = {
    "daily_checkin": 10,
    "skill_completed": 50,
    "roadmap_completed": 200,
    "project_completed": 100,
    "test_passed": 75,
    "7_day_streak": 100,
    "30_day_streak": 500,
    "first_roadmap": 50,
    "mentor_session": 25,
    "help_peer": 15,
}

# Level thresholds
LEVEL_THRESHOLDS = [
    0, 100, 250, 500, 1000, 2000, 3500, 5500, 8000, 11000, 15000,
    20000, 26000, 33000, 41000, 50000, 60000, 71000, 83000, 96000, 110000
]

# Achievement definitions
ACHIEVEMENTS = {
    "first_roadmap": {
        "title": "Journey Begins",
        "description": "Created your first learning roadmap",
        "icon": "🚀",
        "xp": 50,
    },
    "first_skill": {
        "title": "First Step",
        "description": "Completed your first skill",
        "icon": "✨",
        "xp": 50,
    },
    "7_day_streak": {
        "title": "Week Warrior",
        "description": "Maintained a 7-day learning streak",
        "icon": "🔥",
        "xp": 100,
    },
    "30_day_streak": {
        "title": "Month Master",
        "description": "Maintained a 30-day learning streak",
        "icon": "💪",
        "xp": 500,
    },
    "100_day_streak": {
        "title": "Unstoppable",
        "description": "Maintained a 100-day learning streak",
        "icon": "⚡",
        "xp": 2000,
    },
    "roadmap_completed": {
        "title": "Goal Crusher",
        "description": "Completed an entire roadmap",
        "icon": "🏆",
        "xp": 200,
    },
    "5_skills": {
        "title": "Skill Collector",
        "description": "Completed 5 skills",
        "icon": "📚",
        "xp": 100,
    },
    "10_skills": {
        "title": "Knowledge Seeker",
        "description": "Completed 10 skills",
        "icon": "🎓",
        "xp": 250,
    },
    "50_skills": {
        "title": "Polymath",
        "description": "Completed 50 skills",
        "icon": "🧠",
        "xp": 1000,
    },
    "first_project": {
        "title": "Builder",
        "description": "Completed your first project",
        "icon": "🛠️",
        "xp": 100,
    },
    "test_ace": {
        "title": "Test Ace",
        "description": "Passed a skill verification test",
        "icon": "✅",
        "xp": 75,
    },
    "mentor_session": {
        "title": "Wisdom Seeker",
        "description": "Completed a mentor session",
        "icon": "👨‍🏫",
        "xp": 50,
    },
    "helper": {
        "title": "Helpful Hand",
        "description": "Helped 10 peers in study groups",
        "icon": "🤝",
        "xp": 150,
    },
}


async def get_or_create_user_stats(db: AsyncSession, user_id: str) -> UserStats:
    """Get or create user stats."""
    user_uuid = uuid.UUID(user_id)
    result = await db.execute(select(UserStats).where(UserStats.user_id == user_uuid))
    stats = result.scalar_one_or_none()
    
    if not stats:
        stats = UserStats(user_id=user_uuid)
        db.add(stats)
        await db.commit()
        await db.refresh(stats)
    
    return stats


async def add_xp(db: AsyncSession, user_id: str, amount: int, reason: str) -> dict:
    """Add XP to user and check for level up."""
    stats = await get_or_create_user_stats(db, user_id)
    
    old_level = stats.level
    stats.total_xp += amount
    
    # Calculate new level
    new_level = calculate_level(stats.total_xp)
    stats.level = new_level
    
    await db.commit()
    await db.refresh(stats)
    
    # Check if leveled up
    leveled_up = new_level > old_level
    if leveled_up:
        # Create notification
        await create_notification(
            db,
            user_id,
            "Level Up!",
            f"Congratulations! You've reached level {new_level}! 🎉",
            "level_up"
        )
    
    return {
        "xp_gained": amount,
        "total_xp": stats.total_xp,
        "level": stats.level,
        "leveled_up": leveled_up,
        "reason": reason,
    }


def calculate_level(total_xp: int) -> int:
    """Calculate level based on total XP."""
    for level, threshold in enumerate(LEVEL_THRESHOLDS):
        if total_xp < threshold:
            return max(1, level)
    return len(LEVEL_THRESHOLDS)


async def update_streak(db: AsyncSession, user_id: str) -> dict:
    """Update user's learning streak."""
    stats = await get_or_create_user_stats(db, user_id)
    
    today = datetime.utcnow().date()
    last_activity = stats.last_activity_date.date() if stats.last_activity_date else None
    
    if last_activity == today:
        # Already checked in today
        return {
            "current_streak": stats.current_streak,
            "longest_streak": stats.longest_streak,
            "checked_in_today": True,
        }
    
    if last_activity == today - timedelta(days=1):
        # Consecutive day
        stats.current_streak += 1
    elif last_activity is None or last_activity < today - timedelta(days=1):
        # Streak broken
        stats.current_streak = 1
    
    stats.last_activity_date = datetime.utcnow()
    
    # Update longest streak
    if stats.current_streak > stats.longest_streak:
        stats.longest_streak = stats.current_streak
    
    await db.commit()
    await db.refresh(stats)
    
    # Check for streak achievements
    if stats.current_streak == 7:
        await unlock_achievement(db, user_id, "7_day_streak")
    elif stats.current_streak == 30:
        await unlock_achievement(db, user_id, "30_day_streak")
    elif stats.current_streak == 100:
        await unlock_achievement(db, user_id, "100_day_streak")
    
    return {
        "current_streak": stats.current_streak,
        "longest_streak": stats.longest_streak,
        "checked_in_today": True,
    }


async def unlock_achievement(db: AsyncSession, user_id: str, achievement_key: str) -> Achievement | None:
    """Unlock an achievement for a user."""
    if achievement_key not in ACHIEVEMENTS:
        return None
    
    stats = await get_or_create_user_stats(db, user_id)
    
    # Check if already unlocked
    result = await db.execute(
        select(Achievement).where(
            Achievement.user_stats_id == stats.id,
            Achievement.achievement_type == achievement_key
        )
    )
    existing = result.scalar_one_or_none()
    
    if existing:
        return None  # Already unlocked
    
    achievement_data = ACHIEVEMENTS[achievement_key]
    
    # Create achievement
    achievement = Achievement(
        user_stats_id=stats.id,
        achievement_type=achievement_key,
        title=achievement_data["title"],
        description=achievement_data["description"],
        icon=achievement_data["icon"],
        xp_reward=achievement_data["xp"],
    )
    db.add(achievement)
    
    # Add XP reward
    await add_xp(db, user_id, achievement_data["xp"], f"Achievement: {achievement_data['title']}")
    
    # Create notification
    await create_notification(
        db,
        user_id,
        f"Achievement Unlocked: {achievement_data['title']}",
        f"{achievement_data['icon']} {achievement_data['description']}",
        "achievement"
    )
    
    await db.commit()
    await db.refresh(achievement)
    
    return achievement


async def record_daily_checkin(
    db: AsyncSession,
    user_id: str,
    what_learned: str,
    mood: str
) -> dict:
    """Record a daily check-in."""
    user_uuid = uuid.UUID(user_id)
    
    # Generate AI encouragement
    ai_encouragement = await generate_encouragement(what_learned, mood)
    
    # Create check-in
    checkin = DailyCheckIn(
        user_id=user_uuid,
        what_learned=what_learned,
        mood=mood,
        ai_encouragement=ai_encouragement,
        xp_earned=XP_REWARDS["daily_checkin"],
    )
    db.add(checkin)
    
    # Update streak
    streak_data = await update_streak(db, user_id)
    
    # Add XP
    xp_data = await add_xp(db, user_id, XP_REWARDS["daily_checkin"], "Daily check-in")
    
    await db.commit()
    await db.refresh(checkin)
    
    return {
        "checkin_id": str(checkin.id),
        "ai_encouragement": ai_encouragement,
        "xp_earned": xp_data["xp_gained"],
        "total_xp": xp_data["total_xp"],
        "level": xp_data["level"],
        "streak": streak_data["current_streak"],
    }


async def generate_encouragement(what_learned: str, mood: str) -> str:
    """Generate AI encouragement based on what user learned and their mood."""
    # TODO: Integrate with OpenAI for personalized encouragement
    # For now, return template-based encouragement
    
    encouragements = {
        "motivated": [
            f"Amazing work on {what_learned}! Your motivation is inspiring! Keep this momentum going! 🚀",
            f"You're crushing it! Learning {what_learned} shows real dedication. Keep pushing forward! 💪",
        ],
        "struggling": [
            f"I see you're working on {what_learned}. Remember, every expert was once a beginner. You've got this! 💪",
            f"Struggling with {what_learned} is part of the learning process. Each challenge makes you stronger! 🌟",
        ],
        "confident": [
            f"Great job mastering {what_learned}! Your confidence is well-earned. Ready for the next challenge? 🎯",
            f"You're making excellent progress with {what_learned}! Keep building on this confidence! ⭐",
        ],
    }
    
    import random
    messages = encouragements.get(mood, encouragements["motivated"])
    return random.choice(messages)


async def create_notification(
    db: AsyncSession,
    user_id: str,
    title: str,
    message: str,
    notification_type: str,
    action_url: str = None
) -> Notification:
    """Create a notification for a user."""
    user_uuid = uuid.UUID(user_id)
    
    notification = Notification(
        user_id=user_uuid,
        title=title,
        message=message,
        notification_type=notification_type,
        action_url=action_url,
    )
    db.add(notification)
    await db.commit()
    await db.refresh(notification)
    
    return notification


async def get_leaderboard(db: AsyncSession, limit: int = 100) -> list:
    """Get top users by XP."""
    result = await db.execute(
        select(UserStats, User)
        .join(User, UserStats.user_id == User.id)
        .order_by(UserStats.total_xp.desc())
        .limit(limit)
    )
    
    leaderboard = []
    for rank, (stats, user) in enumerate(result.all(), start=1):
        leaderboard.append({
            "rank": rank,
            "user_id": str(user.id),
            "name": user.name,
            "image": user.image,
            "level": stats.level,
            "total_xp": stats.total_xp,
            "current_streak": stats.current_streak,
            "skills_completed": stats.skills_completed,
        })
    
    return leaderboard
