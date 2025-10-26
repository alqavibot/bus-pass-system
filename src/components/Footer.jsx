// src/components/Footer.jsx
import React from "react";
import { Box, Container, Typography, Link } from "@mui/material";

function Footer() {
  return (
    <Box component="footer" sx={{ bgcolor: "background.paper", borderTop: 1, borderColor: "divider", mt: 6 }}>
      <Container sx={{ py: 3, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography variant="body2" color="text.secondary">
          © {new Date().getFullYear()} College Bus Pass System
        </Typography>
        <Box sx={{ display: "flex", gap: 3 }}>
          <Link href="#" color="text.secondary" underline="hover">Privacy</Link>
          <Link href="#" color="text.secondary" underline="hover">Terms</Link>
          <Link href="#" color="text.secondary" underline="hover">Support</Link>
        </Box>
      </Container>
    </Box>
  );
}

export default Footer;
