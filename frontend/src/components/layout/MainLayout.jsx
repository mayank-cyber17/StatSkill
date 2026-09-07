import React from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { 
  Brain, LayoutDashboard, User, Target, Map, BookOpen, GraduationCap, 
  FileQuestion, MessageSquare, BarChart3, Upload, ClipboardList, Shield, LogOut, Bell, Sparkles
} from 'lucide-react'
import InnoWingFloatingWidget from '../assistant/InnoWingFloatingWidget'

export default function MainLayout() {
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isTrainer = user?.role === 'TRAINER' || user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN'
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN'

  return (
    <div className="min-h-screen bg-surface-900 flex flex-col md:flex-row text-white">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-surface-800/90 border-r border-white/10 flex flex-col justify-between shrink-0">
        <div>
          {/* Logo */}
          <div className="p-6 border-b border-white/10 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-brand flex items-center justify-center shadow-glow">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-display font-bold text-xl text-white tracking-tight">Stat<span className="text-brand-400">IQ</span></span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="p-4 space-y-1 text-sm font-medium">
            <div className="px-3 py-2 text-[10px] uppercase font-bold text-slate-500 tracking-wider">Learner Portal</div>
            
            <NavLink to="/dashboard" className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${isActive ? 'bg-brand-600 text-white font-semibold shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
              <LayoutDashboard className="w-4 h-4" /> Dashboard
            </NavLink>

            <NavLink to="/profile" className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${isActive ? 'bg-brand-600 text-white font-semibold shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
              <User className="w-4 h-4" /> Competency Profile
            </NavLink>

            <NavLink to="/skill-gap" className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${isActive ? 'bg-brand-600 text-white font-semibold shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
              <Target className="w-4 h-4" /> Skill Gap Analysis
            </NavLink>

            <NavLink to="/learning-path" className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${isActive ? 'bg-brand-600 text-white font-semibold shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
              <Map className="w-4 h-4" /> Learning Pathway
            </NavLink>

            <NavLink to="/igot" className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${isActive ? 'bg-brand-600 text-white font-semibold shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
              <BookOpen className="w-4 h-4" /> iGOT Courses
            </NavLink>

            <NavLink to="/nssta" className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${isActive ? 'bg-brand-600 text-white font-semibold shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
              <GraduationCap className="w-4 h-4" /> NSSTA Programs
            </NavLink>

            <NavLink to="/quizzes" className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${isActive ? 'bg-brand-600 text-white font-semibold shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
              <FileQuestion className="w-4 h-4" /> Quizzes & MCQs
            </NavLink>

            <NavLink to="/assistant" className={({ isActive }) => `flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${isActive ? 'bg-brand-600 text-white font-semibold shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
              <div className="flex items-center gap-3">
                <Sparkles className="w-4 h-4 text-accent-400 animate-pulse" /> InnoWing AI
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-glow" title="Online AI Assistant" />
            </NavLink>

            <NavLink to="/analytics" className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${isActive ? 'bg-brand-600 text-white font-semibold shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
              <BarChart3 className="w-4 h-4" /> Learner Analytics
            </NavLink>

            {/* Trainer Section */}
            {isTrainer && (
              <>
                <div className="pt-4 px-3 py-2 text-[10px] uppercase font-bold text-slate-500 tracking-wider">Trainer Tools</div>
                <NavLink to="/trainer" className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${isActive ? 'bg-purple-600 text-white font-semibold shadow-md' : 'text-purple-300 hover:text-white hover:bg-white/5'}`}>
                  <ClipboardList className="w-4 h-4" /> Trainer Portal
                </NavLink>
                <NavLink to="/trainer/upload" className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${isActive ? 'bg-purple-600 text-white font-semibold shadow-md' : 'text-purple-300 hover:text-white hover:bg-white/5'}`}>
                  <Upload className="w-4 h-4" /> Upload Material
                </NavLink>
              </>
            )}

            {/* Admin Section */}
            {isAdmin && (
              <>
                <div className="pt-4 px-3 py-2 text-[10px] uppercase font-bold text-slate-500 tracking-wider">Admin Control</div>
                <NavLink to="/admin" className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${isActive ? 'bg-amber-600 text-white font-semibold shadow-md' : 'text-amber-300 hover:text-white hover:bg-white/5'}`}>
                  <Shield className="w-4 h-4" /> Workforce Analytics
                </NavLink>
              </>
            )}
          </nav>
        </div>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-white/10 bg-surface-900/50">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="w-9 h-9 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-300 font-bold text-sm shrink-0">
                {user?.full_name?.charAt(0) || 'U'}
              </div>
              <div className="min-w-0 flex-1 overflow-hidden">
                <div className="text-sm font-semibold text-white truncate">{user?.full_name || 'Official'}</div>
                <div className="text-[10px] text-slate-400 truncate">{user?.email}</div>
              </div>
            </div>
            <span className={`badge shrink-0 text-[9px] px-2 py-0.5 ${user?.role === 'ADMIN' ? 'badge-warn' : user?.role === 'TRAINER' ? 'badge-brand' : 'badge-neutral'}`}>
              {user?.role}
            </span>
          </div>

          <button onClick={handleLogout} className="btn btn-ghost w-full justify-start text-xs text-slate-400 hover:text-danger-400">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header */}
        <header className="h-16 border-b border-white/10 bg-surface-800/50 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-slate-200">India's Official Statistical System</h2>
            <span className="text-xs text-slate-500">| MoSPI Capacity Platform</span>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-400 rounded-full shadow-glow" />
            </button>
            <div className="text-xs text-right hidden sm:block">
              <div className="font-medium text-white">{user?.full_name}</div>
              <div className="text-[10px] text-accent-400 font-semibold">Active Session</div>
            </div>
          </div>
        </header>

        {/* Page Outlet */}
        <div className="p-6 md:p-8 flex-1">
          <Outlet />
        </div>
      </main>

      {/* Omnipresent Floating InnoWing AI Widget */}
      <InnoWingFloatingWidget />
    </div>
  )
}
