from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.analytics import PersonalAnalytics

router = APIRouter()

@router.get("/me")
async def get_personal_analytics(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return {
        "competency_scores": {"Statistical": 3.5, "Technical": 2.8, "Digital Governance": 4.0},
        "quiz_stats": {"total_taken": 5, "avg_score": 85.5},
        "learning_hours": 24.5,
        "courses_completed": 3
    }

@router.get("/workforce")
async def get_workforce_analytics(db: AsyncSession = Depends(get_db)):
    return {
        "total_users": 1500,
        "avg_competency": {"Statistical": 3.2, "Technical": 2.5, "Digital Governance": 3.8},
        "top_gaps": [{"domain": "Technical", "gap": 1.5}],
        "training_completion_rate": 68.5
    }

@router.get("/predictive")
async def get_predictive_analytics(db: AsyncSession = Depends(get_db)):
    return {
        "skill_demand_forecast": [
            {"skill": "Machine Learning", "trend": "UP", "demand_index": 85},
            {"skill": "Survey Design", "trend": "STABLE", "demand_index": 70}
        ]
    }
