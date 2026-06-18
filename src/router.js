import { createElement, lazy } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";

const MainLayout = lazy(() => import("./components/MainLayout"));
const Login = lazy(() => import("./pages/Login"));
const DashboardLayout = lazy(() => import("./pages/DashboardLayout"));
const Teachers = lazy(() => import("./pages/categoryPage/Teachers"));
const Groups = lazy(() => import("./pages/categoryPage/Groups"));
const GroupDetailPage = lazy(() => import("./pages/categoryPage/GroupDetailPage"));
const HomeworkCreatePage = lazy(() => import("./pages/categoryPage/HomeworkCreatePage"));
const HomeworkCheckPage = lazy(() => import("./pages/categoryPage/HomeworkCheckPage"));
const HomeworkAnswerCheckPage = lazy(() => import("./pages/categoryPage/HomeworkAnswerCheckPage"));
const LessonAttendancePage = lazy(() => import("./pages/categoryPage/LessonAttendancePage"));
const TeacherDetailPage = lazy(() => import("./pages/categoryPage/TeacherDetailPage"));
const StudentDetailPage = lazy(() => import("./pages/categoryPage/StudentDetailPage"));
const Students = lazy(() => import("./pages/categoryPage/Students"));
const Gifts = lazy(() => import("./pages/categoryPage/Gifts"));
const Courses = lazy(() => import("./pages/categoryPage/Courses"));
const Rooms = lazy(() => import("./pages/categoryPage/Rooms"));
const Staff = lazy(() => import("./pages/categoryPage/Staff"));
const StudentLayout = lazy(() => import("./pages/student/StudentLayout"));
const MyGroups = lazy(() => import("./pages/student/MyGroups"));
const GroupHomeworkStatus = lazy(() => import("./pages/student/GroupHomeworkStatus"));
const StudentPlaceholder = lazy(() => import("./pages/student/StudentPlaceholder"));
const StudentSettings = lazy(() => import("./pages/student/StudentSettings"));
const TeacherLayout = lazy(() => import("./pages/teacher/TeacherLayout"));
const TeacherGroups = lazy(() => import("./pages/teacher/TeacherGroups"));
const TeacherProfile = lazy(() => import("./pages/teacher/TeacherProfile"));

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
        path: "/groups/:groupId",
        element: createElement(GroupDetailPage),
      },
      {
        path: "/groups/:groupId/homework/yangi",
        element: createElement(HomeworkCreatePage),
      },
      {
        path: "/groups/:groupId/homework/:homeworkId/check",
        element: createElement(HomeworkCheckPage),
      },
      {
        path: "/groups/:groupId/homework/:homeworkId/answers/:answerId",
        element: createElement(HomeworkAnswerCheckPage),
      },
      {
        path: "/groups/:groupId/lesson/:lessonDate",
        element: createElement(LessonAttendancePage),
      },
      {
        path: "/teachers/:teacherId",
        element: createElement(TeacherDetailPage),
      },
      {
        path: "/students",
        element: createElement(Students),
      },
      {
        path: "/students/:studentId",
        element: createElement(StudentDetailPage),
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
  {
    element: createElement(StudentLayout),
    children: [
      {
        path: "/dashboard/my-groups",
        element: createElement(MyGroups),
      },
      {
        path: "/dashboard/my-groups/:groupId",
        element: createElement(GroupHomeworkStatus),
      },
      {
        path: "/dashboard/home",
        element: createElement(StudentPlaceholder, { title: "Bosh sahifa" }),
      },
      {
        path: "/dashboard/my-payments",
        element: createElement(StudentPlaceholder, { title: "To'lovlarim" }),
      },
      {
        path: "/dashboard/my-stats",
        element: createElement(StudentPlaceholder, { title: "Ko'rsatkichlarim" }),
      },
      {
        path: "/dashboard/rating",
        element: createElement(StudentPlaceholder, { title: "Reyting" }),
      },
      {
        path: "/dashboard/shop",
        element: createElement(StudentPlaceholder, { title: "Do'kon" }),
      },
      {
        path: "/dashboard/extra-lessons",
        element: createElement(StudentPlaceholder, { title: "Qo'shimcha darslar" }),
      },
      {
        path: "/dashboard/settings",
        element: createElement(StudentSettings),
      },
    ],
  },
  {
    element: createElement(TeacherLayout),
    children: [
      {
        path: "/dashboard/groups",
        element: createElement(TeacherGroups, { variant: "active" }),
      },
      {
        path: "/dashboard/planned-groups",
        element: createElement(TeacherGroups, { variant: "planned" }),
      },
      {
        path: "/dashboard/profile",
        element: createElement(TeacherProfile),
      },
    ],
  },
]);
