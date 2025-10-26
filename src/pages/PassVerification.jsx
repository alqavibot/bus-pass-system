// src/pages/PassVerification.jsx
import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  Chip,
  Avatar,
  Divider,
  Alert,
  CircularProgress,
} from "@mui/material";

export default function PassVerification() {
  const { studentId } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  
  const [passData, setPassData] = useState(null);
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentAcademicYear, setCurrentAcademicYear] = useState(null);

  useEffect(() => {
    const verifyPass = async () => {
      if (!studentId || !token) {
        setError("Invalid verification link");
        setLoading(false);
        return;
      }

      try {
        // Get current academic year
        const settingsSnap = await getDoc(doc(db, "settings", "global"));
        const currentYear = settingsSnap.exists() ? settingsSnap.data().currentAcademicYear : null;
        setCurrentAcademicYear(currentYear);

        // Get student data
        const studentSnap = await getDoc(doc(db, "users", studentId));
        if (studentSnap.exists()) {
          setStudentData(studentSnap.data());
        }

        // Get pass data
        const passSnap = await getDoc(doc(db, "passes", studentId));
        
        if (!passSnap.exists()) {
          setError("Pass not found");
          setLoading(false);
          return;
        }

        const pass = passSnap.data();
        
        // Verify token matches
        if (pass.passToken !== token) {
          setError("Invalid pass token");
          setLoading(false);
          return;
        }

        // Check if pass is expired due to academic year change
        if (pass.status === "expired" && pass.expiredReason === "academicYearChange") {
          setError("Pass expired due to academic year change");
          setLoading(false);
          return;
        }

        // Check if pass is for current academic year
        if (pass.academicYear !== currentYear) {
          setError("Pass is not valid for current academic year");
          setLoading(false);
          return;
        }

        // Check if pass is active
        if (pass.status !== "active") {
          setError("Pass is not active");
          setLoading(false);
          return;
        }

        setPassData(pass);
      } catch (err) {
        console.error("Verification error:", err);
        setError("Verification failed");
      } finally {
        setLoading(false);
      }
    };

    verifyPass();
  }, [studentId, token]);

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8, textAlign: "center" }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Verifying Pass...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography variant="h6">❌ Pass Verification Failed</Typography>
          <Typography>{error}</Typography>
        </Alert>
        <Typography variant="body2" color="text.secondary">
          This pass is not valid. Please contact the admin if you believe this is an error.
        </Typography>
      </Container>
    );
  }

  if (!passData) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Alert severity="warning">
          No pass data found
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Card elevation={3}>
        <CardContent>
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <Typography variant="h4" color="success.main" gutterBottom>
              ✅ VALID PASS
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Bus Pass Verification Successful
            </Typography>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* Student Info */}
          <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
            <Avatar
              sx={{ width: 80, height: 80, mr: 2 }}
              src={studentData?.profilePhotoUrl || "/logo.png"}
            />
            <Box>
              <Typography variant="h6" fontWeight="bold">
                {studentData?.name || passData.studentName || "Student"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Hall Ticket: {studentData?.hallTicket || passData.hallTicket || "N/A"}
              </Typography>
              {studentData?.branch && (
                <Typography variant="body2" color="text.secondary">
                  Branch: {studentData.branch}
                </Typography>
              )}
              {studentData?.year && studentData?.section && (
                <Typography variant="body2" color="text.secondary">
                  Year & Section: {studentData.year} - {studentData.section}
                </Typography>
              )}
            </Box>
          </Box>

          {/* Pass Details */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Pass Details
            </Typography>
            
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
              <Typography variant="body2">Bus Number:</Typography>
              <Typography variant="body2" fontWeight="bold">
                {passData.busNumber || "N/A"}
              </Typography>
            </Box>
            
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
              <Typography variant="body2">Stage:</Typography>
              <Typography variant="body2" fontWeight="bold">
                {passData.stage || "N/A"}
              </Typography>
            </Box>
            
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
              <Typography variant="body2">Academic Year:</Typography>
              <Typography variant="body2" fontWeight="bold">
                {passData.academicYear || "N/A"}
              </Typography>
            </Box>
            
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
              <Typography variant="body2">Payment Status:</Typography>
              <Chip
                label={passData.passStatus || "Unknown"}
                color={passData.passStatus === "NO DUE" ? "success" : passData.passStatus === "DUE" ? "warning" : "default"}
                size="small"
              />
            </Box>

            {passData.dueAmount && passData.dueAmount > 0 && (
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography variant="body2">Due Amount:</Typography>
                <Typography variant="body2" color="error" fontWeight="bold">
                  ₹{passData.dueAmount}
                </Typography>
              </Box>
            )}
            
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
              <Typography variant="body2">Issued On:</Typography>
              <Typography variant="body2">
                {passData.issuedAt ? (
                  passData.issuedAt.toDate ? 
                    passData.issuedAt.toDate().toLocaleDateString() : 
                    new Date(passData.issuedAt).toLocaleDateString()
                ) : "N/A"}
              </Typography>
            </Box>
          </Box>

          {/* Verification Info */}
          <Box sx={{ p: 2, bgcolor: "success.light", borderRadius: 1 }}>
            <Typography variant="body2" color="success.dark" textAlign="center">
              <strong>✓ This pass is valid for the current academic year</strong>
            </Typography>
            <Typography variant="caption" color="success.dark" textAlign="center" display="block">
              Verified on {new Date().toLocaleString()}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}

