// src/pages/MyPass.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { Container, Typography, Box, Alert, Button } from "@mui/material";
import { Autorenew as RenewIcon } from "@mui/icons-material";
import PassCard from "../components/PassCard";
import { useNavigate } from "react-router-dom";

export default function MyPass() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    
    async function loadPassData() {
      setLoading(true);
      try {
        // First get user profile data
        const userSnap = await getDoc(doc(db, "users", currentUser.uid));
        const userData = userSnap.exists() ? userSnap.data() : {};

        // Then get pass data
        const passSnap = await getDoc(doc(db, "passes", currentUser.uid));
        const passData = passSnap.exists() ? passSnap.data() : {};

        // Get current academic year for validation
        const settingsSnap = await getDoc(doc(db, "settings", "global"));
        const currentAcademicYear = settingsSnap.exists() ? settingsSnap.data().currentAcademicYear : null;

        // Combine user profile with pass data
        setProfile({
          ...userData,
          ...passData,
          // Ensure we have the required fields for PassCard
          name: userData.name || passData.studentName,
          hallticket: userData.hallTicket,
          classSection: userData.section,
          busNumber: passData.busNumber,
          stageName: passData.stage,
          academicYear: passData.academicYear,
          passToken: passData.passToken,
          passStatus: passData.passStatus,
          dueAmount: passData.dueAmount,
          lastPaymentAmount: passData.lastPaymentAmount,
          lastPaymentDate: passData.lastPaymentDate,
          currentAcademicYear: currentAcademicYear,
          isExpired: passData.status === "expired",
          expiredReason: passData.expiredReason,
        });
      } catch (err) {
        console.error("Failed to load pass data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadPassData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.uid]);

  if (!currentUser) return <Navigate to="/login" />;

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

      {!loading && profile && profile.isExpired && (
        <Box sx={{ mt: 2, mb: 2 }}>
          <Alert severity="warning">
            <Typography variant="h6" gutterBottom>
              ⚠️ Pass Expired
            </Typography>
            <Typography>
              {profile.expiredReason === "academicYearChange" 
                ? "Your pass has expired due to academic year change. Please renew your pass for the current academic year."
                : "Your pass has expired. Please contact admin for assistance."
              }
            </Typography>
            {profile.expiredReason === "academicYearChange" && (
              <>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Current Academic Year: <strong>{profile.currentAcademicYear}</strong>
                </Typography>
                <Button
                  variant="contained"
                  color="warning"
                  startIcon={<RenewIcon />}
                  sx={{ mt: 2 }}
                  onClick={() => navigate("/renew-pass")}
                >
                  Renew Pass
                </Button>
              </>
            )}
          </Alert>
        </Box>
      )}

      {!loading && profile && profile.academicYear && profile.currentAcademicYear && profile.academicYear !== profile.currentAcademicYear && !profile.isExpired && (
        <Box sx={{ mt: 2, mb: 2 }}>
          <Alert severity="info">
            <Typography variant="h6" gutterBottom>
              ℹ️ Academic Year Mismatch
            </Typography>
            <Typography>
              Your pass is for academic year <strong>{profile.academicYear}</strong>, but the current academic year is <strong>{profile.currentAcademicYear}</strong>. 
              Please renew your pass for the current academic year.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<RenewIcon />}
              sx={{ mt: 2 }}
              onClick={() => navigate("/renew-pass")}
            >
              Renew Pass
            </Button>
          </Alert>
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
