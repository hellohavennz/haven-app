import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";

import RootLayout from "./layouts/RootLayout";
import App from "./App";
import ContentIndex from "./pages/ContentIndex";
import ContentLesson from "./pages/ContentLesson";
import PracticeIndex from "./pages/PracticeIndex";
import PracticeLesson from "./pages/PracticeLesson";
import PracticeFlashcards from "./pages/PracticeFlashcards";
import Lesson from "./pages/Lesson";
import AppError from "./components/AppError";

const Mock = () => (
  <div className="max-w-2xl mx-auto p-6 text-center">
    <h1 className="text-3xl font-bold mb-4">Mock Exam</h1>
    <p className="text-gray-600">Coming soon…</p>
  </div>
);

const Profile = () => (
  <div className="max-w-2xl mx-auto p-6 text-center">
    <h1 className="text-3xl font-bold mb-4">Profile</h1>
    <p className="text-gray-600">Coming soon…</p>
  </div>
);

const Paywall = () => (
  <div className="max-w-2xl mx-auto p-6 text-center">
    <h1 className="text-3xl font-bold mb-4">Premium</h1>
    <p className="text-gray-600">Upgrade coming soon…</p>
  </div>
);

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <AppError error={new Error("Route error")} />,
    children: [
      { index: true, element: <App /> },
      { path: "content", element: <ContentIndex /> },
      { path: "content/:lessonId", element: <ContentLesson /> },
      { path: "practice", element: <PracticeIndex /> },
      { path: "practice/:lessonId", element: <PracticeLesson /> },
      { path: "flashcards/:lessonId", element: <PracticeFlashcards /> },
      { path: "lesson/:lessonId", element: <Lesson /> },
      { path: "mock", element: <Mock /> },
      { path: "profile", element: <Profile /> },
      { path: "paywall", element: <Paywall /> }
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
