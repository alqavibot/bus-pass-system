// src/pages/student/RenewPass.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Alert,
  CircularProgress,
  Chip,
  Divider,
} from "@mui/material";
import {
  Autorenew as RenewIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebase/config";
import { doc, getDoc } from "firebase/firestore";

export default function RenewPass() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [pass, setPass] = useState(null);
  const [currentAcademicYear, setCurrentAcademicYear] = useState(null);
  const [canRenew, setCanRenew] = useState(false);
  const [renewalReason, setRenewalReason] = useState("");

  useEffect(() => {
    loadData();
    // eslint-disable-next-line
  }, [currentUser]);

  const loadData = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      // Get user profile
      const userSnap = await getDoc(doc(db, "users", currentUser.uid));
      const userData = userSnap.exists() ? userSnap.data() : null;
      setProfile(userData);

      // Get pass data
      const passSnap = await getDoc(doc(db, "passes", currentUser.uid));
      const passData = passSnap.exists() ? passSnap.data() : null;
      setPass(passData);

      // Get current academic year
      const settingsSnap = await getDoc(doc(db, "settings", "global"));
      const academicYear = settingsSnap.exists() ? settingsSnap.data().currentAcademicYear : null;
      setCurrentAcademicYear(academicYear);

      // Check renewal eligibility
      if (passData && academicYear) {
        const isExpired = passData.status === "expired";
        const isYearMismatch = passData.academicYear !== academicYear;
        const hasNoDue = passData.passStatus === "NO DUE";

        if (isExpired && passData.expiredReason === "academicYearChange") {
          setCanRenew(true);
          setRenewalReason("Academic year has changed. You need to renew your pass for the new year.");
        } else if (isYearMismatch) {
          setCanRenew(true);
          setRenewalReason("Your pass is for a previous academic year. Renewal required.");
        } else if (!hasNoDue) {
          setCanRenew(false);
          setRenewalReason("You have pending dues. Please clear all dues before renewing.");
        } else {
          setCanRenew(false);
          setRenewalReason("Your pass is already valid for the current academic year.");
        }
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRenew = async () => {
    if (!canRenew || !currentUser || !profile) return;
    
    // Check if student has bus and stage assigned from previous payment
    if (!profile.busNumber || !profile.stage) {
      alert("No previous bus/stage information found. Please make a new payment to select your bus and stage.");
      navigate("/student/payment");
      return;
    }

    // Redirect to payment page - student MUST pay for the new academic year
    alert("To renew your pass for the new academic year, please make a payment.");
    navigate("/student/payment");
  };

  if (loading) {
    return (
      <Container sx={{ mt: 4, textAlign: "center" }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, display: "flex", alignItems: "center", gap: 1 }}>
        <RenewIcon fontSize="large" color="primary" />
        Pass Renewal
      </Typography>

      {/* Current Pass Status */}
      <Card sx={{ mb: 3, mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight={600}>
            Current Pass Status
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          {pass ? (
            <Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                <Typography variant="body2">Academic Year:</Typography>
                <Chip 
                  label={pass.academicYear || "-"} 
                  size="small"
                  color={pass.academicYear === currentAcademicYear ? "success" : "warning"}
                />
              </Box>
              
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                <Typography variant="body2">Current Academic Year:</Typography>
                <Chip label={currentAcademicYear || "-"} size="small" color="primary" />
              </Box>

              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                <Typography variant="body2">Pass Status:</Typography>
                <Chip 
                  label={pass.status?.toUpperCase() || "UNKNOWN"} 
                  size="small"
                  color={pass.status === "active" ? "success" : "error"}
                />
              </Box>

              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                <Typography variant="body2">Payment Status:</Typography>
                <Chip 
                  label={pass.passStatus || "UNKNOWN"} 
                  size="small"
                  color={pass.passStatus === "NO DUE" ? "success" : "warning"}
                />
              </Box>
            </Box>
          ) : (
            <Alert severity="info">No pass found. Please make a payment first.</Alert>
          )}
        </CardContent>
      </Card>

      {/* Renewal Information */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight={600}>
            Renewal Eligibility
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          {canRenew ? (
            <Alert severity="warning" icon={<WarningIcon />} sx={{ mb: 2 }}>
              <Typography variant="body2" fontWeight={600}>
                {renewalReason}
              </Typography>
            </Alert>
          ) : (
            <Alert severity={pass?.status === "active" ? "success" : "error"} 
                   icon={pass?.status === "active" ? <CheckIcon /> : <WarningIcon />}>
              <Typography variant="body2" fontWeight={600}>
                {renewalReason}
              </Typography>
            </Alert>
          )}

          {canRenew && (
            <Box sx={{ mt: 3 }}>
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2" fontWeight={600} gutterBottom>
                  📋 Renewal Process:
                </Typography>
                <Typography variant="body2" component="div">
                  1. Click "Renew Pass" button below<br/>
                  2. You will be redirected to payment page<br/>
                  3. <strong>Make payment for the new academic year</strong><br/>
                  4. Your pass will be activated after successful payment
                </Typography>
              </Alert>
              <Alert severity="warning">
                <Typography variant="body2">
                  <strong>⚠️ Important:</strong> Payment is mandatory to renew your pass. 
                  You cannot use an expired pass without making payment for the current academic year.
                </Typography>
              </Alert>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
        <Button
          variant="outlined"
          onClick={() => navigate("/student-dashboard")}
        >
          Back to Dashboard
        </Button>
        
        {canRenew && (
          <Button
            variant="contained"
            color="primary"
            size="large"
            startIcon={<RenewIcon />}
            onClick={handleRenew}
          >
            Proceed to Payment
          </Button>
        )}

        {!canRenew && pass?.passStatus !== "NO DUE" && (
          <Button
            variant="contained"
            color="warning"
            onClick={() => navigate("/payment-options")}
          >
            Clear Dues
          </Button>
        )}
      </Box>
    </Container>
  );
}

