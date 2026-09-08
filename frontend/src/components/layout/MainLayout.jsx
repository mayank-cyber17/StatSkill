import React, { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import ThemeToggle from '../common/ThemeToggle'
import { 
  Brain, LayoutDashboard, User, Target, Map, BookOpen, GraduationCap, 
  FileQuestion, BarChart3, Upload, ClipboardList, Shield, LogOut, Bell, Sparkles,
  Activity, Clock
} from 'lucide-react'
import InnoWingFloatingWidget from '../assistant/InnoWingFloatingWidget'
import ErrorBoundary from '../common/ErrorBoundary'

export default function MainLayout() {
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const navigate = useNavigate()

  // Dynamic live time and greeting
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 30000)
    return () => clearInterval(timer)
  }, [])

  const hour = currentTime.getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const formattedDate = currentTime.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isTrainer = user?.role === 'TRAINER' || user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN'
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN'

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-surface-900 flex flex-col md:flex-row text-slate-900 dark:text-white transition-colors duration-200">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white/95 dark:bg-surface-800/90 border-r border-slate-200 dark:border-white/10 flex flex-col justify-between shrink-0 shadow-sm md:shadow-none transition-colors duration-200">
        <div>
          {/* Logo */}
          <div className="p-6 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-brand flex items-center justify-center shadow-glow">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-display font-bold text-xl tracking-tight text-slate-900 dark:text-white">
                  Stat<span className="text-brand-500 dark:text-brand-400">IQ</span>
                </span>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              MoSPI
            </span>
          </div>

          {/* Navigation Items */}
          <nav className="p-4 space-y-1 text-sm font-medium">
            <div className="px-3 py-2 text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">
              Learner Portal
            </div>
            
            <NavLink 
              to="/dashboard" 
              className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                isActive 
                  ? 'bg-brand-600 text-white font-semibold shadow-md shadow-brand-600/20' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" /> Dashboard
            </NavLink>

            <NavLink 
              to="/profile" 
              className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                isActive 
                  ? 'bg-brand-600 text-white font-semibold shadow-md shadow-brand-600/20' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              <User className="w-4 h-4" /> Competency Profile
            </NavLink>

            <NavLink 
              to="/skill-gap" 
              className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                isActive 
                  ? 'bg-brand-600 text-white font-semibold shadow-md shadow-brand-600/20' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              <Target className="w-4 h-4" /> Skill Gap Analysis
            </NavLink>

            <NavLink 
              to="/learning-path" 
              className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                isActive 
                  ? 'bg-brand-600 text-white font-semibold shadow-md shadow-brand-600/20' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              <Map className="w-4 h-4" /> Learning Pathway
            </NavLink>

            <NavLink 
              to="/igot" 
              className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                isActive 
                  ? 'bg-brand-600 text-white font-semibold shadow-md shadow-brand-600/20' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              <BookOpen className="w-4 h-4" /> iGOT Courses
            </NavLink>

            <NavLink 
              to="/nssta" 
              className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                isActive 
                  ? 'bg-brand-600 text-white font-semibold shadow-md shadow-brand-600/20' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              <GraduationCap className="w-4 h-4" /> NSSTA Programs
            </NavLink>

            <NavLink 
              to="/quizzes" 
              className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                isActive 
                  ? 'bg-brand-600 text-white font-semibold shadow-md shadow-brand-600/20' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              <FileQuestion className="w-4 h-4" /> Quizzes & MCQs
            </NavLink>

            <NavLink 
              to="/assistant" 
              className={({ isActive }) => `flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                isActive 
                  ? 'bg-brand-600 text-white font-semibold shadow-md shadow-brand-600/20' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <Sparkles className="w-4 h-4 text-brand-500 dark:text-accent-400 animate-pulse" /> InnoWing AI
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-glow" title="Online AI Assistant" />
            </NavLink>

            <NavLink 
              to="/analytics" 
              className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                isActive 
                  ? 'bg-brand-600 text-white font-semibold shadow-md shadow-brand-600/20' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              <BarChart3 className="w-4 h-4" /> Learner Analytics
            </NavLink>

            {/* Trainer Section */}
            {isTrainer && (
              <>
                <div className="pt-4 px-3 py-2 text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">
                  Trainer Tools
                </div>
                <NavLink 
                  to="/trainer" 
                  className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                    isActive 
                      ? 'bg-purple-600 text-white font-semibold shadow-md' 
                      : 'text-purple-600 dark:text-purple-300 hover:text-purple-900 dark:hover:text-white hover:bg-purple-50 dark:hover:bg-white/5'
                  }`}
                >
                  <ClipboardList className="w-4 h-4" /> Trainer Portal
                </NavLink>
                <NavLink 
                  to="/trainer/upload" 
                  className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                    isActive 
                      ? 'bg-purple-600 text-white font-semibold shadow-md' 
                      : 'text-purple-600 dark:text-purple-300 hover:text-purple-900 dark:hover:text-white hover:bg-purple-50 dark:hover:bg-white/5'
                  }`}
                >
                  <Upload className="w-4 h-4" /> Upload Material
                </NavLink>
              </>
            )}

            {/* Admin Section */}
            {isAdmin && (
              <>
                <div className="pt-4 px-3 py-2 text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">
                  Admin Control
                </div>
                <NavLink 
                  to="/admin" 
                  className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                    isActive 
                      ? 'bg-amber-600 text-white font-semibold shadow-md' 
                      : 'text-amber-600 dark:text-amber-300 hover:text-amber-900 dark:hover:text-white hover:bg-amber-50 dark:hover:bg-white/5'
                  }`}
                >
                  <Shield className="w-4 h-4" /> Workforce Analytics
                </NavLink>
              </>
            )}
          </nav>
        </div>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-surface-900/50 transition-colors duration-200">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="w-9 h-9 rounded-full bg-brand-500/15 dark:bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-600 dark:text-brand-300 font-bold text-sm shrink-0">
                {user?.full_name?.charAt(0) || 'U'}
              </div>
              <div className="min-w-0 flex-1 overflow-hidden">
                <div className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                  {user?.full_name || 'Official'}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                  {user?.email}
                </div>
              </div>
            </div>
            <span className={`badge shrink-0 text-[9px] px-2 py-0.5 ${
              user?.role === 'ADMIN' ? 'badge-warn' : user?.role === 'TRAINER' ? 'badge-brand' : 'badge-neutral'
            }`}>
              {user?.role}
            </span>
          </div>

          <button 
            onClick={handleLogout} 
            className="btn btn-ghost w-full justify-start text-xs text-slate-500 dark:text-slate-400 hover:text-danger-500 dark:hover:text-danger-400"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header */}
        <header className="h-16 border-b border-slate-200 dark:border-white/10 bg-white/80 dark:bg-surface-800/50 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-40 transition-colors duration-200">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  {greeting}, {user?.full_name ? user.full_name.split(' ')[0] : 'Officer'}
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                  <Clock className="w-3 h-3 text-brand-500" />
                  {formattedDate}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
                National Statistical System Capacity Building Portal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Dark / Light Mode Switcher */}
            <ThemeToggle />

            {/* Notifications */}
            <button 
              className="relative p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 border border-slate-200 dark:border-white/10 transition-all"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full shadow-glow animate-pulse" />
            </button>

            {/* User session status badge */}
            <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-white/10">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <div className="text-right">
                <div className="text-xs font-semibold text-slate-800 dark:text-white truncate max-w-[120px]">
                  {user?.full_name}
                </div>
                <div className="text-[9px] text-emerald-600 dark:text-accent-400 font-bold tracking-wider uppercase">
                  Active
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Outlet */}
        <div className="p-6 md:p-8 flex-1">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </div>
      </main>

      {/* Omnipresent Floating InnoWing AI Widget */}
      <InnoWingFloatingWidget />
    </div>
  )
}
