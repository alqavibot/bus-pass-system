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
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Grid container spacing={2}>
        {/* Sidebar */}
        <Grid item xs={12} md={3}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              borderRight: "1px solid #ddd",
              pr: 2,
              height: "100%",
            }}
          >
            <Typography variant="h6" sx={{ mb: 2 }}>
              🚍 Admin Panel
            </Typography>

            {/* ✅ Absolute paths */}
            <Button component={Link} to="buses" variant="outlined">
              Manage Buses
            </Button>
            <Button component={Link} to="stages" variant="outlined">
              Manage Stages
            </Button>
            <Button component={Link} to="students" variant="outlined">
              Manage Students
            </Button>
            <Button component={Link} to="settings" variant="outlined">
              Settings
            </Button>
            <Button component={Link} to="cleanup" variant="outlined" color="warning">
              🗑️ Cleanup Data
            </Button>

            <Button
              variant="contained"
              color="error"
              sx={{ mt: "auto" }}
              onClick={handleLogout}
            >
              Logout
            </Button>
          </Box>
        </Grid>

        {/* Main Content */}
        <Grid item xs={12} md={9}>
          <Outlet /> {/* ✅ This renders the child route */}
        </Grid>
      </Grid>
    </Container>
  );
}
