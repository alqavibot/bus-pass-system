// src/pages/student/StudentDashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import {
  doc,
  getDoc,
  onSnapshot,
  collection,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { Container, Typography, Card, CardContent, Button, Grid, Box, Chip, LinearProgress, Alert, Dialog, DialogTitle, DialogContent, IconButton } from "@mui/material";
import { Receipt as ReceiptIcon, Close as CloseIcon } from "@mui/icons-material";

import { auth, db } from "../../firebase/config";
import { useAuth } from "../../context/AuthContext";
import PaymentReceipt from "../../components/PaymentReceipt";

export default function StudentDashboard() {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [payments, setPayments] = useState([]);
  const [pass, setPass] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const navigate = useNavigate();

  // ✅ Real-time Profile Updates
  useEffect(() => {
    if (!currentUser) return;
    const unsub = onSnapshot(
      doc(db, "users", currentUser.uid), 
      (docSnap) => {
        if (docSnap.exists()) setProfile(docSnap.data());
      },
      (error) => {
        console.error("Profile listener error:", error);
      }
    );
    return () => unsub();
  }, [currentUser]);

  // ✅ Real-time Payment History
  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, "payments"),
      where("studentId", "==", currentUser.uid),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(
      q, 
      (snap) => {
        const arr = [];
        snap.forEach((d) => arr.push(d.data()));
        setPayments(arr);
      },
      (error) => {
        console.error("Payment history listener error:", error);
        setPayments([]);
      }
    );

    return () => unsub();
  }, [currentUser]);

  // ✅ Real-time Bus Pass Updates with Academic Year Check
  useEffect(() => {
    if (!currentUser) return;
    
    const fetchPassWithAcademicYear = async () => {
      // Get current academic year
      const settingsSnap = await getDoc(doc(db, "settings", "global"));
      const currentAcademicYear = settingsSnap.exists() ? settingsSnap.data().currentAcademicYear : null;
      
      // Listen to pass changes
      const unsub = onSnapshot(
        doc(db, "passes", currentUser.uid), 
        (docSnap) => {
          if (docSnap.exists()) {
            const passData = docSnap.data();
            // Add current academic year for comparison
            setPass({
              ...passData,
              currentAcademicYear: currentAcademicYear
            });
          } else {
            setPass(null);
          }
        },
        (error) => {
          console.error("Pass listener error:", error);
          setPass(null);
        }
      );
      return unsub;
    };
    
    const unsubscribe = fetchPassWithAcademicYear();
    return () => {
      unsubscribe.then(unsub => unsub && unsub());
    };
  }, [currentUser]);

  // ✅ Logout
  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Student Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage your profile, payments, and bus pass
        </Typography>
      </Box>

      {/* Profile Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Profile</Typography>
          {profile ? (
            <>
              <Typography>Name: {profile.name}</Typography>
              <Typography>Hall Ticket: {profile.hallTicket}</Typography>
              <Typography>Branch: {profile.branch || profile.section}</Typography>
              <Typography>Year: {profile.year}</Typography>
              <Button
                variant="outlined"
                sx={{ mt: 2 }}
                onClick={() => navigate("/profile")}
              >
                Edit Profile
              </Button>
            </>
          ) : (
            <Typography color="text.secondary">
              No profile data found.
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Bus Info Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Bus Information</Typography>
          {profile || pass ? (
            <>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Bus Number:</strong> {pass?.busNumber || profile?.busNumber || "Not assigned"}
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  <strong>Stage:</strong> {pass?.stage || profile?.stage || "N/A"}
                </Typography>
                
                {/* Calculate and display fee based on payments */}
                {(() => {
                  // Get current academic year payments
                  const currentYearPayments = payments.filter(
                    p => p.status === "success" && p.academicYear === (pass?.academicYear || profile?.academicYear)
                  );
                  
                  // Calculate total paid (ensure numbers, not strings)
                  const totalPaid = currentYearPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
                  
                  // Check if there's a due amount
                  const dueAmount = Number(pass?.dueAmount) || 0;
                  
                  if (totalPaid > 0) {
                    if (dueAmount > 0) {
                      return (
                        <Box>
                          <Typography variant="body1">
                            <strong>Paid:</strong> ₹{totalPaid} | <strong style={{ color: '#ed6c02' }}>Due:</strong> ₹{dueAmount}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Installment payment - Total: ₹{totalPaid + dueAmount}
                          </Typography>
                        </Box>
                      );
                    } else {
                      return (
                        <Box>
                          <Typography variant="body1">
                            <strong>Total Paid:</strong> ₹{totalPaid}
                          </Typography>
                          <Typography variant="caption" color="success.main" display="block" sx={{ mt: 0.5 }}>
                            ✓ All fees cleared
                          </Typography>
                        </Box>
                      );
                    }
                  } else {
                    return (
                      <Typography variant="body1">
                        <strong>Fee:</strong> N/A
                      </Typography>
                    );
                  }
                })()}
              </Box>
              
              <Button
                variant="contained"
                fullWidth
                sx={{ mt: 2 }}
                onClick={() => navigate("/student/payment")}
              >
                Make Payment
              </Button>
            </>
          ) : (
            <Typography color="text.secondary">No bus data found. Please make a payment to select your bus and stage.</Typography>
          )}
        </CardContent>
      </Card>

      {/* Payment Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Payment History</Typography>
          {payments.length > 0 ? (
            payments.map((p, idx) => (
              <Card key={idx} sx={{ mb: 2, p: 2, bgcolor: p.status === "success" ? "#e8f5e8" : p.status === "processing" ? "#fff3cd" : p.status === "failed" ? "#f8d7da" : "#f9f9f9" }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                  <Typography variant="h6">₹{p.amount}</Typography>
                  <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                    <Chip 
                      size="small" 
                      label={p.status.toUpperCase()} 
                      color={p.status === "success" ? "success" : p.status === "processing" ? "warning" : p.status === "pending" ? "info" : "error"} 
                    />
                    {p.status === "success" && (
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={() => {
                          setSelectedPayment(p);
                          setReceiptOpen(true);
                        }}
                        title="View Receipt"
                      >
                        <ReceiptIcon />
                      </IconButton>
                    )}
                  </Box>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Mode: {p.mode} | {p.paymentMode === "TOTAL" ? "Total Payment" : 
                    p.installmentType === "FIRST_SEM" ? "First Semester" : "Second Semester"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Date: {(p.paidAt || p.createdAt)?.toDate().toLocaleString()}
                </Typography>
                {p.status === "processing" && (
                  <Box sx={{ mt: 1 }}>
                    <LinearProgress size="small" />
                    <Typography variant="caption" color="warning.main">
                      Processing payment...
                    </Typography>
                  </Box>
                )}
              </Card>
            ))
          ) : (
            <Typography color="text.secondary">
              No payment records found.
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Pass Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>My Bus Pass</Typography>
          {pass ? (
            <>
              <Typography gutterBottom>Pass ID: {pass.passId}</Typography>
              
              {/* Check for academic year mismatch */}
              {(() => {
                const isExpired = pass.status === "expired";
                const isYearMismatch = pass.academicYear && pass.currentAcademicYear && 
                                      pass.academicYear !== pass.currentAcademicYear;
                const actualStatus = isExpired ? "EXPIRED" : 
                                    isYearMismatch ? "INVALID" : 
                                    pass.status ? pass.status.toUpperCase() : "ACTIVE";
                const statusColor = (isExpired || isYearMismatch) ? "error" : 
                                   pass.status === "active" ? "success" : "warning";
                
                return (
                  <>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                      <Typography>Pass Status:</Typography>
                      <Chip 
                        size="small" 
                        label={actualStatus} 
                        color={statusColor} 
                      />
                    </Box>
                    
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                      <Typography>Payment Status:</Typography>
                      <Chip 
                        size="small" 
                        label={pass.passStatus || "Unknown"} 
                        color={pass.passStatus === "NO DUE" ? "success" : pass.passStatus === "DUE" ? "warning" : "default"} 
                      />
                    </Box>
                    
                    {pass.dueAmount !== undefined && pass.dueAmount !== null && (
                      pass.dueAmount > 0 ? (
                        <Alert severity="warning" sx={{ mb: 1, mt: 1 }}>
                          <strong>Due Amount: ₹{pass.dueAmount}</strong>
                          <br />
                          <small>Please complete your payment to clear dues</small>
                        </Alert>
                      ) : (
                        <Alert severity="success" sx={{ mb: 1, mt: 1 }}>
                          <strong>Due Amount: ₹0 (No Dues)</strong> - All fees paid!
                        </Alert>
                      )
                    )}
                    
                    {isExpired && (
                      <Alert severity="error" sx={{ mb: 1, mt: 1 }}>
                        <strong>Pass Expired!</strong> {pass.expiredReason === "academicYearChange" ? "Academic year changed." : ""} Please get a new pass.
                      </Alert>
                    )}
                    
                    {isYearMismatch && !isExpired && (
                      <Alert severity="error" sx={{ mb: 1, mt: 1 }}>
                        <strong>Pass Invalid!</strong> Your pass is for {pass.academicYear}, but current year is {pass.currentAcademicYear}. Please get a new pass.
                      </Alert>
                    )}
                  </>
                );
              })()}
              
              <Button
                variant="contained"
                sx={{ mt: 2 }}
                onClick={() => navigate("/my-pass")}
              >
                View Pass Details
              </Button>
            </>
          ) : (
            <>
              <Typography color="text.secondary" gutterBottom>
                No active pass found. Please make a payment to get your bus pass.
              </Typography>
              <Button 
                variant="contained" 
                sx={{ mt: 2 }}
                onClick={() => navigate("/student/payment")}
              >
                Get Pass
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Logout */}
      <Grid container justifyContent="flex-end" sx={{ mt: 2 }}>
        <Button variant="contained" color="error" onClick={handleLogout}>
          Logout
        </Button>
      </Grid>

      {/* Payment Receipt Dialog */}
      <Dialog 
        open={receiptOpen} 
        onClose={() => setReceiptOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          Payment Receipt
          <IconButton onClick={() => setReceiptOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedPayment && (
            <PaymentReceipt 
              payment={selectedPayment} 
              student={profile}
              onClose={() => setReceiptOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
}
