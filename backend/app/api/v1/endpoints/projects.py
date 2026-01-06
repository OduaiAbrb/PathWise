"""AI Project Generator API endpoints."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import List, Optional
import uuid
from datetime import datetime

from app.db.database import get_db
from app.core.security import get_current_user_id
from app.db.models_extended import GeneratedProject
from app.services.project_generator_service import (
    generate_project_idea,
    generate_implementation_guide,
    generate_test_cases,
    review_project_code,
    suggest_project_improvements,
)

router = APIRouter()


class GenerateProjectRequest(BaseModel):
    skills: List[str]
    difficulty: str
    interests: Optional[List[str]] = None
    time_available: Optional[str] = None
    roadmap_id: Optional[str] = None


class ImplementationGuideRequest(BaseModel):
    project_description: str
    tech_stack: List[str]


class GenerateTestsRequest(BaseModel):
    project_description: str
    features: List[dict]


class ReviewCodeRequest(BaseModel):
    code: str
    project_requirements: List[str]


class SuggestImprovementsRequest(BaseModel):
    project_id: str
    user_feedback: Optional[str] = None


class UpdateProjectRequest(BaseModel):
    status: Optional[str] = None
    completion_percentage: Optional[int] = None
    github_url: Optional[str] = None


@router.post("/generate", response_model=dict)
async def generate_project(
    request: GenerateProjectRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Generate a custom project idea."""
    try:
        # Generate project
        project_data = await generate_project_idea(
            request.skills,
            request.difficulty,
            request.interests,
            request.time_available
        )
        
        user_uuid = uuid.UUID(user_id)
        roadmap_uuid = uuid.UUID(request.roadmap_id) if request.roadmap_id else None
        
        # Save to database
        project = GeneratedProject(
            user_id=user_uuid,
            roadmap_id=roadmap_uuid,
            title=project_data["title"],
            description=project_data["description"],
            difficulty=project_data["difficulty"],
            tech_stack=project_data["tech_stack"],
            requirements=project_data["requirements"],
            implementation_guide=project_data["implementation_steps"],
            test_cases=project_data.get("test_cases", []),
            status="not_started",
        )
        
        db.add(project)
        await db.commit()
        await db.refresh(project)
        
        return {
            "success": True,
            "data": {
                "id": str(project.id),
                **project_data
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/implementation-guide", response_model=dict)
async def get_implementation_guide(
    request: ImplementationGuideRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Get detailed implementation guide for a project."""
    try:
        guide = await generate_implementation_guide(
            request.project_description,
            request.tech_stack
        )
        
        return {
            "success": True,
            "data": guide
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/generate-tests", response_model=dict)
async def generate_tests(
    request: GenerateTestsRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Generate test cases for a project."""
    try:
        tests = await generate_test_cases(
            request.project_description,
            request.features
        )
        
        return {
            "success": True,
            "data": tests
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/review-code", response_model=dict)
async def review_code(
    request: ReviewCodeRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Review project code against requirements."""
    try:
        review = await review_project_code(
            request.code,
            request.project_requirements
        )
        
        return {
            "success": True,
            "data": review
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/suggest-improvements", response_model=dict)
async def suggest_improvements(
    request: SuggestImprovementsRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Get improvement suggestions for a project."""
    try:
        user_uuid = uuid.UUID(user_id)
        project_uuid = uuid.UUID(request.project_id)
        
        # Get project
        result = await db.execute(
            select(GeneratedProject).where(
                GeneratedProject.id == project_uuid,
                GeneratedProject.user_id == user_uuid
            )
        )
        project = result.scalar_one_or_none()
        
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Get suggestions
        project_dict = {
            "title": project.title,
            "description": project.description,
            "tech_stack": project.tech_stack,
            "features": project.requirements,
        }
        
        suggestions = await suggest_project_improvements(
            project_dict,
            request.user_feedback
        )
        
        return {
            "success": True,
            "data": suggestions
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/list", response_model=dict)
async def list_projects(
    roadmap_id: Optional[str] = None,
    status: Optional[str] = None,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """List user's generated projects."""
    user_uuid = uuid.UUID(user_id)
    
    query = select(GeneratedProject).where(GeneratedProject.user_id == user_uuid)
    
    if roadmap_id:
        roadmap_uuid = uuid.UUID(roadmap_id)
        query = query.where(GeneratedProject.roadmap_id == roadmap_uuid)
    
    if status:
        query = query.where(GeneratedProject.status == status)
    
    query = query.order_by(GeneratedProject.created_at.desc())
    
    result = await db.execute(query)
    projects = result.scalars().all()
    
    return {
        "success": True,
        "data": [
            {
                "id": str(p.id),
                "title": p.title,
                "description": p.description,
                "difficulty": p.difficulty,
                "tech_stack": p.tech_stack,
                "status": p.status,
                "completion_percentage": p.completion_percentage,
                "github_url": p.github_url,
                "created_at": p.created_at.isoformat(),
            }
            for p in projects
        ]
    }


@router.get("/{project_id}", response_model=dict)
async def get_project(
    project_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Get a specific project with full details."""
    user_uuid = uuid.UUID(user_id)
    project_uuid = uuid.UUID(project_id)
    
    result = await db.execute(
        select(GeneratedProject).where(
            GeneratedProject.id == project_uuid,
            GeneratedProject.user_id == user_uuid
        )
    )
    project = result.scalar_one_or_none()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    return {
        "success": True,
        "data": {
            "id": str(project.id),
            "title": project.title,
            "description": project.description,
            "difficulty": project.difficulty,
            "tech_stack": project.tech_stack,
            "requirements": project.requirements,
            "implementation_guide": project.implementation_guide,
            "test_cases": project.test_cases,
            "status": project.status,
            "completion_percentage": project.completion_percentage,
            "github_url": project.github_url,
            "created_at": project.created_at.isoformat(),
            "completed_at": project.completed_at.isoformat() if project.completed_at else None,
        }
    }


@router.patch("/{project_id}", response_model=dict)
async def update_project(
    project_id: str,
    request: UpdateProjectRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Update project status and progress."""
    user_uuid = uuid.UUID(user_id)
    project_uuid = uuid.UUID(project_id)
    
    result = await db.execute(
        select(GeneratedProject).where(
            GeneratedProject.id == project_uuid,
            GeneratedProject.user_id == user_uuid
        )
    )
    project = result.scalar_one_or_none()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Update fields
    if request.status:
        project.status = request.status
        if request.status == "completed":
            project.completed_at = datetime.utcnow()
    
    if request.completion_percentage is not None:
        project.completion_percentage = request.completion_percentage
    
    if request.github_url:
        project.github_url = request.github_url
    
    await db.commit()
    await db.refresh(project)
    
    return {
        "success": True,
        "data": {
            "id": str(project.id),
            "status": project.status,
            "completion_percentage": project.completion_percentage,
            "github_url": project.github_url,
        }
    }
