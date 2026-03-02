import { StrictMode, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';

import RootLayout from './layouts/RootLayout';
import RequireAuth from './components/RequireAuth';
import App from './App';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import ContentIndex from './pages/ContentIndex';
import ContentLesson from './pages/ContentLesson';
import PracticeIndex from './pages/PracticeIndex';
import PracticeLesson from './pages/PracticeLesson';
import PracticeFlashcards from './pages/PracticeFlashcards';
import Exam from './pages/Exam';
import Help from './pages/Help';
import Paywall from './pages/Paywall';
import { ThemeProvider } from './context/ThemeContext';
import Instagram from './pages/Instagram';

// Lazy-loaded: not on the critical path for any first page load
const ExamSession      = lazy(() => import('./pages/ExamSession'));
const ExamDrill        = lazy(() => import('./pages/ExamDrill'));
const Welcome          = lazy(() => import('./pages/Welcome'));
const Profile          = lazy(() => import('./pages/Profile'));
const Admin            = lazy(() => import('./pages/Admin'));
const Analytics        = lazy(() => import('./pages/Analytics'));
const ResetPassword    = lazy(() => import('./pages/ResetPassword'));
const Privacy          = lazy(() => import('./pages/Privacy'));
const Terms            = lazy(() => import('./pages/Terms'));

const Fallback = () => <div className="min-h-screen" />;

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      // Public routes
      { index: true, element: <App /> },
      { path: 'login', element: <Login /> },
      { path: 'signup', element: <Signup /> },
      { path: 'reset-password', element: <Suspense fallback={<Fallback />}><ResetPassword /></Suspense> },
      { path: 'privacy', element: <Suspense fallback={<Fallback />}><Privacy /></Suspense> },
      { path: 'terms', element: <Suspense fallback={<Fallback />}><Terms /></Suspense> },
      { path: 'help', element: <Help /> },
      { path: 'paywall', element: <Paywall /> },
      { path: 'instagram', element: <Instagram /> },

      // Protected routes — redirect to /login if not authenticated
      {
        element: <RequireAuth />,
        children: [
          { path: 'dashboard', element: <Dashboard /> },
          { path: 'content', element: <ContentIndex /> },
          { path: 'content/:lessonId', element: <ContentLesson /> },
          { path: 'practice', element: <PracticeIndex /> },
          { path: 'practice/:lessonId', element: <PracticeLesson /> },
          { path: 'practice/:lessonId/questions', element: <PracticeLesson /> },
          { path: 'practice/:lessonId/flashcards', element: <PracticeFlashcards /> },
          { path: 'flashcards/:lessonId', element: <PracticeFlashcards /> },
          { path: 'exam', element: <Exam /> },
          { path: 'exam/take', element: <Suspense fallback={<Fallback />}><ExamSession /></Suspense> },
          { path: 'exam/drill', element: <Suspense fallback={<Fallback />}><ExamDrill /></Suspense> },
          { path: 'welcome', element: <Suspense fallback={<Fallback />}><Welcome /></Suspense> },
          { path: 'profile', element: <Suspense fallback={<Fallback />}><Profile /></Suspense> },
          { path: 'analytics', element: <Suspense fallback={<Fallback />}><Analytics /></Suspense> },
          { path: 'admin', element: <Suspense fallback={<Fallback />}><Admin /></Suspense> },
        ],
      },
    ],
  },
], { basename: '/uk' });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  </StrictMode>
);
