from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.services.ai.llm_service import LLMService
from app.models.profile import OfficialProfile, JobRoleCompetencyMap, CompetencyProfile, SkillGap, Competency
import json

class CompetencyEngine:
    def __init__(self, llm_service: LLMService):
        self.llm = llm_service
        
    async def generate_competency_profile(
        self, profile: OfficialProfile, db: AsyncSession
    ) -> list[dict]:
        # Fetch all competencies to ask LLM to infer
        result = await db.execute(select(Competency).where(Competency.is_active == True))
        competencies = result.scalars().all()
        
        comp_data = [{"id": c.id, "name": c.name, "desc": c.description} for c in competencies]
        
        prompt = f"""
You are an HR AI expert for the Indian Statistical System.
Given the following official profile:
Designation: {profile.designation}
Role: {profile.job_role}
Experience: {profile.years_experience} years
Education: {profile.educational_qualification}
Prior Training: {profile.prior_trainings}

Assess the following competencies on a scale of 1 to 5.
Return a JSON array of objects with keys: "competency_id", "current_level" (float 1-5), "confidence_score" (float 0-1)

Competencies:
{json.dumps(comp_data)}
        """
        try:
            assessments = await self.llm.generate_json(prompt)
            for a in assessments:
                a['assessment_method'] = 'AI_INFERRED'
            return assessments
        except Exception:
            # Fallback
            return [{"competency_id": c.id, "current_level": 3.0, "confidence_score": 0.5, "assessment_method": 'AI_INFERRED'} for c in competencies]

    async def analyze_skill_gaps(
        self, user_id: int, profile: OfficialProfile, db: AsyncSession
    ) -> list[dict]:
        # Fetch competency profile
        cp_result = await db.execute(select(CompetencyProfile).where(CompetencyProfile.user_id == user_id))
        profiles = cp_result.scalars().all()
        profile_map = {p.competency_id: p.current_level for p in profiles}
        
        # Fetch job requirements
        req_result = await db.execute(select(JobRoleCompetencyMap).where(JobRoleCompetencyMap.job_role == profile.job_role))
        requirements = req_result.scalars().all()
        
        gaps = []
        for req in requirements:
            current = profile_map.get(req.competency_id, 1.0)
            if current < req.required_level:
                gaps.append({
                    "competency_id": req.competency_id,
                    "required_level": req.required_level,
                    "current_level": current,
                    "gap_score": round(req.required_level - current, 2),
                    "priority": req.priority
                })
        
        return sorted(gaps, key=lambda x: (x['priority'], -x['gap_score']))
        
    async def update_from_quiz_result(
        self, user_id: int, quiz_id: int, percentage: float, db: AsyncSession
    ):
        # Simplistic update: if percentage > 80, bump related competencies
        # In a real app, map quiz -> document -> competencies
        pass
