import { createElement } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import MainLayout from "./components/MainLayout";
import CategoryPage from "./pages/CategoryPage";
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
    element: createElement(MainLayout),
    children: [
      {
        path: "/dashboard",
        element: createElement(DashboardLayout),
      },
      {
        path: "/teachers",
        element: createElement(CategoryPage, { title: "O'qituvchilar" }),
      },
      {
        path: "/groups",
        element: createElement(CategoryPage, { title: "Guruhlar" }),
      },
      {
        path: "/students",
        element: createElement(CategoryPage, { title: "Talabalar" }),
      },
      {
        path: "/gifts",
        element: createElement(CategoryPage, { title: "Sovg'alar" }),
      },
      {
        path: "/management",
        element: createElement(CategoryPage, { title: "Boshqarish" }),
      },
    ],
  },
]);
