import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { profileAPI } from '../../services/api'
import { useAuthStore } from '../../stores/authStore'
import { 
  Brain, User, Briefcase, GraduationCap, Award, RefreshCw, 
  CheckCircle2, Sparkles, AlertCircle 
} from 'lucide-react'

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user)

  const { data: profileRes, isLoading, refetch } = useQuery({
    queryKey: ['official-profile'],
    queryFn: profileAPI.get,
  })

  const { data: compRes } = useQuery({
    queryKey: ['competency-profile'],
    queryFn: profileAPI.getCompetency,
  })

  const profile = profileRes?.data || {
    full_name: user?.full_name || 'Rajesh Kumar',
    designation: 'Junior Statistical Officer (JSO)',
    department: 'NSSO (Field Operations Division)',
    organization: 'Ministry of Statistics and Programme Implementation',
    state: 'New Delhi / Central HQ',
    years_experience: 4,
    educational_qualification: "Master's in Statistics",
  }

  const competencies = compRes?.data?.competencies || [
    { name: 'Survey Design & Sampling', domain: 'Statistical', level: 4.0, method: 'AI_INFERRED' },
    { name: 'National Accounts Statistics', domain: 'Statistical', level: 3.5, method: 'AI_INFERRED' },
    { name: 'Consumer Price Index (CPI)', domain: 'Statistical', level: 3.0, method: 'AI_INFERRED' },
    { name: 'Python for Data Analysis', domain: 'Technical', level: 2.0, method: 'QUIZ_DERIVED' },
    { name: 'R Programming & Econometrics', domain: 'Technical', level: 1.5, method: 'SELF_DECLARED' },
    { name: 'SQL for Government Databases', domain: 'Technical', level: 2.5, method: 'AI_INFERRED' },
    { name: 'GIS & Spatial Analytics', domain: 'Technical', level: 1.5, method: 'AI_INFERRED' },
    { name: 'Machine Learning Fundamentals', domain: 'Technical', level: 1.0, method: 'AI_INFERRED' },
    { name: 'Cybersecurity Guidelines', domain: 'Digital Governance', level: 3.5, method: 'AI_INFERRED' },
    { name: 'Data Privacy & DPDP Act', domain: 'Digital Governance', level: 4.0, method: 'AI_INFERRED' },
    { name: 'Technical Report Writing', domain: 'Behavioral', level: 4.5, method: 'TRAINER_ASSESSED' },
    { name: 'Team Leadership & Supervision', domain: 'Behavioral', level: 3.5, method: 'AI_INFERRED' },
  ]

  const domains = ['Statistical', 'Technical', 'Digital Governance', 'Behavioral']

  return (
    <div className="space-y-8">
      {/* Profile Banner */}
      <div className="card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-l-4 border-l-brand-500">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-brand flex items-center justify-center text-white font-bold text-2xl shadow-glow">
            {profile.full_name?.charAt(0) || 'O'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-display font-bold text-white">{profile.full_name}</h1>
              <span className="badge badge-brand">{profile.designation}</span>
            </div>
            <p className="text-slate-400 text-xs mt-1">{profile.department} • {profile.organization}</p>
            <p className="text-slate-500 text-[11px] mt-0.5">{profile.educational_qualification} • {profile.years_experience} Years Experience</p>
          </div>
        </div>

        <button onClick={() => refetch()} className="btn btn-secondary text-xs flex items-center gap-2">
          <RefreshCw className="w-3.5 h-3.5" /> Re-Assess Profile
        </button>
      </div>

      {/* Competencies Grid by Domain */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="section-title text-xl">Assessed Competencies by Domain</h2>
          <span className="text-xs text-slate-400">Scale: 1 (Beginner) to 5 (Expert)</span>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {domains.map((dom) => {
            const domainCompetencies = competencies.filter(c => c.domain?.toLowerCase().includes(dom.toLowerCase()))
            return (
              <div key={dom} className="card p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <h3 className="font-display font-bold text-white text-base flex items-center gap-2">
                    <Brain className={`w-4 h-4 ${dom === 'Statistical' ? 'text-blue-400' : dom === 'Technical' ? 'text-purple-400' : dom === 'Digital Governance' ? 'text-emerald-400' : 'text-amber-400'}`} />
                    {dom} Competencies
                  </h3>
                  <span className="text-xs text-slate-400">{domainCompetencies.length} Skills</span>
                </div>

                <div className="space-y-4">
                  {domainCompetencies.map((comp, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-slate-200">{comp.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-500 font-mono">[{comp.method || 'AI_INFERRED'}]</span>
                          <span className="font-bold text-brand-300">{comp.level} / 5.0</span>
                        </div>
                      </div>

                      <div className="level-bar">
                        <div 
                          className={`level-fill ${comp.level >= 4 ? 'bg-emerald-500' : comp.level >= 3 ? 'bg-brand-500' : 'bg-amber-500'}`} 
                          style={{ width: `${(comp.level / 5) * 100}%` }} 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
