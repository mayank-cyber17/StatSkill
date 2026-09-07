import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { profileAPI } from '../../services/api'
import toast from 'react-hot-toast'
import { Brain, Sparkles, UserCheck, Briefcase, GraduationCap, CheckCircle2, ArrowRight } from 'lucide-react'

export default function ProfileSetupPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    designation: 'Junior Statistical Officer (JSO)',
    department: 'NSSO (Field Operations Division)',
    organization: 'Ministry of Statistics and Programme Implementation (MoSPI)',
    state: 'New Delhi / Central HQ',
    job_role: 'Data Collection, Sample Survey Supervision & Data Processing',
    job_level: 'Junior',
    years_experience: 4,
    educational_qualification: "Master's in Statistics / Applied Econometrics",
    prior_trainings: 'Basic Statistical Methods, NSSO Survey Training, Excel Data Analysis',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await profileAPI.setup(formData)
      toast.success('Competency Profile & AI Skill-Gap Analysis generated!')
      navigate('/dashboard')
    } catch (err) {
      toast.error('Profile setup failed. Saving default profile...')
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-4">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" /> Initial Competency Mapping
        </div>
        <h1 className="text-3xl font-display font-extrabold text-white">Setup Your Official Profile</h1>
        <p className="text-slate-400 text-sm">
          Provide your official background details so StatIQ AI can infer your baseline competencies and map relevant skill gaps.
        </p>
      </div>

      {/* Stepper Progress */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        {[
          { num: 1, label: 'Official Role', icon: Briefcase },
          { num: 2, label: 'Qualifications', icon: GraduationCap },
          { num: 3, label: 'Review & AI Assessment', icon: Brain },
        ].map((s) => {
          const Icon = s.icon
          const isActive = step === s.num
          const isDone = step > s.num
          return (
            <div key={s.num} className="flex items-center gap-2 cursor-pointer" onClick={() => setStep(s.num)}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${isDone ? 'bg-accent-500 text-white' : isActive ? 'bg-brand-500 text-white shadow-glow' : 'bg-surface-700 text-slate-400'}`}>
                {isDone ? <CheckCircle2 className="w-4 h-4" /> : s.num}
              </div>
              <span className={`text-xs font-medium ${isActive ? 'text-white font-bold' : 'text-slate-400'}`}>{s.label}</span>
            </div>
          )
        })}
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="card p-8 space-y-6">
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-display font-bold text-white mb-4">Official Position & Job Role</h3>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="input-label">Designation</label>
                <select name="designation" value={formData.designation} onChange={handleChange} className="input">
                  <option value="Junior Statistical Officer (JSO)">Junior Statistical Officer (JSO)</option>
                  <option value="Senior Statistical Officer (SSO)">Senior Statistical Officer (SSO)</option>
                  <option value="Assistant Director (AD)">Assistant Director (AD)</option>
                  <option value="Deputy Director (DD)">Deputy Director (DD)</option>
                  <option value="Director">Director</option>
                  <option value="Joint Director / Senior Officer">Joint Director / Senior Officer</option>
                </select>
              </div>

              <div className="form-group">
                <label className="input-label">Department / Wing</label>
                <select name="department" value={formData.department} onChange={handleChange} className="input">
                  <option value="NSSO (Field Operations Division)">NSSO (Field Operations Division)</option>
                  <option value="NSSO (Data Processing Division)">NSSO (Data Processing Division)</option>
                  <option value="National Accounts Division (NAD)">National Accounts Division (NAD)</option>
                  <option value="Price Statistics Division (PSD)">Price Statistics Division (PSD)</option>
                  <option value="Economic Statistics Division">Economic Statistics Division</option>
                  <option value="State Directorate of Economics & Statistics">State Directorate of Economics & Statistics</option>
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="input-label">Organization / Ministry</label>
                <input type="text" name="organization" value={formData.organization} onChange={handleChange} className="input" />
              </div>

              <div className="form-group">
                <label className="input-label">State / UT Posting Location</label>
                <input type="text" name="state" value={formData.state} onChange={handleChange} className="input" />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="input-label">Job Level</label>
                <select name="job_level" value={formData.job_level} onChange={handleChange} className="input">
                  <option value="Entry">Entry Level</option>
                  <option value="Junior">Junior Level (1-5 yrs)</option>
                  <option value="Middle">Middle Management (5-12 yrs)</option>
                  <option value="Senior">Senior Leadership (12+ yrs)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="input-label">Years of Service Experience</label>
                <input type="number" name="years_experience" min="0" max="40" value={formData.years_experience} onChange={handleChange} className="input" />
              </div>
            </div>

            <div className="form-group">
              <label className="input-label">Primary Job Role Description</label>
              <textarea name="job_role" rows="3" value={formData.job_role} onChange={handleChange} className="input" />
            </div>

            <button type="button" onClick={() => setStep(2)} className="btn btn-primary w-full py-3">
              Next Step: Qualifications <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-display font-bold text-white mb-4">Educational & Training History</h3>

            <div className="form-group">
              <label className="input-label">Highest Educational Qualification</label>
              <select name="educational_qualification" value={formData.educational_qualification} onChange={handleChange} className="input">
                <option value="Bachelor's in Statistics / Economics">Bachelor's in Statistics / Economics</option>
                <option value="Master's in Statistics / Applied Econometrics">Master's in Statistics / Applied Econometrics</option>
                <option value="Master's in Data Science / Computer Science">Master's in Data Science / Computer Science</option>
                <option value="PhD in Statistics / Demography">PhD in Statistics / Demography</option>
                <option value="Other Post Graduate Degree">Other Post Graduate Degree</option>
              </select>
            </div>

            <div className="form-group">
              <label className="input-label">Previous Trainings & Certifications Attended</label>
              <textarea name="prior_trainings" rows="4" value={formData.prior_trainings} onChange={handleChange} placeholder="e.g. NSSTA Basic Survey Training, iGOT Python Course, Stata Econometrics Workshop..." className="input" />
            </div>

            <div className="flex gap-4 pt-4">
              <button type="button" onClick={() => setStep(1)} className="btn btn-secondary w-1/2 py-3">
                Back
              </button>
              <button type="button" onClick={() => setStep(3)} className="btn btn-primary w-1/2 py-3">
                Next: AI Assessment <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 text-center py-4">
            <div className="w-16 h-16 rounded-full bg-gradient-brand flex items-center justify-center mx-auto shadow-glow">
              <Brain className="w-8 h-8 text-white" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-display font-bold text-white">Ready for AI Competency Profiling</h3>
              <p className="text-slate-400 text-xs max-w-md mx-auto">
                StatIQ will construct your 360° competency vector across Statistical, Technical, Governance, and Behavioral domains.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-surface-700/50 text-left space-y-2 text-xs text-slate-300 border border-white/5 max-w-md mx-auto">
              <div><strong className="text-white">Designation:</strong> {formData.designation}</div>
              <div><strong className="text-white">Department:</strong> {formData.department}</div>
              <div><strong className="text-white">Qualification:</strong> {formData.educational_qualification}</div>
              <div><strong className="text-white">Experience:</strong> {formData.years_experience} Years</div>
            </div>

            <div className="flex gap-4 pt-4">
              <button type="button" onClick={() => setStep(2)} className="btn btn-secondary w-1/3 py-3">
                Back
              </button>
              <button type="submit" disabled={loading} className="btn btn-primary w-2/3 py-3 shadow-glow">
                {loading ? 'AI Engine Processing...' : 'Generate My Competency Profile'}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  )
}
