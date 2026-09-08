import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { gapAPI } from '../../services/api'
import { Target, RefreshCw, AlertTriangle, CheckCircle2, ArrowRight, ShieldAlert } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function SkillGapPage() {
  const { data: gapRes, isLoading, refetch } = useQuery({
    queryKey: ['skill-gaps'],
    queryFn: gapAPI.get,
  })

  const rawGaps = gapRes?.data?.gaps || (Array.isArray(gapRes?.data) ? gapRes.data : null)
  const gaps = (rawGaps && rawGaps.length > 0)
    ? rawGaps
    : [
        { id: 1, name: 'Statistical Software Proficiency', domain: 'Digital & Technology', current: 2.0, required: 4.0, gap: 2.0, priority: 'HIGH' },
        { id: 2, name: 'Data Quality Management', domain: 'Data Management', current: 2.2, required: 4.0, gap: 1.8, priority: 'HIGH' },
        { id: 3, name: 'Econometrics & Modelling', domain: 'Statistical Competencies', current: 2.5, required: 4.0, gap: 1.5, priority: 'MEDIUM' },
        { id: 4, name: 'Artificial Intelligence & ML', domain: 'Digital & Technology', current: 2.0, required: 3.5, gap: 1.5, priority: 'MEDIUM' },
        { id: 5, name: 'Digital Governance & e-Services', domain: 'Digital & Technology', current: 3.0, required: 4.0, gap: 1.0, priority: 'LOW' },
      ]

  const highPriorityCount = gapRes?.data?.high_priority_count !== undefined 
    ? gapRes.data.high_priority_count 
    : gaps.filter(g => g.priority === 'HIGH' || g.priority === 1).length

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-white flex items-center gap-3">
            <Target className="w-7 h-7 text-brand-400" /> Skill Gap Intelligence Matrix
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Automated evaluation of current competency scores against MoSPI job role standards.
          </p>
        </div>

        <button onClick={() => refetch()} className="btn btn-secondary text-xs flex items-center gap-2">
          <RefreshCw className="w-3.5 h-3.5" /> Re-Run Gap Analysis
        </button>
      </div>

      {/* Critical Gaps Banner */}
      <div className="p-6 rounded-2xl bg-danger-500/10 border border-danger-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <ShieldAlert className="w-8 h-8 text-danger-400 shrink-0" />
          <div>
            <h4 className="font-bold text-white text-base">{highPriorityCount} High-Priority Competency Gaps Detected</h4>
            <p className="text-slate-300 text-xs mt-0.5">
              Identified by your official competency assessment against Indian Statistical System cadre benchmarks.
            </p>
          </div>
        </div>

        <Link to="/learning-path" className="btn btn-danger text-xs whitespace-nowrap">
          View Recommended Courses <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Gap Matrix Table */}
      <div className="card overflow-hidden">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h3 className="font-display font-bold text-white text-base">Detailed Skill Gap Matrix</h3>
          <span className="text-xs text-slate-400">Total {gaps.length} Competencies Evaluated</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-surface-700/50 text-xs uppercase font-semibold text-slate-400 border-b border-white/10">
              <tr>
                <th className="px-6 py-4">Competency Name</th>
                <th className="px-6 py-4">Domain</th>
                <th className="px-6 py-4">Current Level</th>
                <th className="px-6 py-4">Required Level</th>
                <th className="px-6 py-4">Gap Delta</th>
                <th className="px-6 py-4">Priority</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {gaps.map((g) => (
                <tr key={g.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-semibold text-white">{g.name}</td>
                  <td className="px-6 py-4">
                    <span className={`badge ${g.domain === 'Technical' ? 'badge-brand' : g.domain === 'Statistical' ? 'badge-success' : 'badge-neutral'}`}>
                      {g.domain}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono font-bold text-brand-300">{g.current} / 5.0</td>
                  <td className="px-6 py-4 font-mono font-bold text-slate-200">{g.required} / 5.0</td>
                  <td className="px-6 py-4 font-mono font-bold text-amber-400">+{g.gap}</td>
                  <td className="px-6 py-4">
                    <span className={`badge ${g.priority === 'HIGH' ? 'badge-danger' : g.priority === 'MEDIUM' ? 'badge-warn' : 'badge-neutral'}`}>
                      {g.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link to="/igot" className="btn btn-ghost text-xs text-brand-400 hover:text-white">
                      Find Course →
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
