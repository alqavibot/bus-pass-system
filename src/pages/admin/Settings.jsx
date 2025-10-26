// src/pages/admin/Settings.jsx
import React, { useEffect, useState } from "react";
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
import { db } from "../../firebase/config";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  updateDoc,
  query,
  where,
  writeBatch,
  serverTimestamp,
} from "firebase/firestore";
import { auth } from "../../firebase/config";

export default function Settings() {
  const [year, setYear] = useState("");
  const [currentYear, setCurrentYear] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Load current academic year
  useEffect(() => {
    const fetchYear = async () => {
      const snap = await getDoc(doc(db, "settings", "global"));
      if (snap.exists()) {
        setCurrentYear(snap.data().currentAcademicYear || "Not Set");
      }
    };
    fetchYear();
  }, []);

  // ✅ Update academic year directly in Firestore (Free Plan)
  const handleUpdate = async () => {
    if (!year) return alert("Enter a valid year (e.g., 2025-2026)");
    setLoading(true);

    try {
      // Get current academic year
      const settingsRef = doc(db, "settings", "global");
      const settingsSnap = await getDoc(settingsRef);
      
      console.log("Settings document exists:", settingsSnap.exists);
      console.log("Settings data:", settingsSnap.data());
      
      const prevYear = settingsSnap.exists && settingsSnap.data() ? settingsSnap.data().currentAcademicYear : null;

      // 1️⃣ Update the new academic year (create document if it doesn't exist)
      const updateData = {
        currentAcademicYear: year,
        previousAcademicYear: prevYear || null,
        updatedAt: serverTimestamp(),
        updatedBy: auth.currentUser?.uid || "admin",
      };

      // Only add createdAt if document doesn't exist
      if (!settingsSnap.exists) {
        updateData.createdAt = serverTimestamp();
      }

      await setDoc(settingsRef, updateData, { merge: true });

      // 2️⃣ Expire all passes from previous year (if different)
      let expiredCount = 0;
      if (prevYear && prevYear !== year) {
        const passesQuery = query(
          collection(db, "passes"),
          where("academicYear", "==", prevYear),
          where("status", "in", ["active", "due"])
        );
        
        const passesSnap = await getDocs(passesQuery);
        expiredCount = passesSnap.size;
        
        if (!passesSnap.empty) {
          // Use batch to update multiple documents
          const batch = writeBatch(db);
          
          passesSnap.forEach((passDoc) => {
            batch.update(passDoc.ref, {
              status: "expired",
              expiredAt: serverTimestamp(),
              expiredReason: "academicYearChange",
            });
          });
          
          await batch.commit();
        }
      }

      setCurrentYear(year);
      setYear("");
      alert(`✅ Academic year updated to ${year}${expiredCount > 0 ? ` and ${expiredCount} passes from ${prevYear} expired` : ''}`);
    } catch (err) {
      console.error(err);
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
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
        <Button
          variant="contained"
          onClick={handleUpdate}
          disabled={loading}
        >
          {loading ? "Updating..." : "Update"}
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
          <ListItemText primary="Students will need to pay again to receive a new pass for the new academic year." />
        </ListItem>
      </List>
    </Container>
  );
}
