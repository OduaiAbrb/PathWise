"""Personal AI Mentor API endpoints (renamed from Study Buddy)."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import List, Optional

from app.db.database import get_db
from app.core.security import get_current_user_id
from app.services.study_buddy_service import (
    chat_with_study_buddy,
    chat_interview_mode,
    explain_concept,
    debug_code,
    generate_quiz,
    review_project,
    suggest_learning_path,
)

router = APIRouter()


class ChatMessage(BaseModel):
    role: str
    content: str


class StudyBuddyChatRequest(BaseModel):
    message: str
    conversation_history: List[ChatMessage] = []
    user_context: Optional[dict] = None
    context: Optional[str] = None  # Additional system context
    mode: str = "mentor"  # "mentor" or "interview"


class ExplainConceptRequest(BaseModel):
    concept: str
    skill_level: str = "beginner"


class DebugCodeRequest(BaseModel):
    code: str
    error_message: str
    language: str


class GenerateQuizRequest(BaseModel):
    topic: str
    difficulty: str = "intermediate"
    num_questions: int = 5


class ReviewProjectRequest(BaseModel):
    project_description: str
    code_or_demo: str
    criteria: List[str]


class SuggestLearningPathRequest(BaseModel):
    current_skills: List[str]
    target_role: str
    time_available: str


@router.post("/chat", response_model=dict)
async def chat_endpoint(
    request: StudyBuddyChatRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Chat with Personal AI Mentor (supports interview mode)."""
    try:
        # Choose handler based on mode
        if request.mode == "interview":
            response = await chat_interview_mode(
                request.message,
                [{"role": msg.role, "content": msg.content} for msg in request.conversation_history],
                request.context
            )
        else:
            response = await chat_with_study_buddy(
                request.message,
                [{"role": msg.role, "content": msg.content} for msg in request.conversation_history],
                request.user_context,
                request.context
            )
        
        return {
            "success": True,
            "response": response,
            "data": {
                "response": response,
                "timestamp": "now"
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/explain", response_model=dict)
async def explain_concept_endpoint(
    request: ExplainConceptRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Get an explanation of a concept."""
    try:
        explanation = await explain_concept(request.concept, request.skill_level)
        
        return {
            "success": True,
            "data": {
                "concept": request.concept,
                "explanation": explanation,
                "skill_level": request.skill_level
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/debug", response_model=dict)
async def debug_code_endpoint(
    request: DebugCodeRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Debug code and get help fixing errors."""
    try:
        result = await debug_code(request.code, request.error_message, request.language)
        
        return {
            "success": True,
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/quiz", response_model=dict)
async def generate_quiz_endpoint(
    request: GenerateQuizRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Generate a quiz to test understanding."""
    try:
        quiz = await generate_quiz(request.topic, request.difficulty, request.num_questions)
        
        return {
            "success": True,
            "data": quiz
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/review", response_model=dict)
async def review_project_endpoint(
    request: ReviewProjectRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Review a project and get feedback."""
    try:
        review = await review_project(
            request.project_description,
            request.code_or_demo,
            request.criteria
        )
        
        return {
            "success": True,
            "data": review
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/learning-path", response_model=dict)
async def suggest_learning_path_endpoint(
    request: SuggestLearningPathRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Get a personalized learning path suggestion."""
    try:
        path = await suggest_learning_path(
            request.current_skills,
            request.target_role,
            request.time_available
        )
        
        return {
            "success": True,
            "data": path
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
