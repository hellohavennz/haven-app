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

const Mock = () => <div>Mock exam coming soon…</div>;
const Profile = () => <div>Profile coming soon…</div>;
const Paywall = () => <div>Upgrade to Premium coming soon…</div>;

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <AppError error={new Error("Route error")} />, // friendly fallback
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
