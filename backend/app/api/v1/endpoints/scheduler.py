"""Smart study scheduler API endpoints."""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

from app.core.security import get_current_user_id
from app.services.scheduler_service import SmartScheduler

router = APIRouter()


class CalendarEvent(BaseModel):
    start: str
    end: str
    title: str


class FindSlotsRequest(BaseModel):
    calendar_events: List[CalendarEvent]
    study_duration_minutes: int
    preferred_times: Optional[List[str]] = None
    days_ahead: int = 7


class GeneratePlanRequest(BaseModel):
    roadmap_data: dict
    hours_per_week: int
    start_date: str
    calendar_events: List[CalendarEvent]


class PomodoroRequest(BaseModel):
    total_minutes: int
    work_interval: int = 25
    short_break: int = 5
    long_break: int = 15


class StudySession(BaseModel):
    start_time: str
    duration_minutes: int


@router.post("/find-slots", response_model=dict)
async def find_slots(
    request: FindSlotsRequest,
    user_id: str = Depends(get_current_user_id)
):
    """Find optimal study time slots."""
    try:
        events = [e.dict() for e in request.calendar_events]
        
        slots = SmartScheduler.find_optimal_study_times(
            events,
            request.study_duration_minutes,
            request.preferred_times,
            request.days_ahead
        )
        
        return {
            "success": True,
            "data": slots
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/generate-plan", response_model=dict)
async def generate_plan(
    request: GeneratePlanRequest,
    user_id: str = Depends(get_current_user_id)
):
    """Generate a complete study plan."""
    try:
        start_date = datetime.fromisoformat(request.start_date.replace('Z', '+00:00'))
        events = [e.dict() for e in request.calendar_events]
        
        plan = SmartScheduler.generate_study_plan(
            request.roadmap_data,
            request.hours_per_week,
            start_date,
            events
        )
        
        return {
            "success": True,
            "data": plan
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/pomodoro", response_model=dict)
async def pomodoro_schedule(
    request: PomodoroRequest,
    user_id: str = Depends(get_current_user_id)
):
    """Generate a Pomodoro technique schedule."""
    try:
        schedule = SmartScheduler.suggest_pomodoro_schedule(
            request.total_minutes,
            request.work_interval,
            request.short_break,
            request.long_break
        )
        
        return {
            "success": True,
            "data": schedule
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/analyze-patterns", response_model=dict)
async def analyze_patterns(
    sessions: List[StudySession],
    user_id: str = Depends(get_current_user_id)
):
    """Analyze study patterns and provide insights."""
    try:
        session_data = [s.dict() for s in sessions]
        
        analysis = SmartScheduler.analyze_study_patterns(session_data)
        
        return {
            "success": True,
            "data": analysis
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
