// src/pages/student/PaymentOptions.jsx
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { 
  Container, 
  Typography, 
  TextField, 
  MenuItem, 
  Button, 
  Box, 
  Card, 
  CardContent, 
  Divider, 
  Alert,
  LinearProgress,
  Snackbar,
  CircularProgress,
  Stepper,
  Step,
  StepLabel
} from "@mui/material";
import { db } from "../../firebase/config";
import { doc, setDoc, getDoc, serverTimestamp, collection, query, where, orderBy, onSnapshot, getDocs } from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";
import { generatePassToken } from "../../services/passGenerator";

// Helper function to generate receipt number
// Uses a counter document that gets incremented atomically
const generateReceiptNumber = async (academicYear, studentId) => {
  try {
    // Use a counter document for the academic year
    const counterRef = doc(db, "receiptCounters", academicYear);
    
    // Try to get current counter value
    const counterSnap = await getDoc(counterRef);
    
    if (counterSnap.exists()) {
      const currentCount = counterSnap.data().count || 0;
      // Return next number (will be incremented when admin creates counter)
      // For students, use timestamp-based unique number
      const timestamp = Date.now();
      const uniqueNumber = parseInt(timestamp.toString().slice(-6)); // Last 6 digits
      return uniqueNumber;
    } else {
      // First receipt - use timestamp-based number
      const timestamp = Date.now();
      const uniqueNumber = parseInt(timestamp.toString().slice(-6));
      return uniqueNumber;
    }
  } catch (error) {
    console.error("Error generating receipt number:", error);
    // Fallback: Use timestamp-based unique number
    const timestamp = Date.now();
    const uniqueNumber = parseInt(timestamp.toString().slice(-6));
    return uniqueNumber;
  }
};

export default function PaymentOptions() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { bus, stage } = location.state || {}; // ✅ Passed from StudentPayments

  const [mode, setMode] = useState(""); // UPI, Card, Netbanking
  const [paymentMode, setPaymentMode] = useState(""); // TOTAL, INSTALLMENT
  const [installmentType, setInstallmentType] = useState(""); // FIRST_SEM, SECOND_SEM
  const [loading, setLoading] = useState(false);
  const [academicYear, setAcademicYear] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [firstInstallmentPaid, setFirstInstallmentPaid] = useState(false);
  
  // Payment tracking states
  const [paymentStep, setPaymentStep] = useState(0);
  const [paymentStatus, setPaymentStatus] = useState(""); // pending, processing, success, failed
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("info");
  const [currentPaymentId, setCurrentPaymentId] = useState(null);

  // ✅ Load academic year from Firestore
  useEffect(() => {
    const fetchYear = async () => {
      const settingsRef = doc(db, "settings", "global");
      const snap = await getDoc(settingsRef);
      if (snap.exists()) {
        setAcademicYear(snap.data().currentAcademicYear);
      }
    };
    fetchYear();
  }, []);

  // ✅ Load payment history to check installment eligibility
  useEffect(() => {
    if (!currentUser || !stage || !academicYear) return;

    const q = query(
      collection(db, "payments"),
      where("studentId", "==", currentUser.uid),
      where("stageId", "==", stage.id),
      where("status", "==", "success"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const payments = [];
      let hasFirstInstallment = false;

      snapshot.forEach((doc) => {
        const payment = doc.data();
        payments.push(payment);
        
        // Check if first installment was paid for CURRENT academic year
        if (payment.academicYear === academicYear && 
            payment.paymentMode === "INSTALLMENT" && 
            payment.installmentType === "FIRST_SEM") {
          hasFirstInstallment = true;
        }
      });

      setPaymentHistory(payments);
      setFirstInstallmentPaid(hasFirstInstallment);
    });

    return () => unsubscribe();
  }, [currentUser, stage, academicYear]);

  // ✅ Real-time payment status tracking
  useEffect(() => {
    if (!currentPaymentId || !loading) return; // Only track during active payment

    const paymentRef = doc(db, "payments", currentPaymentId);
    const unsubscribe = onSnapshot(
      paymentRef, 
      (doc) => {
        if (doc.exists()) {
          const payment = doc.data();
          
          // Only track if it's the current user's payment
          if (payment.studentId !== currentUser?.uid) return;
          
          setPaymentStatus(payment.status);
          
          if (payment.status === "success") {
            setPaymentStep(3);
            setSnackbarMessage("✅ Payment successful! Pass issued.");
            setSnackbarSeverity("success");
            setSnackbarOpen(true);
            
            // Navigate to dashboard after 2 seconds
            setTimeout(() => {
              navigate("/student/dashboard");
            }, 2000);
          } else if (payment.status === "failed") {
            setPaymentStep(0);
            setSnackbarMessage("❌ Payment failed. Please try again.");
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
            setLoading(false);
          }
        }
      },
      (error) => {
        console.error("Payment listener error:", error);
        // Only show error if we're actually processing a payment
        if (loading) {
          setSnackbarMessage("Error tracking payment status");
          setSnackbarSeverity("error");
          setSnackbarOpen(true);
          setLoading(false);
        }
      }
    );

    return () => unsubscribe();
  }, [currentPaymentId, navigate, loading, currentUser]);

  if (!bus || !stage) {
    return (
      <Container maxWidth="sm" sx={{ mt: 5 }}>
        <Typography color="error">
          Invalid payment request. Please go back and select bus & stage again.
        </Typography>
        <Button onClick={() => navigate("/payment")} sx={{ mt: 2 }}>
          Back
        </Button>
      </Container>
    );
  }

  const handleProceed = async () => {
    if (!mode || !paymentMode) {
      setSnackbarMessage("Please select payment mode and type");
      setSnackbarSeverity("warning");
      setSnackbarOpen(true);
      return;
    }
    if (paymentMode === "INSTALLMENT" && !installmentType) {
      setSnackbarMessage("Please select installment type");
      setSnackbarSeverity("warning");
      setSnackbarOpen(true);
      return;
    }
    if (!academicYear) {
      setSnackbarMessage("Academic Year not set. Contact Admin.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }
    
    // ✅ CHECK FOR DUPLICATE PAYMENTS FOR CURRENT ACADEMIC YEAR
    const currentYearPayments = paymentHistory.filter(p => p.academicYear === academicYear);
    
    // Check if already paid TOTAL for this academic year
    const hasTotalPayment = currentYearPayments.some(p => p.paymentMode === "TOTAL");
    if (hasTotalPayment) {
      setSnackbarMessage("❌ You have already paid the full amount for this academic year. No further payment needed!");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }
    
    // Check if trying to pay TOTAL when installments already started
    if (paymentMode === "TOTAL" && firstInstallmentPaid) {
      setSnackbarMessage("❌ You have already paid the first installment. Please complete the second installment payment instead.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }
    
    // Check if first installment already paid for this year
    if (paymentMode === "INSTALLMENT" && installmentType === "FIRST_SEM" && firstInstallmentPaid) {
      setSnackbarMessage("❌ You have already paid the first semester installment for this academic year!");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }
    
    // Check if second installment already paid for this year
    const hasSecondInstallment = currentYearPayments.some(
      p => p.paymentMode === "INSTALLMENT" && p.installmentType === "SECOND_SEM"
    );
    if (paymentMode === "INSTALLMENT" && installmentType === "SECOND_SEM" && hasSecondInstallment) {
      setSnackbarMessage("❌ You have already paid the second semester installment for this academic year!");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }
    
    // ✅ STRICT RULE: Check if second installment can be paid
    if (paymentMode === "INSTALLMENT" && installmentType === "SECOND_SEM" && !firstInstallmentPaid) {
      setSnackbarMessage("❌ You must pay the First Semester installment before paying the Second Semester installment!");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }
    
    setLoading(true);
    setPaymentStep(1); // Payment initiated

    try {
      // Calculate amount based on payment mode
      let amount, passStatus, dueAmount = 0;
      
      if (paymentMode === "TOTAL") {
        amount = stage.fullFee;
        passStatus = "NO DUE";
      } else if (paymentMode === "INSTALLMENT") {
        if (installmentType === "FIRST_SEM") {
          amount = stage.installment1;
          passStatus = "DUE";
          dueAmount = stage.installment2; // Remaining amount
        } else if (installmentType === "SECOND_SEM") {
          amount = stage.installment2;
          passStatus = "NO DUE";
        }
      }

      const paymentId = `${currentUser.uid}_${Date.now()}`;
      const paymentRef = doc(db, "payments", paymentId);
      setCurrentPaymentId(paymentId);

      // Generate receipt number
      const receiptNumber = await generateReceiptNumber(academicYear, currentUser.uid);

      // 1. Create Pending Payment
      setPaymentStep(2); // Payment processing
      await setDoc(paymentRef, {
        paymentId,
        receiptNumber,
        studentId: currentUser.uid,
        studentName: currentUser.displayName || "Student",
        busId: bus.id,
        busNumber: bus.number,
        stageId: stage.id,
        stageName: stage.name,
        stage: stage.name,
        amount,
        mode,
        paymentMode,
        installmentType: installmentType || null,
        status: "pending",
        academicYear,
        createdAt: serverTimestamp(),
      });

      // 2. ✅ Enhanced Payment Flow with real-time updates
      setTimeout(async () => {
        const success = Math.random() > 0.2; // 80% success simulation
        
        if (success) {
          // Update payment status
          await setDoc(
            paymentRef,
            {
              status: "processing",
              processingAt: serverTimestamp(),
            },
            { merge: true }
          );

          // Simulate processing delay
          setTimeout(async () => {
            await setDoc(
              paymentRef,
              {
                status: "success",
                paidAt: serverTimestamp(),
              },
              { merge: true }
            );

            // Auto Issue Pass with DUE/NO DUE status
            const token = generatePassToken(currentUser.uid);
            await setDoc(doc(db, "passes", currentUser.uid), {
              passId: token,
              passToken: token,
              status: "active",
              passStatus: passStatus,
              dueAmount: dueAmount,
              studentId: currentUser.uid,
              studentName: currentUser.displayName || "Student",
              busNumber: bus.number,
              stage: stage.name,
              academicYear,
              issuedAt: serverTimestamp(),
              lastPaymentAmount: amount,
              lastPaymentDate: new Date(),
            });
          }, 1000);
        } else {
          await setDoc(
            paymentRef,
            {
              status: "failed",
              failedAt: serverTimestamp(),
            },
            { merge: true }
          );
        }
        setLoading(false);
      }, 2000);
    } catch (err) {
      console.error(err);
      alert("Error: " + err.message);
      setLoading(false);
    }
  };

  const steps = [
    "Select Payment Details",
    "Payment Processing", 
    "Verification",
    "Complete"
  ];

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
            Payment Options
          </Typography>
          
          {/* Payment Steps */}
          {paymentStep > 0 && (
            <Box sx={{ mb: 3 }}>
              <Stepper activeStep={paymentStep} alternativeLabel>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Box>
          )}

          {/* Payment Status */}
          {paymentStatus && (
            <Box sx={{ mb: 2 }}>
              {paymentStatus === "pending" && (
                <Alert severity="info">
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    Payment initiated. Please wait...
                  </Box>
                </Alert>
              )}
              {paymentStatus === "processing" && (
                <Alert severity="warning">
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    Processing payment...
                  </Box>
                </Alert>
              )}
              {paymentStatus === "success" && (
                <Alert severity="success">
                  ✅ Payment successful! Redirecting to dashboard...
                </Alert>
              )}
              {paymentStatus === "failed" && (
                <Alert severity="error">
                  ❌ Payment failed. Please try again.
                </Alert>
              )}
            </Box>
          )}

          {/* Payment Status Alert for Current Academic Year */}
          {(() => {
            const currentYearPayments = paymentHistory.filter(p => p.academicYear === academicYear);
            const hasTotalPayment = currentYearPayments.some(p => p.paymentMode === "TOTAL");
            const hasFirstInstallment = currentYearPayments.some(
              p => p.paymentMode === "INSTALLMENT" && p.installmentType === "FIRST_SEM"
            );
            const hasSecondInstallment = currentYearPayments.some(
              p => p.paymentMode === "INSTALLMENT" && p.installmentType === "SECOND_SEM"
            );

            if (hasTotalPayment) {
              return (
                <Alert severity="success" sx={{ mb: 2 }}>
                  ✅ <strong>Payment Complete!</strong> You have already paid the full amount for academic year <strong>{academicYear}</strong>. No further payment needed.
                </Alert>
              );
            } else if (hasSecondInstallment) {
              return (
                <Alert severity="success" sx={{ mb: 2 }}>
                  ✅ <strong>All Installments Paid!</strong> You have completed both installments for academic year <strong>{academicYear}</strong>. No further payment needed.
                </Alert>
              );
            } else if (hasFirstInstallment) {
              return (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  ⚠️ <strong>First Installment Paid.</strong> You have one pending installment remaining for academic year <strong>{academicYear}</strong>.
                </Alert>
              );
            } else {
              return (
                <Alert severity="info" sx={{ mb: 2 }}>
                  Review your selection and choose a secure payment option for academic year <strong>{academicYear}</strong>.
                </Alert>
              );
            }
          })()}
          
          <Box sx={{ mb: 2 }}>
            <Typography><strong>Bus:</strong> {bus.number} (Driver: {bus.driver})</Typography>
            <Typography><strong>Stage:</strong> {stage.name}</Typography>
            <Typography><strong>Academic Year:</strong> {academicYear || "Loading..."}</Typography>
          </Box>

          {/* Payment History for this stage */}
          {paymentHistory.length > 0 && (
            <Box sx={{ mb: 2, p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                📋 Payment History for this Stage:
              </Typography>
              {paymentHistory.map((payment, idx) => (
                <Typography key={idx} variant="body2" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  • <strong>Year {payment.academicYear}:</strong> {payment.paymentMode === "TOTAL" ? "Total Payment" : 
                     payment.installmentType === "FIRST_SEM" ? "First Semester" : "Second Semester"}: 
                  <strong>₹{payment.amount}</strong> - {payment.status.toUpperCase()} 
                  ({payment.paidAt?.toDate().toLocaleDateString() || "Pending"})
                </Typography>
              ))}
            </Box>
          )}
          <Divider sx={{ my: 2 }} />

          <Box>
            <TextField
              select
              label="Payment Method"
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              fullWidth
              sx={{ mb: 2 }}
            >
              <MenuItem value="UPI">UPI</MenuItem>
              <MenuItem value="Card">Card</MenuItem>
              <MenuItem value="Netbanking">Netbanking</MenuItem>
            </TextField>

            <TextField
              select
              label="Payment Mode"
              value={paymentMode}
              onChange={(e) => {
                setPaymentMode(e.target.value);
                setInstallmentType(""); // Reset installment type when payment mode changes
              }}
              fullWidth
              sx={{ mb: 2 }}
            >
              <MenuItem value="TOTAL">Total Payment (₹{stage.fullFee}) - NO DUE Pass</MenuItem>
              <MenuItem value="INSTALLMENT">Installment Payment</MenuItem>
            </TextField>

            {paymentMode === "INSTALLMENT" && (
              <TextField
                select
                label="Installment Type"
                value={installmentType}
                onChange={(e) => setInstallmentType(e.target.value)}
                fullWidth
                sx={{ mb: 2 }}
              >
                <MenuItem value="FIRST_SEM">First Semester (₹{stage.installment1}) - DUE Pass</MenuItem>
                <MenuItem 
                  value="SECOND_SEM" 
                  disabled={!firstInstallmentPaid}
                >
                  Second Semester (₹{stage.installment2}) - NO DUE Pass
                  {!firstInstallmentPaid && " (Pay First Semester First)"}
                </MenuItem>
              </TextField>
            )}

            {/* Show installment eligibility status */}
            {paymentMode === "INSTALLMENT" && (
              <Box sx={{ mb: 2 }}>
                {firstInstallmentPaid ? (
                  <Alert severity="success" sx={{ mb: 1 }}>
                    ✅ First Semester installment paid. You can now pay Second Semester.
                  </Alert>
                ) : (
                  <Alert severity="warning" sx={{ mb: 1 }}>
                    ⚠️ You must pay First Semester installment before Second Semester.
                  </Alert>
                )}
              </Box>
            )}

            {paymentMode && (
              <Box sx={{ mb: 2, p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Payment Summary:
                </Typography>
                <Typography variant="body2">
                  <strong>Amount:</strong> ₹{paymentMode === "TOTAL" ? stage.fullFee : installmentType === "FIRST_SEM" ? stage.installment1 : stage.installment2}
                </Typography>
                <Typography variant="body2">
                  <strong>Pass Status:</strong> {paymentMode === "TOTAL" ? "NO DUE" : installmentType === "FIRST_SEM" ? "DUE" : "NO DUE"}
                </Typography>
                {paymentMode === "INSTALLMENT" && installmentType === "FIRST_SEM" && (
                  <Typography variant="body2" color="warning.main">
                    <strong>Due Amount:</strong> ₹{stage.installment2} (Second Semester)
                  </Typography>
                )}
              </Box>
            )}

            <Button
              variant="contained"
              color="primary"
              onClick={handleProceed}
              disabled={
                loading || 
                !mode || 
                !paymentMode || 
                (paymentMode === "INSTALLMENT" && !installmentType) ||
                (paymentMode === "INSTALLMENT" && installmentType === "SECOND_SEM" && !firstInstallmentPaid) ||
                // Disable if already paid full for current year
                paymentHistory.some(p => p.academicYear === academicYear && p.paymentMode === "TOTAL") ||
                // Disable if both installments already paid
                (paymentHistory.filter(p => p.academicYear === academicYear && p.paymentMode === "INSTALLMENT").length >= 2)
              }
              fullWidth
            >
              {loading ? "Processing..." : 
               paymentHistory.some(p => p.academicYear === academicYear && p.paymentMode === "TOTAL") ? "Payment Already Complete" :
               (paymentHistory.filter(p => p.academicYear === academicYear && p.paymentMode === "INSTALLMENT").length >= 2) ? "All Installments Paid" :
               "Proceed to Pay"}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}
