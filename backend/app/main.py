from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from contextlib import asynccontextmanager
from app.core.database import create_all_tables, AsyncSessionLocal
from app.core.config import get_settings
from app.api.v1.router import api_router
from app.services.igot_service import IGOTService
from app.services.nssta_service import NSSTAService
from sqlalchemy import select
from app.models.learning import IGOTCourse, NSSTAProgram

settings = get_settings()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await create_all_tables()
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    
    # Seed data
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(IGOTCourse).limit(1))
        if not result.scalar_one_or_none():
            igot = IGOTService()
            await igot.sync_catalog_to_db(db)
            
        result = await db.execute(select(NSSTAProgram).limit(1))
        if not result.scalar_one_or_none():
            nssta = NSSTAService()
            await nssta.sync_programs_to_db(db)

        from app.core.seed_quizzes import seed_official_quizzes
        await seed_official_quizzes(db)
            
    yield
    # Shutdown
    pass

app = FastAPI(title="StatIQ Backend", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

app.include_router(api_router, prefix="/api/v1")

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
