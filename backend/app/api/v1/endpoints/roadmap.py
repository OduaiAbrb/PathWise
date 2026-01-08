from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from datetime import datetime
import uuid

from app.db.database import get_db
from app.db.models import Roadmap, Progress, User
from app.schemas.roadmap import (
    RoadmapGenerateRequest,
    RoadmapResponse,
    RoadmapListResponse,
    ProgressUpdate,
    ProgressResponse,
    TimeLogRequest,
)
from app.core.security import get_current_user_id
from app.services.ai_service import generate_roadmap

router = APIRouter()


@router.post("/generate", response_model=dict)
async def create_roadmap(
    request: RoadmapGenerateRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Generate a new learning roadmap from a job description."""
    print(f"🎯 Roadmap generation started for user: {user_id}")
    print(f"📝 Request: job_description length={len(request.job_description)}, skill_level={request.skill_level}, industry={request.industry}")
    
    # Convert user_id string to UUID
    try:
        user_uuid = uuid.UUID(user_id)
    except ValueError:
        print(f"❌ Invalid user ID format: {user_id}")
        raise HTTPException(status_code=400, detail="Invalid user ID format")
    
    # Check user tier for rate limiting
    result = await db.execute(select(User).where(User.id == user_uuid))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Free tier: max 10 roadmaps (increased for testing)
    if user.tier == "free":
        roadmap_count = await db.execute(
            select(Roadmap).where(Roadmap.user_id == user_id)
        )
        existing_roadmaps = roadmap_count.scalars().all()
        print(f"📊 User has {len(existing_roadmaps)} existing roadmaps")
        if len(existing_roadmaps) >= 10:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Free tier limited to 10 roadmaps. You have {len(existing_roadmaps)}. Delete old roadmaps or upgrade to Pro."
            )
    
    try:
        print(f"🎯 Starting AI roadmap generation...")
        # Generate roadmap using AI with timeout protection
        ai_result = await generate_roadmap(
            job_description=request.job_description,
            skill_level=request.skill_level,
            industry=request.industry
        )
        print(f"✅ AI generation complete!")
        
        # Create roadmap in database
        new_roadmap = Roadmap(
            user_id=user_id,
            job_title=ai_result.get("job_title", "Untitled Role"),
            job_description=request.job_description,
            industry=ai_result.get("industry", request.industry),
            skill_level=request.skill_level,
            estimated_weeks=ai_result.get("estimated_weeks"),
            phases=ai_result.get("phases", []),
            projects=ai_result.get("projects", []),
            status="active",
        )
        
        db.add(new_roadmap)
        await db.commit()
        await db.refresh(new_roadmap)
        
        # Initialize progress for all skills
        for phase in ai_result.get("phases", []):
            for skill in phase.get("skills", []):
                progress = Progress(
                    roadmap_id=new_roadmap.id,
                    skill_id=skill["id"],
                    skill_name=skill["name"],
                    status="not_started",
                )
                db.add(progress)
        
        await db.commit()
        
        return {
            "success": True,
            "data": {
                "id": str(new_roadmap.id),
                "job_title": new_roadmap.job_title,
                "industry": new_roadmap.industry,
                "skill_level": new_roadmap.skill_level,
                "estimated_weeks": new_roadmap.estimated_weeks,
                "phases": new_roadmap.phases,
                "projects": new_roadmap.projects,
                "completion_percentage": 0,
                "status": new_roadmap.status,
                "generated_at": new_roadmap.generated_at.isoformat(),
            }
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate roadmap: {str(e)}"
        )


@router.get("", response_model=dict)
@router.get("/", response_model=dict)
@router.get("/list", response_model=dict)
async def list_roadmaps(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """List all roadmaps for the current user."""
    # Convert user_id string to UUID
    try:
        user_uuid = uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user ID format")
    
    result = await db.execute(
        select(Roadmap)
        .where(Roadmap.user_id == user_uuid)
        .order_by(Roadmap.generated_at.desc())
    )
    roadmaps = result.scalars().all()
    
    return {
        "success": True,
        "data": [
            {
                "id": str(r.id),
                "job_title": r.job_title,
                "industry": r.industry,
                "skill_level": r.skill_level,
                "completion_percentage": r.completion_percentage,
                "estimated_weeks": r.estimated_weeks,
                "status": r.status,
                "generated_at": r.generated_at.isoformat(),
            }
            for r in roadmaps
        ]
    }


@router.get("/{roadmap_id}", response_model=dict)
async def get_roadmap(
    roadmap_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Get a specific roadmap with full details."""
    # Convert IDs to UUID
    try:
        user_uuid = uuid.UUID(user_id)
        roadmap_uuid = uuid.UUID(roadmap_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid ID format")
    result = await db.execute(
        select(Roadmap)
        .where(Roadmap.id == roadmap_uuid, Roadmap.user_id == user_uuid)
    )
    roadmap = result.scalar_one_or_none()
    
    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found")
    
    # Get progress for this roadmap
    progress_result = await db.execute(
        select(Progress).where(Progress.roadmap_id == roadmap_uuid)
    )
    progress_items = progress_result.scalars().all()
    
    progress_map = {p.skill_id: p for p in progress_items}
    
    # Merge progress into phases
    phases_with_progress = []
    for phase in roadmap.phases or []:
        phase_copy = phase.copy()
        skills_with_progress = []
        for skill in phase.get("skills", []):
            skill_copy = skill.copy()
            progress = progress_map.get(skill["id"])
            if progress:
                skill_copy["progress"] = {
                    "status": progress.status,
                    "time_spent_minutes": progress.time_spent_minutes,
                    "completed_at": progress.completed_at.isoformat() if progress.completed_at else None,
                }
            else:
                skill_copy["progress"] = {"status": "not_started", "time_spent_minutes": 0}
            skills_with_progress.append(skill_copy)
        phase_copy["skills"] = skills_with_progress
        phases_with_progress.append(phase_copy)
    
    return {
        "success": True,
        "data": {
            "id": str(roadmap.id),
            "job_title": roadmap.job_title,
            "job_description": roadmap.job_description,
            "industry": roadmap.industry,
            "skill_level": roadmap.skill_level,
            "estimated_weeks": roadmap.estimated_weeks,
            "phases": phases_with_progress,
            "projects": roadmap.projects,
            "completion_percentage": roadmap.completion_percentage,
            "status": roadmap.status,
            "generated_at": roadmap.generated_at.isoformat(),
        }
    }


@router.post("/progress", response_model=dict)
async def update_progress(
    request: ProgressUpdate,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Update skill progress status."""
    # Verify roadmap ownership
    roadmap_result = await db.execute(
        select(Roadmap)
        .where(Roadmap.id == request.roadmap_id, Roadmap.user_id == user_id)
    )
    roadmap = roadmap_result.scalar_one_or_none()
    
    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found")
    
    # Update or create progress
    progress_result = await db.execute(
        select(Progress)
        .where(Progress.roadmap_id == request.roadmap_id, Progress.skill_id == request.skill_id)
    )
    progress = progress_result.scalar_one_or_none()
    
    if progress:
        progress.status = request.status
        if request.status == "completed":
            progress.completed_at = datetime.utcnow()
    else:
        # Find skill name from phases
        skill_name = request.skill_id
        for phase in roadmap.phases or []:
            for skill in phase.get("skills", []):
                if skill["id"] == request.skill_id:
                    skill_name = skill["name"]
                    break
        
        progress = Progress(
            roadmap_id=request.roadmap_id,
            skill_id=request.skill_id,
            skill_name=skill_name,
            status=request.status,
            completed_at=datetime.utcnow() if request.status == "completed" else None,
        )
        db.add(progress)
    
    # Recalculate roadmap completion
    all_progress = await db.execute(
        select(Progress).where(Progress.roadmap_id == request.roadmap_id)
    )
    all_items = all_progress.scalars().all()
    
    if all_items:
        completed = sum(1 for p in all_items if p.status == "completed")
        roadmap.completion_percentage = int((completed / len(all_items)) * 100)
    
    await db.commit()
    
    return {
        "success": True,
        "data": {
            "skill_id": request.skill_id,
            "status": request.status,
            "roadmap_completion": roadmap.completion_percentage,
        }
    }


@router.post("/time-log", response_model=dict)
async def log_time(
    request: TimeLogRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Log time spent on a skill."""
    # Verify roadmap ownership
    roadmap_result = await db.execute(
        select(Roadmap)
        .where(Roadmap.id == request.roadmap_id, Roadmap.user_id == user_id)
    )
    roadmap = roadmap_result.scalar_one_or_none()
    
    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found")
    
    # Update progress time
    progress_result = await db.execute(
        select(Progress)
        .where(Progress.roadmap_id == request.roadmap_id, Progress.skill_id == request.skill_id)
    )
    progress = progress_result.scalar_one_or_none()
    
    if progress:
        progress.time_spent_minutes += request.minutes
        if progress.status == "not_started":
            progress.status = "in_progress"
        await db.commit()
        
        return {
            "success": True,
            "data": {
                "skill_id": request.skill_id,
                "total_time_minutes": progress.time_spent_minutes,
                "status": progress.status,
            }
        }
    
    raise HTTPException(status_code=404, detail="Skill not found in roadmap")


@router.delete("/{roadmap_id}", response_model=dict)
async def delete_roadmap(
    roadmap_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Delete a roadmap."""
    result = await db.execute(
        select(Roadmap)
        .where(Roadmap.id == roadmap_id, Roadmap.user_id == user_id)
    )
    roadmap = result.scalar_one_or_none()
    
    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found")
    
    await db.delete(roadmap)
    await db.commit()
    
    return {"success": True, "message": "Roadmap deleted"}
