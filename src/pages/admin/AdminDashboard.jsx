// src/pages/admin/AdminDashboard.jsx
import React from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { Container, Box, Button, Typography, Grid } from "@mui/material";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase/config";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/admin/login");
  };

  return (
    <Box sx={{ display: 'flex', minHeight: 'calc(100vh - 64px)', width: '100%' }}>
      {/* Sidebar - Fixed width */}
      <Box
        sx={{
          width: 240,
          flexShrink: 0,
          bgcolor: '#f5f5f5',
          borderRight: '2px solid #e0e0e0',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
        }}
      >
        <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>
          🚍 Admin Panel
        </Typography>

        {/* Navigation Buttons */}
        <Button component={Link} to="buses" variant="outlined" fullWidth sx={{ justifyContent: 'flex-start' }}>
          Manage Buses
        </Button>
        <Button component={Link} to="stages" variant="outlined" fullWidth sx={{ justifyContent: 'flex-start' }}>
          Manage Stages
        </Button>
        <Button component={Link} to="students" variant="outlined" fullWidth sx={{ justifyContent: 'flex-start' }}>
          Manage Students
        </Button>
        <Button component={Link} to="settings" variant="outlined" fullWidth sx={{ justifyContent: 'flex-start' }}>
          Settings
        </Button>
        <Button component={Link} to="cleanup" variant="outlined" color="warning" fullWidth sx={{ justifyContent: 'flex-start' }}>
          🗑️ Cleanup Data
        </Button>

        <Box sx={{ flexGrow: 1 }} />
        
        <Button
          variant="contained"
          color="error"
          fullWidth
          onClick={handleLogout}
        >
          Logout
        </Button>
      </Box>

      {/* Main Content - Takes remaining space */}
      <Box sx={{ flexGrow: 1, overflow: 'auto', bgcolor: '#fafafa' }}>
        <Outlet /> {/* ✅ This renders the child route */}
      </Box>
    </Box>
  );
}
