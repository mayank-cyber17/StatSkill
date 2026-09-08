import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const applyThemeToDOM = (theme) => {
  const root = document.documentElement
  if (theme === 'dark') {
    root.classList.add('dark')
    root.classList.remove('light')
  } else {
    root.classList.remove('dark')
    root.classList.add('light')
  }
}

export const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: 'dark', // default to dark
      toggleTheme: () => {
        const nextTheme = get().theme === 'dark' ? 'light' : 'dark'
        applyThemeToDOM(nextTheme)
        set({ theme: nextTheme })
      },
      setTheme: (theme) => {
        applyThemeToDOM(theme)
        set({ theme })
      },
      initTheme: () => {
        const currentTheme = get().theme || 'dark'
        applyThemeToDOM(currentTheme)
      },
    }),
    {
      name: 'statiq-theme-preference',
      onRehydrateStorage: () => (state) => {
        if (state) {
          applyThemeToDOM(state.theme)
        }
      },
    }
  )
)
