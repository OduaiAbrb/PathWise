from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional
import uuid

from app.db.session import get_db
from app.core.security import get_current_user_id
from app.models.portfolio import Portfolio
from app.models.roadmap import Roadmap
from app.services.ai_service import generate_portfolio_content

router = APIRouter()


@router.post("/generate")
async def generate_portfolio(
    roadmap_id: Optional[str] = None,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Generate a portfolio from roadmap progress"""
    print(f"📁 Generating portfolio for user: {user_id}")
    
    # Get user's roadmap
    roadmap = None
    if roadmap_id:
        result = await db.execute(
            select(Roadmap).where(
                Roadmap.id == uuid.UUID(roadmap_id),
                Roadmap.user_id == uuid.UUID(user_id)
            )
        )
        roadmap = result.scalar_one_or_none()
    else:
        # Get most recent roadmap
        result = await db.execute(
            select(Roadmap)
            .where(Roadmap.user_id == uuid.UUID(user_id))
            .order_by(Roadmap.created_at.desc())
        )
        roadmap = result.scalars().first()
    
    if not roadmap:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No roadmap found. Create a roadmap first."
        )
    
    # Generate portfolio content using AI
    print(f"🤖 Generating AI content for {roadmap.job_title} portfolio...")
    portfolio_data = await generate_portfolio_content(
        target_role=roadmap.job_title,
        roadmap_data=roadmap.phases,
        skill_level=roadmap.skill_level
    )
    
    # Create portfolio
    new_portfolio = Portfolio(
        user_id=uuid.UUID(user_id),
        roadmap_id=roadmap.id,
        title=f"{roadmap.job_title} Portfolio",
        tagline=portfolio_data.get("tagline"),
        bio=portfolio_data.get("bio"),
        resume_bullets=portfolio_data.get("resume_bullets", []),
        linkedin_posts=portfolio_data.get("linkedin_posts", []),
        projects=portfolio_data.get("projects", []),
        certificates=portfolio_data.get("certificates", []),
    )
    
    db.add(new_portfolio)
    await db.commit()
    await db.refresh(new_portfolio)
    
    print(f"✅ Portfolio created: {new_portfolio.id}")
    
    return {
        "success": True,
        "data": {
            "id": str(new_portfolio.id),
            "title": new_portfolio.title,
            "tagline": new_portfolio.tagline,
            "bio": new_portfolio.bio,
            "resume_bullets": new_portfolio.resume_bullets,
            "linkedin_posts": new_portfolio.linkedin_posts,
            "projects": new_portfolio.projects,
            "certificates": new_portfolio.certificates,
            "is_published": new_portfolio.is_published,
        }
    }


@router.get("/{portfolio_id}")
async def get_portfolio(
    portfolio_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Get a specific portfolio"""
    result = await db.execute(
        select(Portfolio).where(
            Portfolio.id == uuid.UUID(portfolio_id),
            Portfolio.user_id == uuid.UUID(user_id)
        )
    )
    portfolio = result.scalar_one_or_none()
    
    if not portfolio:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Portfolio not found"
        )
    
    return {
        "success": True,
        "data": {
            "id": str(portfolio.id),
            "title": portfolio.title,
            "tagline": portfolio.tagline,
            "bio": portfolio.bio,
            "resume_bullets": portfolio.resume_bullets,
            "linkedin_posts": portfolio.linkedin_posts,
            "projects": portfolio.projects,
            "certificates": portfolio.certificates,
            "github_url": portfolio.github_url,
            "linkedin_url": portfolio.linkedin_url,
            "website_url": portfolio.website_url,
            "is_published": portfolio.is_published,
            "views_count": portfolio.views_count,
        }
    }


@router.get("")
async def list_portfolios(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """List all user portfolios"""
    result = await db.execute(
        select(Portfolio)
        .where(Portfolio.user_id == uuid.UUID(user_id))
        .order_by(Portfolio.created_at.desc())
    )
    portfolios = result.scalars().all()
    
    return {
        "success": True,
        "data": [
            {
                "id": str(p.id),
                "title": p.title,
                "tagline": p.tagline,
                "is_published": p.is_published,
                "views_count": p.views_count,
                "created_at": p.created_at.isoformat(),
            }
            for p in portfolios
        ]
    }


@router.put("/{portfolio_id}/publish")
async def publish_portfolio(
    portfolio_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Publish portfolio to make it public"""
    result = await db.execute(
        select(Portfolio).where(
            Portfolio.id == uuid.UUID(portfolio_id),
            Portfolio.user_id == uuid.UUID(user_id)
        )
    )
    portfolio = result.scalar_one_or_none()
    
    if not portfolio:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Portfolio not found"
        )
    
    portfolio.is_published = True
    await db.commit()
    
    return {
        "success": True,
        "message": "Portfolio published successfully"
    }
