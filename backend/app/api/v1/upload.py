from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.assessment import Document
from app.services.storage_service import StorageService
from app.tasks.document_tasks import trigger_document_processing

router = APIRouter()
storage_service = StorageService()

@router.post("/document")
async def upload_document(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    contents = await file.read()
    filename = f"{current_user.id}_{file.filename}"
    file_path = await storage_service.save_file(contents, filename, "documents")
    
    doc = Document(
        user_id=current_user.id,
        filename=filename,
        original_name=file.filename,
        file_type=file.content_type,
        file_size=len(contents),
        file_path=file_path,
        processing_status="PENDING"
    )
    db.add(doc)
    await db.commit()
    await db.refresh(doc)
    
    # Trigger in-process background processing (no Redis/Celery required)
    trigger_document_processing(doc.id)
    
    return {"id": doc.id, "filename": doc.filename, "message": "Upload successful, processing started."}

@router.get("/documents")
async def get_documents(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Document).where(Document.user_id == current_user.id))
    return result.scalars().all()

@router.get("/documents/{doc_id}")
async def get_document(doc_id: int, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Document).where(Document.id == doc_id, Document.user_id == current_user.id))
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc

@router.get("/documents/{doc_id}/status")
async def get_document_status(doc_id: int, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Document).where(Document.id == doc_id, Document.user_id == current_user.id))
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return {"processing_status": doc.processing_status}

@router.delete("/documents/{doc_id}")
async def delete_document(doc_id: int, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Document).where(Document.id == doc_id, Document.user_id == current_user.id))
    doc = result.scalar_one_or_none()
    if doc:
        await storage_service.delete_file(doc.file_path)
        await db.delete(doc)
        await db.commit()
    return {"message": "Deleted"}
