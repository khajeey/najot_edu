import { createElement } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import MainLayout from "./components/MainLayout";
import Login from "./pages/Login";
import DashboardLayout from "./pages/DashboardLayout";
import Teachers from "./pages/categoryPage/Teachers";
import Groups from "./pages/categoryPage/Groups";
import Students from "./pages/categoryPage/Students";
import Gifts from "./pages/categoryPage/Gifts";
import Courses from "./pages/categoryPage/Courses";
import Rooms from "./pages/categoryPage/Rooms";
import Staff from "./pages/categoryPage/Staff";

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
        element: createElement(Teachers),
      },
      {
        path: "/groups",
        element: createElement(Groups),
      },
      {
        path: "/students",
        element: createElement(Students),
      },
      {
        path: "/gifts",
        element: createElement(Gifts),
      },
      {
        path: "/dashboard/boshqarish",
        element: createElement(Navigate, { to: "/dashboard/boshqarish/kurslar", replace: true }),
      },
      {
        path: "/dashboard/boshqarish/kurslar",
        element: createElement(Courses),
      },
      {
        path: "/dashboard/boshqarish/xonalar",
        element: createElement(Rooms),
      },
      {
        path: "/dashboard/boshqarish/hodimlar",
        element: createElement(Staff),
      },
    ],
  },
]);
