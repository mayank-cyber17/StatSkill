import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { profileAPI, gapAPI, learningPathAPI, quizAPI } from '../../services/api'
import { useAuthStore } from '../../stores/authStore'
import { 
  Brain, Target, Map, FileQuestion, BookOpen, GraduationCap, 
  ArrowRight, Award, CheckCircle2, Clock, Sparkles
} from 'lucide-react'
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts'
import { Link } from 'react-router-dom'

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user)

  const { data: compRes, isLoading: compLoading } = useQuery({
    queryKey: ['competency-profile'],
    queryFn: profileAPI.getCompetency,
  })

  const { data: gapRes } = useQuery({
    queryKey: ['skill-gaps'],
    queryFn: gapAPI.get,
  })

  const { data: pathRes } = useQuery({
    queryKey: ['learning-path'],
    queryFn: learningPathAPI.get,
  })

  const { data: quizHistory } = useQuery({
    queryKey: ['quiz-history'],
    queryFn: quizAPI.getHistory,
  })

  // Format radar data
  const radarData = compRes?.data?.domains || [
    { domain: 'Statistical Methods', level: 3.8 },
    { domain: 'Technical & Analytics', level: 2.2 },
    { domain: 'Digital Governance', level: 3.5 },
    { domain: 'Behavioral & Mgmt', level: 4.0 },
  ]

  const formattedRadar = radarData.map(d => ({
    subject: d.domain || d.name,
    A: d.level || d.score || 3.0,
    fullMark: 5,
  }))

  const gaps = gapRes?.data?.gaps || [
    { name: 'Python for Data Analysis', current: 2.0, required: 4.0, priority: 1, domain: 'Technical' },
    { name: 'GIS Spatial Analytics', current: 1.5, required: 4.0, priority: 2, domain: 'Technical' },
    { name: 'Consumer Price Index (CPI)', current: 3.0, required: 5.0, priority: 3, domain: 'Statistical' },
  ]

  const learningItems = pathRes?.data?.items || [
    { id: 1, title: 'Python for Statistical Analysis', type: 'IGOT_COURSE', estHours: 12, status: 'IN_PROGRESS' },
    { id: 2, title: 'GIS for Statistical Officers', type: 'NSSTA_TRAINING', estHours: 24, status: 'PENDING' },
    { id: 3, title: 'National Accounts Basics Quiz', type: 'QUIZ', estHours: 1, status: 'COMPLETED' },
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="card bg-gradient-brand p-8 text-white relative overflow-hidden shadow-glow">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" /> Official Competency Portal
            </div>
            <h1 className="text-3xl font-display font-extrabold mb-2">
              Welcome Back, {user?.full_name || 'Official'}!
            </h1>
            <p className="text-white/80 text-sm max-w-xl">
              Your competency profile is active. You have 3 critical skill gaps identified and 4 recommended learning pathway modules queued.
            </p>
          </div>

          <div className="flex gap-3">
            <Link to="/learning-path" className="btn bg-white text-brand-700 hover:bg-slate-100 font-bold text-sm shadow-lg">
              Continue Learning Pathway <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Overview Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="flex justify-between items-start">
            <span className="stat-label">Avg Competency Level</span>
            <Brain className="w-5 h-5 text-brand-400" />
          </div>
          <div className="stat-value">3.4 <span className="text-xs font-normal text-slate-400">/ 5.0</span></div>
          <div className="stat-change text-emerald-400">Assessed by StatIQ AI</div>
        </div>

        <div className="stat-card">
          <div className="flex justify-between items-start">
            <span className="stat-label">Active Skill Gaps</span>
            <Target className="w-5 h-5 text-amber-400" />
          </div>
          <div className="stat-value text-amber-400">{gaps.length}</div>
          <div className="stat-change text-slate-400">High priority gaps</div>
        </div>

        <div className="stat-card">
          <div className="flex justify-between items-start">
            <span className="stat-label">Pathway Progress</span>
            <Map className="w-5 h-5 text-purple-400" />
          </div>
          <div className="stat-value text-purple-400">35%</div>
          <div className="stat-change text-purple-300">2 / 5 Modules done</div>
        </div>

        <div className="stat-card">
          <div className="flex justify-between items-start">
            <span className="stat-label">Quizzes Completed</span>
            <FileQuestion className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="stat-value text-emerald-400">{quizHistory?.data?.length || 4}</div>
          <div className="stat-change text-emerald-400">Avg score: 85%</div>
        </div>
      </div>

      {/* Main Grid: Radar Chart & Skill Gap Summary */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Radar Chart */}
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="section-title text-lg">360° Competency Profile</h3>
              <p className="section-subtitle">Mapped across 4 Official Statistics Domains</p>
            </div>
            <Link to="/profile" className="text-xs text-brand-400 font-semibold hover:underline">
              View Full Profile →
            </Link>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={formattedRadar}>
                <PolarGrid stroke="#ffffff20" />
                <PolarAngleAxis dataKey="subject" stroke="#a5b4fc" tick={{ fill: '#cbd5e1', fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 5]} stroke="#ffffff30" />
                <Radar name="Current Competency" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.5} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Skill Gaps */}
        <div className="card p-6 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="section-title text-lg">Top Priority Skill Gaps</h3>
                <p className="section-subtitle">Evaluated against target designation standards</p>
              </div>
              <Link to="/skill-gap" className="text-xs text-brand-400 font-semibold hover:underline">
                Gap Matrix →
              </Link>
            </div>

            <div className="space-y-4">
              {gaps.slice(0, 3).map((gap, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-surface-700/50 border border-white/5 space-y-2">
                  <div className="flex justify-between items-center text-sm font-semibold">
                    <span className="text-white">{gap.name}</span>
                    <span className="badge badge-danger">Priority {gap.priority || idx + 1}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-slate-400">
                    <span>Current: {gap.current} / 5.0</span>
                    <span>Required: {gap.required} / 5.0</span>
                  </div>
                  <div className="level-bar">
                    <div className="level-fill bg-brand-500" style={{ width: `${(gap.current / 5) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Link to="/learning-path" className="btn btn-primary w-full mt-4 py-2.5">
            Resolve Gaps via iGOT & NSSTA Pathways
          </Link>
        </div>
      </div>

      {/* Bottom Section: Active Learning Pathway Stepper */}
      <div className="card p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="section-title text-lg">Active Personalized Pathway</h3>
            <p className="section-subtitle">AI Recommended Sequence of iGOT Courses & NSSTA Trainings</p>
          </div>
          <Link to="/learning-path" className="text-xs text-brand-400 font-semibold hover:underline">
            View Full Pathway →
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {learningItems.map((item, idx) => (
            <div key={idx} className="card-glow p-5 space-y-3 relative border-t-4 border-t-brand-500">
              <div className="flex items-center justify-between text-xs">
                <span className="badge badge-brand">{item.type}</span>
                <span className="text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {item.estHours}h
                </span>
              </div>
              <h4 className="font-semibold text-white text-sm line-clamp-2">{item.title}</h4>
              <div className="pt-2 flex items-center justify-between text-xs">
                <span className={item.status === 'COMPLETED' ? 'text-accent-400 font-semibold' : 'text-slate-400'}>
                  {item.status}
                </span>
                <Link 
                  to={item.type === 'IGOT_COURSE' ? '/learn/IGOT001' : item.type === 'NSSTA_TRAINING' ? '/nssta' : '/quizzes'} 
                  className="text-brand-400 hover:underline font-medium"
                >
                  Launch →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
