from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.services.ai.llm_service import LLMService
from app.models.profile import OfficialProfile, JobRoleCompetencyMap, CompetencyProfile, SkillGap, Competency
from app.models.learning import LearningPath, LearningPathItem
import json

class CompetencyEngine:
    def __init__(self, llm_service: LLMService):
        self.llm = llm_service
        
    def normalize_job_role(self, role: str) -> str:
        if not role:
            return "Data Analysis"
        r = role.lower()
        if "survey" in r or "sample" in r:
            return "Survey Design"
        if "field" in r or "investigat" in r:
            return "Field Investigation"
        if "it" in r or "tech" in r or "system" in r or "software" in r:
            return "IT & Systems"
        if "policy" in r or "research" in r:
            return "Policy & Research"
        if "admin" in r or "govern" in r:
            return "Administration"
        if "train" in r or "capacity" in r:
            return "Training & Capacity Building"
        return "Data Analysis"

    async def generate_competency_profile(
        self, profile: OfficialProfile, db: AsyncSession
    ) -> list[dict]:
        result = await db.execute(select(Competency).where(Competency.is_active == True))
        competencies = result.scalars().all()
        
        # Base levels based on experience
        exp = profile.years_experience or 1
        base_lvl = 3.0 if exp >= 3 else 2.5
        
        return [
            {
                "competency_id": c.id,
                "current_level": base_lvl,
                "confidence_score": 0.6,
                "assessment_method": 'AI_INFERRED'
            }
            for c in competencies
        ]

    async def analyze_skill_gaps(
        self, user_id: int, profile: OfficialProfile, db: AsyncSession
    ) -> list[dict]:
        cp_result = await db.execute(select(CompetencyProfile).where(CompetencyProfile.user_id == user_id))
        profiles = cp_result.scalars().all()
        profile_map = {p.competency_id: p.current_level for p in profiles}
        
        # Fetch job requirements with flexible fallback
        req_result = await db.execute(select(JobRoleCompetencyMap).where(JobRoleCompetencyMap.job_role == profile.job_role))
        requirements = req_result.scalars().all()
        
        if not requirements:
            normalized = self.normalize_job_role(profile.job_role)
            req_result = await db.execute(select(JobRoleCompetencyMap).where(JobRoleCompetencyMap.job_role == normalized))
            requirements = req_result.scalars().all()
            
        gaps = []
        for req in requirements:
            current = profile_map.get(req.competency_id, 2.0)
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
        pass

    async def update_from_assessment_result(
        self, user_id: int, quiz_id: int, attempt_id: int, feedback: list[dict], percentage: float, db: AsyncSession
    ):
        p_res = await db.execute(select(OfficialProfile).where(OfficialProfile.user_id == user_id))
        profile = p_res.scalar_one_or_none()
        
        comp_performance: dict[int, list[bool]] = {}
        
        for item in feedback:
            q_text = (item.get("question_text") or "").lower()
            is_corr = item.get("is_correct", False)
            
            target_comps = []
            if "vector" in q_text or "pandas" in q_text or "python" in q_text or "statsmodels" in q_text:
                target_comps.extend([8, 3])
            elif "mean" in q_text and "weight" in q_text:
                target_comps.extend([3, 1])
            elif "9999" in q_text or "missing" in q_text or "clean" in q_text or "null" in q_text or "outlier" in q_text:
                target_comps.extend([6, 5])
            elif "cluster" in q_text or "sampling" in q_text or "srs" in q_text or "stratifi" in q_text or "deff" in q_text:
                target_comps.extend([2, 1])
            elif "laspeyres" in q_text or "price index" in q_text or "cpi" in q_text or "gdp" in q_text:
                target_comps.extend([4])
            elif "merge" in q_text or "sql" in q_text or "database" in q_text or "table" in q_text or "block" in q_text:
                target_comps.extend([7])
            elif "visual" in q_text or "chart" in q_text or "dashboard" in q_text:
                target_comps.extend([9])
            elif "ai" in q_text or "ml" in q_text or "machine learning" in q_text:
                target_comps.extend([10])
            elif "privacy" in q_text or "dpdp" in q_text or "cyber" in q_text or "security" in q_text:
                target_comps.extend([11, 12])
            elif "report" in q_text or "writing" in q_text or "disseminat" in q_text:
                target_comps.extend([14])
            else:
                target_comps.append(1)
                
            for c_id in target_comps:
                if c_id not in comp_performance:
                    comp_performance[c_id] = []
                comp_performance[c_id].append(is_corr)
                
        # Update CompetencyProfile for tested competencies
        for c_id, results in comp_performance.items():
            correct_ratio = sum(1 for r in results if r) / max(1, len(results))
            if correct_ratio >= 0.8:
                assessed_level = 4.2
            elif correct_ratio >= 0.5:
                assessed_level = 3.2
            else:
                assessed_level = 1.9
                
            cp_res = await db.execute(
                select(CompetencyProfile).where(
                    CompetencyProfile.user_id == user_id,
                    CompetencyProfile.competency_id == c_id
                )
            )
            cp = cp_res.scalar_one_or_none()
            if cp:
                cp.current_level = assessed_level
                cp.assessment_method = 'ASSESSMENT_EVALUATED'
                cp.confidence_score = 0.95
            else:
                cp = CompetencyProfile(
                    user_id=user_id,
                    competency_id=c_id,
                    current_level=assessed_level,
                    confidence_score=0.95,
                    assessment_method='ASSESSMENT_EVALUATED'
                )
                db.add(cp)
                
        await db.commit()
        
        # Recalculate skill gaps
        if profile:
            gap_data = await self.analyze_skill_gaps(user_id, profile, db)
            await db.execute(SkillGap.__table__.delete().where(SkillGap.user_id == user_id))
            for gd in gap_data:
                gap = SkillGap(
                    user_id=user_id,
                    competency_id=gd['competency_id'],
                    required_level=gd['required_level'],
                    current_level=gd['current_level'],
                    gap_score=gd['gap_score'],
                    priority=gd['priority']
                )
                db.add(gap)
            await db.commit()
            
            # Generate tailored learning pathway
            await self.generate_personalized_learning_path(user_id, gap_data, db)

    async def generate_personalized_learning_path(self, user_id: int, gap_data: list[dict], db: AsyncSession):
        lp_res = await db.execute(select(LearningPath).where(LearningPath.user_id == user_id))
        path = lp_res.scalar_one_or_none()
        
        reasoning = f"Personalized curriculum generated by StatIQ AI based on your baseline competency assessment. Identified {len(gap_data)} skill gaps targeted with specialized iGOT Karmayogi modules and NSSTA practical training."
        
        if path:
            path.ai_reasoning = reasoning
            path.completion_percentage = 0.0
            path.status = "ACTIVE"
            await db.execute(LearningPathItem.__table__.delete().where(LearningPathItem.path_id == path.id))
        else:
            path = LearningPath(
                user_id=user_id,
                ai_reasoning=reasoning,
                status="ACTIVE",
                completion_percentage=0.0
            )
            db.add(path)
            await db.commit()
            await db.refresh(path)
            
        gap_comp_ids = [g['competency_id'] for g in gap_data]
        
        COURSE_MAP = [
            (8, "IGOT_COURSE", "IGOT001", "Python for Statistical Analysis & Survey Data Processing", 12.0),
            (2, "NSSTA_TRAINING", "NSSTA001", "Advanced Survey Sampling & NSSO Multi-Stage Methodologies", 24.0),
            (6, "IGOT_COURSE", "IGOT005", "Consumer Price Index (CPI) Weighting & Laspeyres Formula", 8.0),
            (7, "IGOT_COURSE", "IGOT002", "R Programming & Statistical Computing for Statisticians", 14.0),
            (11, "IGOT_COURSE", "IGOT006", "Cybersecurity Guidelines & Government Data Privacy", 6.0),
            (4, "IGOT_COURSE", "IGOT007", "Time Series Analysis & Economic Forecasting", 16.0),
            (10, "NSSTA_TRAINING", "NSSTA002", "Artificial Intelligence & ML Applications in Official Statistics", 20.0),
            (14, "IGOT_COURSE", "IGOT008", "Official Statistics Governance & Report Writing", 8.0),
        ]
        
        items = []
        seq = 1
        added_codes = set()
        
        for comp_id, itype, code, title, hours in COURSE_MAP:
            if comp_id in gap_comp_ids and code not in added_codes:
                items.append(LearningPathItem(
                    path_id=path.id,
                    sequence_order=seq,
                    item_type=itype,
                    item_id=code,
                    item_title=title,
                    estimated_hours=hours,
                    status="PENDING"
                ))
                added_codes.add(code)
                seq += 1
                if len(items) >= 4:
                    break
                    
        for comp_id, itype, code, title, hours in COURSE_MAP:
            if code not in added_codes and len(items) < 3:
                items.append(LearningPathItem(
                    path_id=path.id,
                    sequence_order=seq,
                    item_type=itype,
                    item_id=code,
                    item_title=title,
                    estimated_hours=hours,
                    status="PENDING"
                ))
                added_codes.add(code)
                seq += 1
                
        db.add_all(items)
        await db.commit()
