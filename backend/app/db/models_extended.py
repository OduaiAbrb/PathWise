"""Extended database models for new features."""
from sqlalchemy import Column, String, Integer, DateTime, Boolean, Float, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.db.database import Base
from app.db.models import UUID


# Gamification Models
class UserStats(Base):
    __tablename__ = "user_stats"
    
    id = Column(UUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(), ForeignKey("users.id"), nullable=False, unique=True)
    total_xp = Column(Integer, default=0)
    level = Column(Integer, default=1)
    current_streak = Column(Integer, default=0)
    longest_streak = Column(Integer, default=0)
    last_activity_date = Column(DateTime, nullable=True)
    total_study_minutes = Column(Integer, default=0)
    skills_completed = Column(Integer, default=0)
    projects_completed = Column(Integer, default=0)
    
    # Relationships
    user = relationship("User", backref="stats")
    achievements = relationship("Achievement", back_populates="user_stats")


class Achievement(Base):
    __tablename__ = "achievements"
    
    id = Column(UUID(), primary_key=True, default=uuid.uuid4)
    user_stats_id = Column(UUID(), ForeignKey("user_stats.id"), nullable=False)
    achievement_type = Column(String(100), nullable=False)  # first_roadmap, 7_day_streak, etc.
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    icon = Column(String(100), nullable=True)
    xp_reward = Column(Integer, default=0)
    unlocked_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user_stats = relationship("UserStats", back_populates="achievements")


class DailyCheckIn(Base):
    __tablename__ = "daily_checkins"
    
    id = Column(UUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(), ForeignKey("users.id"), nullable=False)
    check_in_date = Column(DateTime, default=datetime.utcnow)
    what_learned = Column(Text, nullable=True)
    mood = Column(String(50), nullable=True)  # motivated, struggling, confident
    ai_encouragement = Column(Text, nullable=True)
    xp_earned = Column(Integer, default=10)
    
    # Relationships
    user = relationship("User", backref="daily_checkins")


# Resume & Job Application Models
class Resume(Base):
    __tablename__ = "resumes"
    
    id = Column(UUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(), ForeignKey("users.id"), nullable=False)
    file_url = Column(String(500), nullable=False)
    original_filename = Column(String(255), nullable=False)
    parsed_text = Column(Text, nullable=True)
    skills_extracted = Column(JSON, nullable=True)  # List of skills
    experience_years = Column(Float, nullable=True)
    is_primary = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", backref="resumes")
    applications = relationship("JobApplication", back_populates="resume")


class JobApplication(Base):
    __tablename__ = "job_applications"
    
    id = Column(UUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(), ForeignKey("users.id"), nullable=False)
    resume_id = Column(UUID(), ForeignKey("resumes.id"), nullable=True)
    job_title = Column(String(255), nullable=False)
    company = Column(String(255), nullable=False)
    job_url = Column(String(500), nullable=False)
    job_description = Column(Text, nullable=True)
    status = Column(String(50), default="applied")  # applied, interviewing, rejected, offered, accepted
    match_percentage = Column(Integer, nullable=True)
    missing_skills = Column(JSON, nullable=True)
    custom_resume_url = Column(String(500), nullable=True)
    cover_letter = Column(Text, nullable=True)
    applied_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    notes = Column(Text, nullable=True)
    
    # Relationships
    user = relationship("User", backref="job_applications")
    resume = relationship("Resume", back_populates="applications")
    interviews = relationship("Interview", back_populates="application")


class Interview(Base):
    __tablename__ = "interviews"
    
    id = Column(UUID(), primary_key=True, default=uuid.uuid4)
    application_id = Column(UUID(), ForeignKey("job_applications.id"), nullable=False)
    interview_type = Column(String(100), nullable=False)  # phone, technical, behavioral, final
    scheduled_at = Column(DateTime, nullable=True)
    duration_minutes = Column(Integer, nullable=True)
    interviewer_name = Column(String(255), nullable=True)
    notes = Column(Text, nullable=True)
    feedback = Column(Text, nullable=True)
    status = Column(String(50), default="scheduled")  # scheduled, completed, cancelled
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    application = relationship("JobApplication", back_populates="interviews")


# Skill Verification Models
class SkillTest(Base):
    __tablename__ = "skill_tests"
    
    id = Column(UUID(), primary_key=True, default=uuid.uuid4)
    skill_name = Column(String(255), nullable=False)
    difficulty = Column(String(50), nullable=False)  # beginner, intermediate, advanced
    questions = Column(JSON, nullable=False)  # List of question objects
    passing_score = Column(Integer, default=70)
    duration_minutes = Column(Integer, default=30)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    attempts = relationship("TestAttempt", back_populates="test")


class TestAttempt(Base):
    __tablename__ = "test_attempts"
    
    id = Column(UUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(), ForeignKey("users.id"), nullable=False)
    test_id = Column(UUID(), ForeignKey("skill_tests.id"), nullable=False)
    score = Column(Integer, nullable=False)
    answers = Column(JSON, nullable=False)  # User's answers
    passed = Column(Boolean, default=False)
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    certificate_url = Column(String(500), nullable=True)
    
    # Relationships
    user = relationship("User", backref="test_attempts")
    test = relationship("SkillTest", back_populates="attempts")


# Mentor Marketplace Models
class Mentor(Base):
    __tablename__ = "mentors"
    
    id = Column(UUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(), ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    company = Column(String(255), nullable=True)
    years_experience = Column(Integer, nullable=False)
    expertise = Column(JSON, nullable=False)  # List of skills
    bio = Column(Text, nullable=True)
    hourly_rate = Column(Float, nullable=False)
    rating = Column(Float, default=5.0)
    total_sessions = Column(Integer, default=0)
    is_available = Column(Boolean, default=True)
    calendar_link = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", backref="mentor_profile")
    sessions = relationship("MentorSession", back_populates="mentor")
    reviews = relationship("MentorReview", back_populates="mentor")


class MentorSession(Base):
    __tablename__ = "mentor_sessions"
    
    id = Column(UUID(), primary_key=True, default=uuid.uuid4)
    mentor_id = Column(UUID(), ForeignKey("mentors.id"), nullable=False)
    mentee_id = Column(UUID(), ForeignKey("users.id"), nullable=False)
    session_type = Column(String(100), nullable=False)  # code_review, mock_interview, consultation
    scheduled_at = Column(DateTime, nullable=False)
    duration_minutes = Column(Integer, default=60)
    meeting_url = Column(String(500), nullable=True)
    status = Column(String(50), default="scheduled")  # scheduled, completed, cancelled
    notes = Column(Text, nullable=True)
    amount_paid = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    mentor = relationship("Mentor", back_populates="sessions")
    mentee = relationship("User", foreign_keys=[mentee_id], backref="mentee_sessions")
    review = relationship("MentorReview", back_populates="session", uselist=False)


class MentorReview(Base):
    __tablename__ = "mentor_reviews"
    
    id = Column(UUID(), primary_key=True, default=uuid.uuid4)
    session_id = Column(UUID(), ForeignKey("mentor_sessions.id"), nullable=False, unique=True)
    mentor_id = Column(UUID(), ForeignKey("mentors.id"), nullable=False)
    reviewer_id = Column(UUID(), ForeignKey("users.id"), nullable=False)
    rating = Column(Integer, nullable=False)  # 1-5
    review_text = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    session = relationship("MentorSession", back_populates="review")
    mentor = relationship("Mentor", back_populates="reviews")
    reviewer = relationship("User", backref="mentor_reviews_given")


# Social Learning Models
class StudyGroup(Base):
    __tablename__ = "study_groups"
    
    id = Column(UUID(), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    roadmap_id = Column(UUID(), ForeignKey("roadmaps.id"), nullable=True)
    creator_id = Column(UUID(), ForeignKey("users.id"), nullable=False)
    max_members = Column(Integer, default=10)
    is_public = Column(Boolean, default=True)
    meeting_schedule = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    roadmap = relationship("Roadmap", backref="study_groups")
    creator = relationship("User", foreign_keys=[creator_id], backref="created_groups")
    members = relationship("StudyGroupMember", back_populates="group")
    messages = relationship("GroupMessage", back_populates="group")


class StudyGroupMember(Base):
    __tablename__ = "study_group_members"
    
    id = Column(UUID(), primary_key=True, default=uuid.uuid4)
    group_id = Column(UUID(), ForeignKey("study_groups.id"), nullable=False)
    user_id = Column(UUID(), ForeignKey("users.id"), nullable=False)
    role = Column(String(50), default="member")  # admin, moderator, member
    joined_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    group = relationship("StudyGroup", back_populates="members")
    user = relationship("User", backref="group_memberships")


class GroupMessage(Base):
    __tablename__ = "group_messages"
    
    id = Column(UUID(), primary_key=True, default=uuid.uuid4)
    group_id = Column(UUID(), ForeignKey("study_groups.id"), nullable=False)
    user_id = Column(UUID(), ForeignKey("users.id"), nullable=False)
    message = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    group = relationship("StudyGroup", back_populates="messages")
    user = relationship("User", backref="group_messages")


# Income Tracking Models
class IncomeEntry(Base):
    __tablename__ = "income_entries"
    
    id = Column(UUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(), ForeignKey("users.id"), nullable=False)
    amount = Column(Float, nullable=False)
    currency = Column(String(10), default="USD")
    entry_type = Column(String(50), nullable=False)  # salary, freelance, bonus, raise
    company = Column(String(255), nullable=True)
    date = Column(DateTime, nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", backref="income_entries")


# AI Project Models
class GeneratedProject(Base):
    __tablename__ = "generated_projects"
    
    id = Column(UUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(), ForeignKey("users.id"), nullable=False)
    roadmap_id = Column(UUID(), ForeignKey("roadmaps.id"), nullable=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    difficulty = Column(String(50), nullable=False)
    tech_stack = Column(JSON, nullable=False)  # List of technologies
    requirements = Column(JSON, nullable=False)  # List of requirements
    implementation_guide = Column(JSON, nullable=False)  # Step-by-step guide
    test_cases = Column(JSON, nullable=True)  # Automated test cases
    github_url = Column(String(500), nullable=True)
    status = Column(String(50), default="not_started")  # not_started, in_progress, completed
    completion_percentage = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    
    # Relationships
    user = relationship("User", backref="generated_projects")
    roadmap = relationship("Roadmap", backref="generated_projects")


# Notification Models
class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(UUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(), ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(String(50), nullable=False)  # achievement, reminder, job_match, etc.
    is_read = Column(Boolean, default=False)
    action_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", backref="notifications")
