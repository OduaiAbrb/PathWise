"""Resume and job application API endpoints."""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional, List
import uuid
from datetime import datetime

from app.db.database import get_db
from app.core.security import get_current_user_id
from app.db.models_extended import Resume, JobApplication
from app.services.resume_service import (
    parse_resume_pdf,
    analyze_resume,
    calculate_skill_gap,
    optimize_resume_for_ats,
    generate_cover_letter,
)

router = APIRouter()


@router.post("/upload", response_model=dict)
async def upload_resume(
    file: UploadFile = File(...),
    is_primary: bool = Form(False),
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Upload and parse a resume."""
    try:
        # Read file content
        content = await file.read()
        
        # Parse PDF
        resume_text = await parse_resume_pdf(content)
        
        # TODO: Upload to S3/Cloudinary and get URL
        file_url = f"temp://{file.filename}"  # Placeholder
        
        user_uuid = uuid.UUID(user_id)
        
        # Create resume record
        resume = Resume(
            user_id=user_uuid,
            file_url=file_url,
            original_filename=file.filename,
            parsed_text=resume_text,
            is_primary=is_primary,
        )
        
        # If this is primary, unset other primary resumes
        if is_primary:
            result = await db.execute(
                select(Resume).where(Resume.user_id == user_uuid, Resume.is_primary == True)
            )
            for existing in result.scalars().all():
                existing.is_primary = False
        
        db.add(resume)
        await db.commit()
        await db.refresh(resume)
        
        return {
            "success": True,
            "data": {
                "id": str(resume.id),
                "filename": resume.original_filename,
                "parsed_text_preview": resume_text[:500] + "..." if len(resume_text) > 500 else resume_text,
                "is_primary": resume.is_primary,
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/analyze", response_model=dict)
async def analyze_resume_endpoint(
    resume_id: str = Form(...),
    target_role: Optional[str] = Form(None),
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Analyze a resume and extract skills."""
    try:
        user_uuid = uuid.UUID(user_id)
        resume_uuid = uuid.UUID(resume_id)
        
        # Get resume
        result = await db.execute(
            select(Resume).where(Resume.id == resume_uuid, Resume.user_id == user_uuid)
        )
        resume = result.scalar_one_or_none()
        
        if not resume:
            raise HTTPException(status_code=404, detail="Resume not found")
        
        # Analyze
        analysis = await analyze_resume(resume.parsed_text, target_role)
        
        # Update resume with extracted skills
        resume.skills_extracted = analysis.get("skills", [])
        resume.experience_years = analysis.get("experience_years")
        resume.updated_at = datetime.utcnow()
        
        await db.commit()
        
        return {
            "success": True,
            "data": analysis
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/skill-gap", response_model=dict)
async def skill_gap_analysis(
    resume_id: str = Form(...),
    job_description: str = Form(...),
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Calculate skill gap for a job."""
    try:
        user_uuid = uuid.UUID(user_id)
        resume_uuid = uuid.UUID(resume_id)
        
        # Get resume
        result = await db.execute(
            select(Resume).where(Resume.id == resume_uuid, Resume.user_id == user_uuid)
        )
        resume = result.scalar_one_or_none()
        
        if not resume:
            raise HTTPException(status_code=404, detail="Resume not found")
        
        # Get skills
        current_skills = resume.skills_extracted or []
        
        # Calculate gap
        gap_analysis = await calculate_skill_gap(current_skills, job_description)
        
        return {
            "success": True,
            "data": gap_analysis
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/optimize-ats", response_model=dict)
async def optimize_for_ats(
    resume_id: str = Form(...),
    job_description: str = Form(...),
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Optimize resume for ATS."""
    try:
        user_uuid = uuid.UUID(user_id)
        resume_uuid = uuid.UUID(resume_id)
        
        # Get resume
        result = await db.execute(
            select(Resume).where(Resume.id == resume_uuid, Resume.user_id == user_uuid)
        )
        resume = result.scalar_one_or_none()
        
        if not resume:
            raise HTTPException(status_code=404, detail="Resume not found")
        
        # Optimize
        optimization = await optimize_resume_for_ats(resume.parsed_text, job_description)
        
        return {
            "success": True,
            "data": optimization
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/cover-letter", response_model=dict)
async def generate_cover_letter_endpoint(
    resume_id: str = Form(...),
    job_description: str = Form(...),
    company_name: str = Form(...),
    job_title: str = Form(...),
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Generate a customized cover letter."""
    try:
        user_uuid = uuid.UUID(user_id)
        resume_uuid = uuid.UUID(resume_id)
        
        # Get resume
        result = await db.execute(
            select(Resume).where(Resume.id == resume_uuid, Resume.user_id == user_uuid)
        )
        resume = result.scalar_one_or_none()
        
        if not resume:
            raise HTTPException(status_code=404, detail="Resume not found")
        
        # Generate cover letter
        cover_letter = await generate_cover_letter(
            resume.parsed_text,
            job_description,
            company_name,
            job_title
        )
        
        return {
            "success": True,
            "data": {
                "cover_letter": cover_letter,
                "company": company_name,
                "job_title": job_title,
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/list", response_model=dict)
async def list_resumes(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """List all user's resumes."""
    user_uuid = uuid.UUID(user_id)
    
    result = await db.execute(
        select(Resume).where(Resume.user_id == user_uuid).order_by(Resume.created_at.desc())
    )
    resumes = result.scalars().all()
    
    return {
        "success": True,
        "data": [
            {
                "id": str(r.id),
                "filename": r.original_filename,
                "is_primary": r.is_primary,
                "skills_count": len(r.skills_extracted) if r.skills_extracted else 0,
                "experience_years": r.experience_years,
                "created_at": r.created_at.isoformat(),
            }
            for r in resumes
        ]
    }
