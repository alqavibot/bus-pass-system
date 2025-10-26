// src/pages/Profile.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TextField, Button, Box, Typography, Container, MenuItem } from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase/config";
import { doc, setDoc, getDoc } from "firebase/firestore";

const BRANCHES = ["CSE", "IT", "AIML", "ECE", "DIPLOMA", "PHARMACY", "EEE"];

export default function Profile() {
  const { currentUser} = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    hallTicket: "",
    branch: "",
    year: "",
    section: "",
    busNumber: "",
    stage: "",
  });

  const [loading, setLoading] = useState(false);
  const [hallTicketLocked, setHallTicketLocked] = useState(false);

  // ✅ Always fetch from Firestore on load
  useEffect(() => {
    const fetchProfile = async () => {
      if (!currentUser) return;
      try {
        const userRef = doc(db, "users", currentUser.uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          const data = snap.data();

          // ✅ Fill the form with Firestore data
          setForm({
            name: data.name || "",
            hallTicket: data.hallTicket || "",
            branch: data.branch || "",
            year: data.year || "",
            section: data.section || "",
            busNumber: data.busNumber || "",
            stage: data.stage || "",
          });

          // ✅ Lock hall ticket if already saved once
          if (data.hallTicket) {
            setHallTicketLocked(true);
          }
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };
    fetchProfile();
  }, [currentUser]); // runs when user changes

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    setLoading(true);
    try {
      const userRef = doc(db, "users", currentUser.uid);

      await setDoc(
        userRef,
        {
          ...form,
          uid: currentUser.uid,
          email: currentUser.email,
          profileCompleted: true,
          updatedAt: new Date(),
        },
        { merge: true }
      );

      alert("Profile saved successfully!");
      navigate("/student/dashboard");
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Error saving profile. Try again.");
    }
    setLoading(false);
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          mt: 6,
          p: 4,
          border: "1px solid #ccc",
          borderRadius: 2,
          boxShadow: 3,
        }}
      >
        <Typography variant="h5" align="center" gutterBottom>
          Complete Your Profile
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            label="Full Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />

          <TextField
            label="Hall Ticket Number"
            name="hallTicket"
            value={form.hallTicket}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
            disabled={hallTicketLocked} // ✅ lock after first save
          />
          {!hallTicketLocked && (
            <Typography variant="caption" color="error">
              * Note: Hall Ticket cannot be edited later. Fill it carefully.
            </Typography>
          )}

          <TextField
            select
            label="Branch"
            name="branch"
            value={form.branch}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
            helperText="Select your branch/department"
          >
            <MenuItem value="">-- Select Branch --</MenuItem>
            {BRANCHES.map((branchName) => (
              <MenuItem key={branchName} value={branchName}>
                {branchName}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Year"
            name="year"
            value={form.year}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />

          <TextField
            label="Section"
            name="section"
            value={form.section}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />

          <TextField
            label="Bus Number (Optional - Admin will assign)"
            name="busNumber"
            value={form.busNumber}
            onChange={handleChange}
            fullWidth
            margin="normal"
            helperText="Leave empty - Admin will assign bus and stage"
          />

          <TextField
            label="Stage Name (Optional - Admin will assign)"
            name="stage"
            value={form.stage}
            onChange={handleChange}
            fullWidth
            margin="normal"
            helperText="Leave empty - Admin will assign bus and stage"
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Profile"}
          </Button>
        </form>
      </Box>
    </Container>
  );
}
