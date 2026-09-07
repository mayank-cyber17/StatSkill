from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.profile import OfficialProfile, SkillGap
from app.services.ai.competency_engine import CompetencyEngine
from app.services.ai.llm_service import LLMService

router = APIRouter()

@router.get("")
async def get_skill_gaps(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(SkillGap).where(SkillGap.user_id == current_user.id))
    gaps = result.scalars().all()
    return gaps

@router.post("/refresh")
async def refresh_gaps(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(OfficialProfile).where(OfficialProfile.user_id == current_user.id))
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
        
    llm = LLMService()
    engine = CompetencyEngine(llm)
    gap_data = await engine.analyze_skill_gaps(current_user.id, profile, db)
    
    # Delete old gaps
    await db.execute(SkillGap.__table__.delete().where(SkillGap.user_id == current_user.id))
    
    gaps = []
    for gd in gap_data:
        gap = SkillGap(
            user_id=current_user.id,
            competency_id=gd['competency_id'],
            required_level=gd['required_level'],
            current_level=gd['current_level'],
            gap_score=gd['gap_score'],
            priority=gd['priority']
        )
        db.add(gap)
        gaps.append(gap)
        
    await db.commit()
    return gaps
