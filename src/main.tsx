import { StrictMode } from 'react';
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
import ExamSession from './pages/ExamSession';
import ExamDrill from './pages/ExamDrill';
import Welcome from './pages/Welcome';
import Help from './pages/Help';
import Paywall from './pages/Paywall';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import ResetPassword from './pages/ResetPassword';
import { ThemeProvider } from './context/ThemeContext';

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      // Public routes
      { index: true, element: <App /> },
      { path: 'login', element: <Login /> },
      { path: 'signup', element: <Signup /> },
      { path: 'reset-password', element: <ResetPassword /> },
      { path: 'help', element: <Help /> },
      { path: 'paywall', element: <Paywall /> },

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
          { path: 'exam/take', element: <ExamSession /> },
          { path: 'exam/drill', element: <ExamDrill /> },
          { path: 'welcome', element: <Welcome /> },
          { path: 'profile', element: <Profile /> },
          { path: 'admin', element: <Admin /> },
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
