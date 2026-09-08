from fastapi import APIRouter
from app.api.v1 import auth, profile, gap_analysis, learning_path, igot, nssta, upload, assessment, assistant, analytics, admin, learning_video

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(profile.router, prefix="/profile", tags=["profile"])
api_router.include_router(gap_analysis.router, prefix="/gap-analysis", tags=["gap_analysis"])
api_router.include_router(learning_path.router, prefix="/learning-path", tags=["learning_path"])
api_router.include_router(igot.router, prefix="/igot", tags=["igot"])
api_router.include_router(nssta.router, prefix="/nssta", tags=["nssta"])
api_router.include_router(upload.router, prefix="/upload", tags=["upload"])
api_router.include_router(assessment.router, prefix="/quizzes", tags=["assessment"])
api_router.include_router(assistant.router, prefix="/assistant", tags=["assistant"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
api_router.include_router(learning_video.router, prefix="/learning-video", tags=["learning_video"])
