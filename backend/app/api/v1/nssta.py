from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.learning import NSSTANomination, NSSTAProgram
from app.services.nssta_service import NSSTAService

router = APIRouter()
nssta_service = NSSTAService()

@router.get("/programs")
async def list_programs(mode: Optional[str] = None):
    return await nssta_service.get_programs(mode)

@router.get("/recommendations")
async def get_recommendations(current_user: User = Depends(get_current_user)):
    return await nssta_service.get_recommendations([], current_user.id, "Director")

@router.post("/nominate/{program_id}")
async def nominate(program_id: str, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(NSSTAProgram).where(NSSTAProgram.program_code == program_id))
    prog = result.scalar_one_or_none()
    if not prog:
        raise HTTPException(status_code=404, detail="Program not synced to DB")
        
    nom = NSSTANomination(user_id=current_user.id, program_id=prog.id)
    db.add(nom)
    await db.commit()
    return {"message": "Nominated successfully"}

@router.get("/nominations")
async def my_nominations(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(NSSTANomination).where(NSSTANomination.user_id == current_user.id))
    return result.scalars().all()
