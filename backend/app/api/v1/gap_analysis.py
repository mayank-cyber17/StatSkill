from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.profile import OfficialProfile, SkillGap, Competency, CompetencyDomain
from app.services.ai.competency_engine import CompetencyEngine
from app.services.ai.llm_service import LLMService

router = APIRouter()

@router.get("")
async def get_skill_gaps(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(SkillGap, Competency, CompetencyDomain)
        .join(Competency, SkillGap.competency_id == Competency.id)
        .join(CompetencyDomain, Competency.domain_id == CompetencyDomain.id)
        .where(SkillGap.user_id == current_user.id)
        .order_by(SkillGap.priority, -SkillGap.gap_score)
    )
    rows = result.all()
    
    # If no gaps recorded yet, compute from profile
    if not rows:
        p_res = await db.execute(select(OfficialProfile).where(OfficialProfile.user_id == current_user.id))
        prof = p_res.scalar_one_or_none()
        if prof:
            llm = LLMService()
            engine = CompetencyEngine(llm)
            gap_data = await engine.analyze_skill_gaps(current_user.id, prof, db)
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
            await db.commit()
            
            result = await db.execute(
                select(SkillGap, Competency, CompetencyDomain)
                .join(Competency, SkillGap.competency_id == Competency.id)
                .join(CompetencyDomain, Competency.domain_id == CompetencyDomain.id)
                .where(SkillGap.user_id == current_user.id)
                .order_by(SkillGap.priority, -SkillGap.gap_score)
            )
            rows = result.all()

    gaps_list = []
    for g, comp, domain in rows:
        gaps_list.append({
            "id": g.id,
            "competency_id": g.competency_id,
            "name": comp.name,
            "domain": domain.name,
            "current": round(g.current_level, 1),
            "required": round(float(g.required_level), 1),
            "gap": round(g.gap_score, 1),
            "priority": "HIGH" if g.priority == 1 else "MEDIUM" if g.priority == 2 else "LOW",
            "priority_num": g.priority
        })
        
    return {
        "gaps": gaps_list,
        "total_gaps": len(gaps_list),
        "high_priority_count": sum(1 for g in gaps_list if g["priority"] == "HIGH"),
        "average_gap": round(sum(g["gap"] for g in gaps_list) / max(1, len(gaps_list)), 1)
    }

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
        
    await db.commit()
    return await get_skill_gaps(current_user=current_user, db=db)
