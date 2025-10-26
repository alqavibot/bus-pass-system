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
import CleanupData from "../pages/admin/CleanupData";
import PaymentOptions from "../pages/student/PaymentOptions";
import MyPass from "../pages/MyPass";
import PassVerification from "../pages/PassVerification";
import RenewPass from "../pages/student/RenewPass";
import ProtectedRoute from "../components/ProtectedRoute";


export default function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify/:studentId" element={<PassVerification />} />

      {/* Student routes (protected) */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/dashboard"
        element={
          <ProtectedRoute>
            <StudentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/payment"
        element={
          <ProtectedRoute>
            <StudentPayment />
          </ProtectedRoute>
        }
      />
      <Route
        path="/payment/options"
        element={
          <ProtectedRoute>
            <PaymentOptions />
          </ProtectedRoute>
        }
      />
      <Route
        path="/mypas"
        element={
          <ProtectedRoute>
            <MyPass />
          </ProtectedRoute>
        }
      />
      <Route
        path="/renew-pass"
        element={
          <ProtectedRoute>
            <RenewPass />
          </ProtectedRoute>
        }
      />

      {/* Admin routes */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* ✅ Nested Admin Dashboard (protected by role) */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute role="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      >
        <Route index element={<h3>Welcome, Admin! 👋 Select an option from the sidebar.</h3>} />
        <Route path="buses" element={<ManageBuses />} />
        <Route path="stages" element={<ManageStages />} />
        <Route path="students" element={<ManageStudents />} />
        <Route path="settings" element={<Settings />} />
        <Route path="cleanup" element={<CleanupData />} />
      </Route>
    </Routes>
  );
}
