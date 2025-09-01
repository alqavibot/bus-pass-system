import React, { useState } from "react";
import { TextField, Button, Container, Typography, Box } from "@mui/material";
import { auth, db } from "../firebase/config";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [name, setName] = useState("");
  const [hallTicket, setHallTicket] = useState("");
  const [year, setYear] = useState("");
  const [section, setSection] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Save profile in Firestore under `/users/{uid}`
      await setDoc(doc(db, "users", user.uid), {
        name,
        hallTicket,
        year,
        section,
        email,
        role: "student",
        createdAt: new Date()
      });

      alert("Registration successful!");
      navigate("/login");
    } catch (error) {
      console.error("❌ Registration error:", error);
      alert(error.message);
    }

    setLoading(false);
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 10, p: 3, boxShadow: 3, borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom>
          Student Registration
        </Typography>
        <form onSubmit={handleRegister}>
          <TextField
            label="Full Name"
            fullWidth
            margin="normal"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <TextField
            label="Hall Ticket No."
            fullWidth
            margin="normal"
            value={hallTicket}
            onChange={(e) => setHallTicket(e.target.value)}
            required
          />
          <TextField
            label="Year"
            fullWidth
            margin="normal"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            required
          />
          <TextField
            label="Section"
            fullWidth
            margin="normal"
            value={section}
            onChange={(e) => setSection(e.target.value)}
            required
          />
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
            {loading ? "Registering..." : "Register"}
          </Button>
        </form>
      </Box>
    </Container>
  );
};

export default Register;
