from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import Optional
import uuid
from datetime import datetime, timedelta

from app.db.database import get_db
from app.core.security import get_current_user_id
from app.models.portfolio import DailyChallenge, UserChallenge

router = APIRouter()


class SubmitChallengeRequest(BaseModel):
    user_answer: str


@router.get("/today")
async def get_todays_challenge(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Get today's challenge"""
    today = datetime.utcnow().date()
    
    result = await db.execute(
        select(DailyChallenge).where(
            DailyChallenge.scheduled_for >= datetime.combine(today, datetime.min.time()),
            DailyChallenge.scheduled_for < datetime.combine(today + timedelta(days=1), datetime.min.time())
        )
    )
    challenge = result.scalars().first()
    
    if not challenge:
        # No challenge for today - return a default one
        return {
            "success": True,
            "data": {
                "id": str(uuid.uuid4()),
                "title": "Quick Coding Challenge",
                "description": "Solve today's coding problem",
                "challenge_type": "coding",
                "difficulty": "medium",
                "question": "Implement a function to reverse a string without using built-in reverse methods.",
                "points": 10,
            }
        }
    
    # Check if user already completed it
    user_attempt = await db.execute(
        select(UserChallenge).where(
            UserChallenge.user_id == uuid.UUID(user_id),
            UserChallenge.challenge_id == challenge.id
        )
    )
    attempt = user_attempt.scalar_one_or_none()
    
    return {
        "success": True,
        "data": {
            "id": str(challenge.id),
            "title": challenge.title,
            "description": challenge.description,
            "challenge_type": challenge.challenge_type,
            "difficulty": challenge.difficulty,
            "question": challenge.question,
            "hints": challenge.hints,
            "points": challenge.points,
            "is_completed": attempt is not None and attempt.completed_at is not None,
            "user_score": attempt.score if attempt else None,
        }
    }


@router.post("/{challenge_id}/submit")
async def submit_challenge(
    challenge_id: str,
    request: SubmitChallengeRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Submit challenge solution"""
    result = await db.execute(
        select(DailyChallenge).where(DailyChallenge.id == uuid.UUID(challenge_id))
    )
    challenge = result.scalar_one_or_none()
    
    if not challenge:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Challenge not found"
        )
    
    # Check if already completed
    existing = await db.execute(
        select(UserChallenge).where(
            UserChallenge.user_id == uuid.UUID(user_id),
            UserChallenge.challenge_id == challenge.id
        )
    )
    attempt = existing.scalar_one_or_none()
    
    if attempt and attempt.completed_at:
        return {
            "success": True,
            "message": "Already completed",
            "data": {
                "score": attempt.score,
                "is_correct": attempt.is_correct
            }
        }
    
    # Evaluate answer (simple check for now)
    is_correct = request.user_answer.strip().lower() in challenge.answer.lower() if challenge.answer else False
    score = challenge.points if is_correct else 0
    
    if attempt:
        attempt.user_answer = request.user_answer
        attempt.is_correct = is_correct
        attempt.score = score
        attempt.completed_at = datetime.utcnow()
    else:
        attempt = UserChallenge(
            user_id=uuid.UUID(user_id),
            challenge_id=challenge.id,
            user_answer=request.user_answer,
            is_correct=is_correct,
            score=score,
            completed_at=datetime.utcnow()
        )
        db.add(attempt)
    
    # Update challenge stats
    challenge.attempts_count += 1
    if is_correct:
        challenge.completions_count += 1
    
    await db.commit()
    
    return {
        "success": True,
        "data": {
            "is_correct": is_correct,
            "score": score,
            "points_earned": score,
            "answer": challenge.answer if not is_correct else None,
            "explanation": "Great job!" if is_correct else "Keep practicing!",
        }
    }


@router.get("/stats")
async def get_challenge_stats(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Get user's challenge statistics"""
    result = await db.execute(
        select(UserChallenge).where(
            UserChallenge.user_id == uuid.UUID(user_id),
            UserChallenge.completed_at.isnot(None)
        )
    )
    completions = result.scalars().all()
    
    total_score = sum(c.score for c in completions)
    total_correct = sum(1 for c in completions if c.is_correct)
    
    return {
        "success": True,
        "data": {
            "total_challenges_completed": len(completions),
            "total_score": total_score,
            "correct_answers": total_correct,
            "accuracy": (total_correct / len(completions) * 100) if completions else 0,
        }
    }
