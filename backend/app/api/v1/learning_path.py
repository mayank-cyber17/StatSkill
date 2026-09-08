from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.learning import LearningPath, LearningPathItem
from app.models.profile import SkillGap
from app.services.ai.competency_engine import CompetencyEngine
from app.services.ai.llm_service import LLMService

router = APIRouter()

@router.get("")
async def get_learning_path(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(LearningPath).where(LearningPath.user_id == current_user.id))
    path = result.scalar_one_or_none()
    
    if not path:
        gap_res = await db.execute(select(SkillGap).where(SkillGap.user_id == current_user.id))
        gaps = gap_res.scalars().all()
        gap_data = [{"competency_id": g.competency_id, "priority": g.priority, "gap_score": g.gap_score} for g in gaps]
        
        engine = CompetencyEngine(LLMService())
        await engine.generate_personalized_learning_path(current_user.id, gap_data, db)
        
        result = await db.execute(select(LearningPath).where(LearningPath.user_id == current_user.id))
        path = result.scalar_one_or_none()
        
    if not path:
        return None
        
    items_result = await db.execute(
        select(LearningPathItem).where(LearningPathItem.path_id == path.id).order_by(LearningPathItem.sequence_order)
    )
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
    gap_res = await db.execute(select(SkillGap).where(SkillGap.user_id == current_user.id))
    gaps = gap_res.scalars().all()
    gap_data = [{"competency_id": g.competency_id, "priority": g.priority, "gap_score": g.gap_score} for g in gaps]
    
    engine = CompetencyEngine(LLMService())
    await engine.generate_personalized_learning_path(current_user.id, gap_data, db)
    
    result = await db.execute(select(LearningPath).where(LearningPath.user_id == current_user.id))
    path = result.scalar_one_or_none()
    
    return {"message": "Path generated successfully", "path_id": path.id if path else 1}

@router.put("/items/{item_id}/complete")
async def complete_item(item_id: int, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(LearningPathItem).where(LearningPathItem.id == item_id))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
        
    item.status = "COMPLETED"
    
    all_items_res = await db.execute(select(LearningPathItem).where(LearningPathItem.path_id == item.path_id))
    all_items = all_items_res.scalars().all()
    if all_items:
        completed_count = sum(1 for i in all_items if i.status == "COMPLETED")
        path_res = await db.execute(select(LearningPath).where(LearningPath.id == item.path_id))
        path = path_res.scalar_one_or_none()
        if path:
            path.completion_percentage = round((completed_count / len(all_items)) * 100, 1)
            
    await db.commit()
    return {"message": "Item marked as completed"}
