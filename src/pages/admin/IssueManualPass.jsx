// src/pages/admin/IssueManualPass.jsx
import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  TextField,
  MenuItem,
  Button,
  Box,
  Card,
  CardContent,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Chip,
  Snackbar,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { collection, onSnapshot, doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase/config";
import { generatePassToken } from "../../services/passGenerator";

const PAYMENT_METHODS = ["Cash", "Bank Transfer", "Cheque", "DD", "Other"];
const YEARS = ["ALL", "1", "2", "3", "4"];
const BRANCHES = ["ALL", "CSE", "IT", "AIML", "ECE", "DIPLOMA", "PHARMACY", "EEE"];

export default function IssueManualPass() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [students, setStudents] = useState([]);
  const [buses, setBuses] = useState([]);
  const [stages, setStages] = useState([]);
  const [academicYear, setAcademicYear] = useState("");

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterYear, setFilterYear] = useState("ALL");
  const [filterBranch, setFilterBranch] = useState("ALL");

  // Form state
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedBus, setSelectedBus] = useState("");
  const [selectedStage, setSelectedStage] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [paymentMode, setPaymentMode] = useState("TOTAL");
  const [installmentType, setInstallmentType] = useState("");
  const [receiptNumber, setReceiptNumber] = useState("");
  const [notes, setNotes] = useState("");

  // UI state
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [studentPassStatus, setStudentPassStatus] = useState(null);

  const steps = ["Select Student", "Select Bus & Stage", "Payment Details", "Issue Pass"];

  // Load students (exclude only admin users, same as ManageStudents)
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "users"), (snap) => {
      const arr = [];
      snap.forEach((d) => {
        const data = d.data();
        // Include all users except admin
        if (data.role !== "admin") {
          arr.push({ id: d.id, ...data });
        }
      });
      setStudents(arr.sort((a, b) => (a.name || "").localeCompare(b.name || "")));
    });
    return () => unsub();
  }, []);

  // Load buses
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "buses"), (snap) => {
      const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setBuses(arr);
    });
    return () => unsub();
  }, []);

  // Load stages for selected bus
  useEffect(() => {
    if (!selectedBus) {
      setStages([]);
      return;
    }
    const unsub = onSnapshot(collection(db, "stages"), (snap) => {
      const arr = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((s) => s.busId === selectedBus);
      setStages(arr);
    });
    return () => unsub();
  }, [selectedBus]);

  // Load academic year
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

  // Check if student has existing pass with first installment paid
  const checkExistingPass = async (studentId) => {
    try {
      const passSnap = await getDoc(doc(db, "passes", studentId));
      if (passSnap.exists()) {
        const passData = passSnap.data();
        return {
          exists: true,
          passStatus: passData.passStatus,
          dueAmount: passData.dueAmount,
          busNumber: passData.busNumber,
          stage: passData.stage,
        };
      }
      return { exists: false };
    } catch (error) {
      console.error("Error checking pass:", error);
      return { exists: false };
    }
  };

  // Filter students based on search and filters
  const filteredStudents = students.filter((s) => {
    // Year filter
    if (filterYear !== "ALL" && s.year !== filterYear) {
      return false;
    }
    
    // Branch filter
    if (filterBranch !== "ALL" && s.branch !== filterBranch) {
      return false;
    }
    
    // Search filter
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      String(s.name || "").toLowerCase().includes(query) ||
      String(s.hallTicket || "").toLowerCase().includes(query) ||
      String(s.section || "").toLowerCase().includes(query) ||
      String(s.email || "").toLowerCase().includes(query)
    );
  });

  const student = students.find((s) => s.id === selectedStudent);
  const bus = buses.find((b) => b.id === selectedBus);
  const stage = stages.find((s) => s.id === selectedStage);

  const calculateAmount = () => {
    if (!stage) return 0;
    if (paymentMode === "TOTAL") return stage.fullFee;
    if (paymentMode === "INSTALLMENT") {
      if (installmentType === "FIRST_SEM") return stage.installment1;
      if (installmentType === "SECOND_SEM") return stage.installment2;
    }
    return 0;
  };

  const handleNext = () => {
    if (activeStep === 0 && !selectedStudent) {
      alert("Please select a student");
      return;
    }
    if (activeStep === 1 && (!selectedBus || !selectedStage)) {
      alert("Please select bus and stage");
      return;
    }
    if (activeStep === 2 && (!paymentMethod || !paymentMode)) {
      alert("Please fill payment details");
      return;
    }
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleIssuePass = async () => {
    if (!selectedStudent || !selectedBus || !selectedStage || !academicYear) {
      alert("Please complete all required fields");
      return;
    }

    setLoading(true);

    try {
      const amount = calculateAmount();
      const passStatus = paymentMode === "TOTAL" || installmentType === "SECOND_SEM" ? "NO DUE" : "DUE";
      const dueAmount = paymentMode === "INSTALLMENT" && installmentType === "FIRST_SEM" ? stage.installment2 : 0;

      // Check if student already has a pass (for second installment case)
      const existingPass = await checkExistingPass(selectedStudent);
      const isSecondInstallment = installmentType === "SECOND_SEM" && existingPass.exists && existingPass.passStatus === "DUE";

      const paymentId = `manual_${selectedStudent}_${Date.now()}`;
      const paymentRef = doc(db, "payments", paymentId);

      // 1. Create payment record
      await setDoc(paymentRef, {
        paymentId,
        receiptNumber: receiptNumber || `MANUAL-${Date.now()}`,
        studentId: selectedStudent,
        studentName: student.name,
        busId: bus.id,
        busNumber: bus.number,
        stageId: stage.id,
        stageName: stage.name,
        stage: stage.name,
        amount,
        mode: paymentMethod,
        paymentMode,
        installmentType: installmentType || null,
        status: "success",
        academicYear,
        isManual: true,
        issuedBy: "admin",
        notes: notes || "Manual cash payment",
        createdAt: serverTimestamp(),
        paidAt: serverTimestamp(),
      });

      // 2. Issue or Update pass
      const passRef = doc(db, "passes", selectedStudent);

      let paymentCompletionMethod = "";
      if (paymentMode === "TOTAL") {
        paymentCompletionMethod = "Manual Payment (Cash/Offline)";
      } else if (installmentType === "SECOND_SEM") {
        paymentCompletionMethod = isSecondInstallment ? "Manual Installment (2nd Semester - Completing Payment)" : "Manual Installment (2nd Semester)";
      } else {
        paymentCompletionMethod = "Manual Installment (1st Semester)";
      }

      if (isSecondInstallment) {
        // Update existing pass (second installment)
        console.log("📝 Updating existing pass - second installment paid in cash");
        await setDoc(
          passRef,
          {
            passStatus: "NO DUE", // Update from DUE to NO DUE
            dueAmount: 0, // Clear due amount
            lastPaymentAmount: amount,
            lastPaymentDate: new Date(),
            paymentMethod: paymentCompletionMethod,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
      } else {
        // Create new pass (first time or total payment)
        const token = generatePassToken(selectedStudent);
        console.log("✨ Creating new pass");
        await setDoc(passRef, {
          passId: token,
          passToken: token,
          status: "active",
          passStatus: passStatus,
          dueAmount: dueAmount,
          studentId: selectedStudent,
          studentName: student.name,
          busNumber: bus.number,
          busId: bus.id,
          stage: stage.name,
          stageId: stage.id,
          academicYear,
          issuedAt: serverTimestamp(),
          lastPaymentAmount: amount,
          lastPaymentDate: new Date(),
          paymentMethod: paymentCompletionMethod,
          isManual: true,
        });
      }

      // 3. Update user profile
      const userRef = doc(db, "users", selectedStudent);
      const userSnap = await getDoc(userRef);
      const existingFee = Number(userSnap.data()?.fee || 0);
      const totalFee = existingFee + amount;

      await setDoc(
        userRef,
        {
          busNumber: bus.number,
          busId: bus.id,
          stage: stage.name,
          stageId: stage.id,
          fee: totalFee,
          lastPaymentAmount: amount,
          lastPaymentDate: new Date(),
          paymentMethod: paymentCompletionMethod, // ✅ How payment was completed
          paymentStatus: "success", // ✅ Shows in admin dashboard
          passStatus: "Issued", // ✅ Shows pass is active
          academicYear,
          updatedAt: new Date(),
        },
        { merge: true }
      );

      const successMessage = isSecondInstallment
        ? `✅ Second installment recorded! ${student.name}'s pass updated to NO DUE`
        : `✅ Pass issued successfully for ${student.name}!`;
      
      setSnackbarMessage(successMessage);
      setSnackbarSeverity("success");
      setSnackbarOpen(true);

      // Reset form after 2 seconds
      setTimeout(() => {
        setActiveStep(0);
        setSelectedStudent("");
        setSelectedBus("");
        setSelectedStage("");
        setPaymentMethod("Cash");
        setPaymentMode("TOTAL");
        setInstallmentType("");
        setReceiptNumber("");
        setNotes("");
        setFilterYear("ALL");
        setFilterBranch("ALL");
        setSearchQuery("");
        navigate("/admin/dashboard/students");
      }, 2000);
    } catch (error) {
      console.error("Error issuing pass:", error);
      setSnackbarMessage(`❌ Error: ${error.message}`);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
            💵 Issue Pass - Manual Payment
          </Typography>

          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* Step 1: Select Student */}
          {activeStep === 0 && (
            <Box>
              <Alert severity="info" sx={{ mb: 3 }}>
                Select the student who paid in cash/offline
              </Alert>

              {/* Filter Section */}
              <Card sx={{ bgcolor: "grey.50", p: 2, mb: 3 }}>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  🔍 Filter Students
                </Typography>
                
                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 2 }}>
                  <TextField
                    select
                    label="Year"
                    value={filterYear}
                    onChange={(e) => setFilterYear(e.target.value)}
                    size="small"
                    sx={{ minWidth: 120 }}
                  >
                    {YEARS.map((year) => (
                      <MenuItem key={year} value={year}>
                        {year === "ALL" ? "All Years" : `Year ${year}`}
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    select
                    label="Branch"
                    value={filterBranch}
                    onChange={(e) => setFilterBranch(e.target.value)}
                    size="small"
                    sx={{ minWidth: 150 }}
                  >
                    {BRANCHES.map((branch) => (
                      <MenuItem key={branch} value={branch}>
                        {branch}
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    label="Search Name/Hall Ticket/Section"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    size="small"
                    placeholder="Type to search..."
                    sx={{ flexGrow: 1, minWidth: 250 }}
                  />
                </Box>

                <Typography variant="caption" color="text.secondary">
                  Found: <strong>{filteredStudents.length}</strong> student{filteredStudents.length !== 1 ? 's' : ''}
                  {(filterYear !== "ALL" || filterBranch !== "ALL" || searchQuery) && (
                    <Button 
                      size="small" 
                      onClick={() => {
                        setFilterYear("ALL");
                        setFilterBranch("ALL");
                        setSearchQuery("");
                      }}
                      sx={{ ml: 1, textTransform: 'none' }}
                    >
                      Clear Filters
                    </Button>
                  )}
                </Typography>
              </Card>

              <TextField
                select
                label="Select Student"
                value={selectedStudent}
                onChange={async (e) => {
                  const id = e.target.value;
                  setSelectedStudent(id);
                  if (id) {
                    const passInfo = await checkExistingPass(id);
                    setStudentPassStatus(passInfo);
                  } else {
                    setStudentPassStatus(null);
                  }
                }}
                fullWidth
                required
                sx={{ mb: 2 }}
                helperText={filteredStudents.length === 0 ? "No students found - try adjusting filters" : "Select from filtered students"}
              >
                <MenuItem value="">-- Select Student --</MenuItem>
                {filteredStudents.length === 0 ? (
                  <MenuItem disabled>No students found</MenuItem>
                ) : (
                  filteredStudents.map((s) => (
                    <MenuItem key={s.id} value={s.id}>
                      {s.name} - {s.hallTicket} ({s.branch} - Year {s.year}/{s.section})
                    </MenuItem>
                  ))
                )}
              </TextField>

              {student && (
                <>
                  <Card sx={{ bgcolor: "grey.50", p: 2, mb: 2 }}>
                    <Typography variant="subtitle2" fontWeight={600}>
                      Selected Student:
                    </Typography>
                    <Typography variant="body2">Name: {student.name}</Typography>
                    <Typography variant="body2">Hall Ticket: {student.hallTicket}</Typography>
                    <Typography variant="body2">Branch: {student.branch}</Typography>
                    <Typography variant="body2">Year: {student.year}</Typography>
                    <Typography variant="body2">Current Fee Paid: ₹{student.fee || 0}</Typography>
                  </Card>

                  {studentPassStatus?.exists && studentPassStatus.passStatus === "DUE" && (
                    <Alert severity="warning" sx={{ mb: 2 }}>
                      <Typography variant="body2" fontWeight="bold" gutterBottom>
                        ⚠️ Student has an active pass with DUE status
                      </Typography>
                      <Typography variant="body2" fontSize="0.85rem">
                        • Bus: {studentPassStatus.busNumber} → Stage: {studentPassStatus.stage}
                      </Typography>
                      <Typography variant="body2" fontSize="0.85rem">
                        • Pending Amount: ₹{studentPassStatus.dueAmount}
                      </Typography>
                      <Typography variant="body2" fontSize="0.85rem" mt={1}>
                        💡 Select <strong>"Second Semester"</strong> installment to complete their payment
                      </Typography>
                    </Alert>
                  )}

                  {studentPassStatus?.exists && studentPassStatus.passStatus === "NO DUE" && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                      <Typography variant="body2" fontWeight="bold">
                        ✅ Student already has an active pass with NO DUE status
                      </Typography>
                      <Typography variant="body2" fontSize="0.85rem">
                        • Bus: {studentPassStatus.busNumber} → Stage: {studentPassStatus.stage}
                      </Typography>
                    </Alert>
                  )}
                </>
              )}
            </Box>
          )}

          {/* Step 2: Select Bus & Stage */}
          {activeStep === 1 && (
            <Box>
              <Alert severity="info" sx={{ mb: 3 }}>
                Select the bus and stage for this student
              </Alert>

              <TextField
                select
                label="Select Bus"
                value={selectedBus}
                onChange={(e) => {
                  setSelectedBus(e.target.value);
                  setSelectedStage("");
                }}
                fullWidth
                required
                sx={{ mb: 2 }}
              >
                <MenuItem value="">-- Select Bus --</MenuItem>
                {buses.map((b) => (
                  <MenuItem key={b.id} value={b.id}>
                    Bus {b.number} (Driver: {b.driver})
                  </MenuItem>
                ))}
              </TextField>

              {selectedBus && (
                <TextField
                  select
                  label="Select Stage"
                  value={selectedStage}
                  onChange={(e) => setSelectedStage(e.target.value)}
                  fullWidth
                  required
                  sx={{ mb: 2 }}
                >
                  <MenuItem value="">-- Select Stage --</MenuItem>
                  {stages.length === 0 ? (
                    <MenuItem disabled>No stages for this bus</MenuItem>
                  ) : (
                    stages.map((s) => (
                      <MenuItem key={s.id} value={s.id}>
                        {s.name} - Full: ₹{s.fullFee} | Installments: ₹{s.installment1} + ₹{s.installment2}
                      </MenuItem>
                    ))
                  )}
                </TextField>
              )}

              {stage && (
                <Card sx={{ bgcolor: "success.light", color: "success.contrastText", p: 2, mb: 2 }}>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Selected Route:
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                    <Chip label={`Bus: ${bus.number}`} size="small" />
                    <Chip label={`Stage: ${stage.name}`} size="small" />
                  </Box>
                </Card>
              )}
            </Box>
          )}

          {/* Step 3: Payment Details */}
          {activeStep === 2 && (
            <Box>
              <Alert severity="warning" sx={{ mb: 3 }}>
                Enter payment details for the offline/cash payment
              </Alert>

              <TextField
                select
                label="Payment Method"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                fullWidth
                required
                sx={{ mb: 2 }}
              >
                {PAYMENT_METHODS.map((method) => (
                  <MenuItem key={method} value={method}>
                    {method}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                label="Payment Mode"
                value={paymentMode}
                onChange={(e) => {
                  setPaymentMode(e.target.value);
                  setInstallmentType("");
                }}
                fullWidth
                required
                sx={{ mb: 2 }}
              >
                <MenuItem value="TOTAL">
                  Total Payment (₹{stage?.fullFee || 0}) - NO DUE Pass
                </MenuItem>
                <MenuItem value="INSTALLMENT">Installment Payment</MenuItem>
              </TextField>

              {paymentMode === "INSTALLMENT" && (
                <>
                  <TextField
                    select
                    label="Installment Type"
                    value={installmentType}
                    onChange={(e) => setInstallmentType(e.target.value)}
                    fullWidth
                    required
                    sx={{ mb: 2 }}
                  >
                    <MenuItem value="FIRST_SEM">
                      First Semester (₹{stage?.installment1 || 0}) - DUE Pass
                    </MenuItem>
                    <MenuItem value="SECOND_SEM">
                      Second Semester (₹{stage?.installment2 || 0}) - NO DUE Pass
                    </MenuItem>
                  </TextField>
                  
                  {installmentType === "SECOND_SEM" && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                      <Typography variant="body2">
                        💡 This will update the student's pass from <strong>"DUE"</strong> to <strong>"NO DUE"</strong> status
                      </Typography>
                    </Alert>
                  )}
                </>
              )}

              <TextField
                label="Receipt Number (Optional)"
                value={receiptNumber}
                onChange={(e) => setReceiptNumber(e.target.value)}
                fullWidth
                sx={{ mb: 2 }}
                helperText="Leave empty to auto-generate"
              />

              <TextField
                label="Notes (Optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                fullWidth
                multiline
                rows={2}
                sx={{ mb: 2 }}
                helperText="Any additional information"
              />

              <Card sx={{ bgcolor: "grey.50", p: 2 }}>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  Payment Summary:
                </Typography>
                <Typography variant="body2">Amount: ₹{calculateAmount()}</Typography>
                <Typography variant="body2">Method: {paymentMethod}</Typography>
                <Typography variant="body2">
                  Pass Status: {paymentMode === "TOTAL" || installmentType === "SECOND_SEM" ? "NO DUE" : "DUE"}
                </Typography>
              </Card>
            </Box>
          )}

          {/* Step 4: Confirm & Issue */}
          {activeStep === 3 && (
            <Box>
              <Alert severity="success" sx={{ mb: 3 }}>
                Review all details and click "Issue Pass" to complete
              </Alert>

              <Card sx={{ bgcolor: "grey.50", p: 3, mb: 2 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  📋 Pass Issuance Summary
                </Typography>

                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Student Details:
                  </Typography>
                  <Typography variant="body2">• Name: {student?.name}</Typography>
                  <Typography variant="body2">• Hall Ticket: {student?.hallTicket}</Typography>
                  <Typography variant="body2">• Branch: {student?.branch}</Typography>
                </Box>

                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Route Details:
                  </Typography>
                  <Typography variant="body2">• Bus: {bus?.number}</Typography>
                  <Typography variant="body2">• Stage: {stage?.name}</Typography>
                </Box>

                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Payment Details:
                  </Typography>
                  <Typography variant="body2">• Method: {paymentMethod}</Typography>
                  <Typography variant="body2">• Amount: ₹{calculateAmount()}</Typography>
                  <Typography variant="body2">
                    • Mode: {paymentMode === "TOTAL" ? "Total Payment" : `Installment (${installmentType})`}
                  </Typography>
                  <Typography variant="body2">
                    • Pass Status: {paymentMode === "TOTAL" || installmentType === "SECOND_SEM" ? "NO DUE" : "DUE"}
                  </Typography>
                </Box>
              </Card>
            </Box>
          )}

          {/* Navigation Buttons */}
          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
            <Button
              onClick={handleBack}
              disabled={activeStep === 0 || loading}
              variant="outlined"
            >
              Back
            </Button>

            {activeStep < steps.length - 1 ? (
              <Button onClick={handleNext} variant="contained">
                Next
              </Button>
            ) : (
              <Button
                onClick={handleIssuePass}
                variant="contained"
                color="success"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : null}
              >
                {loading ? "Issuing..." : "Issue Pass"}
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: "100%" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}

