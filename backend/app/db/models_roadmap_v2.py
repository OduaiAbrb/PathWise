"""Roadmap v2 database models for exam persistence, phase states, and resource bookmarks."""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, Boolean, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship

from app.db.database import Base
from app.db.models import UUID


class RoadmapPhaseState(Base):
    """Track phase unlock status and understanding score per roadmap."""
    __tablename__ = "roadmap_phase_states"

    id = Column(UUID(), primary_key=True, default=uuid.uuid4)
    roadmap_id = Column(UUID(), ForeignKey("roadmaps.id", ondelete="CASCADE"), nullable=False)
    phase_id = Column(String(100), nullable=False)
    status = Column(String(50), default="locked")  # locked, unlocked, in_progress, completed
    understanding_score = Column(Integer, default=0)
    unlocked_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    roadmap = relationship("Roadmap", backref="phase_states")


class CheckpointAttempt(Base):
    """Store individual checkpoint answers and scores."""
    __tablename__ = "checkpoint_attempts"

    id = Column(UUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    roadmap_id = Column(UUID(), ForeignKey("roadmaps.id", ondelete="CASCADE"), nullable=False)
    phase_id = Column(String(100), nullable=False)
    checkpoint_id = Column(String(100), nullable=False)
    question_type = Column(String(20), nullable=False)  # mcq, open, code
    user_answer = Column(Text, nullable=True)
    is_correct = Column(Boolean, nullable=True)
    score = Column(Integer, nullable=True)  # 0-100 for open-ended
    feedback = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", backref="checkpoint_attempts")
    roadmap = relationship("Roadmap", backref="checkpoint_attempts")


class PhaseExamAttempt(Base):
    """Store complete phase exam attempts with all answers and scores."""
    __tablename__ = "phase_exam_attempts"

    id = Column(UUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    roadmap_id = Column(UUID(), ForeignKey("roadmaps.id", ondelete="CASCADE"), nullable=False)
    phase_id = Column(String(100), nullable=False)
    answers = Column(JSON, nullable=False)  # {question_id: answer}
    scores = Column(JSON, nullable=True)  # {question_id: score}
    total_score = Column(Integer, nullable=False)
    passed = Column(Boolean, nullable=False)
    feedback = Column(JSON, nullable=True)
    attempt_number = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", backref="exam_attempts")
    roadmap = relationship("Roadmap", backref="exam_attempts")


class UserResourceBookmark(Base):
    """User's saved/bookmarked resources with notes and completion status."""
    __tablename__ = "user_resource_bookmarks"

    id = Column(UUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    roadmap_id = Column(UUID(), ForeignKey("roadmaps.id", ondelete="CASCADE"), nullable=True)
    skill_id = Column(String(100), nullable=True)
    resource_url = Column(String(1000), nullable=False)
    resource_title = Column(String(500), nullable=False)
    resource_type = Column(String(50), nullable=True)  # video, article, docs, course
    status = Column(String(50), default="saved")  # saved, in_progress, completed
    notes = Column(Text, nullable=True)
    rating = Column(Integer, nullable=True)  # 1-5 stars
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", backref="resource_bookmarks")
    roadmap = relationship("Roadmap", backref="resource_bookmarks")
