"""
Resource Database Models
Tracks learning resources with health status, user reports, and fallbacks
"""

from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, Text, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid

from app.db.database import Base


class LearningResource(Base):
    """Curated learning resource with health tracking"""
    __tablename__ = "learning_resources"

    id = Column(UUID(), primary_key=True, default=uuid.uuid4)
    
    # Resource info
    title = Column(String(500), nullable=False)
    url = Column(String(1000), nullable=False, unique=True)
    description = Column(Text, nullable=True)
    
    # Categorization
    skill_category = Column(String(100), nullable=False, index=True)  # python, javascript, react, etc.
    resource_type = Column(String(50), nullable=False)  # video, documentation, article, course, interactive, book
    provider = Column(String(200), nullable=True)  # freeCodeCamp, MDN, YouTube, etc.
    difficulty = Column(String(20), default="beginner")  # beginner, intermediate, advanced
    
    # Quality metrics
    quality_score = Column(Float, default=0.8)  # 0.0 - 1.0
    duration_minutes = Column(Integer, nullable=True)
    is_free = Column(Boolean, default=True)
    
    # Tier access
    tier_required = Column(String(20), default="free")  # free, standard, premium
    
    # Health tracking
    is_verified = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    last_verified_at = Column(DateTime, nullable=True)
    consecutive_failures = Column(Integer, default=0)
    last_failure_reason = Column(String(500), nullable=True)
    
    # User reports
    report_count = Column(Integer, default=0)
    
    # Fallback
    fallback_resource_id = Column(UUID(), ForeignKey("learning_resources.id"), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class ResourceReport(Base):
    """User reports for broken/outdated resources"""
    __tablename__ = "resource_reports"

    id = Column(UUID(), primary_key=True, default=uuid.uuid4)
    resource_id = Column(UUID(), ForeignKey("learning_resources.id"), nullable=False)
    user_id = Column(UUID(), ForeignKey("users.id"), nullable=False)
    
    report_type = Column(String(50), nullable=False)  # broken_link, outdated, inappropriate, other
    description = Column(Text, nullable=True)
    suggested_replacement_url = Column(String(1000), nullable=True)
    
    status = Column(String(20), default="pending")  # pending, reviewed, fixed, dismissed
    reviewed_by = Column(UUID(), nullable=True)
    reviewed_at = Column(DateTime, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)


class ResourceHealthCheck(Base):
    """Log of automated health checks"""
    __tablename__ = "resource_health_checks"

    id = Column(UUID(), primary_key=True, default=uuid.uuid4)
    resource_id = Column(UUID(), ForeignKey("learning_resources.id"), nullable=False)
    
    check_timestamp = Column(DateTime, default=datetime.utcnow)
    http_status = Column(Integer, nullable=True)
    response_time_ms = Column(Integer, nullable=True)
    is_healthy = Column(Boolean, default=True)
    error_message = Column(String(500), nullable=True)


class ResumeAnalysis(Base):
    """Stored resume analysis results"""
    __tablename__ = "resume_analyses"

    id = Column(UUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(), ForeignKey("users.id"), nullable=False)
    
    # Resume content
    file_name = Column(String(255), nullable=True)
    raw_text = Column(Text, nullable=True)
    
    # Analysis results
    overall_score = Column(Integer, default=0)  # 0-100
    ats_score = Column(Integer, default=0)  # ATS compatibility score
    
    # Extracted data
    extracted_skills = Column(JSON, default=list)
    extracted_experience = Column(JSON, default=list)
    extracted_education = Column(JSON, default=list)
    
    # Feedback
    strengths = Column(JSON, default=list)
    improvements = Column(JSON, default=list)
    keyword_suggestions = Column(JSON, default=list)
    formatting_issues = Column(JSON, default=list)
    
    # Target role comparison
    target_role = Column(String(200), nullable=True)
    role_match_score = Column(Integer, nullable=True)
    missing_skills = Column(JSON, default=list)
    
    created_at = Column(DateTime, default=datetime.utcnow)


class JobApplication(Base):
    """Track user job applications"""
    __tablename__ = "job_applications"

    id = Column(UUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(), ForeignKey("users.id"), nullable=False)
    
    # Job info
    company_name = Column(String(255), nullable=False)
    job_title = Column(String(255), nullable=False)
    job_url = Column(String(1000), nullable=True)
    location = Column(String(255), nullable=True)
    salary_min = Column(Integer, nullable=True)
    salary_max = Column(Integer, nullable=True)
    job_type = Column(String(50), nullable=True)  # full-time, part-time, contract, remote
    
    # Application status
    status = Column(String(50), default="saved")  # saved, applied, phone_screen, interview, offer, rejected, withdrawn
    applied_at = Column(DateTime, nullable=True)
    
    # Notes and tracking
    notes = Column(Text, nullable=True)
    resume_version = Column(String(100), nullable=True)
    cover_letter = Column(Text, nullable=True)
    
    # Interview tracking
    interviews = Column(JSON, default=list)  # [{date, type, notes, outcome}]
    
    # Follow-up
    next_follow_up = Column(DateTime, nullable=True)
    follow_up_count = Column(Integer, default=0)
    
    # Outcome
    offer_amount = Column(Integer, nullable=True)
    rejection_reason = Column(String(500), nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class SkillAssessment(Base):
    """Track user skill assessments for gap analysis"""
    __tablename__ = "skill_assessments"

    id = Column(UUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(), ForeignKey("users.id"), nullable=False)
    
    skill_name = Column(String(200), nullable=False)
    skill_category = Column(String(100), nullable=True)
    
    # Assessment
    self_rating = Column(Integer, nullable=True)  # 1-5
    assessed_level = Column(String(20), nullable=True)  # beginner, intermediate, advanced, expert
    confidence_score = Column(Float, nullable=True)  # AI confidence in assessment
    
    # Evidence
    assessment_method = Column(String(50), nullable=True)  # self, quiz, project, resume
    evidence = Column(JSON, default=list)  # [{type, description, score}]
    
    # Market data
    market_demand = Column(Float, nullable=True)  # % of jobs requiring this skill
    salary_impact = Column(Float, nullable=True)  # % salary increase with this skill
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
