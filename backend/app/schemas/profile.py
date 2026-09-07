from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class OfficialProfileBase(BaseModel):
    employee_id: str
    designation: str
    department: str
    organization: str
    state: str
    job_role: str
    job_level: str
    years_experience: int
    educational_qualification: str
    prior_trainings: str

class OfficialProfileCreate(OfficialProfileBase):
    pass

class OfficialProfileUpdate(BaseModel):
    employee_id: Optional[str] = None
    designation: Optional[str] = None
    department: Optional[str] = None
    organization: Optional[str] = None
    state: Optional[str] = None
    job_role: Optional[str] = None
    job_level: Optional[str] = None
    years_experience: Optional[int] = None
    educational_qualification: Optional[str] = None
    prior_trainings: Optional[str] = None

class OfficialProfileResponse(OfficialProfileBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}

class CompetencyDomainResponse(BaseModel):
    id: int
    name: str
    description: str
    domain_type: str
    model_config = {"from_attributes": True}

class CompetencyResponse(BaseModel):
    id: int
    domain_id: int
    name: str
    description: str
    level_1_desc: str
    level_2_desc: str
    level_3_desc: str
    level_4_desc: str
    level_5_desc: str
    is_active: bool
    model_config = {"from_attributes": True}

class CompetencyProfileResponse(BaseModel):
    id: int
    competency_id: int
    current_level: float
    assessed_at: datetime
    assessment_method: str
    confidence_score: float
    competency: CompetencyResponse
    model_config = {"from_attributes": True}

class SkillGapResponse(BaseModel):
    id: int
    competency_id: int
    required_level: int
    current_level: float
    gap_score: float
    priority: int
    identified_at: datetime
    competency: CompetencyResponse
    model_config = {"from_attributes": True}

class SkillGapSummary(BaseModel):
    domain_name: str
    average_gap_score: float
    total_gaps: int
    gaps: List[SkillGapResponse]
