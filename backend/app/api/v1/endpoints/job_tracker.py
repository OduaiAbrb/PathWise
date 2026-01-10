"""
Job Application Tracker API Endpoints
Track job applications, interviews, and outcomes
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime
import uuid

from app.db.database import get_db
from app.core.security import get_current_user_id

router = APIRouter()


class JobApplicationCreate(BaseModel):
    company_name: str
    job_title: str
    job_url: Optional[str] = None
    location: Optional[str] = None
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    job_type: Optional[str] = None  # full-time, part-time, contract, remote
    notes: Optional[str] = None
    status: str = "saved"  # saved, applied, phone_screen, interview, offer, rejected, withdrawn


class JobApplicationUpdate(BaseModel):
    company_name: Optional[str] = None
    job_title: Optional[str] = None
    job_url: Optional[str] = None
    location: Optional[str] = None
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    job_type: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[str] = None
    applied_at: Optional[datetime] = None
    next_follow_up: Optional[datetime] = None
    offer_amount: Optional[int] = None
    rejection_reason: Optional[str] = None


class InterviewAdd(BaseModel):
    application_id: str
    interview_date: datetime
    interview_type: str  # phone, technical, behavioral, onsite, final
    notes: Optional[str] = None
    outcome: Optional[str] = None  # pending, passed, failed


# In-memory storage (in production, use database)
_job_applications: dict = {}


@router.post("", response_model=dict)
async def create_job_application(
    request: JobApplicationCreate,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Create a new job application"""
    
    application_id = str(uuid.uuid4())
    
    application = {
        "id": application_id,
        "user_id": user_id,
        "company_name": request.company_name,
        "job_title": request.job_title,
        "job_url": request.job_url,
        "location": request.location,
        "salary_min": request.salary_min,
        "salary_max": request.salary_max,
        "job_type": request.job_type,
        "status": request.status,
        "notes": request.notes,
        "applied_at": datetime.utcnow().isoformat() if request.status == "applied" else None,
        "interviews": [],
        "next_follow_up": None,
        "follow_up_count": 0,
        "offer_amount": None,
        "rejection_reason": None,
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
    }
    
    # Store in memory (keyed by user_id)
    if user_id not in _job_applications:
        _job_applications[user_id] = {}
    _job_applications[user_id][application_id] = application
    
    return {
        "success": True,
        "data": application
    }


@router.get("", response_model=dict)
async def list_job_applications(
    status: Optional[str] = None,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """List all job applications for the user"""
    
    user_apps = _job_applications.get(user_id, {})
    applications = list(user_apps.values())
    
    # Filter by status if provided
    if status:
        applications = [a for a in applications if a.get("status") == status]
    
    # Sort by updated_at descending
    applications.sort(key=lambda x: x.get("updated_at", ""), reverse=True)
    
    # Calculate stats
    stats = {
        "total": len(user_apps),
        "saved": len([a for a in user_apps.values() if a.get("status") == "saved"]),
        "applied": len([a for a in user_apps.values() if a.get("status") == "applied"]),
        "interviewing": len([a for a in user_apps.values() if a.get("status") in ["phone_screen", "interview"]]),
        "offers": len([a for a in user_apps.values() if a.get("status") == "offer"]),
        "rejected": len([a for a in user_apps.values() if a.get("status") == "rejected"]),
    }
    
    return {
        "success": True,
        "data": {
            "applications": applications,
            "stats": stats,
        }
    }


@router.get("/{application_id}", response_model=dict)
async def get_job_application(
    application_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Get a specific job application"""
    
    user_apps = _job_applications.get(user_id, {})
    application = user_apps.get(application_id)
    
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    return {
        "success": True,
        "data": application
    }


@router.put("/{application_id}", response_model=dict)
async def update_job_application(
    application_id: str,
    request: JobApplicationUpdate,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Update a job application"""
    
    user_apps = _job_applications.get(user_id, {})
    application = user_apps.get(application_id)
    
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    # Update fields
    update_data = request.dict(exclude_unset=True)
    for key, value in update_data.items():
        if value is not None:
            if isinstance(value, datetime):
                application[key] = value.isoformat()
            else:
                application[key] = value
    
    # Auto-set applied_at when status changes to applied
    if request.status == "applied" and not application.get("applied_at"):
        application["applied_at"] = datetime.utcnow().isoformat()
    
    application["updated_at"] = datetime.utcnow().isoformat()
    
    return {
        "success": True,
        "data": application
    }


@router.delete("/{application_id}", response_model=dict)
async def delete_job_application(
    application_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Delete a job application"""
    
    user_apps = _job_applications.get(user_id, {})
    
    if application_id not in user_apps:
        raise HTTPException(status_code=404, detail="Application not found")
    
    del user_apps[application_id]
    
    return {
        "success": True,
        "message": "Application deleted"
    }


@router.post("/{application_id}/interview", response_model=dict)
async def add_interview(
    application_id: str,
    request: InterviewAdd,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Add an interview to a job application"""
    
    user_apps = _job_applications.get(user_id, {})
    application = user_apps.get(application_id)
    
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    interview = {
        "id": str(uuid.uuid4()),
        "date": request.interview_date.isoformat(),
        "type": request.interview_type,
        "notes": request.notes,
        "outcome": request.outcome or "pending",
    }
    
    application["interviews"].append(interview)
    application["updated_at"] = datetime.utcnow().isoformat()
    
    # Auto-update status to interview if not already
    if application["status"] in ["saved", "applied", "phone_screen"]:
        if request.interview_type == "phone":
            application["status"] = "phone_screen"
        else:
            application["status"] = "interview"
    
    return {
        "success": True,
        "data": application
    }


@router.get("/stats/summary", response_model=dict)
async def get_application_stats(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Get summary statistics for job applications"""
    
    user_apps = _job_applications.get(user_id, {})
    applications = list(user_apps.values())
    
    # Calculate response rate
    applied_count = len([a for a in applications if a.get("applied_at")])
    response_count = len([a for a in applications if a.get("status") in ["phone_screen", "interview", "offer", "rejected"]])
    response_rate = (response_count / applied_count * 100) if applied_count > 0 else 0
    
    # Calculate interview rate
    interview_count = len([a for a in applications if a.get("interviews")])
    interview_rate = (interview_count / applied_count * 100) if applied_count > 0 else 0
    
    # Calculate offer rate
    offer_count = len([a for a in applications if a.get("status") == "offer"])
    offer_rate = (offer_count / applied_count * 100) if applied_count > 0 else 0
    
    # Average salary from offers
    offers_with_salary = [a for a in applications if a.get("status") == "offer" and a.get("offer_amount")]
    avg_offer = sum(a["offer_amount"] for a in offers_with_salary) / len(offers_with_salary) if offers_with_salary else 0
    
    return {
        "success": True,
        "data": {
            "total_applications": len(applications),
            "applied_count": applied_count,
            "response_rate": round(response_rate, 1),
            "interview_rate": round(interview_rate, 1),
            "offer_rate": round(offer_rate, 1),
            "offer_count": offer_count,
            "average_offer_salary": int(avg_offer),
            "status_breakdown": {
                "saved": len([a for a in applications if a.get("status") == "saved"]),
                "applied": len([a for a in applications if a.get("status") == "applied"]),
                "phone_screen": len([a for a in applications if a.get("status") == "phone_screen"]),
                "interview": len([a for a in applications if a.get("status") == "interview"]),
                "offer": offer_count,
                "rejected": len([a for a in applications if a.get("status") == "rejected"]),
                "withdrawn": len([a for a in applications if a.get("status") == "withdrawn"]),
            }
        }
    }
