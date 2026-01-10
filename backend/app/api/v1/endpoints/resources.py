"""
Learning Resources API Endpoints
Resource discovery, health checking, and broken link reporting
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime
import uuid

from app.db.database import get_db
from app.core.security import get_current_user_id
from app.services.resource_service_v2 import (
    get_resources_for_skill,
    get_official_doc,
    get_skill_category,
    mark_resource_unhealthy,
    get_resource_health,
    VERIFIED_RESOURCES,
    OFFICIAL_DOCS,
)

router = APIRouter()

# In-memory storage for reports (in production, use database)
_resource_reports: List[dict] = []


class ResourceReportRequest(BaseModel):
    resource_id: str
    resource_url: str
    report_type: str  # broken_link, outdated, inappropriate, other
    description: Optional[str] = None
    suggested_replacement_url: Optional[str] = None


class ResourceSearchRequest(BaseModel):
    skill_name: str
    difficulty: Optional[str] = None


@router.get("/skill/{skill_name}", response_model=dict)
async def get_skill_resources(
    skill_name: str,
    difficulty: Optional[str] = None,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Get curated resources for a specific skill"""
    
    # Get user tier
    from app.db.models import User
    from sqlalchemy import select
    
    try:
        user_uuid = uuid.UUID(user_id)
        result = await db.execute(select(User).where(User.id == user_uuid))
        user = result.scalar_one_or_none()
        user_tier = user.tier if user else "free"
    except:
        user_tier = "free"
    
    resources = get_resources_for_skill(
        skill_name,
        user_tier=user_tier,
        difficulty=difficulty
    )
    
    # Get official doc if available
    official_doc = get_official_doc(skill_name)
    
    return {
        "success": True,
        "data": {
            "skill_name": skill_name,
            "category": get_skill_category(skill_name),
            "user_tier": user_tier,
            "official_documentation": official_doc,
            "resources": resources,
            "resource_count": len(resources),
        }
    }


@router.get("/categories", response_model=dict)
async def list_resource_categories(
    user_id: str = Depends(get_current_user_id),
):
    """List all available resource categories"""
    
    categories = []
    for category, resources in VERIFIED_RESOURCES.items():
        categories.append({
            "id": category,
            "name": category.replace("_", " ").title(),
            "resource_count": len(resources),
            "has_official_docs": category in OFFICIAL_DOCS,
        })
    
    return {
        "success": True,
        "data": categories
    }


@router.get("/official-docs", response_model=dict)
async def list_official_docs(
    user_id: str = Depends(get_current_user_id),
):
    """List all official documentation links"""
    
    docs = []
    for tech, doc in OFFICIAL_DOCS.items():
        docs.append({
            "technology": tech,
            "title": doc["title"],
            "url": doc["url"],
            "tutorial_url": doc.get("tutorial"),
            "provider": doc["provider"],
        })
    
    return {
        "success": True,
        "data": docs
    }


@router.post("/report", response_model=dict)
async def report_broken_resource(
    request: ResourceReportRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Report a broken or outdated resource"""
    
    report = {
        "id": str(uuid.uuid4()),
        "resource_id": request.resource_id,
        "resource_url": request.resource_url,
        "report_type": request.report_type,
        "description": request.description,
        "suggested_replacement_url": request.suggested_replacement_url,
        "user_id": user_id,
        "status": "pending",
        "created_at": datetime.utcnow().isoformat(),
    }
    
    _resource_reports.append(report)
    
    # Mark resource as potentially unhealthy
    if request.report_type == "broken_link":
        mark_resource_unhealthy(
            request.resource_id,
            f"User reported: {request.description or 'Broken link'}"
        )
    
    return {
        "success": True,
        "message": "Thank you for reporting this issue. We'll review it shortly.",
        "data": {
            "report_id": report["id"],
        }
    }


@router.get("/health/{resource_id}", response_model=dict)
async def check_resource_health(
    resource_id: str,
    user_id: str = Depends(get_current_user_id),
):
    """Check the health status of a specific resource"""
    
    health = get_resource_health(resource_id)
    
    return {
        "success": True,
        "data": {
            "resource_id": resource_id,
            "health_status": health or {"is_healthy": True, "checked_at": None},
        }
    }


@router.get("/reports", response_model=dict)
async def list_resource_reports(
    status: Optional[str] = None,
    user_id: str = Depends(get_current_user_id),
):
    """List resource reports (admin only in production)"""
    
    reports = _resource_reports
    
    if status:
        reports = [r for r in reports if r.get("status") == status]
    
    return {
        "success": True,
        "data": {
            "reports": reports[-50:],  # Last 50 reports
            "total_count": len(reports),
            "pending_count": len([r for r in _resource_reports if r.get("status") == "pending"]),
        }
    }


@router.get("/search", response_model=dict)
async def search_resources(
    query: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Search across all resources"""
    
    # Get user tier
    from app.db.models import User
    from sqlalchemy import select
    
    try:
        user_uuid = uuid.UUID(user_id)
        result = await db.execute(select(User).where(User.id == user_uuid))
        user = result.scalar_one_or_none()
        user_tier = user.tier if user else "free"
    except:
        user_tier = "free"
    
    query_lower = query.lower()
    results = []
    
    # Search through all resources
    for category, resources in VERIFIED_RESOURCES.items():
        for resource in resources:
            # Check if query matches title, provider, or category
            if (query_lower in resource.get("title", "").lower() or
                query_lower in resource.get("provider", "").lower() or
                query_lower in category.lower()):
                
                # Check tier access
                tier_order = {"free": 0, "standard": 1, "premium": 2}
                if tier_order.get(resource.get("tier_required", "free"), 0) <= tier_order.get(user_tier, 0):
                    result = resource.copy()
                    result["category"] = category
                    results.append(result)
    
    # Sort by quality score
    results.sort(key=lambda x: x.get("quality_score", 0), reverse=True)
    
    return {
        "success": True,
        "data": {
            "query": query,
            "results": results[:20],  # Top 20 results
            "total_count": len(results),
        }
    }
