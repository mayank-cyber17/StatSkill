from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.learning import LearningPath, LearningPathItem

router = APIRouter()

@router.get("")
async def get_learning_path(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(LearningPath).where(LearningPath.user_id == current_user.id))
    path = result.scalar_one_or_none()
    if not path:
        return None
        
    items_result = await db.execute(select(LearningPathItem).where(LearningPathItem.path_id == path.id).order_by(LearningPathItem.sequence_order))
    items = items_result.scalars().all()
    
    return {
        "id": path.id,
        "status": path.status,
        "completion_percentage": path.completion_percentage,
        "ai_reasoning": path.ai_reasoning,
        "items": items
    }

@router.post("/generate")
async def generate_path(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    # In a real system, this would fetch skill gaps and call LLM + iGOTService to map out a path
    # For now, mock creation
    path = LearningPath(
        user_id=current_user.id,
        ai_reasoning="Based on your skill gaps in Data Science and Policy, this path focuses on foundational python and statistical methodologies."
    )
    db.add(path)
    await db.commit()
    await db.refresh(path)
    
    items = [
        LearningPathItem(path_id=path.id, sequence_order=1, item_type="IGOT_COURSE", item_id="IGOT001", item_title="Python for Statistical Analysis", estimated_hours=10.0),
        LearningPathItem(path_id=path.id, sequence_order=2, item_type="NSSTA_TRAINING", item_id="NSSTA001", item_title="Data Science for Statisticians", estimated_hours=40.0)
    ]
    db.add_all(items)
    await db.commit()
    
    return {"message": "Path generated successfully", "path_id": path.id}

@router.put("/items/{item_id}/complete")
async def complete_item(item_id: int, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(LearningPathItem).where(LearningPathItem.id == item_id))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
        
    item.status = "COMPLETED"
    
    # Update completion percentage of path
    # (Simplified logic)
    
    await db.commit()
    return {"message": "Item marked as completed"}
