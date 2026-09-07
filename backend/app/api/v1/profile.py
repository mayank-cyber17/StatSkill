from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.profile import OfficialProfile, CompetencyProfile
from app.schemas.profile import OfficialProfileCreate, OfficialProfileUpdate, OfficialProfileResponse
from app.services.ai.competency_engine import CompetencyEngine
from app.services.ai.llm_service import LLMService

router = APIRouter()

@router.get("", response_model=OfficialProfileResponse)
async def get_profile(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(OfficialProfile).where(OfficialProfile.user_id == current_user.id))
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile

@router.post("/setup", response_model=OfficialProfileResponse)
async def setup_profile(
    profile_in: OfficialProfileCreate, 
    current_user: User = Depends(get_current_user), 
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(OfficialProfile).where(OfficialProfile.user_id == current_user.id))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Profile already exists")
        
    profile = OfficialProfile(**profile_in.model_dump(), user_id=current_user.id)
    db.add(profile)
    await db.commit()
    await db.refresh(profile)
    
    # Trigger AI competency profiling
    llm = LLMService()
    engine = CompetencyEngine(llm)
    assessments = await engine.generate_competency_profile(profile, db)
    
    for ass in assessments:
        cp = CompetencyProfile(
            user_id=current_user.id,
            competency_id=ass['competency_id'],
            current_level=ass['current_level'],
            confidence_score=ass['confidence_score'],
            assessment_method=ass['assessment_method']
        )
        db.add(cp)
    await db.commit()
    
    return profile

@router.put("", response_model=OfficialProfileResponse)
async def update_profile(
    profile_in: OfficialProfileUpdate, 
    current_user: User = Depends(get_current_user), 
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(OfficialProfile).where(OfficialProfile.user_id == current_user.id))
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
        
    update_data = profile_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(profile, key, value)
        
    await db.commit()
    await db.refresh(profile)
    return profile

@router.get("/competency")
async def get_competency_profile(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(CompetencyProfile).where(CompetencyProfile.user_id == current_user.id))
    profiles = result.scalars().all()
    # Eager loading or simple mapping could be done here; returning raw for demo
    return profiles
