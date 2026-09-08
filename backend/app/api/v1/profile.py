from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.profile import OfficialProfile, CompetencyProfile, Competency, CompetencyDomain
from app.schemas.profile import OfficialProfileCreate, OfficialProfileUpdate, OfficialProfileResponse
from app.services.ai.competency_engine import CompetencyEngine
from app.services.ai.llm_service import LLMService

router = APIRouter()

@router.get("", response_model=OfficialProfileResponse)
async def get_profile(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(OfficialProfile).where(OfficialProfile.user_id == current_user.id))
    profile = result.scalar_one_or_none()
    if not profile:
        profile = OfficialProfile(
            user_id=current_user.id,
            employee_id=f"MOSPI-2025-{current_user.id:04d}",
            designation="Junior Statistical Officer (JSO)",
            department="NSSO (Field Operations Division)",
            organization="Ministry of Statistics and Programme Implementation (MoSPI)",
            state="New Delhi / Central HQ",
            job_role="Data Analysis",
            job_level="Junior",
            years_experience=3,
            educational_qualification="Master's in Statistics / Applied Econometrics",
            prior_trainings="Basic Statistical Methods, NSSO Survey Training"
        )
        db.add(profile)
        await db.commit()
        await db.refresh(profile)
    profile.full_name = current_user.full_name
    return profile

@router.post("/setup", response_model=OfficialProfileResponse)
async def setup_profile(
    profile_in: OfficialProfileCreate, 
    current_user: User = Depends(get_current_user), 
    db: AsyncSession = Depends(get_db)
):
    profile_data = profile_in.model_dump()
    if not profile_data.get("employee_id") or profile_data["employee_id"].strip() == "":
        profile_data["employee_id"] = f"MOSPI-2025-{current_user.id:04d}"
        
    result = await db.execute(select(OfficialProfile).where(OfficialProfile.user_id == current_user.id))
    profile = result.scalar_one_or_none()
    
    if profile:
        for key, value in profile_data.items():
            setattr(profile, key, value)
    else:
        profile = OfficialProfile(**profile_data, user_id=current_user.id)
        db.add(profile)
        
    await db.commit()
    await db.refresh(profile)
    
    # Trigger baseline AI competency profiling
    try:
        llm = LLMService()
        engine = CompetencyEngine(llm)
        assessments = await engine.generate_competency_profile(profile, db)
        
        # Clear existing AI-inferred competencies if present
        await db.execute(
            CompetencyProfile.__table__.delete().where(
                CompetencyProfile.user_id == current_user.id,
                CompetencyProfile.assessment_method == 'AI_INFERRED'
            )
        )
        
        # Check if user already has assessment-evaluated competencies
        existing_cp_res = await db.execute(
            select(CompetencyProfile.competency_id).where(
                CompetencyProfile.user_id == current_user.id,
                CompetencyProfile.assessment_method == 'ASSESSMENT_EVALUATED'
            )
        )
        evaluated_ids = set(existing_cp_res.scalars().all())
        
        for ass in assessments:
            if ass['competency_id'] not in evaluated_ids:
                cp = CompetencyProfile(
                    user_id=current_user.id,
                    competency_id=ass['competency_id'],
                    current_level=ass['current_level'],
                    confidence_score=ass['confidence_score'],
                    assessment_method=ass['assessment_method']
                )
                db.add(cp)
        await db.commit()
    except Exception as e:
        print(f"[setup_profile] Note during competency profiling: {e}")
    
    profile.full_name = current_user.full_name
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
    profile.full_name = current_user.full_name
    return profile

@router.get("/competency")
async def get_competency_profile(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(CompetencyProfile, Competency, CompetencyDomain)
        .join(Competency, CompetencyProfile.competency_id == Competency.id)
        .join(CompetencyDomain, Competency.domain_id == CompetencyDomain.id)
        .where(CompetencyProfile.user_id == current_user.id)
        .order_by(Competency.id)
    )
    rows = result.all()
    
    # Ensure every active competency exists for the user (fill baseline for any missing)
    all_comps_res = await db.execute(select(Competency).where(Competency.is_active == True))
    all_comps = all_comps_res.scalars().all()
    
    existing_comp_ids = {cp.competency_id for cp, _, _ in rows}
    missing_comps = [c for c in all_comps if c.id not in existing_comp_ids]
    
    if missing_comps:
        p_res = await db.execute(select(OfficialProfile).where(OfficialProfile.user_id == current_user.id))
        prof = p_res.scalar_one_or_none()
        exp = prof.years_experience if prof and prof.years_experience else 2
        base_lvl = 3.0 if exp >= 3 else 2.5
        
        for c in missing_comps:
            new_cp = CompetencyProfile(
                user_id=current_user.id,
                competency_id=c.id,
                current_level=base_lvl,
                confidence_score=0.5,
                assessment_method='AI_INFERRED'
            )
            db.add(new_cp)
        await db.commit()
        
        result = await db.execute(
            select(CompetencyProfile, Competency, CompetencyDomain)
            .join(Competency, CompetencyProfile.competency_id == Competency.id)
            .join(CompetencyDomain, Competency.domain_id == CompetencyDomain.id)
            .where(CompetencyProfile.user_id == current_user.id)
            .order_by(Competency.id)
        )
        rows = result.all()

    competencies_list = []
    domain_scores = {}
    
    for cp, comp, domain in rows:
        competencies_list.append({
            "id": cp.id,
            "competency_id": cp.competency_id,
            "name": comp.name,
            "domain": domain.name,
            "level": round(cp.current_level, 1),
            "confidence": cp.confidence_score,
            "method": cp.assessment_method,
            "assessed_at": cp.assessed_at.isoformat() if cp.assessed_at else None
        })
        if domain.name not in domain_scores:
            domain_scores[domain.name] = []
        domain_scores[domain.name].append(cp.current_level)
        
    all_domains_res = await db.execute(select(CompetencyDomain).order_by(CompetencyDomain.id))
    all_domains = all_domains_res.scalars().all()

    domains_summary = []
    for dom in all_domains:
        scores = domain_scores.get(dom.name, [])
        avg = round(sum(scores) / len(scores), 1) if scores else 2.5
        domains_summary.append({
            "domain": dom.name,
            "name": dom.name,
            "level": avg,
            "score": avg,
            "count": len(scores)
        })
        
    avg_total = round(sum(cp.current_level for cp, _, _ in rows) / len(rows), 1) if rows else 3.0

    return {
        "competencies": competencies_list,
        "domains": domains_summary,
        "average_level": avg_total,
        "total_competencies": len(competencies_list)
    }

