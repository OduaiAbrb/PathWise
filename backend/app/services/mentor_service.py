"""Mentor marketplace service."""
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_
from datetime import datetime, timedelta
import uuid

from app.db.models_extended import Mentor, MentorSession, MentorReview


async def create_mentor_profile(
    db: AsyncSession,
    user_id: str,
    expertise: List[str],
    bio: str,
    hourly_rate: float,
    availability: dict
) -> Mentor:
    """Create a mentor profile."""
    user_uuid = uuid.UUID(user_id)
    
    mentor = Mentor(
        user_id=user_uuid,
        expertise=expertise,
        bio=bio,
        hourly_rate=hourly_rate,
        availability=availability,
        is_verified=False,
        rating=0.0,
        total_sessions=0,
    )
    
    db.add(mentor)
    await db.commit()
    await db.refresh(mentor)
    
    return mentor


async def search_mentors(
    db: AsyncSession,
    skills: Optional[List[str]] = None,
    min_rating: Optional[float] = None,
    max_rate: Optional[float] = None,
    availability_day: Optional[str] = None
) -> List[Mentor]:
    """Search for mentors based on criteria."""
    query = select(Mentor).where(Mentor.is_active == True)
    
    if min_rating:
        query = query.where(Mentor.rating >= min_rating)
    
    if max_rate:
        query = query.where(Mentor.hourly_rate <= max_rate)
    
    # Note: Skills filtering would need array operations
    # For PostgreSQL, we'd use array overlap operator
    
    query = query.order_by(Mentor.rating.desc())
    
    result = await db.execute(query)
    return result.scalars().all()


async def book_session(
    db: AsyncSession,
    mentor_id: str,
    mentee_id: str,
    scheduled_time: datetime,
    duration_minutes: int,
    topic: str
) -> MentorSession:
    """Book a mentoring session."""
    mentor_uuid = uuid.UUID(mentor_id)
    mentee_uuid = uuid.UUID(mentee_id)
    
    # Check if mentor is available
    result = await db.execute(select(Mentor).where(Mentor.id == mentor_uuid))
    mentor = result.scalar_one_or_none()
    
    if not mentor or not mentor.is_active:
        raise ValueError("Mentor not available")
    
    # Create session
    session = MentorSession(
        mentor_id=mentor_uuid,
        mentee_id=mentee_uuid,
        scheduled_time=scheduled_time,
        duration_minutes=duration_minutes,
        topic=topic,
        status="scheduled",
        amount_paid=mentor.hourly_rate * (duration_minutes / 60),
    )
    
    db.add(session)
    await db.commit()
    await db.refresh(session)
    
    return session


async def complete_session(
    db: AsyncSession,
    session_id: str,
    notes: Optional[str] = None
) -> MentorSession:
    """Mark a session as completed."""
    session_uuid = uuid.UUID(session_id)
    
    result = await db.execute(select(MentorSession).where(MentorSession.id == session_uuid))
    session = result.scalar_one_or_none()
    
    if not session:
        raise ValueError("Session not found")
    
    session.status = "completed"
    session.completed_at = datetime.utcnow()
    if notes:
        session.notes = notes
    
    # Update mentor's total sessions
    result = await db.execute(select(Mentor).where(Mentor.id == session.mentor_id))
    mentor = result.scalar_one_or_none()
    if mentor:
        mentor.total_sessions += 1
    
    await db.commit()
    await db.refresh(session)
    
    return session


async def add_review(
    db: AsyncSession,
    session_id: str,
    reviewer_id: str,
    rating: int,
    comment: str
) -> MentorReview:
    """Add a review for a mentor session."""
    session_uuid = uuid.UUID(session_id)
    reviewer_uuid = uuid.UUID(reviewer_id)
    
    # Get session
    result = await db.execute(select(MentorSession).where(MentorSession.id == session_uuid))
    session = result.scalar_one_or_none()
    
    if not session:
        raise ValueError("Session not found")
    
    # Create review
    review = MentorReview(
        mentor_id=session.mentor_id,
        session_id=session_uuid,
        reviewer_id=reviewer_uuid,
        rating=rating,
        comment=comment,
    )
    
    db.add(review)
    
    # Update mentor's average rating
    result = await db.execute(
        select(Mentor).where(Mentor.id == session.mentor_id)
    )
    mentor = result.scalar_one_or_none()
    
    if mentor:
        # Get all reviews for this mentor
        reviews_result = await db.execute(
            select(MentorReview).where(MentorReview.mentor_id == mentor.id)
        )
        all_reviews = reviews_result.scalars().all()
        
        # Calculate new average
        total_rating = sum(r.rating for r in all_reviews) + rating
        mentor.rating = total_rating / (len(all_reviews) + 1)
    
    await db.commit()
    await db.refresh(review)
    
    return review


async def get_mentor_availability(
    db: AsyncSession,
    mentor_id: str,
    start_date: datetime,
    end_date: datetime
) -> List[dict]:
    """Get mentor's available time slots."""
    mentor_uuid = uuid.UUID(mentor_id)
    
    # Get mentor
    result = await db.execute(select(Mentor).where(Mentor.id == mentor_uuid))
    mentor = result.scalar_one_or_none()
    
    if not mentor:
        raise ValueError("Mentor not found")
    
    # Get booked sessions in date range
    result = await db.execute(
        select(MentorSession).where(
            and_(
                MentorSession.mentor_id == mentor_uuid,
                MentorSession.scheduled_time >= start_date,
                MentorSession.scheduled_time <= end_date,
                MentorSession.status.in_(["scheduled", "in_progress"])
            )
        )
    )
    booked_sessions = result.scalars().all()
    
    # Build availability slots
    # This is simplified - real implementation would parse mentor.availability
    # and exclude booked times
    
    available_slots = []
    current = start_date
    
    while current < end_date:
        # Check if this slot is booked
        is_booked = any(
            session.scheduled_time <= current < 
            session.scheduled_time + timedelta(minutes=session.duration_minutes)
            for session in booked_sessions
        )
        
        if not is_booked:
            available_slots.append({
                "start_time": current.isoformat(),
                "end_time": (current + timedelta(hours=1)).isoformat(),
                "available": True,
            })
        
        current += timedelta(hours=1)
    
    return available_slots
