from pydantic import BaseModel
from typing import Dict, List, Any

class PersonalAnalytics(BaseModel):
    competency_scores: Dict[str, float]
    quiz_stats: Dict[str, Any]
    learning_hours: float
    courses_completed: int

class WorkforceAnalytics(BaseModel):
    total_users: int
    avg_competency: Dict[str, float]
    top_gaps: List[Dict[str, Any]]
    training_completion_rate: float

class PredictiveAnalytics(BaseModel):
    skill_demand_forecast: List[Dict[str, Any]]
