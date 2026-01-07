"""Income tracking and ROI calculator API endpoints."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

from app.db.database import get_db
from app.core.security import get_current_user_id
from app.services.income_service import (
    add_income_entry,
    get_income_entries,
    calculate_income_stats,
    calculate_learning_roi,
    project_future_income,
    calculate_skill_value,
    generate_income_report,
)

router = APIRouter()


class AddIncomeRequest(BaseModel):
    amount: float
    source: str
    entry_type: str
    date: str
    description: Optional[str] = None


class CalculateROIRequest(BaseModel):
    initial_salary: float
    current_salary: float
    learning_investment: float
    months_elapsed: int


class ProjectIncomeRequest(BaseModel):
    current_salary: float
    annual_growth_rate: float
    years: int = 5


@router.post("/add", response_model=dict)
async def add_income(
    request: AddIncomeRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Add an income or expense entry."""
    try:
        date = datetime.fromisoformat(request.date.replace('Z', '+00:00'))
        
        entry = await add_income_entry(
            db,
            user_id,
            request.amount,
            request.source,
            request.entry_type,
            date,
            request.description
        )
        
        return {
            "success": True,
            "data": {
                "id": str(entry.id),
                "amount": entry.amount,
                "source": entry.source,
                "entry_type": entry.entry_type,
                "date": entry.date.isoformat(),
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/entries", response_model=dict)
async def get_entries(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    entry_type: Optional[str] = None,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Get income entries with filters."""
    try:
        start = datetime.fromisoformat(start_date.replace('Z', '+00:00')) if start_date else None
        end = datetime.fromisoformat(end_date.replace('Z', '+00:00')) if end_date else None
        
        entries = await get_income_entries(db, user_id, start, end, entry_type)
        
        return {
            "success": True,
            "data": [
                {
                    "id": str(e.id),
                    "amount": e.amount,
                    "source": e.source,
                    "entry_type": e.entry_type,
                    "date": e.date.isoformat(),
                    "description": e.description,
                }
                for e in entries
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/stats", response_model=dict)
async def get_stats(
    months: int = 12,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Get income statistics."""
    try:
        stats = await calculate_income_stats(db, user_id, months)
        
        return {
            "success": True,
            "data": stats
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/calculate-roi", response_model=dict)
async def calculate_roi(
    request: CalculateROIRequest,
    user_id: str = Depends(get_current_user_id)
):
    """Calculate ROI on learning investment."""
    try:
        roi = calculate_learning_roi(
            request.initial_salary,
            request.current_salary,
            request.learning_investment,
            request.months_elapsed
        )
        
        return {
            "success": True,
            "data": roi
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/project", response_model=dict)
async def project(
    request: ProjectIncomeRequest,
    user_id: str = Depends(get_current_user_id)
):
    """Project future income."""
    try:
        projections = project_future_income(
            request.current_salary,
            request.annual_growth_rate,
            request.years
        )
        
        return {
            "success": True,
            "data": projections
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/skill-value/{skill_name}", response_model=dict)
async def skill_value(
    skill_name: str,
    user_id: str = Depends(get_current_user_id)
):
    """Get estimated market value of a skill."""
    try:
        value = calculate_skill_value(skill_name)
        
        return {
            "success": True,
            "data": value
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/report", response_model=dict)
async def get_report(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Generate comprehensive income report."""
    try:
        # Get stats
        stats = await calculate_income_stats(db, user_id, 12)
        
        # Calculate ROI (using placeholder values)
        roi = calculate_learning_roi(50000, 65000, 5000, 12)
        
        # Project income
        projections = project_future_income(65000, 10, 5)
        
        # Generate report
        report = generate_income_report(stats, roi, projections)
        
        return {
            "success": True,
            "data": report
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
