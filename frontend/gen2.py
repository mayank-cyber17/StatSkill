import os
import json

base_dir = r"c:\Users\hp\OneDrive\Desktop\Innovexa\frontend"
src_dir = os.path.join(base_dir, "src")

files = {}

files["vite.config.js"] = """import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:8000'
    }
  }
});
"""

files["index.html"] = """<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>StatIQ — AI Skill Intelligence Platform</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@400;500;600;700&display=swap" rel="stylesheet">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
"""

files["src/main.jsx"] = """import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
        <Toaster position="top-right" toastOptions={{ style: { background: '#1e293b', color: '#f8fafc', border: '1px solid #334155' } }} />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
"""

files["src/App.jsx"] = """import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import PrivateRoute from './components/PrivateRoute';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import ProfilePage from './pages/profile/ProfilePage';
import ProfileSetupPage from './pages/profile/ProfileSetupPage';
import SkillGapPage from './pages/skillgap/SkillGapPage';
import LearningPathPage from './pages/learning/LearningPathPage';
import IGOTPage from './pages/igot/IGOTPage';
import NSSTAPage from './pages/nssta/NSSTAPage';
import QuizzesPage from './pages/quizzes/QuizzesPage';
import QuizEnginePage from './pages/quizzes/QuizEnginePage';
import QuizResultPage from './pages/quizzes/QuizResultPage';
import AssistantPage from './pages/assistant/AssistantPage';
import AnalyticsPage from './pages/analytics/AnalyticsPage';
import TrainerDashboardPage from './pages/trainer/TrainerDashboardPage';
import UploadPage from './pages/trainer/UploadPage';
import TrainerQuizzesPage from './pages/trainer/TrainerQuizzesPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<PrivateRoute><MainLayout /></PrivateRoute>}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/setup" element={<ProfileSetupPage />} />
        <Route path="/skill-gap" element={<SkillGapPage />} />
        <Route path="/learning-path" element={<LearningPathPage />} />
        <Route path="/igot" element={<IGOTPage />} />
        <Route path="/nssta" element={<NSSTAPage />} />
        <Route path="/quizzes" element={<QuizzesPage />} />
        <Route path="/quizzes/:quizId" element={<QuizEnginePage />} />
        <Route path="/quizzes/:quizId/result/:attemptId" element={<QuizResultPage />} />
        <Route path="/assistant" element={<AssistantPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/trainer" element={<PrivateRoute roles={['TRAINER', 'ADMIN']}><TrainerDashboardPage /></PrivateRoute>} />
        <Route path="/trainer/upload" element={<PrivateRoute roles={['TRAINER', 'ADMIN']}><UploadPage /></PrivateRoute>} />
        <Route path="/trainer/quizzes" element={<PrivateRoute roles={['TRAINER', 'ADMIN']}><TrainerQuizzesPage /></PrivateRoute>} />
        <Route path="/admin" element={<PrivateRoute roles={['ADMIN']}><AdminDashboardPage /></PrivateRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
"""

files["src/components/PrivateRoute.jsx"] = """import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export default function PrivateRoute({ children, roles }) {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (roles && user && !roles.includes(user.role)) return <Navigate to="/dashboard" />;
  return children ? children : <Outlet />;
}
"""

files["src/components/layout/MainLayout.jsx"] = """import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { LogOut } from 'lucide-react';

export default function MainLayout() {
  const { user, logout, isTrainer, isAdmin } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-surface-900 text-slate-200">
      <aside className="w-64 border-r border-surface-800 p-4 flex flex-col">
        <h1 className="text-2xl font-bold mb-8">StatIQ</h1>
        <nav className="flex-1 space-y-2">
          <Link to="/dashboard" className="block p-2 hover:bg-surface-800 rounded">Dashboard</Link>
          <Link to="/profile" className="block p-2 hover:bg-surface-800 rounded">Profile</Link>
          <Link to="/skill-gap" className="block p-2 hover:bg-surface-800 rounded">Skill Gap</Link>
          <Link to="/learning-path" className="block p-2 hover:bg-surface-800 rounded">Learning Path</Link>
          <Link to="/igot" className="block p-2 hover:bg-surface-800 rounded">iGOT Courses</Link>
          <Link to="/nssta" className="block p-2 hover:bg-surface-800 rounded">NSSTA</Link>
          <Link to="/quizzes" className="block p-2 hover:bg-surface-800 rounded">Quizzes</Link>
          <Link to="/assistant" className="block p-2 hover:bg-surface-800 rounded">Assistant</Link>
          <Link to="/analytics" className="block p-2 hover:bg-surface-800 rounded">Analytics</Link>
          {isTrainer() && (
            <>
              <div className="pt-4 text-xs font-bold text-slate-500">TRAINER</div>
              <Link to="/trainer" className="block p-2 hover:bg-surface-800 rounded">Trainer Dashboard</Link>
              <Link to="/trainer/upload" className="block p-2 hover:bg-surface-800 rounded">Upload</Link>
              <Link to="/trainer/quizzes" className="block p-2 hover:bg-surface-800 rounded">Manage Quizzes</Link>
            </>
          )}
          {isAdmin() && (
            <>
              <div className="pt-4 text-xs font-bold text-slate-500">ADMIN</div>
              <Link to="/admin" className="block p-2 hover:bg-surface-800 rounded">Admin Dashboard</Link>
            </>
          )}
        </nav>
        <button onClick={handleLogout} className="flex items-center gap-2 p-2 hover:bg-surface-800 rounded text-red-400">
          <LogOut size={18} /> Logout
        </button>
      </aside>
      <main className="flex-1 overflow-auto bg-[#0B0F19] p-8">
        <Outlet />
      </main>
    </div>
  );
}
"""

files["src/pages/LandingPage.jsx"] = """import React from 'react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0B0F19] text-white flex flex-col items-center justify-center text-center p-4">
      <h1 className="text-6xl font-bold mb-4">StatIQ</h1>
      <p className="text-xl mb-8">AI-Powered Skill Intelligence for India's Statistical Workforce</p>
      <div className="flex gap-4">
        <Link to="/login" className="btn btn-primary px-8 py-3 rounded-lg bg-brand-500">Login</Link>
        <Link to="/register" className="btn btn-secondary px-8 py-3 rounded-lg border border-brand-500">Register</Link>
      </div>
    </div>
  );
}
"""

files["src/pages/auth/LoginPage.jsx"] = """import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

export default function LoginPage() {
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');

  const handleLogin = (role) => {
    setAuth({ name: 'Test User', email, role }, 'fake-token');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-900 text-white">
      <div className="card p-8 w-96 bg-surface-800 rounded-xl">
        <h2 className="text-2xl font-bold mb-6">Login</h2>
        <input type="email" placeholder="Email" className="w-full p-2 rounded bg-surface-700 mb-4" value={email} onChange={e => setEmail(e.target.value)} />
        <input type="password" placeholder="Password" className="w-full p-2 rounded bg-surface-700 mb-6" />
        <button onClick={() => handleLogin('LEARNER')} className="w-full bg-brand-500 py-2 rounded mb-4">Login</button>
        <div className="flex justify-between text-sm">
          <button onClick={() => handleLogin('LEARNER')} className="text-blue-400">Demo Learner</button>
          <button onClick={() => handleLogin('TRAINER')} className="text-green-400">Demo Trainer</button>
          <button onClick={() => handleLogin('ADMIN')} className="text-red-400">Demo Admin</button>
        </div>
      </div>
    </div>
  );
}
"""

files["src/pages/auth/RegisterPage.jsx"] = """import React from 'react';
import { Link } from 'react-router-dom';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-900 text-white">
      <div className="card p-8 w-96 bg-surface-800 rounded-xl">
        <h2 className="text-2xl font-bold mb-6">Register</h2>
        <p>Registration closed. <Link to="/login" className="text-brand-500">Login instead</Link></p>
      </div>
    </div>
  );
}
"""

pages = [
    "dashboard/DashboardPage", "profile/ProfilePage", "profile/ProfileSetupPage",
    "skillgap/SkillGapPage", "learning/LearningPathPage", "igot/IGOTPage",
    "nssta/NSSTAPage", "quizzes/QuizzesPage", "quizzes/QuizEnginePage",
    "quizzes/QuizResultPage", "assistant/AssistantPage", "analytics/AnalyticsPage",
    "trainer/TrainerDashboardPage", "trainer/UploadPage", "trainer/TrainerQuizzesPage",
    "admin/AdminDashboardPage"
]

for page in pages:
    name = page.split('/')[-1]
    files[f"src/pages/{page}.jsx"] = f"""import React from 'react';

export default function {name}() {{
  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold">{name}</h1>
      <p className="mt-4 text-slate-400">Content for {name}</p>
    </div>
  );
}}
"""

for path, content in files.items():
    full_path = os.path.join(base_dir, path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content)

print("Files generated successfully.")
