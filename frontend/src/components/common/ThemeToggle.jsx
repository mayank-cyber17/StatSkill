import React from 'react'
import { useThemeStore } from '../../stores/themeStore'
import { Sun, Moon } from 'lucide-react'

export default function ThemeToggle({ className = '', variant = 'icon' }) {
  const { theme, toggleTheme } = useThemeStore()
  const isDark = theme === 'dark'

  if (variant === 'button') {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 border ${
          isDark
            ? 'bg-surface-700/60 text-slate-300 border-white/10 hover:text-white hover:bg-surface-600'
            : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200 hover:text-slate-900'
        } ${className}`}
        title={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
      >
        {isDark ? (
          <>
            <Sun className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
            <span>Light Mode</span>
          </>
        ) : (
          <>
            <Moon className="w-3.5 h-3.5 text-indigo-600" />
            <span>Dark Mode</span>
          </>
        )}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`p-2 rounded-xl border transition-all duration-200 relative group flex items-center justify-center ${
        isDark
          ? 'bg-surface-700/50 hover:bg-surface-600 text-amber-300 border-white/10 hover:border-amber-400/40 hover:shadow-glow'
          : 'bg-white hover:bg-slate-100 text-indigo-600 border-slate-200 hover:border-indigo-400/40 shadow-sm'
      } ${className}`}
      aria-label={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
      title={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
    >
      <div className="relative w-4 h-4 flex items-center justify-center">
        {isDark ? (
          <Sun className="w-4 h-4 transition-transform duration-300 transform rotate-0 hover:rotate-45" />
        ) : (
          <Moon className="w-4 h-4 transition-transform duration-300 transform -rotate-12 hover:rotate-0" />
        )}
      </div>
    </button>
  )
}
