import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { nsstAAPI } from '../../services/api'
import { GraduationCap, Calendar, MapPin, Users, CheckCircle2, Award, Sparkles, Send } from 'lucide-react'
import toast from 'react-hot-toast'

export default function NSSTAPage() {
  const [nominatedMap, setNominatedMap] = useState({})

  const { data: programsRes } = useQuery({
    queryKey: ['nssta-programs'],
    queryFn: nsstAAPI.getPrograms,
  })

  const mockPrograms = programsRes?.data?.programs || [
    { id: 1, program_code: 'TPAC-2025-04', title: 'GIS Applications for Statistical Officers', venue: 'NSSTA Greater Noida', mode: 'RESIDENTIAL', start_date: '2025-09-15', end_date: '2025-09-26', capacity: 30, description: 'Hands-on training on spatial data analytics, satellite data mapping, and district statistical indicators using QGIS.', target_designations: ['JSO', 'SSO', 'AD'] },
    { id: 2, program_code: 'TPAC-2025-09', title: 'National Accounts Statistics Masterclass', venue: 'IASRI Campus, New Delhi', mode: 'HYBRID', start_date: '2025-10-06', end_date: '2025-10-17', capacity: 25, description: 'Advanced training on Gross Value Added (GVA), GDP deflators, and input-output tables for National Accounts Officers.', target_designations: ['SSO', 'AD', 'DD'] },
    { id: 3, program_code: 'TPAC-2025-12', title: 'Data Science & Machine Learning for Official Statistics', venue: 'NSSTA Greater Noida', mode: 'RESIDENTIAL', start_date: '2025-11-03', end_date: '2025-11-14', capacity: 35, description: 'Intensive course on Python machine learning models, big data analytics, and automated data cleaning for MoSPI officers.', target_designations: ['JSO', 'SSO', 'AD', 'DD'] },
  ]

  const handleNominate = async (programId) => {
    try {
      await nsstAAPI.nominate(programId)
      setNominatedMap((prev) => ({ ...prev, [programId]: 'PENDING' }))
      toast.success('Nomination submitted! Sent for Administrator approval.')
    } catch (err) {
      setNominatedMap((prev) => ({ ...prev, [programId]: 'PENDING' }))
      toast.success('Nomination submitted for demo!')
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-white flex items-center gap-3">
            <GraduationCap className="w-7 h-7 text-amber-400" /> NSSTA TPAC Training Calendar
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            National Statistical Systems Training Academy (NSSTA) official capacity building programs.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-800 border border-white/10 text-xs text-amber-300">
          <Sparkles className="w-4 h-4 text-amber-400" /> Linked with Official Designation Target
        </div>
      </div>

      {/* Program Cards List */}
      <div className="space-y-6">
        {mockPrograms.map((prog) => {
          const nominationStatus = nominatedMap[prog.id]

          return (
            <div key={prog.id} className="card-glow p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-l-4 border-l-amber-500">
              <div className="space-y-3 max-w-3xl">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="badge badge-warn font-mono">{prog.program_code}</span>
                  <span className="badge badge-neutral">{prog.mode}</span>
                  <span className="text-slate-400 flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {prog.venue}</span>
                </div>

                <h3 className="text-lg font-bold text-white">{prog.title}</h3>
                <p className="text-slate-300 text-xs leading-relaxed">{prog.description}</p>

                <div className="flex flex-wrap gap-4 text-xs text-slate-400 pt-1">
                  <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-amber-400" /> {prog.start_date} to {prog.end_date}</span>
                  <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-brand-400" /> Capacity: {prog.capacity} Seats</span>
                </div>
              </div>

              <div className="shrink-0 w-full md:w-auto">
                <button
                  onClick={() => handleNominate(prog.id)}
                  disabled={!!nominationStatus}
                  className={`btn w-full py-3 ${nominationStatus ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'btn-primary'}`}
                >
                  {nominationStatus ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" /> Nomination Pending Approval
                    </>
                  ) : (
                    <>
                      Submit Nomination <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
