// src/App.jsx
import React from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AppRoutes from "./routes/AppRoutes";
import { Container, Box } from "@mui/material";

function App() {
  return (
    <Box display="flex" flexDirection="column" minHeight="100vh">
      <Navbar />
      <Box component="main" flexGrow={1} sx={{ py: 4 }}>
        <Container>
          <AppRoutes />   {/* ✅ no <Router> here */}
        </Container>
      </Box>
      <Footer />
    </Box>
  );
}

export default App;
