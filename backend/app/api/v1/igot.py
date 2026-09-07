from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.learning import IGOTEnrollment, IGOTCourse
from app.services.igot_service import IGOTService

router = APIRouter()
igot_service = IGOTService()

@router.get("/courses")
async def list_courses(q: Optional[str] = None, level: Optional[str] = None):
    return await igot_service.search_courses(q, level)

@router.get("/courses/{course_id}")
async def get_course(course_id: str):
    course = await igot_service.get_course(course_id)
    if not course:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Course not found")
    return course

@router.get("/recommendations")
async def get_recommendations(current_user: User = Depends(get_current_user)):
    return await igot_service.get_recommendations([], current_user.id)

@router.post("/enroll/{course_id}")
async def enroll_course(course_id: str, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    # Need to fetch internal db id
    result = await db.execute(select(IGOTCourse).where(IGOTCourse.igot_course_id == course_id))
    course = result.scalar_one_or_none()
    if not course:
        return {"error": "Course not synced to DB"}
        
    enrollment = IGOTEnrollment(user_id=current_user.id, igot_course_id=course.id)
    db.add(enrollment)
    await db.commit()
    return {"message": "Enrolled successfully"}

@router.get("/enrollments")
async def my_enrollments(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(IGOTEnrollment).where(IGOTEnrollment.user_id == current_user.id))
    return result.scalars().all()
