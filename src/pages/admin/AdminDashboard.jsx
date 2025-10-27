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
          width: { xs: 180, md: 200 },
          flexShrink: 0,
          bgcolor: '#f5f5f5',
          borderRight: '2px solid #e0e0e0',
          p: 1.5,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
        }}
      >
        <Typography variant="h6" sx={{ mb: 0.5, fontWeight: 700, fontSize: '1.1rem' }}>
          Admin Panel
        </Typography>

        {/* Navigation Buttons */}
        <Button component={Link} to="buses" variant="outlined" fullWidth size="small" sx={{ justifyContent: 'flex-start', fontSize: '0.8rem', py: 0.5 }}>
          Manage Buses
        </Button>
        <Button component={Link} to="stages" variant="outlined" fullWidth size="small" sx={{ justifyContent: 'flex-start', fontSize: '0.8rem', py: 0.5 }}>
          Manage Stages
        </Button>
        <Button component={Link} to="students" variant="outlined" fullWidth size="small" sx={{ justifyContent: 'flex-start', fontSize: '0.8rem', py: 0.5 }}>
          Manage Students
        </Button>
        <Button component={Link} to="issue-pass" variant="contained" color="success" fullWidth size="small" sx={{ justifyContent: 'flex-start', fontSize: '0.8rem', py: 0.5 }}>
          Issue Manual Pass
        </Button>
        <Button component={Link} to="settings" variant="outlined" fullWidth size="small" sx={{ justifyContent: 'flex-start', fontSize: '0.8rem', py: 0.5 }}>
          Settings
        </Button>
        <Button component={Link} to="cleanup" variant="outlined" color="warning" fullWidth size="small" sx={{ justifyContent: 'flex-start', fontSize: '0.8rem', py: 0.5 }}>
          Cleanup Data
        </Button>

        <Box sx={{ flexGrow: 1 }} />
        
        <Button
          variant="contained"
          color="error"
          fullWidth
          size="small"
          onClick={handleLogout}
          sx={{ py: 0.5, fontSize: '0.8rem' }}
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
