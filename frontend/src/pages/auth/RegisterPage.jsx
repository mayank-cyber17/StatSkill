import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authAPI } from '../../services/api'
import { useAuthStore } from '../../stores/authStore'
import toast from 'react-hot-toast'
import { Brain, User, Mail, Lock, ArrowRight } from 'lucide-react'

export default function RegisterPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('LEARNER')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const setAuth = useAuthStore((state) => state.setAuth)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await authAPI.register({ full_name: fullName, email, password, role })
      const { access_token, user } = res.data
      setAuth(user, access_token)
      toast.success('Registration successful! Please setup your profile.')
      navigate('/profile/setup')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface-900 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="w-full max-w-md card p-8 space-y-6 shadow-glow">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-brand flex items-center justify-center mx-auto shadow-glow">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-display font-bold text-white">Create Official Account</h2>
          <p className="text-slate-400 text-xs">Join StatIQ Capacity Building Ecosystem</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-group">
            <label className="input-label">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Rajesh Kumar"
                className="input pl-10"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="input-label">Government Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="official@statiq.gov.in"
                className="input pl-10"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="input-label">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input pl-10"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="input-label">Portal Account Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value)} className="input">
              <option value="LEARNER">Learner (Statistical Official / Officer)</option>
              <option value="TRAINER">Trainer (NSSTA / Course Author)</option>
              <option value="ADMIN">Administrator (MoSPI HR / Training Head)</option>
            </select>
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary w-full py-3">
            {loading ? 'Creating Account...' : 'Register Account'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-400">
          Already registered?{' '}
          <Link to="/login" className="text-brand-400 font-semibold hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}
