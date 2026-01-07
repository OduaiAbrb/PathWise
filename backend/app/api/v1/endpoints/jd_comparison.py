"""
Job Description Comparison API Endpoints
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import List, Optional
from uuid import UUID

from app.db.database import get_db
from app.core.security import get_current_user_id
from app.services.jd_comparison_service import jd_comparison_service

router = APIRouter()


class JDExtractRequest(BaseModel):
    job_description: str


class JDCompareRequest(BaseModel):
    job_descriptions: List[dict]


@router.post("/extract")
async def extract_skills(
    request: JDExtractRequest,
    user_id: str = Depends(get_current_user_id)
):
    """Extract skills from a job description"""
    if len(request.job_description) < 50:
        raise HTTPException(status_code=400, detail="Job description too short")

    result = await jd_comparison_service.extract_skills_from_jd(request.job_description)
    
    return {
        "success": True,
        "data": result
    }


@router.post("/compare")
async def compare_jds(
    request: JDCompareRequest,
    user_id: str = Depends(get_current_user_id)
):
    """Compare multiple job descriptions"""
    if len(request.job_descriptions) < 2:
        raise HTTPException(status_code=400, detail="Need at least 2 job descriptions to compare")

    result = await jd_comparison_service.compare_job_descriptions(request.job_descriptions)
    
    return {
        "success": True,
        "data": result
    }
