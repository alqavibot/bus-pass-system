// src/pages/admin/Settings.jsx
import React, { useEffect, useState } from "react";
import { httpsCallable } from "firebase/functions";
import { functions, db } from "../../firebase/config";
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Divider,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { doc, getDoc } from "firebase/firestore";

export default function Settings() {
  const [year, setYear] = useState("");
  const [currentYear, setCurrentYear] = useState("");

  // ✅ Load current year
  useEffect(() => {
    const fetchYear = async () => {
      const snap = await getDoc(doc(db, "settings", "global"));
      if (snap.exists()) {
        setCurrentYear(snap.data().currentAcademicYear || "Not Set");
      }
    };
    fetchYear();
  }, []);

  // ✅ Update academic year via Cloud Function
  const handleUpdate = async () => {
    if (!year) return alert("Enter a valid year (e.g., 2025-2026)");
    try {
      const setYearFn = httpsCallable(functions, "setAcademicYear");
      const res = await setYearFn({ year });
      alert(res.data.message);
      setCurrentYear(year);
      setYear("");
    } catch (err) {
      console.error(err);
      alert("Error: " + err.message);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        ⚙️ Admin Settings
      </Typography>
      <Divider sx={{ mb: 2 }} />

      {/* Current Year */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="body1">
          <strong>Current Academic Year:</strong> {currentYear}
        </Typography>
      </Box>

      {/* Update Year */}
      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <TextField
          label="New Academic Year"
          placeholder="e.g. 2025-2026"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          fullWidth
        />
        <Button variant="contained" onClick={handleUpdate}>
          Update
        </Button>
      </Box>

      <Typography variant="subtitle1" gutterBottom>
        🔹 Notes:
      </Typography>
      <List dense>
        <ListItem>
          <ListItemText primary="When you change the academic year, all active passes from the previous year will be automatically expired." />
        </ListItem>
        <ListItem>
          <ListItemText primary="Students will need to pay again to receive a new pass for the new year." />
        </ListItem>
      </List>
    </Container>
  );
}
