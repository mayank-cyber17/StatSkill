# StatIQ Backend — FastAPI

## Project Structure
```
backend/
├── app/
│   ├── main.py
│   ├── core/
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── security.py
│   │   └── deps.py
│   ├── models/
│   │   ├── user.py
│   │   ├── profile.py
│   │   ├── competency.py
│   │   ├── learning.py
│   │   ├── assessment.py
│   │   └── analytics.py
│   ├── schemas/
│   │   ├── auth.py
│   │   ├── profile.py
│   │   ├── competency.py
│   │   ├── learning.py
│   │   ├── assessment.py
│   │   └── analytics.py
│   ├── api/v1/
│   │   ├── router.py
│   │   ├── auth.py
│   │   ├── profile.py
│   │   ├── competency.py
│   │   ├── gap_analysis.py
│   │   ├── learning_path.py
│   │   ├── igot.py
│   │   ├── nssta.py
│   │   ├── upload.py
│   │   ├── assessment.py
│   │   ├── assistant.py
│   │   ├── analytics.py
│   │   └── admin.py
│   ├── services/
│   │   ├── ai/
│   │   │   ├── llm_service.py
│   │   │   ├── embedding_service.py
│   │   │   ├── rag_service.py
│   │   │   ├── mcq_generator.py
│   │   │   ├── competency_engine.py
│   │   │   └── assistant_service.py
│   │   ├── igot_service.py
│   │   ├── nssta_service.py
│   │   └── storage_service.py
│   └── tasks/
│       ├── celery_app.py
│       └── document_tasks.py
├── alembic/
├── requirements.txt
├── .env.example
└── run.py
```
