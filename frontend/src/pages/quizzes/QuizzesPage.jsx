import React, { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { quizAPI } from '../../services/api'
import { FileQuestion, Play, Clock, Award, CheckCircle2, Sparkles, Search, Filter, BookOpen, Upload } from 'lucide-react'

export default function QuizzesPage() {
  const [searchParams] = useSearchParams()
  const courseFilter = searchParams.get('course')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDomain, setSelectedDomain] = useState('ALL')

  const { data: quizzesRes, isLoading } = useQuery({
    queryKey: ['quizzes'],
    queryFn: quizAPI.getAll,
  })

  // Default fallback catalog if network/backend is syncing
  const defaultQuizzes = [
    { id: 4, title: 'Python for Statistical Analysis & Survey Data Processing', total_questions: 10, difficulty_level: 'INTERMEDIATE', domain: 'Technical & Analytics', target_role: 'Junior Statistical Officer', course_code: 'IGOT001' },
    { id: 5, title: 'R Programming & Statistical Computing for Statisticians', total_questions: 10, difficulty_level: 'BEGINNER', domain: 'Technical & Analytics', target_role: 'Statistical Investigator', course_code: 'IGOT002' },
    { id: 6, title: 'Consumer Price Index (CPI) Weighting & Laspeyres Formula', total_questions: 10, difficulty_level: 'EASY', domain: 'Official Statistics', target_role: 'Statistical Assistant', course_code: 'IGOT005' },
    { id: 7, title: 'National Accounts Statistics & GDP Estimation Methodology', total_questions: 10, difficulty_level: 'MEDIUM', domain: 'National Accounts', target_role: 'Senior Statistical Officer', course_code: 'IGOT013' },
    { id: 8, title: 'Survey Sampling Theory & NSSO Multi-Stage Methodology', total_questions: 10, difficulty_level: 'HARD', domain: 'Survey Methodology', target_role: 'Statistical Officer', course_code: 'IGOT011' },
    { id: 9, title: 'Cybersecurity Guidelines & Government Data Privacy', total_questions: 10, difficulty_level: 'MEDIUM', domain: 'Digital Governance', target_role: 'All Statistical Cadres', course_code: 'IGOT006' },
    { id: 10, title: 'Time Series Analysis & Economic Forecasting', total_questions: 10, difficulty_level: 'HARD', domain: 'Technical & Analytics', target_role: 'Director / Statistical Officer', course_code: 'IGOT007' },
    { id: 11, title: 'Official Statistics Governance & National Statistical Commission Framework', total_questions: 10, difficulty_level: 'INTERMEDIATE', domain: 'Governance & Policy', target_role: 'Assistant Director / Senior Official', course_code: 'IGOT008' },
  ]

  // Map backend response or fallback
  const rawList = (quizzesRes?.data && Array.isArray(quizzesRes.data) && quizzesRes.data.length > 0)
    ? quizzesRes.data
    : defaultQuizzes

  // Enrich each quiz with domain and course_code if not present
  const enrichedQuizzes = rawList.map((q) => {
    let domain = q.target_role?.includes('Officer') ? 'Statistical' : 'Technical'
    let courseCode = null
    const titleLower = q.title.toLowerCase()

    if (titleLower.includes('python')) {
      domain = 'Technical & Analytics'
      courseCode = 'IGOT001'
    } else if (titleLower.includes('r prog')) {
      domain = 'Technical & Analytics'
      courseCode = 'IGOT002'
    } else if (titleLower.includes('consumer price') || titleLower.includes('cpi')) {
      domain = 'Official Statistics'
      courseCode = 'IGOT005'
    } else if (titleLower.includes('national accounts') || titleLower.includes('gdp')) {
      domain = 'National Accounts'
      courseCode = 'IGOT013'
    } else if (titleLower.includes('sampling') || titleLower.includes('survey')) {
      domain = 'Survey Methodology'
      courseCode = 'IGOT011'
    } else if (titleLower.includes('cyber') || titleLower.includes('privacy')) {
      domain = 'Digital Governance'
      courseCode = 'IGOT006'
    } else if (titleLower.includes('time series')) {
      domain = 'Technical & Analytics'
      courseCode = 'IGOT007'
    } else if (titleLower.includes('commission') || titleLower.includes('governance')) {
      domain = 'Governance & Policy'
      courseCode = 'IGOT008'
    } else if (titleLower.includes('assessment:') || q.document_id) {
      domain = 'Custom Uploaded Material'
    }

    return {
      ...q,
      domain,
      courseCode,
      questionsCount: q.total_questions || 10
    }
  })

  // Filter based on search, domain, and optional course parameter
  const filteredQuizzes = enrichedQuizzes.filter((q) => {
    const matchesSearch = q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.domain.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDomain = selectedDomain === 'ALL' || q.domain === selectedDomain
    return matchesSearch && matchesDomain
  })

  // If filtered by course param, sort matching course quiz to the very top
  const sortedQuizzes = [...filteredQuizzes].sort((a, b) => {
    if (courseFilter && a.courseCode === courseFilter) return -1
    if (courseFilter && b.courseCode === courseFilter) return 1
    return 0
  })

  const domains = ['ALL', 'Technical & Analytics', 'Official Statistics', 'National Accounts', 'Survey Methodology', 'Digital Governance', 'Custom Uploaded Material']

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-white flex items-center gap-3">
            <FileQuestion className="w-7 h-7 text-emerald-400" /> Quizzes & Grounded AI Assessments
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Official MoSPI competency assessments and AI-synthesized MCQs generated directly from uploaded learning materials.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/trainer/upload" className="btn btn-primary text-xs shadow-glow flex items-center gap-2">
            <Upload className="w-3.5 h-3.5" /> Upload Material & Generate New Quiz
          </Link>
        </div>
      </div>

      {/* Notice if arriving from Course Completion */}
      {courseFilter && (
        <div className="card p-4 border-l-4 border-l-accent-500 bg-accent-500/10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Award className="w-6 h-6 text-accent-400 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-white">Course Completed: Ready for Competency Verification</h4>
              <p className="text-xs text-slate-300 mt-0.5">
                Take the official capstone assessment below to verify your competencies and update your StatIQ capacity profile.
              </p>
            </div>
          </div>
          <Link to="/quizzes" className="text-xs text-slate-400 hover:text-white underline whitespace-nowrap">
            View All Quizzes
          </Link>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search quizzes by title or topic..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10 text-sm w-full"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
          <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <select
            value={selectedDomain}
            onChange={(e) => setSelectedDomain(e.target.value)}
            className="input text-xs py-2 w-auto"
          >
            {domains.map((d) => (
              <option key={d} value={d}>{d === 'ALL' ? 'All Domains' : d}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Total Count Header */}
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>Showing <strong className="text-white">{sortedQuizzes.length}</strong> available quizzes</span>
        <span className="badge badge-brand">Grounded RAG & MoSPI Curriculum</span>
      </div>

      {/* Quizzes Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedQuizzes.map((q) => {
          const isCourseMatch = courseFilter && q.courseCode === courseFilter

          return (
            <div
              key={q.id}
              className={`card-glow p-6 flex flex-col justify-between space-y-4 transition-all ${
                isCourseMatch
                  ? 'border-2 border-accent-500 shadow-glow bg-gradient-to-b from-accent-500/10 to-surface-800'
                  : 'border-t-4 border-t-emerald-500'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs gap-2">
                  <span className={`badge ${q.domain.includes('Custom') ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'badge-brand'}`}>
                    {q.domain}
                  </span>
                  <span className={`badge ${q.difficulty_level === 'HARD' ? 'badge-danger' : q.difficulty_level === 'MEDIUM' ? 'badge-warn' : 'badge-neutral'}`}>
                    {q.difficulty_level || 'MEDIUM'}
                  </span>
                </div>

                {isCourseMatch && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-accent-500/20 text-accent-400 text-[11px] font-bold">
                    <Award className="w-3 h-3" /> Recommended Capstone Quiz
                  </div>
                )}

                <h3 className="font-bold text-white text-base leading-snug line-clamp-2">{q.title}</h3>
                
                {q.description && (
                  <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed">{q.description}</p>
                )}

                <div className="flex items-center gap-2 text-xs text-brand-300 font-mono">
                  <FileQuestion className="w-3.5 h-3.5 text-brand-400" />
                  <span>{q.questionsCount} Multiple Choice Questions</span>
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                <div className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-500" /> ~{Math.max(5, q.questionsCount * 1.5)} Mins
                </div>

                <Link
                  to={`/quizzes/${q.id}`}
                  className={`btn text-xs py-2 px-4 flex items-center gap-1.5 ${
                    isCourseMatch ? 'btn-primary shadow-glow bg-gradient-to-r from-brand-500 to-accent-600' : 'btn-primary'
                  }`}
                >
                  Start Assessment <Play className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )
        })}
      </div>

      {sortedQuizzes.length === 0 && (
        <div className="card p-12 text-center space-y-4">
          <FileQuestion className="w-12 h-12 text-slate-500 mx-auto" />
          <h3 className="text-lg font-bold text-white">No quizzes found</h3>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            Try adjusting your search filter or upload a learning document to synthesize a new grounded quiz.
          </p>
          <Link to="/trainer/upload" className="btn btn-primary text-xs">
            Upload Material Now
          </Link>
        </div>
      )}
    </div>
  )
}
