// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children, role }) {
  const { currentUser, userDoc } = useAuth();
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (role && (userDoc?.role !== role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
