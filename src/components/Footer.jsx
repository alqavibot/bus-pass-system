// src/components/Footer.jsx
import React from "react";
import { Box, Container, Typography, Link } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

function Footer() {
  return (
    <Box component="footer" sx={{ bgcolor: "background.paper", borderTop: 1, borderColor: "divider", mt: 6 }}>
      <Container sx={{ py: 3, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
        <Typography variant="body2" color="text.secondary">
          © {new Date().getFullYear()} College Bus Pass System
        </Typography>
        <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
          <Link component={RouterLink} to="/privacy" color="text.secondary" underline="hover">
            Privacy Policy
          </Link>
          <Link component={RouterLink} to="/terms" color="text.secondary" underline="hover">
            Terms & Conditions
          </Link>
          <Link component={RouterLink} to="/support" color="text.secondary" underline="hover">
            Support
          </Link>
        </Box>
      </Container>
    </Box>
  );
}

export default Footer;
