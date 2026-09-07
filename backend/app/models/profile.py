from datetime import datetime, timezone
from sqlalchemy import String, Integer, Float, ForeignKey, Text, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

class OfficialProfile(Base):
    __tablename__ = 'official_profiles'
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey('users.id'), unique=True)
    employee_id: Mapped[str] = mapped_column(String(50))
    designation: Mapped[str] = mapped_column(String(100))
    department: Mapped[str] = mapped_column(String(100))
    organization: Mapped[str] = mapped_column(String(100))
    state: Mapped[str] = mapped_column(String(100))
    job_role: Mapped[str] = mapped_column(String(100))
    job_level: Mapped[str] = mapped_column(String(50))
    years_experience: Mapped[int] = mapped_column(Integer)
    educational_qualification: Mapped[str] = mapped_column(String(255))
    prior_trainings: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

class CompetencyDomain(Base):
    __tablename__ = 'competency_domains'
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100))
    description: Mapped[str] = mapped_column(Text)
    domain_type: Mapped[str] = mapped_column(String(50))

class Competency(Base):
    __tablename__ = 'competencies'
    id: Mapped[int] = mapped_column(primary_key=True)
    domain_id: Mapped[int] = mapped_column(ForeignKey('competency_domains.id'))
    name: Mapped[str] = mapped_column(String(100))
    description: Mapped[str] = mapped_column(Text)
    level_1_desc: Mapped[str] = mapped_column(Text)
    level_2_desc: Mapped[str] = mapped_column(Text)
    level_3_desc: Mapped[str] = mapped_column(Text)
    level_4_desc: Mapped[str] = mapped_column(Text)
    level_5_desc: Mapped[str] = mapped_column(Text)
    is_active: Mapped[bool] = mapped_column(default=True)
    
    domain: Mapped["CompetencyDomain"] = relationship()

class JobRoleCompetencyMap(Base):
    __tablename__ = 'job_role_competency_maps'
    id: Mapped[int] = mapped_column(primary_key=True)
    job_role: Mapped[str] = mapped_column(String(100))
    competency_id: Mapped[int] = mapped_column(ForeignKey('competencies.id'))
    required_level: Mapped[int] = mapped_column(Integer)
    priority: Mapped[int] = mapped_column(Integer)

class CompetencyProfile(Base):
    __tablename__ = 'competency_profiles'
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey('users.id'))
    competency_id: Mapped[int] = mapped_column(ForeignKey('competencies.id'))
    current_level: Mapped[float] = mapped_column(Float)
    assessed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    assessment_method: Mapped[str] = mapped_column(String(50))
    confidence_score: Mapped[float] = mapped_column(Float)

    competency: Mapped["Competency"] = relationship()

class SkillGap(Base):
    __tablename__ = 'skill_gaps'
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey('users.id'))
    competency_id: Mapped[int] = mapped_column(ForeignKey('competencies.id'))
    required_level: Mapped[int] = mapped_column(Integer)
    current_level: Mapped[float] = mapped_column(Float)
    gap_score: Mapped[float] = mapped_column(Float)
    priority: Mapped[int] = mapped_column(Integer)
    identified_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    competency: Mapped["Competency"] = relationship()
