import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import { db } from "../../firebase/config";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
} from "firebase/firestore";

export default function Settings() {
  const [year, setYear] = useState("");
  const [currentYear, setCurrentYear] = useState("");

  // Load current academic year
  useEffect(() => {
    const fetchYear = async () => {
      const docRef = doc(db, "settings", "academicYear");
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        setCurrentYear(snap.data().year);
      }
    };
    fetchYear();
  }, []);

  // Update Academic Year
  const handleUpdate = async () => {
    if (!year) return alert("Please enter a valid academic year");

    // Step 1: Update settings
    const docRef = doc(db, "settings", "academicYear");
    await setDoc(docRef, { year }, { merge: true });

    // Step 2: Expire all passes of previous year
    if (currentYear && currentYear !== year) {
      const passesSnap = await getDocs(collection(db, "passes"));
      const updates = passesSnap.docs.map(async (d) => {
        const pass = d.data();
        if (pass.academicYear === currentYear) {
          await updateDoc(doc(db, "passes", d.id), { status: "expired" });
        }
      });
      await Promise.all(updates);
    }

    setCurrentYear(year);
    setYear("");
    alert("Academic Year updated successfully!");
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
          <ListItemText primary="When you change the academic year, all passes from the previous year will automatically be marked as expired." />
        </ListItem>
        <ListItem>
          <ListItemText primary="Make sure to set this once at the beginning of every academic cycle." />
        </ListItem>
      </List>
    </Container>
  );
}
