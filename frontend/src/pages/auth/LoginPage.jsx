import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authAPI } from '../../services/api'
import { useAuthStore } from '../../stores/authStore'
import toast from 'react-hot-toast'
import { Brain, Lock, Mail, ArrowRight, UserCheck, Shield, Award } from 'lucide-react'

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState('LEARNER')
  const [email, setEmail] = useState('learner@statiq.gov.in')
  const [password, setPassword] = useState('Demo@1234')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const setAuth = useAuthStore((state) => state.setAuth)

  const handleRoleSelect = (role) => {
    setSelectedRole(role)
    if (role === 'LEARNER') {
      setEmail('learner@statiq.gov.in')
      setPassword('Demo@1234')
    } else if (role === 'TRAINER') {
      setEmail('trainer@statiq.gov.in')
      setPassword('Demo@1234')
    } else if (role === 'ADMIN') {
      setEmail('admin@statiq.gov.in')
      setPassword('Demo@1234')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await authAPI.login({ email, password })
      const { access_token, user } = res.data
      setAuth(user, access_token)
      toast.success(`Welcome back, ${user.full_name}!`)
      if (user.role === 'ADMIN') navigate('/admin')
      else if (user.role === 'TRAINER') navigate('/trainer')
      else navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface-900 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-brand-600/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-4xl grid md:grid-cols-2 rounded-3xl overflow-hidden border border-white/10 shadow-glow bg-surface-800/90 backdrop-blur-xl">
        {/* Left Side Info */}
        <div className="p-8 lg:p-12 bg-gradient-brand flex flex-col justify-between text-white relative">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <span className="font-display font-bold text-2xl">StatIQ</span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-display font-extrabold mb-4 leading-snug">
              Official Statistical System Capacity Building Portal
            </h2>
            <p className="text-white/80 text-sm leading-relaxed mb-6">
              Access personalized iGOT Karmayogi course recommendations, automated skill-gap analysis, and AI-generated quizzes.
            </p>
          </div>

          <div className="space-y-3 border-t border-white/20 pt-6 text-xs text-white/90">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-300" />
              <span>Learner Competency Profiling</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-300" />
              <span>NSSTA TPAC Training Recommendations</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-300" />
              <span>MoSPI Workforce Skill Analytics</span>
            </div>
          </div>
        </div>

        {/* Right Side Form */}
        <div className="p-8 lg:p-12 flex flex-col justify-between space-y-6">
          <div>
            <h3 className="text-xl font-display font-bold text-white mb-1">Sign In to StatIQ</h3>
            <p className="text-xs text-slate-400 mb-5">Select your role and enter registered government credentials</p>

            {/* Role Selection Option */}
            <div className="mb-5 space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block">
                Select Account Role:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleRoleSelect('LEARNER')}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    selectedRole === 'LEARNER'
                      ? 'bg-brand-500/20 border-brand-500 text-white shadow-glow'
                      : 'bg-surface-700/40 border-white/5 text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <UserCheck className={`w-4 h-4 mx-auto mb-1 ${selectedRole === 'LEARNER' ? 'text-brand-400' : 'text-slate-400'}`} />
                  <div className="text-xs font-bold">Learner</div>
                  <div className="text-[9px] text-slate-400 truncate">Official</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleSelect('TRAINER')}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    selectedRole === 'TRAINER'
                      ? 'bg-purple-500/20 border-purple-500 text-white shadow-glow'
                      : 'bg-surface-700/40 border-white/5 text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Award className={`w-4 h-4 mx-auto mb-1 ${selectedRole === 'TRAINER' ? 'text-purple-400' : 'text-slate-400'}`} />
                  <div className="text-xs font-bold">Trainer</div>
                  <div className="text-[9px] text-slate-400 truncate">Faculty</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleSelect('ADMIN')}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    selectedRole === 'ADMIN'
                      ? 'bg-amber-500/20 border-amber-500 text-white shadow-glow'
                      : 'bg-surface-700/40 border-white/5 text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Shield className={`w-4 h-4 mx-auto mb-1 ${selectedRole === 'ADMIN' ? 'text-amber-400' : 'text-slate-400'}`} />
                  <div className="text-xs font-bold">Admin</div>
                  <div className="text-[9px] text-slate-400 truncate">Administrator</div>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="form-group">
                <label className="input-label text-xs">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="official@statiq.gov.in"
                    className="input pl-10 text-xs"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="input-label text-xs">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input pl-10 text-xs"
                  />
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn btn-primary w-full py-3 text-sm shadow-glow">
                {loading ? 'Authenticating...' : `Sign In as ${selectedRole === 'ADMIN' ? 'Administrator' : selectedRole === 'TRAINER' ? 'Trainer' : 'Learner'}`} <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          <div className="text-center text-xs text-slate-400 pt-4">
            New Official?{' '}
            <Link to="/register" className="text-brand-400 font-semibold hover:underline">
              Create an Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
