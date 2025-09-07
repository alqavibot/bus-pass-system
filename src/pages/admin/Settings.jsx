// src/pages/admin/Settings.jsx
import React, { useState, useEffect } from "react";
import { httpsCallable } from "firebase/functions";
import { functions, db } from "../../firebase/config";
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
} from "@mui/material";
import { doc, getDoc } from "firebase/firestore";

export default function Settings() {
  const [year, setYear] = useState("");
  const [currentYear, setCurrentYear] = useState("");
  const [loading, setLoading] = useState(false); // ✅ new state

  // Load current academic year
  useEffect(() => {
    const fetchYear = async () => {
      const docRef = doc(db, "settings", "global"); // consistent with backend
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        setCurrentYear(snap.data().currentAcademicYear);
      }
    };
    fetchYear();
  }, []);

  // Update Academic Year via Cloud Function
  const handleUpdate = async () => {
    if (!year) return alert("Please enter a valid academic year");

    setLoading(true);
    try {
      const setYear = httpsCallable(functions, "setAcademicYear");
      const res = await setYear({ year });
      alert(res.data.message);

      // Refresh UI
      setCurrentYear(year);
      setYear("");
    } catch (err) {
      console.error("Error updating year:", err);
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h5" gutterBottom>
        ⚙️ Admin Settings
      </Typography>
      <Divider sx={{ mb: 2 }} />

      <Box sx={{ mb: 3 }}>
        <Typography variant="body1">
          <strong>Current Academic Year:</strong>{" "}
          {currentYear || "Not Set"}
        </Typography>
      </Box>

      <Box sx={{ display: "flex", gap: 2, mb: 3, alignItems: "center" }}>
        <TextField
          label="New Academic Year"
          placeholder="e.g. 2025-2026"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          fullWidth
          disabled={loading} // ✅ disable while loading
        />
        <Button
          variant="contained"
          onClick={handleUpdate}
          disabled={loading} // ✅ disable button
        >
          {loading ? (
            <CircularProgress size={24} sx={{ color: "white" }} />
          ) : (
            "Update"
          )}
        </Button>
      </Box>

      <Typography variant="subtitle1" gutterBottom>
        🔹 Notes:
      </Typography>
      <List dense>
        <ListItem>
          <ListItemText primary="When you change the academic year, all passes from the previous year will automatically be marked as expired." />
        </ListItem>
        <ListItem>
          <ListItemText primary="This is handled securely in Cloud Functions (not on client)." />
        </ListItem>
      </List>
    </Container>
  );
}
