import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (user, token) => {
        localStorage.setItem('statiq_token', token)
        localStorage.setItem('statiq_user', JSON.stringify(user))
        set({ user, token, isAuthenticated: true })
      },

      updateUser: (user) => set({ user }),

      logout: () => {
        localStorage.removeItem('statiq_token')
        localStorage.removeItem('statiq_user')
        set({ user: null, token: null, isAuthenticated: false })
      },

      hasRole: (...roles) => {
        const { user } = get()
        return user && roles.includes(user.role)
      },

      isAdmin: () => get().hasRole('ADMIN', 'SUPER_ADMIN'),
      isTrainer: () => get().hasRole('TRAINER', 'ADMIN', 'SUPER_ADMIN'),
    }),
    {
      name: 'statiq-auth',
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
)
