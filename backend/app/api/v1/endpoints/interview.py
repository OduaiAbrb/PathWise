from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import List, Optional
import uuid
from datetime import datetime

from app.db.database import get_db
from app.core.security import get_current_user_id
from app.models.portfolio import InterviewSession
from app.services.ai_service import generate_interview_questions, evaluate_interview_response

router = APIRouter()


class StartInterviewRequest(BaseModel):
    session_type: str  # coding, system_design, behavioral, full_mock
    target_role: str
    difficulty: str  # easy, medium, hard


class SubmitResponseRequest(BaseModel):
    question_id: str
    response: str


@router.post("/start")
async def start_interview(
    request: StartInterviewRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Start a new interview simulation session"""
    print(f"🎙️ Starting {request.session_type} interview for {request.target_role}")
    
    # Generate interview questions using AI
    questions = await generate_interview_questions(
        session_type=request.session_type,
        target_role=request.target_role,
        difficulty=request.difficulty
    )
    
    # Create interview session
    session = InterviewSession(
        user_id=uuid.UUID(user_id),
        session_type=request.session_type,
        target_role=request.target_role,
        difficulty=request.difficulty,
        questions=questions,
        status="in_progress"
    )
    
    db.add(session)
    await db.commit()
    await db.refresh(session)
    
    print(f"✅ Interview session created: {session.id}")
    
    return {
        "success": True,
        "data": {
            "session_id": str(session.id),
            "questions": questions,
            "duration_minutes": session.duration_minutes,
        }
    }


@router.post("/{session_id}/submit")
async def submit_response(
    session_id: str,
    request: SubmitResponseRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Submit a response to an interview question"""
    result = await db.execute(
        select(InterviewSession).where(
            InterviewSession.id == uuid.UUID(session_id),
            InterviewSession.user_id == uuid.UUID(user_id)
        )
    )
    session = result.scalar_one_or_none()
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview session not found"
        )
    
    # Add response
    if not session.responses:
        session.responses = []
    
    session.responses.append({
        "question_id": request.question_id,
        "response": request.response,
        "submitted_at": datetime.utcnow().isoformat()
    })
    
    await db.commit()
    
    return {
        "success": True,
        "message": "Response submitted"
    }


@router.post("/{session_id}/complete")
async def complete_interview(
    session_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Complete interview and get AI evaluation"""
    result = await db.execute(
        select(InterviewSession).where(
            InterviewSession.id == uuid.UUID(session_id),
            InterviewSession.user_id == uuid.UUID(user_id)
        )
    )
    session = result.scalar_one_or_none()
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview session not found"
        )
    
    print(f"🤖 Evaluating interview responses...")
    
    # AI evaluation
    evaluation = await evaluate_interview_response(
        questions=session.questions,
        responses=session.responses,
        target_role=session.target_role,
        session_type=session.session_type
    )
    
    # Update session
    session.status = "completed"
    session.completed_at = datetime.utcnow()
    session.overall_score = evaluation.get("overall_score", 0)
    session.feedback = evaluation.get("feedback", {})
    session.strengths = evaluation.get("strengths", [])
    session.improvements = evaluation.get("improvements", [])
    
    await db.commit()
    
    print(f"✅ Interview evaluated. Score: {session.overall_score}/100")
    
    return {
        "success": True,
        "data": {
            "overall_score": session.overall_score,
            "feedback": session.feedback,
            "strengths": session.strengths,
            "improvements": session.improvements,
        }
    }


@router.get("/history")
async def get_interview_history(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Get user's interview history"""
    result = await db.execute(
        select(InterviewSession)
        .where(InterviewSession.user_id == uuid.UUID(user_id))
        .order_by(InterviewSession.started_at.desc())
    )
    sessions = result.scalars().all()
    
    return {
        "success": True,
        "data": [
            {
                "id": str(s.id),
                "session_type": s.session_type,
                "target_role": s.target_role,
                "difficulty": s.difficulty,
                "overall_score": s.overall_score,
                "status": s.status,
                "started_at": s.started_at.isoformat(),
                "completed_at": s.completed_at.isoformat() if s.completed_at else None,
            }
            for s in sessions
        ]
    }
