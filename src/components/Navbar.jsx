// src/components/Navbar.jsx (optional replacement)
import React from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  Link,
} from "@mui/material";

function Navbar() {
  return (
    <AppBar position="sticky" color="default">
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Bus Pass System
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Link component={RouterLink} to="/" underline="none">
            <Button>Home</Button>
          </Link>
          <Link component={RouterLink} to="/student/dashboard" underline="none">
            <Button>Dashboard</Button>
          </Link>
          <Link component={RouterLink} to="/admin/login" underline="none">
            <Button>Admin</Button>
          </Link>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
