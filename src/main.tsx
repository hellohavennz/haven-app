import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";

import RootLayout from "./layouts/RootLayout";
import App from "./App";
import Path from "./pages/Path";
import Lesson from "./pages/Lesson";
import Lesson1Content from "./pages/Lesson1Content";

const Mock = () => <div>Mock exam coming soon…</div>;
const Profile = () => <div>Profile coming soon…</div>;
const Paywall = () => <div>Upgrade to Premium coming soon…</div>;

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <App /> },
      { path: "path", element: <Path /> },
      { path: "lesson/:lessonId", element: <Lesson /> },
      { path: "lesson1-content", element: <Lesson1Content /> },
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
