import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Integer, Float, DateTime, ForeignKey, JSON, Enum
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import relationship

from app.db.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=True)  # Nullable for OAuth users
    name = Column(String(255), nullable=False)
    image = Column(String(500), nullable=True)
    tier = Column(String(50), default="free")  # free, pro, enterprise
    google_id = Column(String(255), unique=True, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime, default=datetime.utcnow)

    # Relationships
    roadmaps = relationship("Roadmap", back_populates="user", cascade="all, delete-orphan")
    qa_history = relationship("QAHistory", back_populates="user", cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="user", cascade="all, delete-orphan")


class Roadmap(Base):
    __tablename__ = "roadmaps"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    job_title = Column(String(255), nullable=False)
    job_description = Column(Text, nullable=False)
    industry = Column(String(100), nullable=True)
    skill_level = Column(String(50), nullable=False)  # beginner, intermediate, advanced
    generated_at = Column(DateTime, default=datetime.utcnow)
    completion_percentage = Column(Integer, default=0)
    estimated_weeks = Column(Integer, nullable=True)
    skills = Column(JSON, nullable=True)  # Array of skill objects
    phases = Column(JSON, nullable=True)  # Learning phases with resources
    projects = Column(JSON, nullable=True)  # Project suggestions
    status = Column(String(50), default="active")  # active, completed, archived

    # Relationships
    user = relationship("User", back_populates="roadmaps")
    progress = relationship("Progress", back_populates="roadmap", cascade="all, delete-orphan")
    qa_history = relationship("QAHistory", back_populates="roadmap", cascade="all, delete-orphan")
    job_matches = relationship("JobMatch", back_populates="roadmap", cascade="all, delete-orphan")


class Progress(Base):
    __tablename__ = "progress"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    roadmap_id = Column(UUID(as_uuid=True), ForeignKey("roadmaps.id"), nullable=False)
    skill_id = Column(String(100), nullable=False)
    skill_name = Column(String(255), nullable=False)
    status = Column(String(50), default="not_started")  # not_started, in_progress, completed
    time_spent_minutes = Column(Integer, default=0)
    completed_at = Column(DateTime, nullable=True)
    notes = Column(Text, nullable=True)

    # Relationships
    roadmap = relationship("Roadmap", back_populates="progress")


class Resource(Base):
    __tablename__ = "resources"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(500), nullable=False)
    url = Column(String(1000), nullable=False)
    type = Column(String(50), nullable=False)  # video, article, course, documentation, book
    skill_tags = Column(ARRAY(String), nullable=True)
    quality_score = Column(Float, default=0.0)
    difficulty = Column(String(50), nullable=True)  # beginner, intermediate, advanced
    duration_minutes = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class QAHistory(Base):
    __tablename__ = "qa_history"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    roadmap_id = Column(UUID(as_uuid=True), ForeignKey("roadmaps.id"), nullable=True)
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="qa_history")
    roadmap = relationship("Roadmap", back_populates="qa_history")


class JobMatch(Base):
    __tablename__ = "job_matches"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    roadmap_id = Column(UUID(as_uuid=True), ForeignKey("roadmaps.id"), nullable=False)
    job_title = Column(String(255), nullable=False)
    company = Column(String(255), nullable=True)
    job_url = Column(String(1000), nullable=False)
    match_percentage = Column(Integer, default=0)
    missing_skills = Column(ARRAY(String), nullable=True)
    scraped_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    roadmap = relationship("Roadmap", back_populates="job_matches")


class Payment(Base):
    __tablename__ = "payments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    lemon_squeezy_order_id = Column(String(255), unique=True, nullable=False)
    amount = Column(Integer, nullable=False)  # in cents
    currency = Column(String(10), default="usd")
    tier = Column(String(50), nullable=False)  # pro, enterprise
    status = Column(String(50), default="paid")  # paid, refunded, failed
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="payments")
