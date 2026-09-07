from datetime import datetime, timezone
from sqlalchemy import String, Integer, Float, ForeignKey, Text, Boolean, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import Optional
from app.core.database import Base

class LearningPath(Base):
    __tablename__ = 'learning_paths'
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey('users.id'), unique=True)
    generated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    status: Mapped[str] = mapped_column(String(50), default="ACTIVE")
    completion_percentage: Mapped[float] = mapped_column(Float, default=0.0)
    ai_reasoning: Mapped[str] = mapped_column(Text)
    
    items: Mapped[list["LearningPathItem"]] = relationship(cascade="all, delete-orphan")

class LearningPathItem(Base):
    __tablename__ = 'learning_path_items'
    id: Mapped[int] = mapped_column(primary_key=True)
    path_id: Mapped[int] = mapped_column(ForeignKey('learning_paths.id'))
    sequence_order: Mapped[int] = mapped_column(Integer)
    item_type: Mapped[str] = mapped_column(String(50))
    item_id: Mapped[str] = mapped_column(String(50))
    item_title: Mapped[str] = mapped_column(String(255))
    estimated_hours: Mapped[float] = mapped_column(Float)
    status: Mapped[str] = mapped_column(String(50), default="PENDING")
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

class IGOTCourse(Base):
    __tablename__ = 'igot_courses'
    id: Mapped[int] = mapped_column(primary_key=True)
    igot_course_id: Mapped[str] = mapped_column(String(50), unique=True)
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(Text)
    provider: Mapped[str] = mapped_column(String(100))
    duration_hours: Mapped[float] = mapped_column(Float)
    competencies_covered: Mapped[str] = mapped_column(Text)
    level: Mapped[str] = mapped_column(String(50))
    url: Mapped[str] = mapped_column(String(255))
    thumbnail_url: Mapped[str] = mapped_column(String(255))
    last_synced_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

class IGOTEnrollment(Base):
    __tablename__ = 'igot_enrollments'
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey('users.id'))
    igot_course_id: Mapped[int] = mapped_column(ForeignKey('igot_courses.id'))
    enrolled_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    completion_percentage: Mapped[float] = mapped_column(Float, default=0.0)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    certificate_url: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

class NSSTAProgram(Base):
    __tablename__ = 'nssta_programs'
    id: Mapped[int] = mapped_column(primary_key=True)
    program_code: Mapped[str] = mapped_column(String(50), unique=True)
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(Text)
    mode: Mapped[str] = mapped_column(String(50))
    start_date: Mapped[str] = mapped_column(String(50))
    end_date: Mapped[str] = mapped_column(String(50))
    venue: Mapped[str] = mapped_column(String(255))
    capacity: Mapped[int] = mapped_column(Integer)
    competencies_covered: Mapped[str] = mapped_column(Text)
    target_designations: Mapped[str] = mapped_column(Text)
    url: Mapped[str] = mapped_column(String(255))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

class NSSTANomination(Base):
    __tablename__ = 'nssta_nominations'
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey('users.id'))
    program_id: Mapped[int] = mapped_column(ForeignKey('nssta_programs.id'))
    nominated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    status: Mapped[str] = mapped_column(String(50), default="PENDING")
    approved_by: Mapped[Optional[int]] = mapped_column(ForeignKey('users.id'), nullable=True)
    approval_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    remarks: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
