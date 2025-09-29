// src/routes/AppRoutes.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";

import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Profile from "../pages/Profile";
import AdminLogin from "../pages/admin/AdminLogin";
import StudentDashboard from "../pages/student/StudentDashboard";
import StudentPayment from "../pages/student/StudentPayments";   // ✅ Use this only
import AdminDashboard from "../pages/admin/AdminDashboard";
import ManageBuses from "../pages/admin/ManageBuses";
import ManageStages from "../pages/admin/ManageStages";
import ManageStudents from "../pages/admin/ManageStudents";
import Settings from "../pages/admin/Settings";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Student routes */}
      <Route path="/profile" element={<Profile />} />
      <Route path="/student/dashboard" element={<StudentDashboard />} />
      <Route path="/student/payment" element={<StudentPayment />} /> {/* ✅ */}

      {/* Admin routes */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* ✅ Nested Admin Dashboard */}
      <Route path="/admin/dashboard" element={<AdminDashboard />}>
        <Route index element={<h3>Welcome, Admin! 👋 Select an option from the sidebar.</h3>} />
        <Route path="buses" element={<ManageBuses />} />
        <Route path="stages" element={<ManageStages />} />
        <Route path="students" element={<ManageStudents />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}
