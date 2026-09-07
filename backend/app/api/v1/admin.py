from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.deps import require_role
from app.models.user import User

router = APIRouter()

@router.get("/users")
async def list_users(current_user: User = Depends(require_role("ADMIN", "SUPER_ADMIN")), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User))
    return result.scalars().all()

@router.put("/users/{user_id}/role")
async def change_role(user_id: int, role: str, current_user: User = Depends(require_role("SUPER_ADMIN")), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user:
        user.role = role
        await db.commit()
    return {"message": "Role updated"}

@router.get("/frameworks")
async def get_frameworks(current_user: User = Depends(require_role("ADMIN")), db: AsyncSession = Depends(get_db)):
    return {"frameworks": []}

@router.get("/nominations/pending")
async def get_pending_nominations(current_user: User = Depends(require_role("ADMIN")), db: AsyncSession = Depends(get_db)):
    from app.models.learning import NSSTANomination
    result = await db.execute(select(NSSTANomination).where(NSSTANomination.status == "PENDING"))
    return result.scalars().all()

@router.post("/nominations/{id}/approve")
async def approve_nomination(id: int, action: str, current_user: User = Depends(require_role("ADMIN")), db: AsyncSession = Depends(get_db)):
    from app.models.learning import NSSTANomination
    result = await db.execute(select(NSSTANomination).where(NSSTANomination.id == id))
    nom = result.scalar_one_or_none()
    if nom:
        nom.status = action.upper()
        nom.approved_by = current_user.id
        await db.commit()
    return {"message": f"Nomination {action}"}

@router.get("/reports/competency")
async def export_competency_report(current_user: User = Depends(require_role("ADMIN")), db: AsyncSession = Depends(get_db)):
    return {"report": "Data"}
