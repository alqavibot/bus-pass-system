// src/components/Navbar.jsx (optional replacement)
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { logoutUser } from "../firebase/auth";

function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutUser();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="nav-logo">
        <Link to="/">Bus Pass System</Link>
      </div>
    </nav>
  );
}

export default Navbar;
