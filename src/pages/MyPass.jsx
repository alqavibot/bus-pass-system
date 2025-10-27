// src/pages/MyPass.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { Container, Typography, Box, Alert, Button, LinearProgress } from "@mui/material";
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
        console.log("User Data:", userData);

        // Then get pass data
        const passSnap = await getDoc(doc(db, "passes", currentUser.uid));
        const passData = passSnap.exists() ? passSnap.data() : {};
        console.log("Pass Data:", passData);
        console.log("Pass Exists:", passSnap.exists());

        // Get current academic year for validation
        const settingsSnap = await getDoc(doc(db, "settings", "global"));
        const currentAcademicYear = settingsSnap.exists() ? settingsSnap.data().currentAcademicYear : null;

        // If pass doesn't exist, don't set profile
        if (!passSnap.exists()) {
          console.log("No pass found for user");
          setProfile(null);
          return;
        }

        // Combine user profile with pass data
        const combinedProfile = {
          uid: currentUser.uid,
          ...userData,
          ...passData,
          // Ensure we have the required fields for PassCard
          name: userData.name || passData.studentName,
          hallticket: userData.hallTicket,
          classSection: userData.section || userData.year,
          busNumber: passData.busNumber || userData.busNumber,
          stageName: passData.stage || userData.stage,
          academicYear: passData.academicYear,
          passToken: passData.passToken,
          passStatus: passData.passStatus,
          dueAmount: passData.dueAmount,
          lastPaymentAmount: passData.lastPaymentAmount,
          lastPaymentDate: passData.lastPaymentDate,
          currentAcademicYear: currentAcademicYear,
          isExpired: passData.status === "expired",
          expiredReason: passData.expiredReason,
        };
        
        console.log("Combined Profile:", combinedProfile);
        setProfile(combinedProfile);
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

  console.log("MyPass render - loading:", loading, "profile:", profile);

  return (
    <Container maxWidth="xl" sx={{ py: 3, px: { xs: 2, sm: 3, md: 4 }, minHeight: '80vh' }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        🎫 My Bus Pass
      </Typography>

      {loading && (
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="h6">Loading your pass...</Typography>
          <LinearProgress sx={{ mt: 2 }} />
        </Box>
      )}

      {!loading && (!profile || !profile.passToken) && (
        <Box sx={{ mt: 2 }}>
          <Alert severity="info">
            <Typography>
              You do not have an issued pass yet. Make sure you have completed payment and the admin/system has issued your pass.
            </Typography>
            <Button
              variant="contained"
              sx={{ mt: 2 }}
              onClick={() => navigate("/student/payment")}
            >
              Make Payment
            </Button>
          </Alert>
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

      {!loading && profile && profile.passToken && (
        <Box sx={{ mt: 2 }}>
          <PassCard profile={profile} />
        </Box>
      )}

      {!loading && profile && !profile.passToken && (
        <Box sx={{ mt: 2 }}>
          <Alert severity="warning">
            <Typography variant="h6" gutterBottom>
              ⚠️ Pass Token Missing
            </Typography>
            <Typography>
              Your pass exists but is missing a token. This might be a data issue. Please contact admin or try making a payment again.
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              <strong>Debug Info:</strong><br />
              Pass Status: {profile.passStatus || "N/A"}<br />
              Academic Year: {profile.academicYear || "N/A"}<br />
              Bus: {profile.busNumber || "N/A"}<br />
              Stage: {profile.stageName || "N/A"}
            </Typography>
          </Alert>
        </Box>
      )}
    </Container>
  );
}
