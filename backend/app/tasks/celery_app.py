from celery import Celery
from app.core.config import get_settings

settings = get_settings()

celery_app = Celery(
    'statiq',
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=['app.tasks.document_tasks']
)

celery_app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='Asia/Kolkata',
    enable_utc=True,
)
