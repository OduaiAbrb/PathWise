"""Exam and Checkpoint API endpoints for roadmap assessment system."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import json

from app.db.database import get_db
from app.core.security import get_current_user_id
from app.services.ai_service import evaluate_open_answer, generate_exam_questions

router = APIRouter()


# ═══════════════════════════════════════════════════════════════════════════
# REQUEST/RESPONSE MODELS
# ═══════════════════════════════════════════════════════════════════════════

class CheckpointAnswerRequest(BaseModel):
    roadmap_id: str
    phase_id: str
    checkpoint_id: str
    answer: str | int
    question_type: str = "mcq"  # mcq, open, code


class ExamSubmissionRequest(BaseModel):
    roadmap_id: str
    phase_id: str
    answers: Dict[str, Any]  # question_id -> answer


class GenerateExamRequest(BaseModel):
    phase_title: str
    skills: List[str]
    target_role: str
    difficulty: str = "intermediate"
    num_questions: int = 5


class EvaluateAnswerRequest(BaseModel):
    question: str
    answer: str
    skill: str
    target_role: str


# ═══════════════════════════════════════════════════════════════════════════
# CHECKPOINT ENDPOINTS
# ═══════════════════════════════════════════════════════════════════════════

@router.post("/checkpoint/answer")
async def submit_checkpoint_answer(
    request: CheckpointAnswerRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Submit an answer to an inline checkpoint question."""
    try:
        # For MCQ, validate against correct answer
        if request.question_type == "mcq":
            # In production, fetch correct answer from DB
            # For now, return the submitted answer
            return {
                "success": True,
                "data": {
                    "checkpoint_id": request.checkpoint_id,
                    "is_correct": True,  # Would validate against stored answer
                    "explanation": "Answer recorded successfully.",
                    "understanding_delta": 5,  # Points added to understanding score
                }
            }
        
        # For open-ended questions, use AI evaluation
        elif request.question_type == "open":
            evaluation = await evaluate_open_answer(
                question="",  # Would fetch from DB
                answer=str(request.answer),
                skill="",
                target_role=""
            )
            return {
                "success": True,
                "data": {
                    "checkpoint_id": request.checkpoint_id,
                    "score": evaluation.get("score", 70),
                    "feedback": evaluation.get("feedback", "Good attempt!"),
                    "is_correct": evaluation.get("score", 70) >= 60,
                    "understanding_delta": evaluation.get("score", 70) // 10,
                }
            }
        
        return {
            "success": True,
            "data": {
                "checkpoint_id": request.checkpoint_id,
                "recorded": True
            }
        }
        
    except Exception as e:
        print(f"❌ Error submitting checkpoint answer: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ═══════════════════════════════════════════════════════════════════════════
# EXAM ENDPOINTS
# ═══════════════════════════════════════════════════════════════════════════

@router.post("/exam/submit")
async def submit_exam(
    request: ExamSubmissionRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Submit a complete phase exam for evaluation."""
    try:
        total_questions = len(request.answers)
        correct_answers = 0
        feedback = []
        
        # In production, fetch exam questions from DB and validate
        # For now, simulate scoring
        for question_id, answer in request.answers.items():
            # Simulate MCQ validation (would check against stored correct answers)
            if isinstance(answer, int):
                # Assume 50% correct for demo
                is_correct = hash(question_id) % 2 == 0
                if is_correct:
                    correct_answers += 1
                feedback.append({
                    "question_id": question_id,
                    "is_correct": is_correct,
                    "your_answer": answer,
                })
            else:
                # Open-ended - use AI evaluation
                evaluation = await evaluate_open_answer(
                    question=question_id,
                    answer=str(answer),
                    skill="general",
                    target_role="engineer"
                )
                score = evaluation.get("score", 70)
                if score >= 60:
                    correct_answers += 1
                feedback.append({
                    "question_id": question_id,
                    "score": score,
                    "feedback": evaluation.get("feedback", ""),
                })
        
        # Calculate final score
        final_score = int((correct_answers / max(total_questions, 1)) * 100)
        passed = final_score >= 70
        
        return {
            "success": True,
            "data": {
                "phase_id": request.phase_id,
                "score": final_score,
                "passed": passed,
                "correct_answers": correct_answers,
                "total_questions": total_questions,
                "feedback": feedback,
                "message": "Congratulations! Phase unlocked." if passed else "Keep practicing. You need 70% to pass.",
                "next_phase_unlocked": passed,
            }
        }
        
    except Exception as e:
        print(f"❌ Error submitting exam: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/exam/generate")
async def generate_exam(
    request: GenerateExamRequest,
    user_id: str = Depends(get_current_user_id),
):
    """Generate exam questions for a phase using AI."""
    try:
        questions = await generate_exam_questions(
            phase_title=request.phase_title,
            skills=request.skills,
            target_role=request.target_role,
            difficulty=request.difficulty,
            num_questions=request.num_questions
        )
        
        return {
            "success": True,
            "data": {
                "phase_title": request.phase_title,
                "questions": questions,
                "pass_score": 70,
            }
        }
        
    except Exception as e:
        print(f"❌ Error generating exam: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ═══════════════════════════════════════════════════════════════════════════
# AI EVALUATION ENDPOINT
# ═══════════════════════════════════════════════════════════════════════════

@router.post("/evaluate")
async def evaluate_answer(
    request: EvaluateAnswerRequest,
    user_id: str = Depends(get_current_user_id),
):
    """Evaluate an open-ended answer using AI."""
    try:
        evaluation = await evaluate_open_answer(
            question=request.question,
            answer=request.answer,
            skill=request.skill,
            target_role=request.target_role
        )
        
        return {
            "success": True,
            "data": evaluation
        }
        
    except Exception as e:
        print(f"❌ Error evaluating answer: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ═══════════════════════════════════════════════════════════════════════════
# PROGRESS ENDPOINTS
# ═══════════════════════════════════════════════════════════════════════════

@router.get("/progress/{roadmap_id}")
async def get_exam_progress(
    roadmap_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Get exam progress for all phases in a roadmap."""
    try:
        # In production, fetch from database
        # For now, return mock progress
        return {
            "success": True,
            "data": {
                "roadmap_id": roadmap_id,
                "phases": [
                    {
                        "phase_id": "phase-0",
                        "understanding_score": 0,
                        "checkpoints_completed": 0,
                        "exam_passed": False,
                        "exam_score": None,
                    }
                ],
                "overall_understanding": 0,
            }
        }
        
    except Exception as e:
        print(f"❌ Error fetching exam progress: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
