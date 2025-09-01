// src/pages/MyPass.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { Container, Typography, Box } from "@mui/material";
import PassCard from "../components/PassCard";

export default function MyPass() {
  const { user } = useAuth(); // user is profile doc from AuthContext
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  if (!user) return <Navigate to="/login" />;

  useEffect(() => {
    async function loadFullProfile() {
      setLoading(true);
      try {
        // start with the AuthContext profile
        const base = user || {};
        // Ensure we have latest data from Firestore (in case context is stale)
        const snap = await getDoc(doc(db, "users", base.uid));
        const data = snap.exists() ? snap.data() : base;

        // If user has busId, stageId, try to resolve friendly names
        let busNumber = data.busNumber;
        let stageName = data.stageName;

        if (!busNumber && data.busId) {
          const busSnap = await getDoc(doc(db, "buses", data.busId));
          if (busSnap.exists()) {
            const busData = busSnap.data();
            busNumber = busData.busNumber || busSnap.id;
            // find stage by id
            if (data.stageId && Array.isArray(busData.stages)) {
              const s = busData.stages.find(st => st.id === data.stageId || st.stageName === data.stageId);
              if (s) stageName = s.stageName || s.location || s.id;
            }
          }
        }

        setProfile({
          ...data,
          busNumber,
          stageName,
        });
      } catch (err) {
        console.error("Failed to load pass profile:", err);
      } finally {
        setLoading(false);
      }
    }
    loadFullProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        My Bus Pass
      </Typography>

      {loading && <Typography>Loading...</Typography>}

      {!loading && (!profile || !profile.passToken) && (
        <Box sx={{ mt: 2 }}>
          <Typography>
            You do not have an issued pass yet. Make sure you have completed payment and the admin/system has issued your pass.
          </Typography>
        </Box>
      )}

      {!loading && profile && (
        <Box sx={{ mt: 2 }}>
          <PassCard profile={profile} />
        </Box>
      )}
    </Container>
  );
}
