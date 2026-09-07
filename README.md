# StatIQ — AI-Enabled Skill Intelligence & Learning Platform
### Smart India Hackathon 2026 | Team Innovexa

---

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 20+
- Google Gemini API Key (free at [aistudio.google.com](https://aistudio.google.com))
- Redis (optional for local dev — async tasks work without it)

---

### Step 1: Set Up Backend

```powershell
# Navigate to backend
cd backend

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Configure environment
# Edit .env and add your GEMINI_API_KEY

# Run the server
python run.py
```

Backend runs at: **http://localhost:8000**
API Docs: **http://localhost:8000/docs**

---

### Step 2: Set Up Frontend

```powershell
# Navigate to frontend
cd frontend

# Install dependencies (already done during setup)
npm install

# Run dev server
npm run dev
```

Frontend runs at: **http://localhost:5173**

---

## 🎯 Demo Credentials

After starting the backend, demo accounts are auto-seeded:

| Role | Email | Password |
|------|-------|----------|
| Learner | learner@statiq.gov.in | Demo@1234 |
| Trainer | trainer@statiq.gov.in | Demo@1234 |
| Admin | admin@statiq.gov.in | Demo@1234 |

---

## 🏗️ Architecture

```
Innovexa/
├── backend/          # FastAPI Python backend
│   ├── app/
│   │   ├── core/     # Config, database, security
│   │   ├── models/   # SQLAlchemy ORM models
│   │   ├── schemas/  # Pydantic schemas
│   │   ├── api/v1/   # REST API routes
│   │   ├── services/ # AI services, iGOT, NSSTA
│   │   └── tasks/    # Celery async tasks
│   ├── .env          # Environment variables
│   └── requirements.txt
│
└── frontend/         # React + Vite frontend
    ├── src/
    │   ├── pages/    # All application pages
    │   ├── components/ # Reusable components
    │   ├── services/ # API client
    │   └── stores/   # Zustand state
    └── package.json
```

---

## ✨ Key Features

| Feature | Status |
|---------|--------|
| AI Competency Assessment | ✅ |
| Skill Gap Analysis | ✅ |
| Personalized Learning Path | ✅ |
| iGOT Course Recommendations | ✅ (Mock API) |
| NSSTA TPAC Recommendations | ✅ (Mock API) |
| MCQ Quiz Generator from PDFs | ✅ |
| AI Learning Assistant | ✅ |
| Learner Analytics Dashboard | ✅ |
| Admin Workforce Analytics | ✅ |
| Predictive Skill Demand | ✅ |

---

## 🔑 Environment Variables

```env
GEMINI_API_KEY=your-key-here     # Required for all AI features
DATABASE_URL=sqlite+aiosqlite:///./statiq.db
SECRET_KEY=your-secret-key
```

---

## 📊 Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | FastAPI (Python) |
| Database | SQLite (dev) / PostgreSQL (prod) |
| AI/LLM | Google Gemini 1.5 Flash |
| Embeddings | Google text-embedding-004 |
| Vector Store | ChromaDB |
| Charts | Recharts |
| State | Zustand + React Query |

---

## 👥 Team Innovexa
Smart India Hackathon 2026
