// src/App.jsx
import React from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AppRoutes from "./routes/AppRoutes";
import { Box } from "@mui/material";

function App() {
  return (
    <Box display="flex" flexDirection="column" minHeight="100vh" width="100%">
      <Navbar />
      <Box component="main" flexGrow={1} sx={{ width: '100%', p: 0 }}>
        <AppRoutes />   {/* ✅ no <Router> here */}
      </Box>
      <Footer />
    </Box>
  );
}

export default App;
