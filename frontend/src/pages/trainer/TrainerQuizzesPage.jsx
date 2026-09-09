import React from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { quizAPI } from '../../services/api'
import { FileQuestion, Plus, CheckCircle2, Play, Sparkles } from 'lucide-react'

export default function TrainerQuizzesPage() {
  const { data: quizzesRes, isLoading } = useQuery({
    queryKey: ['trainer-quizzes'],
    queryFn: quizAPI.getAll,
  })

  const quizzes = (quizzesRes?.data && Array.isArray(quizzesRes.data) && quizzesRes.data.length > 0)
    ? quizzesRes.data
    : [
        { id: 4, title: 'Python for Statistical Analysis & Survey Data Processing', total_questions: 10, status: 'PUBLISHED', description: 'Official MoSPI iGOT001 Curriculum' },
        { id: 5, title: 'R Programming & Statistical Computing for Statisticians', total_questions: 10, status: 'PUBLISHED', description: 'Official MoSPI iGOT002 Curriculum' },
        { id: 6, title: 'Consumer Price Index (CPI) Weighting & Laspeyres Formula', total_questions: 10, status: 'PUBLISHED', description: 'Official MoSPI iGOT005 Curriculum' },
        { id: 7, title: 'National Accounts Statistics & GDP Estimation Methodology', total_questions: 10, status: 'PUBLISHED', description: 'UN SNA 2008 & MoSPI Framework' },
        { id: 8, title: 'Survey Sampling Theory & NSSO Multi-Stage Methodology', total_questions: 10, status: 'PUBLISHED', description: 'NSSO FOD Sampling Design' },
      ]

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <FileQuestion className="w-7 h-7 text-purple-500 dark:text-purple-400" /> Manage AI Generated & Official Quizzes
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
            Review, edit, publish, or preview AI-synthesized multiple choice question banks.
          </p>
        </div>

        <Link to="/trainer/upload" className="btn btn-primary text-xs shadow-glow flex items-center gap-2">
          <Plus className="w-4 h-4" /> Create New Quiz from Material
        </Link>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-100 dark:bg-surface-700/50 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-white/10">
              <tr>
                <th className="px-6 py-4">Quiz Title</th>
                <th className="px-6 py-4">Curriculum / Source Material</th>
                <th className="px-6 py-4">Questions</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {quizzes.map((q) => (
                <tr key={q.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900 dark:text-white max-w-xs truncate">{q.title}</td>
                  <td className="px-6 py-4 text-xs font-mono text-slate-500 dark:text-slate-400 max-w-xs truncate">
                    {q.description || (q.document_id ? `Document #${q.document_id}` : 'Official MoSPI Curriculum')}
                  </td>
                  <td className="px-6 py-4 font-mono font-bold text-brand-600 dark:text-brand-300">
                    {q.total_questions || 10} MCQs
                  </td>
                  <td className="px-6 py-4">
                    <span className={`badge ${q.status === 'PUBLISHED' ? 'badge-success' : 'badge-warn'}`}>
                      {q.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link to={`/quizzes/${q.id}`} className="btn btn-secondary text-xs py-1.5 inline-flex items-center gap-1">
                      Preview Quiz →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
