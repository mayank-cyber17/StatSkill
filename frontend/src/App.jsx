import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import PrivateRoute from './components/PrivateRoute';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordFlow from './pages/auth/ForgotPasswordFlow';
import DashboardPage from './pages/dashboard/DashboardPage';
import ProfilePage from './pages/profile/ProfilePage';
import ProfileSetupPage from './pages/profile/ProfileSetupPage';
import OnboardingAssessmentPage from './pages/assessment/OnboardingAssessmentPage';
import SkillGapPage from './pages/skillgap/SkillGapPage';
import LearningPathPage from './pages/learning/LearningPathPage';
import CourseStudyPage from './pages/learning/CourseStudyPage';
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
      <Route path="/forgot-password" element={<ForgotPasswordFlow />} />
      <Route element={<PrivateRoute><MainLayout /></PrivateRoute>}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/assessment" element={<OnboardingAssessmentPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/setup" element={<ProfileSetupPage />} />
        <Route path="/skill-gap" element={<SkillGapPage />} />
        <Route path="/learning-path" element={<LearningPathPage />} />
        <Route path="/learn/:courseId" element={<CourseStudyPage />} />
        <Route path="/igot" element={<IGOTPage />} />
        <Route path="/igot/course/:courseId" element={<CourseStudyPage />} />
        <Route path="/nssta" element={<NSSTAPage />} />
        <Route path="/quizzes" element={<QuizzesPage />} />
        <Route path="/quizzes/:quizId" element={<QuizEnginePage />} />
        <Route path="/quizzes/:quizId/result/:attemptId" element={<QuizResultPage />} />
        <Route path="/assistant" element={<AssistantPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/trainer" element={<PrivateRoute roles={['TRAINER', 'ADMIN']}><TrainerDashboardPage /></PrivateRoute>} />
        <Route path="/trainer/upload" element={<PrivateRoute roles={['LEARNER', 'TRAINER', 'ADMIN']}><UploadPage /></PrivateRoute>} />
        <Route path="/trainer/quizzes" element={<PrivateRoute roles={['LEARNER', 'TRAINER', 'ADMIN']}><TrainerQuizzesPage /></PrivateRoute>} />
        <Route path="/admin" element={<PrivateRoute roles={['ADMIN']}><AdminDashboardPage /></PrivateRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
