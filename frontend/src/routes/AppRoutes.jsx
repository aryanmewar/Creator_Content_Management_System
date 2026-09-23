import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute.jsx';
import Login from '../pages/Login.jsx';
import Home from '../pages/Home.jsx';
import Instructors from '../pages/Instructors.jsx';
import InstructorDetails from '../pages/InstructorDetails.jsx';
import Content from '../pages/Content.jsx';
import ContentDetails from '../pages/ContentDetails.jsx';
import AssignContent from '../pages/AssignContent.jsx';
import Schedule from '../pages/Schedule.jsx';
import Reports from '../pages/Reports.jsx';
import Settings from '../pages/Settings.jsx';
import NotFound from '../pages/NotFound.jsx';

const AppRoutes = () => (
  <Routes>
    {/* Public routes */}
    <Route path="/login" element={<Login />} />

    {/* Protected routes */}
    <Route element={<ProtectedRoute />}>
      <Route path="/" element={<Home />} />
      <Route path="/instructors" element={<Instructors />} />
      <Route path="/instructors/:id" element={<InstructorDetails />} />
      <Route path="/content" element={<Content />} />
      <Route path="/content/:id" element={<ContentDetails />} />
      <Route path="/assign-content" element={<AssignContent />} />
      <Route path="/schedule" element={<Schedule />} />
      <Route path="/reports" element={<Reports />} />
      <Route path="/settings" element={<Settings />} />
    </Route>

    {/* 404 */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default AppRoutes;
