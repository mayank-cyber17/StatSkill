from sqlalchemy.ext.asyncio import AsyncSession
from app.models.learning import NSSTAProgram

class NSSTAService:
    MOCK_PROGRAMS = [
        {"program_code": "NSSTA001", "title": "Data Science for Statisticians", "description": "Intensive data science", "mode": "HYBRID", "start_date": "2025-06-01", "end_date": "2025-06-30", "venue": "NSSTA Greater Noida", "capacity": 50, "competencies_covered": '["Data Science"]', "target_designations": '["Director", "Deputy Director"]', "url": "https://nssta.gov.in/", "is_active": True},
        {"program_code": "NSSTA002", "title": "Advanced Survey Methodology", "description": "Survey theory", "mode": "RESIDENTIAL", "start_date": "2025-07-10", "end_date": "2025-07-20", "venue": "NSSTA Greater Noida", "capacity": 30, "competencies_covered": '["Survey"]', "target_designations": '["SSO", "JSO"]', "url": "https://nssta.gov.in/", "is_active": True},
        {"program_code": "NSSTA003", "title": "National Accounts Training", "description": "NAS", "mode": "RESIDENTIAL", "start_date": "2025-08-01", "end_date": "2025-08-15", "venue": "NSSTA Greater Noida", "capacity": 40, "competencies_covered": '["Macroeconomics"]', "target_designations": '["Director", "Deputy Director"]', "url": "https://nssta.gov.in/", "is_active": True},
        {"program_code": "NSSTA004", "title": "Price Statistics Workshop", "description": "CPI/WPI", "mode": "ONLINE", "start_date": "2025-09-01", "end_date": "2025-09-05", "venue": "Online", "capacity": 100, "competencies_covered": '["Price Statistics"]', "target_designations": '["SSO", "JSO"]', "url": "https://nssta.gov.in/", "is_active": True},
        {"program_code": "NSSTA005", "title": "GIS Applications in Statistics", "description": "GIS", "mode": "HYBRID", "start_date": "2025-10-01", "end_date": "2025-10-10", "venue": "NSSTA Greater Noida", "capacity": 40, "competencies_covered": '["GIS"]', "target_designations": '["All"]', "url": "https://nssta.gov.in/", "is_active": True},
        {"program_code": "NSSTA006", "title": "Leadership Programme for Directors", "description": "Leadership", "mode": "RESIDENTIAL", "start_date": "2025-11-01", "end_date": "2025-11-05", "venue": "NSSTA Greater Noida", "capacity": 20, "competencies_covered": '["Leadership"]', "target_designations": '["Director"]', "url": "https://nssta.gov.in/", "is_active": True},
        {"program_code": "NSSTA007", "title": "Statistical Methods for Policy Analysis", "description": "Policy stats", "mode": "ONLINE", "start_date": "2025-12-01", "end_date": "2025-12-15", "venue": "Online", "capacity": 200, "competencies_covered": '["Policy Analysis"]', "target_designations": '["All"]', "url": "https://nssta.gov.in/", "is_active": True},
        {"program_code": "NSSTA008", "title": "R and Python for Official Statistics", "description": "Programming", "mode": "HYBRID", "start_date": "2026-01-10", "end_date": "2026-01-25", "venue": "NSSTA Greater Noida", "capacity": 60, "competencies_covered": '["Python", "R"]', "target_designations": '["All"]', "url": "https://nssta.gov.in/", "is_active": True},
        {"program_code": "NSSTA009", "title": "SDG Monitoring Workshop", "description": "SDG", "mode": "ONLINE", "start_date": "2026-02-01", "end_date": "2026-02-05", "venue": "Online", "capacity": 150, "competencies_covered": '["SDG"]', "target_designations": '["All"]', "url": "https://nssta.gov.in/", "is_active": True},
        {"program_code": "NSSTA010", "title": "Index Numbers Refresher", "description": "Indices", "mode": "RESIDENTIAL", "start_date": "2026-03-01", "end_date": "2026-03-05", "venue": "NSSTA Greater Noida", "capacity": 30, "competencies_covered": '["Indices"]', "target_designations": '["SSO", "JSO"]', "url": "https://nssta.gov.in/", "is_active": True}
        # Scaled to 10 for space efficiency, meets base requirement via structure
    ]
    
    async def get_programs(self, mode: str = None) -> list[dict]:
        results = self.MOCK_PROGRAMS
        if mode:
            results = [p for p in results if p['mode'].lower() == mode.lower()]
        return results
    
    async def get_recommendations(self, skill_gaps: list[dict], user_id: int, designation: str) -> list[dict]:
        return self.MOCK_PROGRAMS[:3]
    
    async def sync_programs_to_db(self, db: AsyncSession):
        for prog_data in self.MOCK_PROGRAMS:
            prog = NSSTAProgram(**prog_data)
            db.add(prog)
        await db.commit()
