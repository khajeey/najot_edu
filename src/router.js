import { createElement } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import DashboardLayout from "./pages/DashboardLayout";

export const router = createBrowserRouter([
  {
    path: "/",
    element: createElement(Navigate, { to: "/login", replace: true }),
  },
  {
    path: "/login",
    element: createElement(Login),
  },
  {
    path: "/dashboard",
    element: createElement(DashboardLayout),
  },
]);
