from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class LearningPathItemResponse(BaseModel):
    id: int
    sequence_order: int
    item_type: str
    item_id: str
    item_title: str
    estimated_hours: float
    status: str
    completed_at: Optional[datetime] = None
    model_config = {"from_attributes": True}

class LearningPathResponse(BaseModel):
    id: int
    generated_at: datetime
    status: str
    completion_percentage: float
    ai_reasoning: str
    items: List[LearningPathItemResponse]
    model_config = {"from_attributes": True}

class LearningPathGenerateRequest(BaseModel):
    force_regenerate: bool = False

class IGOTCourseResponse(BaseModel):
    id: int
    igot_course_id: str
    title: str
    description: str
    provider: str
    duration_hours: float
    competencies_covered: str
    level: str
    url: str
    thumbnail_url: str
    last_synced_at: datetime
    model_config = {"from_attributes": True}

class IGOTEnrollmentResponse(BaseModel):
    id: int
    user_id: int
    igot_course_id: int
    enrolled_at: datetime
    completion_percentage: float
    completed_at: Optional[datetime] = None
    certificate_url: Optional[str] = None
    course: Optional[IGOTCourseResponse] = None
    model_config = {"from_attributes": True}

class NSSTAProgramResponse(BaseModel):
    id: int
    program_code: str
    title: str
    description: str
    mode: str
    start_date: str
    end_date: str
    venue: str
    capacity: int
    competencies_covered: str
    target_designations: str
    url: str
    is_active: bool
    model_config = {"from_attributes": True}

class NSSTANominationResponse(BaseModel):
    id: int
    user_id: int
    program_id: int
    nominated_at: datetime
    status: str
    approved_by: Optional[int] = None
    approval_date: Optional[datetime] = None
    remarks: Optional[str] = None
    program: Optional[NSSTAProgramResponse] = None
    model_config = {"from_attributes": True}
