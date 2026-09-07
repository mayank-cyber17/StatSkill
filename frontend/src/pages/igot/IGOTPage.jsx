import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { igotAPI } from '../../services/api'
import { BookOpen, Search, Filter, CheckCircle2, Clock, Award, Sparkles, ExternalLink, PlayCircle, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'

export default function IGOTPage() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDomain, setSelectedDomain] = useState('ALL')
  const [enrolledMap, setEnrolledMap] = useState({ 1: true }) // Preserves user's enrollment in Python for Statistical Analysis

  const { data: coursesRes, isLoading } = useQuery({
    queryKey: ['igot-courses', searchTerm, selectedDomain],
    queryFn: () => igotAPI.getCourses({ q: searchTerm, domain: selectedDomain !== 'ALL' ? selectedDomain : undefined }),
  })

  const { data: enrollmentsRes } = useQuery({
    queryKey: ['igot-enrollments'],
    queryFn: igotAPI.getEnrollments,
  })

  const mockCourses = coursesRes?.data?.courses || [
    { id: 1, igot_course_id: 'IGOT001', title: 'Python for Statistical Analysis', provider: 'iGOT Karmayogi / MoSPI', duration_hours: 12, level: 'INTERMEDIATE', domain: 'Technical', description: 'Comprehensive guide to Python pandas, numpy, and statsmodels for official data analysis.', recommended_for_gap: true },
    { id: 2, igot_course_id: 'IGOT002', title: 'R Programming for Statisticians', provider: 'iGOT Karmayogi', duration_hours: 15, level: 'BEGINNER', domain: 'Technical', description: 'Fundamentals of R syntax, ggplot2 data visualization, and statistical modeling.', recommended_for_gap: true },
    { id: 3, igot_course_id: 'IGOT003', title: 'SQL for Government Data Management', provider: 'iGOT Karmayogi', duration_hours: 10, level: 'BEGINNER', domain: 'Technical', description: 'Relational database queries, indexing, joins, and aggregating large survey datasets.', recommended_for_gap: false },
    { id: 4, igot_course_id: 'IGOT005', title: 'GIS for Statistical Officers', provider: 'iGOT Karmayogi / ISRO', duration_hours: 24, level: 'INTERMEDIATE', domain: 'Technical', description: 'Spatial data analytics, QGIS, satellite imagery integration, and district mapping.', recommended_for_gap: true },
    { id: 5, igot_course_id: 'IGOT011', title: 'Survey Design & Sampling Theory', provider: 'iGOT Karmayogi / NSSO', duration_hours: 20, level: 'ADVANCED', domain: 'Statistical', description: 'Stratified sampling, cluster sampling, non-sampling error reduction, and estimation.', recommended_for_gap: false },
    { id: 6, igot_course_id: 'IGOT013', title: 'National Accounts Statistics & GDP', provider: 'iGOT Karmayogi / NAD', duration_hours: 30, level: 'ADVANCED', domain: 'Statistical', description: 'SNA 2008 framework, GDP estimation, GVA by economic activity, and input-output tables.', recommended_for_gap: false },
  ]

  const handleEnrollAndStudy = async (course) => {
    try {
      await igotAPI.enroll(course.igot_course_id || course.id)
    } catch (err) {
      // Offline fallback
    }
    setEnrolledMap((prev) => ({ ...prev, [course.id]: true }))
    toast.success('Enrolled! Opening course study classroom...')
    navigate(`/learn/${course.igot_course_id || 'IGOT001'}`)
  }

  const handleStudy = (course) => {
    navigate(`/learn/${course.igot_course_id || 'IGOT001'}`)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-white flex items-center gap-3">
            <BookOpen className="w-7 h-7 text-brand-400" /> iGOT Karmayogi Course Repository
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Personalized e-learning recommendations mapped strictly to your identified competency gaps.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-800 border border-white/10 text-xs text-brand-300">
          <Sparkles className="w-4 h-4 text-brand-400" /> Auto-Synced via iGOT Mock API
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card p-4 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search courses by topic (Python, Sampling, CPI, GIS...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedDomain}
            onChange={(e) => setSelectedDomain(e.target.value)}
            className="input w-48"
          >
            <option value="ALL">All Domains</option>
            <option value="Technical">Technical & Analytics</option>
            <option value="Statistical">Statistical Methods</option>
            <option value="Digital Governance">Digital Governance</option>
            <option value="Behavioral">Behavioral & Mgmt</option>
          </select>
        </div>
      </div>

      {/* Course Cards Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockCourses.map((course) => {
          const isEnrolled = enrolledMap[course.id]

          return (
            <div key={course.id} className="card-glow p-6 flex flex-col justify-between space-y-4 relative border-t-4 border-t-brand-500">
              {course.recommended_for_gap && (
                <div className="absolute top-3 right-3 bg-brand-500/20 text-brand-300 border border-brand-500/30 px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-brand-400" /> Recommended for Gap
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <span className="badge badge-brand">{course.domain}</span>
                  <span className="badge badge-neutral">{course.level}</span>
                </div>

                <h3 className="font-bold text-white text-base leading-snug pt-1">{course.title}</h3>
                <p className="text-slate-400 text-xs line-clamp-2">{course.description}</p>
              </div>

              <div className="space-y-4 pt-4 border-t border-white/5">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {course.duration_hours} Hours</span>
                  <span>{course.provider}</span>
                </div>

                {isEnrolled ? (
                  <div className="space-y-2">
                    <button
                      onClick={() => handleStudy(course)}
                      className="btn btn-primary w-full py-2.5 shadow-glow flex items-center justify-center gap-2"
                    >
                      <PlayCircle className="w-4 h-4" /> Start Learning / Study Now
                    </button>
                    <div className="text-center text-[11px] text-accent-400 font-semibold flex items-center justify-center gap-1.5 pt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Enrolled & Synced with Pathway
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => handleEnrollAndStudy(course)}
                    className="btn btn-primary w-full py-2.5 flex items-center justify-center gap-2"
                  >
                    Enroll & Start Learning <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
