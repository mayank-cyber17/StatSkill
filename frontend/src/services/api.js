import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('statiq_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('statiq_token')
      localStorage.removeItem('statiq_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
  logout: () => { localStorage.removeItem('statiq_token'); localStorage.removeItem('statiq_user') },
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  verifyOTP: (data) => api.post('/auth/verify-otp', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  resendOTP: (data) => api.post('/auth/resend-otp', data),
}

// Profile
export const profileAPI = {
  get: () => api.get('/profile'),
  setup: (data) => api.post('/profile/setup', data),
  update: (data) => api.put('/profile', data),
  getCompetency: () => api.get('/profile/competency'),
}

// Gap Analysis
export const gapAPI = {
  get: () => api.get('/gap-analysis'),
  refresh: () => api.post('/gap-analysis/refresh'),
}

// Learning Path
export const learningPathAPI = {
  get: () => api.get('/learning-path'),
  generate: () => api.post('/learning-path/generate'),
  completeItem: (itemId) => api.put(`/learning-path/items/${itemId}/complete`),
}

// iGOT
export const igotAPI = {
  getCourses: (params) => api.get('/igot/courses', { params }),
  getCourse: (id) => api.get(`/igot/courses/${id}`),
  getRecommendations: () => api.get('/igot/recommendations'),
  enroll: (courseId) => api.post(`/igot/enroll/${courseId}`),
  getEnrollments: () => api.get('/igot/enrollments'),
}

// NSSTA
export const nsstAAPI = {
  getPrograms: (params) => api.get('/nssta/programs', { params }),
  getProgram: (id) => api.get(`/nssta/programs/${id}`),
  getRecommendations: () => api.get('/nssta/recommendations'),
  nominate: (programId) => api.post(`/nssta/nominate/${programId}`),
  getNominations: () => api.get('/nssta/nominations'),
}

// Upload & Documents
export const uploadAPI = {
  uploadDocument: (formData) => api.post('/upload/document', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getDocuments: () => api.get('/upload/documents'),
  getDocument: (id) => api.get(`/upload/documents/${id}`),
  deleteDocument: (id) => api.delete(`/upload/documents/${id}`),
  getStatus: (id) => api.get(`/upload/documents/${id}/status`),
}

// Quizzes
export const quizAPI = {
  generate: (data) => api.post('/quizzes/generate', data),
  getAll: (params) => api.get('/quizzes', { params }),
  get: (id) => api.get(`/quizzes/${id}`),
  getOnboarding: () => api.get('/quizzes/onboarding'),
  getOnboardingStatus: () => api.get('/quizzes/onboarding/status'),
  submitOnboarding: (data) => api.post('/quizzes/onboarding/submit', data),
  update: (id, data) => api.put(`/quizzes/${id}`, data),
  publish: (id) => api.post(`/quizzes/${id}/publish`),
  startAttempt: (id) => api.post(`/quizzes/${id}/attempt/start`),
  submit: (id, data) => api.post(`/quizzes/${id}/attempt/submit`, data),
  getResult: (id, attemptId) => api.get(`/quizzes/${id}/result/${attemptId}`),
  getHistory: () => api.get('/quizzes/history'),
}

// Assistant
export const assistantAPI = {
  createConversation: () => api.post('/assistant/conversations'),
  getConversations: () => api.get('/assistant/conversations'),
  getMessages: (convId) => api.get(`/assistant/conversations/${convId}/messages`),
  sendMessage: (convId, data) => api.post(`/assistant/conversations/${convId}/message`, data),
  deleteConversation: (convId) => api.delete(`/assistant/conversations/${convId}`),
}

// Analytics
export const analyticsAPI = {
  getPersonal: () => api.get('/analytics/me'),
  getWorkforce: () => api.get('/analytics/workforce'),
  getPredictive: () => api.get('/analytics/predictive'),
}

// Admin
export const adminAPI = {
  getUsers: (params) => api.get('/admin/users', { params }),
  updateRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
  getPendingNominations: () => api.get('/admin/nominations/pending'),
  approveNomination: (id, data) => api.post(`/admin/nominations/${id}/approve`, data),
  getFrameworks: () => api.get('/admin/frameworks'),
}
