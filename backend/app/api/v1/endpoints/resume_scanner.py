"""
Resume Scanner API Endpoints
Full resume analysis, ATS optimization, and skill gap detection
"""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional
from pydantic import BaseModel
import uuid

from app.db.database import get_db
from app.db.models import User
from app.core.security import get_current_user_id
from app.services.resume_service import (
    parse_resume_pdf,
    analyze_resume,
    calculate_skill_gap,
    optimize_resume_for_ats,
    generate_cover_letter,
)

router = APIRouter()


class ResumeAnalysisRequest(BaseModel):
    resume_text: str
    target_role: Optional[str] = None


class SkillGapRequest(BaseModel):
    job_description: str


class ATSOptimizeRequest(BaseModel):
    resume_text: str
    job_description: str


class CoverLetterRequest(BaseModel):
    resume_text: str
    job_description: str
    company_name: str
    job_title: str


@router.post("/upload", response_model=dict)
async def upload_and_analyze_resume(
    file: UploadFile = File(...),
    target_role: Optional[str] = Form(None),
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Upload a PDF resume and get comprehensive analysis"""
    
    # Validate file type
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are supported. Please upload a PDF resume."
        )
    
    # Check file size (max 5MB)
    content = await file.read()
    if len(content) > 5 * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail="File too large. Maximum size is 5MB."
        )
    
    try:
        # Parse PDF
        resume_text = await parse_resume_pdf(content)
        
        if not resume_text or len(resume_text) < 100:
            raise HTTPException(
                status_code=400,
                detail="Could not extract text from PDF. Please ensure the PDF contains selectable text."
            )
        
        # Analyze resume
        analysis = await analyze_resume(resume_text, target_role)
        
        return {
            "success": True,
            "data": {
                "resume_text": resume_text[:500] + "..." if len(resume_text) > 500 else resume_text,
                "analysis": analysis,
                "file_name": file.filename,
            }
        }
        
    except Exception as e:
        print(f"❌ Resume upload error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to analyze resume: {str(e)}"
        )


@router.post("/analyze", response_model=dict)
async def analyze_resume_text(
    request: ResumeAnalysisRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Analyze resume text (for pasted content)"""
    
    if not request.resume_text or len(request.resume_text) < 100:
        raise HTTPException(
            status_code=400,
            detail="Resume text is too short. Please provide more content."
        )
    
    try:
        analysis = await analyze_resume(request.resume_text, request.target_role)
        
        return {
            "success": True,
            "data": analysis
        }
        
    except Exception as e:
        print(f"❌ Resume analysis error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to analyze resume: {str(e)}"
        )


@router.post("/skill-gap", response_model=dict)
async def analyze_skill_gap(
    request: SkillGapRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Analyze skill gap between user's skills and job requirements"""
    
    # Get user's roadmap to extract current skills
    from app.db.models import Roadmap, Progress
    
    try:
        user_uuid = uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user ID")
    
    # Get user's latest roadmap
    result = await db.execute(
        select(Roadmap)
        .where(Roadmap.user_id == user_uuid)
        .order_by(Roadmap.generated_at.desc())
        .limit(1)
    )
    roadmap = result.scalar_one_or_none()
    
    # Extract skills from roadmap
    current_skills = []
    if roadmap and roadmap.phases:
        for phase in roadmap.phases:
            for skill in phase.get("skills", []):
                # Get progress for this skill
                progress_result = await db.execute(
                    select(Progress)
                    .where(Progress.roadmap_id == roadmap.id, Progress.skill_id == skill.get("id"))
                )
                progress = progress_result.scalar_one_or_none()
                
                proficiency = "beginner"
                if progress:
                    if progress.status == "completed":
                        proficiency = "intermediate"
                    elif progress.status == "in_progress":
                        proficiency = "beginner"
                
                current_skills.append({
                    "name": skill.get("name"),
                    "proficiency": proficiency,
                })
    
    if not current_skills:
        raise HTTPException(
            status_code=400,
            detail="No skills found. Please create a roadmap first to track your skills."
        )
    
    try:
        gap_analysis = await calculate_skill_gap(current_skills, request.job_description)
        
        return {
            "success": True,
            "data": {
                "current_skills_count": len(current_skills),
                "analysis": gap_analysis,
            }
        }
        
    except Exception as e:
        print(f"❌ Skill gap analysis error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to analyze skill gap: {str(e)}"
        )


@router.post("/ats-optimize", response_model=dict)
async def optimize_for_ats(
    request: ATSOptimizeRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Optimize resume for Applicant Tracking Systems"""
    
    if not request.resume_text or len(request.resume_text) < 100:
        raise HTTPException(
            status_code=400,
            detail="Resume text is too short."
        )
    
    if not request.job_description or len(request.job_description) < 50:
        raise HTTPException(
            status_code=400,
            detail="Job description is too short."
        )
    
    try:
        optimization = await optimize_resume_for_ats(
            request.resume_text,
            request.job_description
        )
        
        return {
            "success": True,
            "data": optimization
        }
        
    except Exception as e:
        print(f"❌ ATS optimization error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to optimize resume: {str(e)}"
        )


@router.post("/cover-letter", response_model=dict)
async def generate_cover_letter_endpoint(
    request: CoverLetterRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Generate a customized cover letter"""
    
    if not request.resume_text or len(request.resume_text) < 100:
        raise HTTPException(
            status_code=400,
            detail="Resume text is too short."
        )
    
    try:
        cover_letter = await generate_cover_letter(
            request.resume_text,
            request.job_description,
            request.company_name,
            request.job_title
        )
        
        return {
            "success": True,
            "data": {
                "cover_letter": cover_letter,
                "company": request.company_name,
                "job_title": request.job_title,
            }
        }
        
    except Exception as e:
        print(f"❌ Cover letter generation error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate cover letter: {str(e)}"
        )
