import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute.jsx";
import Loader from "../components/common/Loader.jsx";

// ── Lazy-loaded pages (each becomes its own JS chunk) ────────────────────────
const Login = lazy(() => import("../pages/Login.jsx"));
const Home = lazy(() => import("../pages/Home.jsx"));
const Instructors = lazy(() => import("../pages/Instructors.jsx"));
const InstructorDetails = lazy(() => import("../pages/InstructorDetails.jsx"));
const Content = lazy(() => import("../pages/Content.jsx"));
const ContentDetails = lazy(() => import("../pages/ContentDetails.jsx"));
const AssignContent = lazy(() => import("../pages/AssignContent.jsx"));
const Schedule = lazy(() => import("../pages/Schedule.jsx"));
const Reports = lazy(() => import("../pages/Reports.jsx"));
const Settings = lazy(() => import("../pages/Settings.jsx"));
const FutureProjects = lazy(() => import("../pages/FutureProjects.jsx"));
const ContributorDashboard = lazy(
  () => import("../pages/ContributorDashboard.jsx"),
);
const ContributorReport = lazy(() => import("../pages/ContributorReport.jsx"));
const Notifications = lazy(() => import("../pages/Notifications.jsx"));
const NotFound = lazy(() => import("../pages/NotFound.jsx"));

const PageLoader = () => <Loader fullScreen text="Loading page..." />;

const AppRoutes = () => (
  <Suspense fallback={<PageLoader />}>
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />

      {/* Admin & Content Manager Protected Routes */}
      <Route
        element={<ProtectedRoute allowedRoles={["ADMIN", "CONTENT_MANAGER"]} />}
      >
        <Route path="/" element={<Home />} />
        <Route path="/instructors" element={<Instructors />} />
        <Route path="/instructors/:id" element={<InstructorDetails />} />
        <Route path="/content" element={<Content />} />
        <Route path="/content/:id" element={<ContentDetails />} />
        <Route path="/assign-content" element={<AssignContent />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/future-projects" element={<FutureProjects />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      {/* Contributor Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={["CONTRIBUTOR"]} />}>
        <Route path="/my-dashboard" element={<ContributorDashboard />} />
        <Route path="/my-report" element={<ContributorReport />} />
      </Route>

      {/* Routes accessible to all authenticated users */}
      <Route
        element={
          <ProtectedRoute
            allowedRoles={["ADMIN", "CONTENT_MANAGER", "CONTRIBUTOR"]}
          />
        }
      >
        <Route path="/notifications" element={<Notifications />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  </Suspense>
);

export default AppRoutes;
