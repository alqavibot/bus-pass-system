// src/pages/admin/Settings.jsx
import React, { useEffect, useState } from "react";
import { Container, Typography, TextField, Button, Box } from "@mui/material";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase/config";

export default function Settings() {
  const [settings, setSettings] = useState({ academicYear: "", dueDays: 30, lateFeePercent: 2 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      const ref = doc(db, "settings", "app");
      const snap = await getDoc(ref);
      if (snap.exists()) setSettings(prev => ({ ...prev, ...snap.data() }));
    };
    load();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      await setDoc(doc(db, "settings", "app"), { ...settings, updatedAt: serverTimestamp() }, { merge: true });
      alert("Settings saved");
    } catch (err) {
      console.error(err);
      alert("Save failed");
    }
    setLoading(false);
  };

  return (
    <Container>
      <Typography variant="h6" sx={{ mb: 2 }}>Application Settings</Typography>
      <Box sx={{ maxWidth: 480 }}>
        <TextField label="Academic Year" fullWidth value={settings.academicYear} onChange={(e)=>setSettings({...settings, academicYear: e.target.value})} sx={{mb:2}} />
        <TextField label="Due Days" type="number" fullWidth value={settings.dueDays} onChange={(e)=>setSettings({...settings, dueDays: Number(e.target.value)})} sx={{mb:2}} />
        <TextField label="Late Fee % (per period)" type="number" fullWidth value={settings.lateFeePercent} onChange={(e)=>setSettings({...settings, lateFeePercent: Number(e.target.value)})} sx={{mb:2}} />

        <Button variant="contained" onClick={handleSave} disabled={loading}>Save Settings</Button>
      </Box>
    </Container>
  );
}
