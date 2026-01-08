from sqlalchemy import Column, String, Text, Boolean, Integer, DateTime, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime

from app.db.base_class import Base


class Portfolio(Base):
    """User portfolio with auto-generated projects and content"""
    __tablename__ = "portfolios"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    roadmap_id = Column(UUID(as_uuid=True), ForeignKey("roadmaps.id"), nullable=True)
    
    # Portfolio settings
    title = Column(String, nullable=False)  # e.g., "Backend Engineer Portfolio"
    tagline = Column(String, nullable=True)
    github_url = Column(String, nullable=True)
    linkedin_url = Column(String, nullable=True)
    website_url = Column(String, nullable=True)
    
    # Auto-generated content
    bio = Column(Text, nullable=True)  # AI-generated bio
    resume_bullets = Column(JSON, default=list)  # Generated bullet points
    linkedin_posts = Column(JSON, default=list)  # Generated LinkedIn posts
    
    # Projects
    projects = Column(JSON, default=list)  # List of portfolio projects
    
    # Certificates
    certificates = Column(JSON, default=list)  # Skill certificates
    
    # Status
    is_published = Column(Boolean, default=False)
    views_count = Column(Integer, default=0)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="portfolios")
    roadmap = relationship("Roadmap", back_populates="portfolios")


class InterviewSession(Base):
    """Interview simulation sessions"""
    __tablename__ = "interview_sessions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    # Session details
    session_type = Column(String, nullable=False)  # coding, system_design, behavioral, full_mock
    target_role = Column(String, nullable=True)
    difficulty = Column(String, nullable=False)  # easy, medium, hard
    duration_minutes = Column(Integer, default=45)
    
    # Questions asked
    questions = Column(JSON, default=list)
    
    # User responses
    responses = Column(JSON, default=list)
    
    # AI evaluation
    overall_score = Column(Integer, nullable=True)  # 0-100
    feedback = Column(JSON, default=dict)  # Structured feedback
    strengths = Column(JSON, default=list)
    improvements = Column(JSON, default=list)
    
    # Recording
    recording_url = Column(String, nullable=True)
    transcript = Column(Text, nullable=True)
    
    # Status
    status = Column(String, default="in_progress")  # in_progress, completed, abandoned
    
    # Timestamps
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="interview_sessions")


class AccountabilityPartner(Base):
    """Accountability partner matching"""
    __tablename__ = "accountability_partners"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user1_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    user2_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    # Match details
    matched_on_roadmap = Column(String, nullable=True)  # Common career goal
    similarity_score = Column(Integer, default=0)  # 0-100
    
    # Status
    status = Column(String, default="pending")  # pending, active, inactive
    
    # Progress tracking
    weekly_checkins = Column(JSON, default=list)
    shared_goals = Column(JSON, default=list)
    
    # Timestamps
    matched_at = Column(DateTime, default=datetime.utcnow)
    last_interaction = Column(DateTime, nullable=True)
    
    # Relationships
    user1 = relationship("User", foreign_keys=[user1_id], back_populates="accountability_partners_initiated")
    user2 = relationship("User", foreign_keys=[user2_id], back_populates="accountability_partners_received")


class DailyChallenge(Base):
    """Daily challenges for engagement"""
    __tablename__ = "daily_challenges"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Challenge details
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    challenge_type = Column(String, nullable=False)  # interview_question, quiz, coding, system_design
    difficulty = Column(String, nullable=False)
    category = Column(String, nullable=True)  # backend, frontend, data, devops, etc.
    
    # Content
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=True)
    hints = Column(JSON, default=list)
    resources = Column(JSON, default=list)
    
    # Points
    points = Column(Integer, default=10)
    
    # Scheduling
    scheduled_for = Column(DateTime, nullable=False)
    expires_at = Column(DateTime, nullable=True)
    
    # Stats
    attempts_count = Column(Integer, default=0)
    completions_count = Column(Integer, default=0)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)


class UserChallenge(Base):
    """User challenge attempts and completions"""
    __tablename__ = "user_challenges"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    challenge_id = Column(UUID(as_uuid=True), ForeignKey("daily_challenges.id"), nullable=False)
    
    # Attempt details
    user_answer = Column(Text, nullable=True)
    is_correct = Column(Boolean, nullable=True)
    score = Column(Integer, default=0)
    
    # Timestamps
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="challenges")
    challenge = relationship("DailyChallenge")
