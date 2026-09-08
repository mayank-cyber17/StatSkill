import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authAPI } from '../../services/api'
import ThemeToggle from '../../components/common/ThemeToggle'
import toast from 'react-hot-toast'
import {
  Brain, Mail, ArrowRight, ArrowLeft, Lock, CheckCircle,
  AlertCircle, RefreshCw, Eye, EyeOff, ShieldCheck,
} from 'lucide-react'

// ── Step constants ─────────────────────────────────────────────────────────────
const STEP_EMAIL   = 'email'
const STEP_OTP     = 'otp'
const STEP_RESET   = 'reset'
const STEP_SUCCESS = 'success'

const RESEND_COOLDOWN = 60 // seconds

// ── Password strength helper ───────────────────────────────────────────────────
function getPasswordStrength(pw) {
  if (!pw) return { score: 0, label: '', color: '' }
  let score = 0
  if (pw.length >= 8)  score++
  if (pw.length >= 12) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  if (score <= 1) return { score, label: 'Weak',   color: 'bg-red-500' }
  if (score <= 2) return { score, label: 'Fair',   color: 'bg-amber-500' }
  if (score <= 3) return { score, label: 'Good',   color: 'bg-yellow-400' }
  return { score, label: 'Strong', color: 'bg-emerald-500' }
}

// ── Shared card shell ──────────────────────────────────────────────────────────
function CardShell({ children }) {
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-surface-900 flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-200">
      {/* Top-right theme toggle */}
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      <div className="absolute -top-32 -left-32 w-96 h-96 bg-brand-500/15 dark:bg-brand-600/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-500/15 dark:bg-purple-600/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md rounded-3xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-2xl bg-white dark:bg-surface-800/90 backdrop-blur-xl transition-colors duration-200">
        {/* Header */}
        <div className="p-6 bg-gradient-brand flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-display font-bold text-white text-lg leading-tight">StatIQ</p>
            <p className="text-white/80 text-xs">Password Recovery</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">{children}</div>
      </div>
    </div>
  )
}

// ── Error banner ───────────────────────────────────────────────────────────────
function ErrorBanner({ message }) {
  if (!message) return null
  return (
    <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 flex items-start gap-2.5">
      <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
      <p className="text-xs text-red-300 leading-relaxed">{message}</p>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 1 — Enter Email
// ─────────────────────────────────────────────────────────────────────────────
function StepEmail({ onNext }) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await authAPI.forgotPassword({ email })
      toast.success('OTP sent! Check your email inbox.')
      onNext(email)
    } catch (err) {
      const detail = err.response?.data?.detail || 'Failed to send OTP. Please try again.'
      setError(detail)
    } finally {
      setLoading(false)
    }
  }

  return (
    <CardShell>
      <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-6 transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
      </Link>

      <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white mb-1">Forgot Password</h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
        Enter your registered email address. We'll send a 6-digit OTP to reset your password.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="form-group">
          <label className="input-label text-xs">Registered Email Address</label>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400 dark:text-slate-500" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError('') }}
              placeholder="your@gmail.com"
              className={`input pl-10 text-xs ${error ? 'border-red-500/60' : ''}`}
            />
          </div>
        </div>

        <ErrorBanner message={error} />

        <button type="submit" disabled={loading} className="btn btn-primary w-full py-3 text-sm shadow-glow">
          {loading ? 'Sending OTP…' : 'Send OTP'} {!loading && <ArrowRight className="w-4 h-4" />}
        </button>
      </form>
    </CardShell>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 2 — Verify OTP
// ─────────────────────────────────────────────────────────────────────────────
function StepOTP({ email, onNext, onBack }) {
  const [digits, setDigits]     = useState(Array(6).fill(''))
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [resending, setResending] = useState(false)
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN)
  const inputsRef = useRef([])

  // Countdown timer
  useEffect(() => {
    if (cooldown <= 0) return
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  const otp = digits.join('')

  const handleDigitChange = (idx, val) => {
    // Accept only digits
    const d = val.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[idx] = d
    setDigits(next)
    setError('')
    // Auto-advance
    if (d && idx < 5) inputsRef.current[idx + 1]?.focus()
  }

  const handleKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !digits[idx] && idx > 0) {
      inputsRef.current[idx - 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    const next = Array(6).fill('')
    pasted.split('').forEach((ch, i) => { next[i] = ch })
    setDigits(next)
    inputsRef.current[Math.min(pasted.length, 5)]?.focus()
  }

  const handleVerify = async (e) => {
    e.preventDefault()
    if (otp.length < 6) { setError('Please enter all 6 digits.'); return }
    setError('')
    setLoading(true)
    try {
      await authAPI.verifyOTP({ email, otp })
      toast.success('OTP verified!')
      onNext(otp)
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (cooldown > 0) return
    setResending(true)
    setError('')
    try {
      await authAPI.resendOTP({ email })
      toast.success('A new OTP has been sent to your email.')
      setDigits(Array(6).fill(''))
      setCooldown(RESEND_COOLDOWN)
      inputsRef.current[0]?.focus()
    } catch (err) {
      const detail = err.response?.data?.detail || 'Failed to resend OTP.'
      setError(detail)
    } finally {
      setResending(false)
    }
  }

  return (
    <CardShell>
      <button onClick={onBack} className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-6 transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" /> Back
      </button>

      <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white mb-1">Enter OTP</h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
        A 6-digit OTP was sent to <span className="text-brand-600 dark:text-brand-400 font-semibold">{email}</span>.
        It is valid for 10 minutes.
      </p>

      <form onSubmit={handleVerify} className="space-y-5 mt-6">
        {/* 6-digit OTP boxes */}
        <div className="flex gap-2 justify-center" onPaste={handlePaste}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => (inputsRef.current[i] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={(e) => handleDigitChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className={`w-11 text-center text-lg font-bold rounded-xl border bg-slate-100 dark:bg-surface-700/60 text-slate-900 dark:text-white outline-none transition-all
                ${d ? 'border-brand-500 shadow-glow' : 'border-slate-300 dark:border-white/10'}
                ${error ? 'border-red-500/60' : ''}
                focus:border-brand-500 focus:ring-1 focus:ring-brand-400/30`}
              style={{ height: '52px' }}
            />
          ))}
        </div>

        <ErrorBanner message={error} />

        <button type="submit" disabled={loading || otp.length < 6} className="btn btn-primary w-full py-3 text-sm shadow-glow">
          {loading ? 'Verifying…' : 'Verify OTP'} {!loading && <ShieldCheck className="w-4 h-4" />}
        </button>

        {/* Resend OTP */}
        <div className="text-center">
          <button
            type="button"
            onClick={handleResend}
            disabled={cooldown > 0 || resending}
            className={`inline-flex items-center gap-1.5 text-xs font-semibold transition-colors
              ${cooldown > 0 ? 'text-slate-400 cursor-not-allowed' : 'text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300'}`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
            {cooldown > 0 ? `Resend OTP in ${cooldown}s` : resending ? 'Resending…' : 'Resend OTP'}
          </button>
        </div>
      </form>
    </CardShell>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 3 — Create New Password
// ─────────────────────────────────────────────────────────────────────────────
function StepReset({ email, otp, onNext }) {
  const [newPassword, setNewPassword]     = useState('')
  const [confirmPassword, setConfirm]     = useState('')
  const [showNew, setShowNew]             = useState(false)
  const [showConfirm, setShowConfirm]     = useState(false)
  const [loading, setLoading]             = useState(false)
  const [error, setError]                 = useState('')

  const strength = getPasswordStrength(newPassword)
  const passwordsMatch = newPassword && confirmPassword && newPassword === confirmPassword
  const canSubmit = newPassword.length >= 8 && passwordsMatch && !loading

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (newPassword.length < 8) { setError('Password must be at least 8 characters.'); return }
    if (newPassword !== confirmPassword) { setError('Passwords do not match.'); return }
    setError('')
    setLoading(true)
    try {
      await authAPI.resetPassword({ email, otp, new_password: newPassword })
      toast.success('Password reset successfully!')
      onNext()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to reset password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <CardShell>
      <div className="mb-6">
        <div className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
          OTP verified — now set your new password
        </div>
      </div>

      <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white mb-1">Create New Password</h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
        Choose a strong password. It must be at least 8 characters.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* New password */}
        <div className="form-group">
          <label className="input-label text-xs">New Password</label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400 dark:text-slate-500" />
            <input
              type={showNew ? 'text' : 'password'}
              required
              value={newPassword}
              onChange={(e) => { setNewPassword(e.target.value); setError('') }}
              placeholder="Min. 8 characters"
              className={`input pl-10 pr-10 text-xs ${error && !newPassword ? 'border-red-500/60' : ''}`}
            />
            <button
              type="button"
              onClick={() => setShowNew((v) => !v)}
              className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
            >
              {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {/* Strength bar */}
          {newPassword && (
            <div className="mt-2 space-y-1">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((s) => (
                  <div
                    key={s}
                    className={`h-1 flex-1 rounded-full transition-all ${
                      strength.score >= s ? strength.color : 'bg-slate-200 dark:bg-white/10'
                    }`}
                  />
                ))}
              </div>
              <p className={`text-[10px] font-semibold ${
                strength.score <= 1 ? 'text-red-500 dark:text-red-400'
                : strength.score <= 2 ? 'text-amber-500 dark:text-amber-400'
                : strength.score <= 3 ? 'text-yellow-600 dark:text-yellow-300'
                : 'text-emerald-600 dark:text-emerald-400'
              }`}>
                {strength.label}
              </p>
            </div>
          )}
        </div>

        {/* Confirm password */}
        <div className="form-group">
          <label className="input-label text-xs">Confirm New Password</label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400 dark:text-slate-500" />
            <input
              type={showConfirm ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={(e) => { setConfirm(e.target.value); setError('') }}
              placeholder="Re-enter new password"
              className={`input pl-10 pr-10 text-xs ${
                confirmPassword && !passwordsMatch ? 'border-red-500/60' : ''
              } ${confirmPassword && passwordsMatch ? 'border-emerald-500/60' : ''}`}
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
            >
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {confirmPassword && !passwordsMatch && (
            <p className="text-[10px] text-red-500 dark:text-red-400 mt-1">Passwords do not match.</p>
          )}
          {confirmPassword && passwordsMatch && (
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> Passwords match
            </p>
          )}
        </div>

        <ErrorBanner message={error} />

        <button type="submit" disabled={!canSubmit} className="btn btn-primary w-full py-3 text-sm shadow-glow disabled:opacity-50 disabled:cursor-not-allowed">
          {loading ? 'Resetting Password…' : 'Reset Password'} {!loading && <ArrowRight className="w-4 h-4" />}
        </button>
      </form>
    </CardShell>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 4 — Success
// ─────────────────────────────────────────────────────────────────────────────
function StepSuccess() {
  const navigate = useNavigate()
  useEffect(() => {
    const t = setTimeout(() => navigate('/login'), 5000)
    return () => clearTimeout(t)
  }, [navigate])

  return (
    <CardShell>
      <div className="text-center py-4">
        <div className="w-20 h-20 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-emerald-500 dark:text-emerald-400" />
        </div>
        <h3 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-3">Password Reset!</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
          Your password has been updated successfully.
        </p>
        <p className="text-xs text-slate-500 mb-8">
          Redirecting to login in a few seconds…
        </p>
        <Link
          to="/login"
          className="btn btn-primary inline-flex items-center gap-2 px-8 py-3 text-sm shadow-glow"
        >
          Go to Login <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </CardShell>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main orchestrator
// ─────────────────────────────────────────────────────────────────────────────
export default function ForgotPasswordFlow() {
  const [step, setStep]   = useState(STEP_EMAIL)
  const [email, setEmail] = useState('')
  const [otp, setOtp]     = useState('')

  if (step === STEP_EMAIL) {
    return (
      <StepEmail
        onNext={(e) => { setEmail(e); setStep(STEP_OTP) }}
      />
    )
  }

  if (step === STEP_OTP) {
    return (
      <StepOTP
        email={email}
        onNext={(o) => { setOtp(o); setStep(STEP_RESET) }}
        onBack={() => setStep(STEP_EMAIL)}
      />
    )
  }

  if (step === STEP_RESET) {
    return (
      <StepReset
        email={email}
        otp={otp}
        onNext={() => setStep(STEP_SUCCESS)}
      />
    )
  }

  return <StepSuccess />
}
