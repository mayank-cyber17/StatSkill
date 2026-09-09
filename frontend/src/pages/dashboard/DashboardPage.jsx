import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { profileAPI, gapAPI, learningPathAPI, quizAPI } from '../../services/api'
import { useAuthStore } from '../../stores/authStore'
import { useThemeStore } from '../../stores/themeStore'
import { 
  Brain, Target, Map as MapIcon, FileQuestion, BookOpen, GraduationCap, 
  ArrowRight, Award, CheckCircle2, Clock, Sparkles
} from 'lucide-react'
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { Link } from 'react-router-dom'

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user)
  const theme = useThemeStore((state) => state.theme)
  const isDark = theme !== 'light'

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

  const { data: onboardingStatus } = useQuery({
    queryKey: ['onboarding-status'],
    queryFn: quizAPI.getOnboardingStatus,
  })

  // Format 360° radar data across all 4 official statistics domains
  const OFFICIAL_DOMAINS = [
    'Statistical Competencies',
    'Data Management',
    'Digital & Technology',
    'Policy & Governance',
  ]

  const domainScores = new Map()
  if (compRes?.data?.domains && Array.isArray(compRes.data.domains)) {
    compRes.data.domains.forEach((d) => {
      const name = d.domain || d.name
      if (name) {
        domainScores.set(name.toLowerCase().trim(), d.level !== undefined ? d.level : (d.score !== undefined ? d.score : 3.0))
      }
    })
  }

  const defaultLevel = compRes?.data?.average_level ? Number(compRes.data.average_level) : 2.5

  const formattedRadar = OFFICIAL_DOMAINS.map((domainName) => {
    const key = domainName.toLowerCase().trim()
    let score = domainScores.get(key)
    if (score === undefined) {
      for (const [k, val] of domainScores.entries()) {
        if (k.includes(key) || key.includes(k)) {
          score = val
          break
        }
      }
    }
    return {
      subject: domainName,
      A: score !== undefined ? Number(score) : defaultLevel,
      fullMark: 5,
    }
  })

  const rawGaps = gapRes?.data?.gaps || (Array.isArray(gapRes?.data) ? gapRes.data : null)
  const gaps = (rawGaps && rawGaps.length > 0)
    ? rawGaps
    : [
        { name: 'Statistical Software Proficiency', current: 2.0, required: 4.0, priority: 1, domain: 'Digital & Technology' },
        { name: 'Data Quality Management', current: 2.2, required: 4.0, priority: 1, domain: 'Data Management' },
        { name: 'Econometrics & Modelling', current: 2.5, required: 4.0, priority: 2, domain: 'Statistical' },
      ]

  const rawItems = pathRes?.data?.items || (Array.isArray(pathRes?.data) ? pathRes.data : null)
  const learningItems = (rawItems && rawItems.length > 0)
    ? rawItems.map((item) => ({
        id: item.id,
        title: item.item_title || item.title || 'Official Curriculum Module',
        type: item.item_type || item.type || 'IGOT_COURSE',
        estHours: item.estimated_hours || item.estHours || 10,
        status: item.status || 'PENDING'
      }))
    : [
        { id: 1, title: 'Python for Statistical Analysis & Survey Data Processing', type: 'IGOT_COURSE', estHours: 12, status: 'IN_PROGRESS' },
        { id: 2, title: 'Advanced Survey Sampling & NSSO Multi-Stage Methodologies', type: 'NSSTA_TRAINING', estHours: 24, status: 'PENDING' },
        { id: 3, title: 'Consumer Price Index (CPI) Weighting & Laspeyres Formula', type: 'IGOT_COURSE', estHours: 8, status: 'PENDING' },
      ]

  const localAssessed = (user?.id && localStorage.getItem(`baseline_completed_${user.id}`) === 'true')
    || localStorage.getItem('statiq_baseline_completed') === 'true'

  const attemptsList = Array.isArray(quizHistory?.data) ? quizHistory.data : []
  const quizzesDone = attemptsList.filter((a) => a.status === 'COMPLETED').length
  const avgQuizScore = quizzesDone > 0
    ? Math.round(attemptsList.reduce((acc, a) => acc + (a.percentage || 0), 0) / quizzesDone)
    : (onboardingStatus?.data?.latest_score ? Math.round(onboardingStatus.data.latest_score) : 0)

  const hasAssessed = Boolean(
    localAssessed ||
    onboardingStatus?.data?.has_completed_baseline ||
    quizzesDone > 0 ||
    compRes?.data?.competencies?.some((c) => c.method === 'ASSESSMENT_EVALUATED') ||
    (pathRes?.data?.items && pathRes.data.items.length > 0)
  )
  const avgLevel = compRes?.data?.average_level || 3.2
  const pathwayProgress = pathRes?.data?.completion_percentage !== undefined
    ? pathRes.data.completion_percentage
    : (learningItems.length > 0 ? Math.round((learningItems.filter((i) => i.status === 'COMPLETED').length / learningItems.length) * 100) : 0)

  return (
    <div className="space-y-8">
      {/* Onboarding Prompt if not yet assessed */}
      {!hasAssessed && (
        <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-amber-500 dark:text-amber-400 shrink-0" />
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white text-base">Baseline Competency Assessment Required</h4>
              <p className="text-slate-600 dark:text-slate-300 text-xs mt-0.5">
                Complete your official 10-question evaluation to unlock your personalized radar matrix, skill gaps, and learning pathway.
              </p>
            </div>
          </div>

          <Link to="/assessment" className="btn btn-primary text-xs whitespace-nowrap shadow-glow">
            Take Assessment Now <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Welcome Banner */}
      <div className="card !bg-gradient-brand p-8 !text-white relative overflow-hidden shadow-glow border-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold uppercase tracking-wider mb-3 !text-white">
              <Sparkles className="w-3.5 h-3.5" /> Official Competency Portal
            </div>
            <h1 className="text-3xl font-display font-extrabold mb-2 !text-white">
              Welcome, {user?.full_name || 'Statistical Official'}!
            </h1>
            <p className="!text-white/90 text-sm max-w-xl">
              {hasAssessed
                ? `Your competency profile is active. You have ${gaps.length} active skill gaps identified and ${learningItems.length} customized learning pathway modules queued.`
                : 'Your official account is active. Complete your baseline assessment to calibrate your official skills and customize your training pathway.'}
            </p>
          </div>

          <div className="flex gap-3">
            {hasAssessed ? (
              <Link to="/learning-path" className="btn bg-white !text-brand-700 hover:bg-slate-100 font-bold text-sm shadow-lg">
                Continue Learning Pathway <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <Link to="/assessment" className="btn bg-white !text-brand-700 hover:bg-slate-100 font-bold text-sm shadow-lg">
                Start Baseline Assessment <ArrowRight className="w-4 h-4" />
              </Link>
            )}
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
          <div className="stat-value">{avgLevel} <span className="text-xs font-normal text-slate-400">/ 5.0</span></div>
          <div className="stat-change text-emerald-400">{hasAssessed ? 'Calibrated by StatIQ AI' : 'Baseline initial'}</div>
        </div>

        <div className="stat-card">
          <div className="flex justify-between items-start">
            <span className="stat-label">Active Skill Gaps</span>
            <Target className="w-5 h-5 text-amber-400" />
          </div>
          <div className="stat-value text-amber-400">{gaps.length}</div>
          <div className="stat-change text-slate-400">MoSPI role benchmarks</div>
        </div>

        <div className="stat-card">
          <div className="flex justify-between items-start">
            <span className="stat-label">Pathway Progress</span>
            <MapIcon className="w-5 h-5 text-purple-400" />
          </div>
          <div className="stat-value text-purple-400">{pathwayProgress}%</div>
          <div className="stat-change text-purple-300">Targeted modules</div>
        </div>

        <div className="stat-card">
          <div className="flex justify-between items-start">
            <span className="stat-label">Quizzes Completed</span>
            <FileQuestion className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="stat-value text-emerald-400">{quizzesDone}</div>
          <div className="stat-change text-emerald-400">{quizzesDone > 0 ? `Avg score: ${avgQuizScore}%` : 'Evaluation pending'}</div>
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
                <PolarGrid stroke={isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.12)"} />
                <PolarAngleAxis 
                  dataKey="subject" 
                  stroke={isDark ? "#a5b4fc" : "#4f46e5"} 
                  tick={{ fill: isDark ? '#cbd5e1' : '#1e293b', fontSize: 11, fontWeight: 600 }} 
                />
                <PolarRadiusAxis 
                  angle={30} 
                  domain={[0, 5]} 
                  stroke={isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.15)"} 
                  tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 10 }}
                />
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: isDark ? '#16162a' : '#ffffff', 
                    borderColor: isDark ? 'rgba(255,255,255,0.15)' : '#e2e8f0', 
                    borderRadius: '0.75rem', 
                    color: isDark ? '#fff' : '#0f172a', 
                    fontSize: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                  formatter={(value) => [`${value} / 5.0`, 'Competency Level']}
                />
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
              <Link to="/skill-gap" className="text-xs text-brand-600 dark:text-brand-400 font-semibold hover:underline">
                Gap Matrix →
              </Link>
            </div>

            <div className="space-y-4">
              {gaps.slice(0, 3).map((gap, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-100/80 dark:bg-surface-700/50 border border-slate-200/80 dark:border-white/5 space-y-2">
                  <div className="flex justify-between items-center text-sm font-semibold">
                    <span className="text-slate-900 dark:text-white">{gap.name}</span>
                    <span className="badge badge-danger">Priority {gap.priority || idx + 1}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
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
          <Link to="/learning-path" className="text-xs text-brand-600 dark:text-brand-400 font-semibold hover:underline">
            View Full Pathway →
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {learningItems.map((item, idx) => (
            <div key={idx} className="card-glow p-5 space-y-3 relative border-t-4 border-t-brand-500 bg-white dark:bg-surface-800">
              <div className="flex items-center justify-between text-xs">
                <span className="badge badge-brand">{item.type}</span>
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {item.estHours}h
                </span>
              </div>
              <h4 className="font-semibold text-slate-900 dark:text-white text-sm line-clamp-2">{item.title}</h4>
              <div className="pt-2 flex items-center justify-between text-xs">
                <span className={item.status === 'COMPLETED' ? 'text-emerald-600 dark:text-accent-400 font-semibold' : 'text-slate-500 dark:text-slate-400'}>
                  {item.status}
                </span>
                <Link 
                  to={item.type === 'IGOT_COURSE' ? '/learn/IGOT001' : item.type === 'NSSTA_TRAINING' ? '/nssta' : '/quizzes'} 
                  className="text-brand-600 dark:text-brand-400 hover:underline font-medium"
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
