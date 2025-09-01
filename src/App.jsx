// src/App.jsx
import React from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <div className="app-container">
      <Navbar />
      <main className="content">
        <AppRoutes />   {/* ✅ no <Router> here */}
      </main>
      <Footer />
    </div>
  );
}

export default App;
