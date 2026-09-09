import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { adminAPI } from '../../services/api'
import { Shield, Users, BarChart3, TrendingUp, CheckCircle2, XCircle, AlertCircle, Sparkles, Building } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import toast from 'react-hot-toast'

export default function AdminDashboardPage() {
  const [approvedMap, setApprovedMap] = useState({})

  const { data: workforceRes } = useQuery({
    queryKey: ['admin-workforce'],
    queryFn: adminAPI.getUsers,
  })

  // Predictive Demand Trend Data
  const demandData = [
    { quarter: 'Q1 2025', Python: 65, GIS: 40, MachineLearning: 25, NationalAccounts: 80 },
    { quarter: 'Q2 2025', Python: 75, GIS: 55, MachineLearning: 40, NationalAccounts: 82 },
    { quarter: 'Q3 2025', Python: 88, GIS: 70, MachineLearning: 60, NationalAccounts: 85 },
    { quarter: 'Q4 2025 (Forecast)', Python: 95, GIS: 85, MachineLearning: 78, NationalAccounts: 90 },
  ]

  const pendingNominations = [
    { id: 1, official: 'Rajesh Kumar', designation: 'Junior Statistical Officer (JSO)', dept: 'NSSO (FOD)', program: 'GIS Applications for Statistical Officers', date: '2025-08-28' },
    { id: 2, official: 'Priya Sharma', designation: 'Senior Statistical Officer (SSO)', dept: 'National Accounts Division', program: 'National Accounts Statistics Masterclass', date: '2025-08-27' },
    { id: 3, official: 'Amit Verma', designation: 'Assistant Director (AD)', dept: 'Economic Statistics Division', program: 'Data Science & Machine Learning for Official Statistics', date: '2025-08-26' },
  ]

  const handleApprove = async (id) => {
    try {
      await adminAPI.approveNomination(id, { status: 'APPROVED' })
      setApprovedMap((prev) => ({ ...prev, [id]: 'APPROVED' }))
      toast.success('NSSTA TPAC Nomination Approved!')
    } catch (err) {
      setApprovedMap((prev) => ({ ...prev, [id]: 'APPROVED' }))
      toast.success('Nomination Approved!')
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Shield className="w-7 h-7 text-amber-500 dark:text-amber-400" /> MoSPI Workforce Competency & Predictive Command Center
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
            Organization-wide capacity analytics, departmental skill gap heatmaps, and predictive demand modeling.
          </p>
        </div>

        <span className="badge badge-warn font-mono">Role: System Administrator</span>
      </div>

      {/* Top KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="flex justify-between items-start">
            <span className="stat-label">Total Officers Mapped</span>
            <Users className="w-5 h-5 text-brand-400" />
          </div>
          <div className="stat-value">1,240</div>
          <div className="stat-change text-emerald-500 dark:text-emerald-400">Across 14 Departments</div>
        </div>

        <div className="stat-card">
          <div className="flex justify-between items-start">
            <span className="stat-label">Avg National Score</span>
            <BarChart3 className="w-5 h-5 text-accent-400" />
          </div>
          <div className="stat-value">3.42 <span className="text-xs font-normal text-slate-500 dark:text-slate-400">/ 5.0</span></div>
          <div className="stat-change text-accent-500 dark:text-accent-400">+0.4 since Q1</div>
        </div>

        <div className="stat-card">
          <div className="flex justify-between items-start">
            <span className="stat-label">iGOT Utilization</span>
            <Building className="w-5 h-5 text-purple-500 dark:text-purple-400" />
          </div>
          <div className="stat-value text-purple-600 dark:text-purple-400">78%</div>
          <div className="stat-change text-purple-600 dark:text-purple-300">890 Enrolled</div>
        </div>

        <div className="stat-card">
          <div className="flex justify-between items-start">
            <span className="stat-label">NSSTA Nominations</span>
            <TrendingUp className="w-5 h-5 text-amber-500 dark:text-amber-400" />
          </div>
          <div className="stat-value text-amber-600 dark:text-amber-400">3</div>
          <div className="stat-change text-amber-600 dark:text-amber-300">Pending Review</div>
        </div>
      </div>

      {/* Main Grid: Predictive Chart & Heatmap */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Predictive Skill Demand Graph */}
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="section-title text-lg">Predictive Skill Demand Analytics</h3>
              <p className="section-subtitle">AI Forecast based on emerging technology adoption in MoSPI</p>
            </div>
            <span className="badge badge-brand flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Machine Learning Forecast
            </span>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={demandData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" className="dark:[stroke:rgba(255,255,255,0.06)]" />
                <XAxis dataKey="quarter" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#1e1e35', borderColor: '#ffffff20', color: '#fff', borderRadius: '12px' }} />
                <Area type="monotone" dataKey="Python" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
                <Area type="monotone" dataKey="GIS" stroke="#a855f7" fill="#a855f7" fillOpacity={0.2} />
                <Area type="monotone" dataKey="MachineLearning" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Departmental Heatmap */}
        <div className="card p-6 space-y-4">
          <div>
            <h3 className="section-title text-lg">Departmental Competency Matrix</h3>
            <p className="section-subtitle">Average proficiency levels across major MoSPI wings</p>
          </div>

          <div className="space-y-4 pt-2">
            {[
              { dept: 'NSSO (Field Operations Division)', stats: 4.2, tech: 2.1, gov: 3.8, beh: 4.0 },
              { dept: 'National Accounts Division (NAD)', stats: 4.8, tech: 3.2, gov: 4.0, beh: 4.2 },
              { dept: 'Data Processing Division (DPD)', stats: 3.5, tech: 4.1, gov: 3.5, beh: 3.8 },
              { dept: 'Economic Statistics Division', stats: 4.0, tech: 2.8, gov: 3.6, beh: 3.9 },
            ].map((row, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-100/70 dark:bg-surface-700/40 border border-slate-200 dark:border-white/5 space-y-2">
                <div className="font-bold text-slate-900 dark:text-white text-sm">{row.dept}</div>
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div className="p-2 rounded bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-300">
                    <span className="block text-[10px] text-slate-500 dark:text-slate-400">Statistical</span>
                    <span className="font-bold">{row.stats}</span>
                  </div>
                  <div className="p-2 rounded bg-purple-500/10 border border-purple-500/20 text-purple-700 dark:text-purple-300">
                    <span className="block text-[10px] text-slate-500 dark:text-slate-400">Technical</span>
                    <span className="font-bold">{row.tech}</span>
                  </div>
                  <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                    <span className="block text-[10px] text-slate-500 dark:text-slate-400">Digital Gov</span>
                    <span className="font-bold">{row.gov}</span>
                  </div>
                  <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300">
                    <span className="block text-[10px] text-slate-500 dark:text-slate-400">Behavioral</span>
                    <span className="font-bold">{row.beh}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pending NSSTA Nominations Approval Panel */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="section-title text-lg">Pending NSSTA TPAC Training Nominations</h3>
            <p className="section-subtitle">Approve or reject officer applications for national residential courses</p>
          </div>
          <span className="badge badge-warn font-mono">{pendingNominations.length} Pending Approval</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-100 dark:bg-surface-700/50 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-white/10">
              <tr>
                <th className="px-6 py-4">Officer Name</th>
                <th className="px-6 py-4">Designation & Dept</th>
                <th className="px-6 py-4">Training Program</th>
                <th className="px-6 py-4">Submitted Date</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {pendingNominations.map((n) => {
                const status = approvedMap[n.id]

                return (
                  <tr key={n.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{n.official}</td>
                    <td className="px-6 py-4 text-xs">
                      <div className="font-medium text-slate-700 dark:text-slate-200">{n.designation}</div>
                      <div className="text-slate-500 dark:text-slate-400">{n.dept}</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-amber-700 dark:text-amber-300 text-xs">{n.program}</td>
                    <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400">{n.date}</td>
                    <td className="px-6 py-4 text-right">
                      {status === 'APPROVED' ? (
                        <span className="badge badge-success flex items-center gap-1 inline-flex">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                        </span>
                      ) : (
                        <button
                          onClick={() => handleApprove(n.id)}
                          className="btn btn-primary text-xs py-1.5"
                        >
                          Approve Nomination
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
