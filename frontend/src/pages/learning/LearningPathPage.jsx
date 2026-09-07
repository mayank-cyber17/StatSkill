import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { learningPathAPI } from '../../services/api'
import { Map, Clock, CheckCircle2, PlayCircle, Sparkles, BookOpen, GraduationCap, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function LearningPathPage() {
  const { data: pathRes, isLoading } = useQuery({
    queryKey: ['learning-path'],
    queryFn: learningPathAPI.get,
  })

  const path = pathRes?.data || {
    completion_percentage: 35,
    ai_reasoning: 'Pathway constructed to prioritize Python & GIS technical gaps identified in your profile, followed by specialized NSSTA TPAC modules in National Accounts Statistics.',
    items: [
      { id: 1, sequence_order: 1, item_type: 'IGOT_COURSE', item_title: 'Python for Statistical Analysis (IGOT001)', estimated_hours: 12, status: 'IN_PROGRESS', provider: 'iGOT Karmayogi' },
      { id: 2, sequence_order: 2, item_type: 'NSSTA_TRAINING', item_title: 'GIS Applications for Statistical Officers (TPAC-2025-04)', estimated_hours: 24, status: 'PENDING', provider: 'NSSTA Greater Noida' },
      { id: 3, sequence_order: 3, item_type: 'QUIZ', item_title: 'Survey Methodology & Sampling Assessment Quiz', estimated_hours: 1, status: 'COMPLETED', provider: 'StatIQ AI Engine' },
      { id: 4, sequence_order: 4, item_type: 'IGOT_COURSE', item_title: 'Machine Learning Fundamentals for Data Analysis (IGOT006)', estimated_hours: 18, status: 'PENDING', provider: 'iGOT Karmayogi' },
      { id: 5, sequence_order: 5, item_type: 'NSSTA_TRAINING', item_title: 'National Accounts Statistics Masterclass (TPAC-2025-09)', estimated_hours: 30, status: 'PENDING', provider: 'NSSTA / IASRI' },
    ]
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-white flex items-center gap-3">
            <Map className="w-7 h-7 text-purple-400" /> AI-Personalized Learning Pathway
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Sequenced trajectory combining iGOT e-learning modules and NSSTA classroom/hybrid training programs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-xs text-slate-400">Pathway Completion</div>
            <div className="text-lg font-bold font-mono text-purple-400">{path.completion_percentage}%</div>
          </div>
          <div className="w-24 h-2 rounded-full bg-surface-700 overflow-hidden">
            <div className="h-full bg-purple-500 rounded-full" style={{ width: `${path.completion_percentage}%` }} />
          </div>
        </div>
      </div>

      {/* AI Reasoning Card */}
      <div className="card p-6 border-l-4 border-l-purple-500 bg-purple-500/5 space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-purple-300 uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-purple-400" /> StatIQ AI Recommendation Logic
        </div>
        <p className="text-slate-200 text-sm leading-relaxed">{path.ai_reasoning}</p>
      </div>

      {/* Timeline View */}
      <div className="space-y-6 relative before:absolute before:inset-0 before:left-6 before:w-0.5 before:bg-white/10">
        {path.items.map((item, idx) => {
          const isDone = item.status === 'COMPLETED'
          const isInProgress = item.status === 'IN_PROGRESS'

          return (
            <div key={item.id} className="relative flex items-start gap-6 pl-2">
              {/* Timeline Marker */}
              <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 z-10 font-bold text-sm ${isDone ? 'bg-accent-500 text-white shadow-glow' : isInProgress ? 'bg-brand-500 text-white shadow-glow ring-4 ring-brand-500/20' : 'bg-surface-700 text-slate-400 border border-white/10'}`}>
                {isDone ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
              </div>

              {/* Module Card */}
              <div className={`card-glow p-6 flex-1 space-y-3 ${isInProgress ? 'border-brand-500/50 bg-brand-500/5' : ''}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`badge ${item.item_type === 'IGOT_COURSE' ? 'badge-brand' : item.item_type === 'NSSTA_TRAINING' ? 'badge-warn' : 'badge-success'}`}>
                      {item.item_type === 'IGOT_COURSE' ? 'iGOT Karmayogi' : item.item_type === 'NSSTA_TRAINING' ? 'NSSTA TPAC' : 'AI Assessment'}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {item.estimated_hours} Hours
                    </span>
                  </div>
                  <span className={`text-xs font-semibold ${isDone ? 'text-accent-400' : isInProgress ? 'text-brand-300' : 'text-slate-500'}`}>
                    {item.status}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white">{item.item_title}</h3>
                <p className="text-xs text-slate-400">Provider: {item.provider}</p>

                <div className="pt-2 flex justify-end">
                  <Link 
                    to={
                      item.item_type === 'IGOT_COURSE' 
                        ? '/learn/IGOT001' 
                        : item.item_type === 'NSSTA_TRAINING' 
                        ? '/nssta' 
                        : '/quizzes'
                    }
                    className={`btn text-xs ${isInProgress ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    {isDone ? 'Review Module' : isInProgress ? 'Continue Learning' : 'Start Module'} <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
