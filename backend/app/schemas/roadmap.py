from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class SkillBase(BaseModel):
    id: str
    name: str
    category: str
    difficulty: str  # beginner, intermediate, advanced
    importance: str  # critical, important, optional
    estimated_hours: int
    description: str


class ResourceBase(BaseModel):
    id: str
    title: str
    url: str
    type: str  # video, article, course, documentation, book
    difficulty: str
    duration_minutes: Optional[int] = None
    quality_score: float


class SkillWithResources(SkillBase):
    resources: List[ResourceBase] = []


class PhaseBase(BaseModel):
    id: str
    name: str
    description: str
    order: int
    estimated_weeks: int
    skills: List[SkillWithResources] = []


class ProjectBase(BaseModel):
    id: str
    title: str
    description: str
    difficulty: str
    estimated_hours: int
    skills: List[str]
    steps: List[str]


class RoadmapGenerateRequest(BaseModel):
    job_description: str
    skill_level: str  # beginner, intermediate, advanced
    industry: Optional[str] = None


class RoadmapResponse(BaseModel):
    id: str
    user_id: str
    job_title: str
    job_description: str
    industry: Optional[str] = None
    skill_level: str
    generated_at: datetime
    completion_percentage: int
    estimated_weeks: Optional[int] = None
    phases: List[PhaseBase] = []
    projects: List[ProjectBase] = []
    status: str

    class Config:
        from_attributes = True


class RoadmapListResponse(BaseModel):
    id: str
    job_title: str
    industry: Optional[str] = None
    skill_level: str
    completion_percentage: int
    estimated_weeks: Optional[int] = None
    status: str
    generated_at: datetime

    class Config:
        from_attributes = True


class ProgressUpdate(BaseModel):
    roadmap_id: str
    skill_id: str
    status: str  # not_started, in_progress, completed


class ProgressResponse(BaseModel):
    id: str
    roadmap_id: str
    skill_id: str
    skill_name: str
    status: str
    time_spent_minutes: int
    completed_at: Optional[datetime] = None
    notes: Optional[str] = None

    class Config:
        from_attributes = True


class TimeLogRequest(BaseModel):
    roadmap_id: str
    skill_id: str
    minutes: int
