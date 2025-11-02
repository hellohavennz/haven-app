import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';

import RootLayout from './layouts/RootLayout';
import App from './App';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import ContentIndex from './pages/ContentIndex';
import ContentLesson from './pages/ContentLesson';
import PracticeIndex from './pages/PracticeIndex';
import PracticeLesson from './pages/PracticeLesson';
import Flashcards from './pages/Flashcards';
import Paywall from './components/Paywall';

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <App /> },
      { path: 'login', element: <Login /> },
      { path: 'signup', element: <Signup /> },
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'content', element: <ContentIndex /> },
      { path: 'content/:lessonId', element: <ContentLesson /> },
      { path: 'practice', element: <PracticeIndex /> },
      { path: 'practice/:lessonId', element: <PracticeLesson /> },
      { path: 'flashcards/:lessonId', element: <Flashcards /> },
      { path: 'paywall', element: <Paywall /> },
    ],
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
