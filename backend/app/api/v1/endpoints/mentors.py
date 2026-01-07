"""Mentor marketplace API endpoints."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

from app.db.database import get_db
from app.core.security import get_current_user_id
from app.services.mentor_service import (
    create_mentor_profile,
    search_mentors,
    book_session,
    complete_session,
    add_review,
    get_mentor_availability,
)

router = APIRouter()


class CreateMentorRequest(BaseModel):
    expertise: List[str]
    bio: str
    hourly_rate: float
    availability: dict


class BookSessionRequest(BaseModel):
    mentor_id: str
    scheduled_time: str
    duration_minutes: int
    topic: str


class CompleteSessionRequest(BaseModel):
    session_id: str
    notes: Optional[str] = None


class AddReviewRequest(BaseModel):
    session_id: str
    rating: int
    comment: str


@router.post("/profile", response_model=dict)
async def create_profile(
    request: CreateMentorRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Create a mentor profile."""
    try:
        mentor = await create_mentor_profile(
            db,
            user_id,
            request.expertise,
            request.bio,
            request.hourly_rate,
            request.availability
        )
        
        return {
            "success": True,
            "data": {
                "id": str(mentor.id),
                "expertise": mentor.expertise,
                "hourly_rate": mentor.hourly_rate,
                "is_verified": mentor.is_verified,
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/search", response_model=dict)
async def search(
    skills: Optional[str] = None,
    min_rating: Optional[float] = None,
    max_rate: Optional[float] = None,
    db: AsyncSession = Depends(get_db)
):
    """Search for mentors."""
    try:
        skill_list = skills.split(",") if skills else None
        mentors = await search_mentors(db, skill_list, min_rating, max_rate)
        
        return {
            "success": True,
            "data": [
                {
                    "id": str(m.id),
                    "user_id": str(m.user_id),
                    "expertise": m.expertise,
                    "bio": m.bio,
                    "hourly_rate": m.hourly_rate,
                    "rating": m.rating,
                    "total_sessions": m.total_sessions,
                    "is_verified": m.is_verified,
                }
                for m in mentors
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/book", response_model=dict)
async def book(
    request: BookSessionRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Book a mentoring session."""
    try:
        scheduled_time = datetime.fromisoformat(request.scheduled_time.replace('Z', '+00:00'))
        
        session = await book_session(
            db,
            request.mentor_id,
            user_id,
            scheduled_time,
            request.duration_minutes,
            request.topic
        )
        
        return {
            "success": True,
            "data": {
                "id": str(session.id),
                "scheduled_time": session.scheduled_time.isoformat(),
                "duration_minutes": session.duration_minutes,
                "topic": session.topic,
                "amount_paid": session.amount_paid,
                "status": session.status,
            }
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/complete", response_model=dict)
async def complete(
    request: CompleteSessionRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Mark a session as completed."""
    try:
        session = await complete_session(db, request.session_id, request.notes)
        
        return {
            "success": True,
            "data": {
                "id": str(session.id),
                "status": session.status,
                "completed_at": session.completed_at.isoformat() if session.completed_at else None,
            }
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/review", response_model=dict)
async def review(
    request: AddReviewRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Add a review for a mentor."""
    try:
        review = await add_review(
            db,
            request.session_id,
            user_id,
            request.rating,
            request.comment
        )
        
        return {
            "success": True,
            "data": {
                "id": str(review.id),
                "rating": review.rating,
                "comment": review.comment,
            }
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/availability/{mentor_id}", response_model=dict)
async def availability(
    mentor_id: str,
    start_date: str,
    end_date: str,
    db: AsyncSession = Depends(get_db)
):
    """Get mentor availability."""
    try:
        start = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
        end = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
        
        slots = await get_mentor_availability(db, mentor_id, start, end)
        
        return {
            "success": True,
            "data": slots
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
