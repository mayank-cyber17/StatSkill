"""
Seed script for StatIQ competency framework and job role mappings.
Based on iGOT Karmayogi competency framework for statistical officials.
Run: python seed_competencies.py
"""
import asyncio
import sys
sys.path.insert(0, '.')

from app.core.database import AsyncSessionLocal, create_all_tables
from app.models.profile import CompetencyDomain, Competency, JobRoleCompetencyMap
from sqlalchemy import select

# ─────────────────────────────────────────────────────
# COMPETENCY FRAMEWORK DATA
# Based on iGOT Karmayogi Framework for Statistical Officials
# ─────────────────────────────────────────────────────

DOMAINS = [
    {"name": "Statistical Competencies", "description": "Core statistical and quantitative skills", "domain_type": "FUNCTIONAL"},
    {"name": "Data Management", "description": "Data collection, cleaning, and management", "domain_type": "FUNCTIONAL"},
    {"name": "Digital & Technology", "description": "Digital tools, software, and technology skills", "domain_type": "TECHNICAL"},
    {"name": "Policy & Governance", "description": "Understanding policy, governance, and legal frameworks", "domain_type": "DOMAIN"},
    {"name": "Communication & Dissemination", "description": "Communicating data and insights effectively", "domain_type": "BEHAVIORAL"},
    {"name": "Leadership & Management", "description": "Team leadership and organizational management", "domain_type": "BEHAVIORAL"},
]

COMPETENCIES_BY_DOMAIN = {
    "Statistical Competencies": [
        {
            "name": "Statistical Theory & Methods",
            "description": "Knowledge of statistical theories, probability, and methods",
            "level_1_desc": "Aware of basic statistical terms and concepts",
            "level_2_desc": "Applies basic statistical tests and interpretes results",
            "level_3_desc": "Designs and conducts statistical surveys independently",
            "level_4_desc": "Develops new analytical methodologies for complex problems",
            "level_5_desc": "Leads national-level statistical methodology development",
        },
        {
            "name": "Survey Design & Sampling",
            "description": "Designing surveys, selecting sampling methods, and estimating",
            "level_1_desc": "Understands basic survey concepts and sampling terminologies",
            "level_2_desc": "Assists in questionnaire design and basic sampling",
            "level_3_desc": "Independently designs surveys and selects appropriate sampling methods",
            "level_4_desc": "Innovates sampling techniques for complex survey scenarios",
            "level_5_desc": "Establishes national survey standards and mentors others",
        },
        {
            "name": "Data Analysis & Inference",
            "description": "Analyzing data to draw meaningful conclusions",
            "level_1_desc": "Performs basic data summarization and tabulation",
            "level_2_desc": "Applies regression, correlation, and hypothesis testing",
            "level_3_desc": "Conducts multivariate analysis and machine learning models",
            "level_4_desc": "Designs complex analytical frameworks and validates models",
            "level_5_desc": "Pioneers data-driven policy frameworks at national level",
        },
        {
            "name": "Econometrics & Modelling",
            "description": "Economic modelling and forecasting techniques",
            "level_1_desc": "Aware of basic economic indicators and GDP concepts",
            "level_2_desc": "Applies simple econometric models under supervision",
            "level_3_desc": "Builds economic forecasting models independently",
            "level_4_desc": "Leads development of macroeconomic models for policy use",
            "level_5_desc": "Advises government on economic modelling at national level",
        },
    ],
    "Data Management": [
        {
            "name": "Data Collection & Curation",
            "description": "Collecting, validating and curating statistical data",
            "level_1_desc": "Understands data collection forms and basic data entry",
            "level_2_desc": "Conducts field surveys and validates collected data",
            "level_3_desc": "Designs data collection instruments and quality checks",
            "level_4_desc": "Establishes data governance frameworks for large datasets",
            "level_5_desc": "Sets national data curation standards and policies",
        },
        {
            "name": "Data Quality Management",
            "description": "Ensuring accuracy, completeness, and reliability of data",
            "level_1_desc": "Identifies basic data errors and inconsistencies",
            "level_2_desc": "Applies data cleaning procedures and validates data",
            "level_3_desc": "Designs quality control frameworks for statistical data",
            "level_4_desc": "Leads data quality assurance programs across departments",
            "level_5_desc": "Establishes national data quality standards",
        },
        {
            "name": "Database Management",
            "description": "Managing databases, SQL, and data warehousing",
            "level_1_desc": "Uses databases to retrieve basic information",
            "level_2_desc": "Writes SQL queries and manages relational databases",
            "level_3_desc": "Designs database schemas and manages data warehouses",
            "level_4_desc": "Architexts enterprise data solutions and pipelines",
            "level_5_desc": "Leads national data infrastructure strategy",
        },
    ],
    "Digital & Technology": [
        {
            "name": "Statistical Software Proficiency",
            "description": "Using R, Python, SPSS, SAS, and other statistical tools",
            "level_1_desc": "Uses spreadsheets (Excel) for basic analysis",
            "level_2_desc": "Uses SPSS or R for standard statistical analysis",
            "level_3_desc": "Writes R/Python programs for automated data analysis",
            "level_4_desc": "Develops custom packages and tools for statistical use",
            "level_5_desc": "Leads digital transformation of statistical systems",
        },
        {
            "name": "Data Visualization",
            "description": "Creating charts, dashboards, and infographics",
            "level_1_desc": "Creates basic charts and graphs using Excel",
            "level_2_desc": "Uses BI tools like Tableau/Power BI for dashboards",
            "level_3_desc": "Designs interactive visualizations and data stories",
            "level_4_desc": "Develops visualization frameworks for public dissemination",
            "level_5_desc": "Leads national data visualization standards",
        },
        {
            "name": "Artificial Intelligence & ML",
            "description": "Understanding and applying AI/ML in statistical work",
            "level_1_desc": "Aware of AI/ML concepts and their applications",
            "level_2_desc": "Uses pre-built ML models for basic prediction tasks",
            "level_3_desc": "Builds and validates ML models for statistical problems",
            "level_4_desc": "Leads AI adoption in statistical processes",
            "level_5_desc": "Defines national AI strategy for statistical systems",
        },
        {
            "name": "Digital Governance & e-Services",
            "description": "Digital governance frameworks and e-government services",
            "level_1_desc": "Aware of basic digital governance and e-services concepts",
            "level_2_desc": "Uses digital platforms for governance and data sharing",
            "level_3_desc": "Implements digital governance frameworks in department",
            "level_4_desc": "Designs e-government statistical services",
            "level_5_desc": "Leads digital transformation of statistical governance",
        },
    ],
    "Policy & Governance": [
        {
            "name": "Statistical Laws & Regulations",
            "description": "Knowledge of statistical laws, collection act, and policies",
            "level_1_desc": "Aware of basic statistical laws in India",
            "level_2_desc": "Applies statistical regulations in day-to-day work",
            "level_3_desc": "Interprets and implements statistical legislation",
            "level_4_desc": "Contributes to policy formulation and legislative updates",
            "level_5_desc": "Shapes national statistical legal frameworks",
        },
        {
            "name": "Government Schemes & Programs",
            "description": "Understanding of government flagship programs and their data needs",
            "level_1_desc": "Aware of major government schemes and their objectives",
            "level_2_desc": "Collects and reports data for government scheme monitoring",
            "level_3_desc": "Designs M&E frameworks for government programs",
            "level_4_desc": "Leads impact evaluation studies for flagship programs",
            "level_5_desc": "Advises on data-driven policy for national programs",
        },
    ],
    "Communication & Dissemination": [
        {
            "name": "Statistical Report Writing",
            "description": "Writing clear and accurate statistical reports",
            "level_1_desc": "Prepares basic tables and data summaries",
            "level_2_desc": "Writes standard statistical reports with interpretation",
            "level_3_desc": "Produces comprehensive analytical reports for decision-makers",
            "level_4_desc": "Leads report production for national statistical publications",
            "level_5_desc": "Sets standards for national statistical publications",
        },
        {
            "name": "Stakeholder Communication",
            "description": "Communicating with policy makers, media, and public",
            "level_1_desc": "Responds to basic queries from stakeholders",
            "level_2_desc": "Presents data findings to internal stakeholders",
            "level_3_desc": "Conducts briefings for senior officials and media",
            "level_4_desc": "Leads public communication strategy for data releases",
            "level_5_desc": "Represents organization in national/international forums",
        },
    ],
    "Leadership & Management": [
        {
            "name": "Team Leadership",
            "description": "Leading teams and managing human resources",
            "level_1_desc": "Works effectively as part of a team",
            "level_2_desc": "Coordinates tasks and guides junior colleagues",
            "level_3_desc": "Leads small teams and manages project timelines",
            "level_4_desc": "Manages large teams across multiple projects",
            "level_5_desc": "Leads departmental strategy and organizational change",
        },
        {
            "name": "Project Management",
            "description": "Planning and executing statistical projects",
            "level_1_desc": "Understands project basics and follows plans",
            "level_2_desc": "Manages own tasks and meets deadlines",
            "level_3_desc": "Plans and executes medium-scale statistical surveys",
            "level_4_desc": "Leads large-scale national survey programs",
            "level_5_desc": "Oversees national/international statistical projects",
        },
    ],
}

# ─────────────────────────────────────────────────────
# JOB ROLE COMPETENCY REQUIREMENTS
# priority: 1=Critical, 2=Important, 3=Nice-to-have
# ─────────────────────────────────────────────────────

JOB_ROLE_REQUIREMENTS = {
    "Data Analysis": {
        "Statistical Theory & Methods": (4, 1),
        "Data Analysis & Inference": (4, 1),
        "Statistical Software Proficiency": (3, 1),
        "Data Quality Management": (3, 2),
        "Data Visualization": (3, 2),
        "Statistical Report Writing": (3, 2),
        "Database Management": (2, 3),
        "Survey Design & Sampling": (2, 3),
    },
    "Survey Design": {
        "Survey Design & Sampling": (4, 1),
        "Statistical Theory & Methods": (3, 1),
        "Data Collection & Curation": (4, 1),
        "Data Quality Management": (4, 1),
        "Statistical Report Writing": (3, 2),
        "Database Management": (2, 2),
        "Stakeholder Communication": (2, 3),
    },
    "Administration": {
        "Government Schemes & Programs": (3, 1),
        "Statistical Laws & Regulations": (3, 1),
        "Stakeholder Communication": (3, 1),
        "Project Management": (3, 2),
        "Team Leadership": (2, 2),
        "Digital Governance & e-Services": (2, 2),
        "Statistical Report Writing": (3, 2),
    },
    "Field Investigation": {
        "Data Collection & Curation": (4, 1),
        "Survey Design & Sampling": (3, 1),
        "Data Quality Management": (3, 1),
        "Statistical Report Writing": (2, 2),
        "Stakeholder Communication": (3, 2),
        "Government Schemes & Programs": (2, 3),
    },
    "IT & Systems": {
        "Statistical Software Proficiency": (4, 1),
        "Database Management": (4, 1),
        "Digital Governance & e-Services": (4, 1),
        "Artificial Intelligence & ML": (3, 1),
        "Data Visualization": (3, 2),
        "Data Quality Management": (2, 2),
    },
    "Policy & Research": {
        "Statistical Theory & Methods": (4, 1),
        "Econometrics & Modelling": (4, 1),
        "Government Schemes & Programs": (4, 1),
        "Statistical Laws & Regulations": (3, 1),
        "Statistical Report Writing": (4, 1),
        "Stakeholder Communication": (3, 2),
        "Data Analysis & Inference": (3, 2),
    },
    "Training & Capacity Building": {
        "Statistical Theory & Methods": (4, 1),
        "Communication & Stakeholder": (3, 1),
        "Statistical Report Writing": (3, 1),
        "Team Leadership": (3, 2),
        "Project Management": (2, 2),
        "Digital Governance & e-Services": (2, 3),
    },
}


async def seed():
    await create_all_tables()

    async with AsyncSessionLocal() as db:
        # Check if already seeded
        existing = await db.execute(select(CompetencyDomain))
        if existing.scalars().first():
            print("Competencies already seeded. Skipping.")
            return

        print("Seeding competency domains and competencies...")

        domain_map = {}
        for d in DOMAINS:
            domain = CompetencyDomain(**d)
            db.add(domain)
            await db.flush()
            domain_map[d["name"]] = domain
            print(f"  Added domain: {d['name']}")

        competency_map = {}
        for domain_name, comps in COMPETENCIES_BY_DOMAIN.items():
            domain = domain_map[domain_name]
            for c in comps:
                comp = Competency(domain_id=domain.id, **c)
                db.add(comp)
                await db.flush()
                competency_map[c["name"]] = comp
                print(f"  Added competency: {c['name']}")

        print("\nSeeding job role competency requirements...")
        for role, requirements in JOB_ROLE_REQUIREMENTS.items():
            for comp_name, (level, priority) in requirements.items():
                if comp_name not in competency_map:
                    print(f"  WARNING: Competency '{comp_name}' not found for role '{role}'")
                    continue
                mapping = JobRoleCompetencyMap(
                    job_role=role,
                    competency_id=competency_map[comp_name].id,
                    required_level=level,
                    priority=priority
                )
                db.add(mapping)
            print(f"  Added requirements for role: {role}")

        await db.commit()
        print(f"\n[OK] Seeding complete!")
        print(f"   Domains: {len(DOMAINS)}")
        print(f"   Competencies: {sum(len(v) for v in COMPETENCIES_BY_DOMAIN.values())}")
        print(f"   Job Roles mapped: {len(JOB_ROLE_REQUIREMENTS)}")


if __name__ == "__main__":
    asyncio.run(seed())
