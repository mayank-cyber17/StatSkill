import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { analyticsAPI } from '../../services/api'
import { BarChart3, TrendingUp, Award, Clock, BookOpen } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

export default function AnalyticsPage() {
  const { data: analyticsRes } = useQuery({
    queryKey: ['personal-analytics'],
    queryFn: analyticsAPI.getPersonal,
  })

  const compProgressData = analyticsRes?.data?.comp_progress || [
    { month: 'Baseline', Statistical: 3.2, Technical: 2.0, Governance: 3.0 },
    { month: 'Current Assessed', Statistical: 3.8, Technical: 2.5, Governance: 3.5 },
  ]

  const quizScoresData = analyticsRes?.data?.quiz_scores || [
    { quiz: 'Baseline Assessment', score: 80 },
    { quiz: 'Python Data Analysis', score: 75 },
    { quiz: 'CPI Indexing', score: 85 },
  ]

  const learningHours = analyticsRes?.data?.learning_hours !== undefined ? analyticsRes.data.learning_hours : 12.0
  const coursesDone = analyticsRes?.data?.courses_completed !== undefined ? analyticsRes.data.courses_completed : 1
  const avgQuizScore = analyticsRes?.data?.quiz_stats?.avg_score !== undefined ? analyticsRes.data.quiz_stats.avg_score : 80.0
  const totalQuizzes = analyticsRes?.data?.quiz_stats?.total_taken !== undefined ? analyticsRes.data.quiz_stats.total_taken : 1

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-display font-bold text-white flex items-center gap-3">
          <BarChart3 className="w-7 h-7 text-brand-400" /> Individual Learner Analytics
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Track competency growth over time, learning hours logged, and quiz evaluation trajectory.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <span className="stat-label">Learning Hours</span>
          <div className="stat-value">{learningHours} <span className="text-xs font-normal text-slate-400">Hrs</span></div>
          <div className="stat-change text-emerald-400">Grounded curriculum</div>
        </div>

        <div className="stat-card">
          <span className="stat-label">Courses Completed</span>
          <div className="stat-value text-brand-400">{coursesDone}</div>
          <div className="stat-change text-slate-400">iGOT / NSSTA modules</div>
        </div>

        <div className="stat-card">
          <span className="stat-label">Quiz Avg Score</span>
          <div className="stat-value text-accent-400">{avgQuizScore}%</div>
          <div className="stat-change text-emerald-400">{totalQuizzes} Assessment(s)</div>
        </div>

        <div className="stat-card">
          <span className="stat-label">Skill Upgrades</span>
          <div className="stat-value text-purple-400">+3</div>
          <div className="stat-change text-purple-300">Levels calibrated</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="card p-6 space-y-4">
          <h3 className="section-title text-lg">Competency Score Growth Trajectory</h3>
          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={compProgressData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="month" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} domain={[0, 5]} />
                <Tooltip contentStyle={{ backgroundColor: '#1e1e35', borderColor: '#ffffff20', color: '#fff', borderRadius: '12px' }} />
                <Line type="monotone" dataKey="Statistical" stroke="#6366f1" strokeWidth={3} />
                <Line type="monotone" dataKey="Technical" stroke="#a855f7" strokeWidth={3} />
                <Line type="monotone" dataKey="Governance" stroke="#10b981" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-6 space-y-4">
          <h3 className="section-title text-lg">Quiz Performance Scores</h3>
          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={quizScoresData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="quiz" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#1e1e35', borderColor: '#ffffff20', color: '#fff', borderRadius: '12px' }} />
                <Bar dataKey="score" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
