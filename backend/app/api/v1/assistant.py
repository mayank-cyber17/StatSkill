from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.assessment import AssistantConversation, AssistantMessage
from app.schemas.assessment import AssistantMessageRequest
from app.services.ai.assistant_service import AssistantService
from app.services.ai.llm_service import LLMService

router = APIRouter()

@router.post("/conversations")
async def create_conversation(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    conv = AssistantConversation(user_id=current_user.id, title="New Chat")
    db.add(conv)
    await db.commit()
    await db.refresh(conv)
    return conv

@router.get("/conversations")
async def list_conversations(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(AssistantConversation)
        .where(AssistantConversation.user_id == current_user.id)
        .order_by(AssistantConversation.created_at.desc())
    )
    return result.scalars().all()

@router.get("/conversations/{conv_id}/messages")
async def get_conversation_messages(
    conv_id: int, 
    current_user: User = Depends(get_current_user), 
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(AssistantConversation)
        .where(AssistantConversation.id == conv_id, AssistantConversation.user_id == current_user.id)
    )
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Conversation not found")
        
    messages_res = await db.execute(
        select(AssistantMessage)
        .where(AssistantMessage.conversation_id == conv_id)
        .order_by(AssistantMessage.created_at.asc())
    )
    return messages_res.scalars().all()

@router.delete("/conversations/{conv_id}")
async def delete_conversation(
    conv_id: int, 
    current_user: User = Depends(get_current_user), 
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(AssistantConversation)
        .where(AssistantConversation.id == conv_id, AssistantConversation.user_id == current_user.id)
    )
    conv = result.scalar_one_or_none()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
        
    await db.execute(delete(AssistantMessage).where(AssistantMessage.conversation_id == conv_id))
    await db.delete(conv)
    await db.commit()
    return {"status": "success", "message": "Conversation deleted"}

@router.post("/conversations/{conv_id}/message")
async def send_message(
    conv_id: int, 
    req: AssistantMessageRequest, 
    current_user: User = Depends(get_current_user), 
    db: AsyncSession = Depends(get_db)
):
    conv = None
    if conv_id and conv_id > 0:
        result = await db.execute(
            select(AssistantConversation)
            .where(AssistantConversation.id == conv_id, AssistantConversation.user_id == current_user.id)
        )
        conv = result.scalar_one_or_none()
        
    if not conv:
        title = (req.content[:35] + "...") if len(req.content) > 35 else req.content
        conv = AssistantConversation(user_id=current_user.id, title=title or "Chat with InnoWing")
        db.add(conv)
        await db.commit()
        await db.refresh(conv)
        conv_id = conv.id
    elif conv.title in ["New Chat", "Chat with InnoWing"]:
        conv.title = (req.content[:35] + "...") if len(req.content) > 35 else req.content
        db.add(conv)
        await db.commit()
        
    user_msg = AssistantMessage(conversation_id=conv_id, role="USER", content=req.content)
    db.add(user_msg)
    await db.commit()
    
    llm = LLMService()
    assistant = AssistantService(llm)
    
    user_context = {
        "role": getattr(current_user, "role", "LEARNER"), 
        "email": getattr(current_user, "email", "learner@statiq.gov.in"),
        "name": getattr(current_user, "full_name", "Official")
    }
    
    response_text = await assistant.chat(conv_id, req.content, user_context, db)
    
    asst_msg = AssistantMessage(conversation_id=conv_id, role="ASSISTANT", content=response_text)
    db.add(asst_msg)
    await db.commit()
    await db.refresh(asst_msg)
    
    return {
        "message": response_text,
        "content": response_text,
        "conversation_id": conv_id,
        "role": "ASSISTANT",
        "id": asst_msg.id
    }

