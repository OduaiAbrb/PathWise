"""Company-Specific Interview Paths with enhanced AI feedback."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import List, Optional

from app.db.database import get_db
from app.db.models import User
from app.core.security import get_current_user_id

router = APIRouter()

# Company tech stack intelligence
COMPANY_PROFILES = {
    "google": {
        "name": "Google",
        "focus_areas": ["system design", "algorithms", "data structures", "distributed systems"],
        "interview_style": "Whiteboard coding, system design, behavioral (Googleyness)",
        "tech_stack": ["Python", "Go", "Java", "C++", "GCP", "Kubernetes"],
        "difficulty": "hard",
        "rounds": 5,
        "tips": [
            "Practice on LeetCode medium/hard problems",
            "Focus on time/space complexity analysis",
            "Prepare STAR format behavioral answers",
            "Study Google's engineering principles",
        ],
    },
    "meta": {
        "name": "Meta",
        "focus_areas": ["algorithms", "system design", "product sense", "behavioral"],
        "interview_style": "Coding on CoderPad, system design, behavioral",
        "tech_stack": ["React", "Python", "PHP (Hack)", "C++", "GraphQL"],
        "difficulty": "hard",
        "rounds": 4,
        "tips": [
            "Practice coding in an online editor (no IDE autocomplete)",
            "Focus on graph and tree problems",
            "Prepare product sense questions",
            "Study Meta's core values",
        ],
    },
    "amazon": {
        "name": "Amazon",
        "focus_areas": ["leadership principles", "system design", "coding", "behavioral"],
        "interview_style": "Leadership principle-focused behavioral, coding, system design",
        "tech_stack": ["Java", "Python", "AWS", "DynamoDB", "Microservices"],
        "difficulty": "hard",
        "rounds": 5,
        "tips": [
            "Memorize all 16 Leadership Principles with examples",
            "Use the STAR method for every behavioral question",
            "Focus on scalable system design with AWS services",
            "Practice object-oriented design problems",
        ],
    },
    "stripe": {
        "name": "Stripe",
        "focus_areas": ["API design", "system design", "coding", "debugging"],
        "interview_style": "Practical coding, API design, debugging exercises",
        "tech_stack": ["Ruby", "Python", "Go", "React", "PostgreSQL"],
        "difficulty": "hard",
        "rounds": 4,
        "tips": [
            "Focus on clean, production-quality code",
            "Practice API design and RESTful principles",
            "Study payment processing concepts",
            "Prepare for debugging real code snippets",
        ],
    },
    "careem": {
        "name": "Careem",
        "focus_areas": ["system design", "mobile development", "backend", "algorithms"],
        "interview_style": "Technical coding, system design, cultural fit",
        "tech_stack": ["Kotlin", "Swift", "Go", "Python", "PostgreSQL", "Kafka"],
        "difficulty": "medium",
        "rounds": 4,
        "tips": [
            "Focus on real-time systems and geolocation",
            "Study ride-sharing system design",
            "Prepare for mobile-first architecture questions",
            "Understand MENA market challenges",
        ],
    },
    "mursalat": {
        "name": "Mursalat (Jordan)",
        "focus_areas": ["web development", "APIs", "databases", "DevOps"],
        "interview_style": "Technical interview, take-home project, cultural fit",
        "tech_stack": ["React", "Node.js", "Python", "PostgreSQL", "Docker"],
        "difficulty": "medium",
        "rounds": 3,
        "tips": [
            "Prepare a strong portfolio of projects",
            "Focus on full-stack development skills",
            "Study Arabic localization and RTL challenges",
            "Demonstrate knowledge of local market needs",
        ],
    },
}


class CompanyPath(BaseModel):
    company: str
    name: str
    focus_areas: List[str]
    interview_style: str
    tech_stack: List[str]
    difficulty: str
    rounds: int
    tips: List[str]


class InterviewFeedback(BaseModel):
    technical_accuracy: int  # 0-100
    communication_clarity: int  # 0-100
    problem_solving: int  # 0-100
    code_quality: int  # 0-100
    overall_score: int  # 0-100
    strengths: List[str]
    improvements: List[str]
    detailed_feedback: str


@router.get("/companies", response_model=dict)
async def list_companies():
    """List all available company-specific preparation paths."""
    companies = []
    for key, profile in COMPANY_PROFILES.items():
        companies.append({
            "id": key,
            "name": profile["name"],
            "difficulty": profile["difficulty"],
            "rounds": profile["rounds"],
            "focus_areas": profile["focus_areas"][:3],
        })
    return {"success": True, "data": companies}


@router.get("/company/{company_id}", response_model=dict)
async def get_company_path(company_id: str):
    """Get detailed preparation path for a specific company."""
    profile = COMPANY_PROFILES.get(company_id.lower())
    if not profile:
        raise HTTPException(
            status_code=404,
            detail=f"Company '{company_id}' not found. Available: {list(COMPANY_PROFILES.keys())}"
        )

    return {"success": True, "data": profile}


@router.post("/feedback", response_model=dict)
async def get_enhanced_interview_feedback(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Get enhanced AI interview feedback with detailed scoring breakdown.
    
    In production, this would analyze recorded interview sessions.
    For now, returns a structured feedback template.
    """
    return {
        "success": True,
        "data": {
            "technical_accuracy": 72,
            "communication_clarity": 85,
            "problem_solving": 68,
            "code_quality": 76,
            "overall_score": 75,
            "strengths": [
                "Clear communication of thought process",
                "Good use of data structures",
                "Asked clarifying questions before coding",
            ],
            "improvements": [
                "Consider edge cases earlier in problem solving",
                "Optimize time complexity — your O(n²) solution could be O(n log n)",
                "Practice explaining trade-offs between approaches",
            ],
            "detailed_feedback": (
                "Your overall performance was solid. You demonstrated strong communication skills "
                "and a logical approach to problem solving. To improve, focus on identifying edge "
                "cases before coding and practice optimizing brute-force solutions. Consider studying "
                "common patterns like sliding window, two pointers, and dynamic programming."
            ),
        }
    }
