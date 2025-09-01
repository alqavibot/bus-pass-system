import React, { useState } from "react";
import { TextField, Button, Container, Typography, Box } from "@mui/material";
import { auth, db } from "../firebase/config";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Sign in with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Fetch their Firestore profile
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        console.log("✅ User Profile:", docSnap.data());

        alert("Login successful!");
        // ✅ Navigate student to their dashboard
        navigate("/student/dashboard");
      } else {
        alert("Profile not found. Please register first.");
      }
    } catch (error) {
      console.error("❌ Login Error:", error);
      alert(error.message);
    }

    setLoading(false);
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 10, p: 3, boxShadow: 3, borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom>
          Student Login
        </Typography>
        <form onSubmit={handleLogin}>
          <TextField
            label="Email"
            type="email"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            disabled={loading}
            sx={{ mt: 2 }}
          >
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>
      </Box>
    </Container>
  );
};

export default Login;
