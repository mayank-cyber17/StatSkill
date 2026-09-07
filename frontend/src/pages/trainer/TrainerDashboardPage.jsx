import React from 'react'
import { Link } from 'react-router-dom'
import { ClipboardList, Upload, FileText, FileQuestion, Users, Sparkles, Plus, ArrowRight } from 'lucide-react'

export default function TrainerDashboardPage() {
  const materials = [
    { id: 1, name: 'National_Accounts_Statistics_Manual_2025.pdf', chunks: 48, status: 'READY', date: '2025-08-28' },
    { id: 2, name: 'NSSO_78th_Round_Sampling_Design.pdf', chunks: 32, status: 'READY', date: '2025-08-26' },
    { id: 3, name: 'Python_Data_Analysis_MoSPI_Guide.docx', chunks: 20, status: 'READY', date: '2025-08-24' },
  ]

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-white flex items-center gap-3">
            <ClipboardList className="w-7 h-7 text-purple-400" /> Trainer Management Command Portal
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Upload official training manuals, manage RAG vector stores, and publish AI-generated quizzes.
          </p>
        </div>

        <Link to="/trainer/upload" className="btn btn-primary text-xs shadow-glow">
          <Upload className="w-4 h-4" /> Upload New Material
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <span className="stat-label">Uploaded Documents</span>
          <div className="stat-value text-purple-400">12</div>
          <div className="stat-change text-purple-300">PDF, DOCX, PPTX</div>
        </div>

        <div className="stat-card">
          <span className="stat-label">Generated Quizzes</span>
          <div className="stat-value text-brand-400">8</div>
          <div className="stat-change text-slate-400">Grounded MCQs</div>
        </div>

        <div className="stat-card">
          <span className="stat-label">Learners Evaluated</span>
          <div className="stat-value text-emerald-400">450</div>
          <div className="stat-change text-emerald-400">Officers Attempted</div>
        </div>

        <div className="stat-card">
          <span className="stat-label">Vector Embeddings</span>
          <div className="stat-value text-amber-400">1,240</div>
          <div className="stat-change text-amber-300">ChromaDB Chunks</div>
        </div>
      </div>

      <div className="card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="section-title text-lg">Recent Ingested Learning Materials</h3>
          <Link to="/trainer/upload" className="text-xs text-brand-400 font-semibold hover:underline">
            + Add Material
          </Link>
        </div>

        <div className="space-y-3">
          {materials.map((m) => (
            <div key={m.id} className="p-4 rounded-xl bg-surface-700/40 border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-purple-400 shrink-0" />
                <div>
                  <div className="font-bold text-white text-sm">{m.name}</div>
                  <div className="text-xs text-slate-400">{m.chunks} Text Chunks Ingested • Uploaded {m.date}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="badge badge-success">{m.status}</span>
                <Link to="/trainer/upload" className="btn btn-secondary text-xs py-1.5">
                  Generate Quiz <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
