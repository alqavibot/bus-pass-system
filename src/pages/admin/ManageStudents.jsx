// src/pages/admin/ManageStudents.jsx
import React, { useEffect, useState } from "react";
import {
  Typography,
  TextField,
  Box,
  Chip,
  Avatar,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  MenuItem,
  Button,
  CircularProgress,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from "@mui/material";
import {
  Person as PersonIcon,
  DirectionsBus as BusIcon,
  LocationOn as LocationIcon,
  Payment as PaymentIcon,
  CardMembership as PassIcon,
  Search as SearchIcon,
  AttachMoney as AttachMoneyIcon,
} from "@mui/icons-material";
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebase/config";
import { generatePassToken } from "../../services/passGenerator";
import { syncBusStageData } from "../../utils/syncBusStageData";

const BRANCHES = ["ALL", "CSE", "IT", "AIML", "ECE", "DIPLOMA", "PHARMACY", "EEE"];
const YEARS = ["ALL", "1", "2", "3", "4"];

export default function ManageStudents() {
  const [students, setStudents] = useState([]);
  const [qname, setQname] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("ALL");
  const [selectedYear, setSelectedYear] = useState("ALL");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("info");
  
  // Payment dialog states
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedStudentForPayment, setSelectedStudentForPayment] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [receiptNumber, setReceiptNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [processingPayment, setProcessingPayment] = useState(false);
  const [passes, setPasses] = useState([]);
  const [syncDone, setSyncDone] = useState(false);

  // Students
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "users"), (snap) => {
      const arr = [];
      snap.forEach((d) => arr.push({ id: d.id, ...d.data() }));
      setStudents(arr);
    });
    return () => unsub();
  }, []);

  // Auto-sync bus & stage data on mount (one-time)
  useEffect(() => {
    const runSync = async () => {
      if (syncDone) return; // Already synced in this session
      
      try {
        console.log("🔄 Auto-syncing bus & stage data...");
        const result = await syncBusStageData();
        
        if (result.success && result.updated > 0) {
          console.log(`✅ Auto-sync: Updated ${result.updated} students with bus & stage data`);
          // Show subtle notification only if data was actually updated
          setSnackbarMessage(`✅ Synced bus & stage data for ${result.updated} students`);
          setSnackbarSeverity("info");
          setSnackbarOpen(true);
        } else if (result.success) {
          console.log("✅ Auto-sync: All students already have correct data");
        }
        
        setSyncDone(true);
      } catch (error) {
        console.error("❌ Auto-sync error:", error);
        setSyncDone(true); // Mark as done even on error to avoid loops
      }
    };
    
    // Run sync after a short delay to let students load first
    const timeoutId = setTimeout(runSync, 2000);
    return () => clearTimeout(timeoutId);
  }, [syncDone]);

  // Load passes to get due amounts
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "passes"), (snap) => {
      const arr = [];
      snap.forEach((d) => arr.push({ id: d.id, ...d.data() }));
      setPasses(arr);
    });
    return () => unsub();
  }, []);

  // Filter students based on search, branch, and year
  const filteredStudents = students.filter((s) => {
    // Branch filter
    if (selectedBranch !== "ALL" && s.branch !== selectedBranch) {
      return false;
    }
    
    // Year filter
    if (selectedYear !== "ALL" && s.year !== selectedYear) {
      return false;
    }
    
    // Search filter
    if (!qname) return true;
    const q = qname.toLowerCase();
    return (
      String(s.name || "").toLowerCase().includes(q) ||
      String(s.hallTicket || "").toLowerCase().includes(q) ||
      String(s.email || "").toLowerCase().includes(q) ||
      String(s.branch || "").toLowerCase().includes(q) ||
      String(s.year || "").toLowerCase().includes(q)
    );
  });

  // Get status color for chips
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "success": return "success";
      case "pending": return "warning";
      case "failed": return "error";
      case "issued": return "success";
      case "not issued": return "default";
      default: return "default";
    }
  };

  // Get pass data for a student
  const getStudentPass = (studentId) => {
    return passes.find(p => p.studentId === studentId);
  };

  // Open payment dialog for second installment
  const handlePayDue = (student) => {
    setSelectedStudentForPayment(student);
    setPaymentDialogOpen(true);
    setPaymentMethod("Cash");
    setReceiptNumber("");
    setNotes("");
  };

  // Process second installment payment
  const handleProcessPayment = async () => {
    if (!selectedStudentForPayment) return;

    setProcessingPayment(true);
    try {
      const studentPass = getStudentPass(selectedStudentForPayment.id);
      if (!studentPass || studentPass.passStatus !== "DUE") {
        throw new Error("Student doesn't have a pending second installment");
      }

      const dueAmount = Number(studentPass.dueAmount) || 0;
      const paymentId = `manual_${selectedStudentForPayment.id}_${Date.now()}`;
      
      console.log("🔢 Processing second installment:");
      console.log("   Due Amount (from pass):", dueAmount);
      
      // Get academic year from settings
      const settingsSnap = await getDoc(doc(db, "settings", "global"));
      const academicYear = settingsSnap.exists() ? settingsSnap.data().currentAcademicYear : "";

      // 1. Create payment record
      await setDoc(doc(db, "payments", paymentId), {
        paymentId,
        receiptNumber: receiptNumber || `CASH-${Date.now()}`,
        studentId: selectedStudentForPayment.id,
        studentName: selectedStudentForPayment.name,
        busId: studentPass.busId,
        busNumber: studentPass.busNumber,
        stageId: studentPass.stageId,
        stageName: studentPass.stage,
        stage: studentPass.stage,
        amount: Number(dueAmount),
        mode: "manual",
        paymentMode: "INSTALLMENT",
        installmentType: "SECOND_SEM",
        status: "success",
        paymentMethod: paymentMethod,
        notes: notes || "Manual cash payment - Second installment",
        academicYear,
        createdAt: serverTimestamp(),
        paidAt: serverTimestamp(),
      });

      // 2. Update pass to NO DUE
      await setDoc(
        doc(db, "passes", selectedStudentForPayment.id),
        {
          passStatus: "NO DUE",
          dueAmount: 0,
          lastPaymentAmount: Number(dueAmount),
          lastPaymentDate: new Date(),
          paymentMethod: "Manual Installment (2nd Semester - Completing Payment)",
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      // 3. Update user profile
      const userSnap = await getDoc(doc(db, "users", selectedStudentForPayment.id));
      const existingFee = Number(userSnap.data()?.fee || 0);
      const dueAmountNum = Number(dueAmount);
      const totalFee = existingFee + dueAmountNum;
      
      console.log("💰 Fee calculation:");
      console.log("   Existing Fee:", existingFee);
      console.log("   Due Amount:", dueAmountNum);
      console.log("   Total Fee:", totalFee);

      await setDoc(
        doc(db, "users", selectedStudentForPayment.id),
        {
          fee: Number(totalFee),
          lastPaymentAmount: Number(dueAmount),
          lastPaymentDate: new Date(),
          paymentMethod: "Manual Installment (2nd Semester - Completing Payment)",
          paymentStatus: "success",
          passStatus: "Issued",
          updatedAt: new Date(),
        },
        { merge: true }
      );

      setSnackbarMessage(`Second installment of ₹${dueAmount} recorded for ${selectedStudentForPayment.name}. Total fees: ₹${totalFee}`);
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      setPaymentDialogOpen(false);
      setSelectedStudentForPayment(null);
    } catch (error) {
      console.error("Payment processing error:", error);
      setSnackbarMessage(`❌ Error: ${error.message}`);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setProcessingPayment(false);
    }
  };

  return (
    <Box sx={{ width: '100%', height: '100%', p: { xs: 0.5, sm: 1 } }}>
      {/* Compact Header with Stats Inline */}
      <Paper elevation={1} sx={{ p: 1.5, mb: 1.5 }}>
        {/* Title and Controls Row */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5, flexWrap: "wrap", gap: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Manage Students
            </Typography>
            <Chip 
              label={`${filteredStudents.length} ${selectedBranch !== "ALL" || selectedYear !== "ALL" ? "Filtered" : "Total"}`} 
              color="primary" 
              sx={{ fontWeight: 600 }}
            />
            <Chip 
              label={`${students.filter(s => s.paymentStatus === "success").length} Paid`} 
              color="success" 
              size="small"
            />
            <Chip 
              label={`${passes.filter(p => p.status === "active").length} Active`} 
              color="success" 
              size="small"
              variant="outlined"
            />
            <Chip 
              label={`${passes.filter(p => p.status === "expired").length} Expired`} 
              color="error" 
              size="small"
              variant="outlined"
            />
          </Box>
          
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
            <TextField
              select
              size="small"
              label="Year"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              sx={{ minWidth: 100 }}
            >
              {YEARS.map((year) => (
                <MenuItem key={year} value={year}>
                  {year === "ALL" ? "All Years" : `Year ${year}`}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              size="small"
              label="Branch"
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              sx={{ minWidth: 120 }}
            >
              {BRANCHES.map((branch) => (
                <MenuItem key={branch} value={branch}>
                  {branch}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              size="small"
              placeholder="Search by name, hall ticket..."
              value={qname}
              onChange={(e) => setQname(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 0.5, color: "text.secondary", fontSize: 20 }} />,
              }}
              sx={{ minWidth: 280 }}
            />
          </Box>
        </Box>
      </Paper>

      {/* Students Table */}
      <TableContainer component={Paper} elevation={1} sx={{ maxHeight: 'calc(100vh - 180px)', width: '100%' }}>
        <Table size="small" stickyHeader sx={{ minWidth: 1100 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, bgcolor: "primary.main", color: "primary.contrastText", py: 1.2, minWidth: 160 }}>Student</TableCell>
              <TableCell sx={{ fontWeight: 700, bgcolor: "primary.main", color: "primary.contrastText", py: 1.2, minWidth: 110 }}>Hall Ticket</TableCell>
              <TableCell sx={{ fontWeight: 700, bgcolor: "primary.main", color: "primary.contrastText", py: 1.2, minWidth: 80 }}>Branch</TableCell>
              <TableCell sx={{ fontWeight: 700, bgcolor: "primary.main", color: "primary.contrastText", py: 1.2, minWidth: 70 }}>Year/Sec</TableCell>
              <TableCell sx={{ fontWeight: 700, bgcolor: "primary.main", color: "primary.contrastText", py: 1.2, minWidth: 70 }}>Bus</TableCell>
              <TableCell sx={{ fontWeight: 700, bgcolor: "primary.main", color: "primary.contrastText", py: 1.2, minWidth: 150 }}>Stage / Route</TableCell>
              <TableCell sx={{ fontWeight: 700, bgcolor: "primary.main", color: "primary.contrastText", py: 1.2, minWidth: 100 }}>Total Fees</TableCell>
              <TableCell sx={{ fontWeight: 700, bgcolor: "primary.main", color: "primary.contrastText", py: 1.2, minWidth: 130 }}>Payment Method</TableCell>
              <TableCell sx={{ fontWeight: 700, bgcolor: "primary.main", color: "primary.contrastText", py: 1.2, minWidth: 130 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 700, bgcolor: "primary.main", color: "primary.contrastText", py: 1.2, minWidth: 100 }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredStudents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} align="center" sx={{ py: 6 }}>
                  <PersonIcon sx={{ fontSize: 40, color: "text.secondary", mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    {qname ? "No students found" : "No students registered yet"}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredStudents
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((student) => (
                  <TableRow 
                    key={student.id}
                    hover
                    sx={{ 
                      '&:hover': { bgcolor: 'action.hover' },
                      '&:last-child td': { border: 0 }
                    }}
                  >
                    <TableCell sx={{ py: 0.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 28, height: 28, bgcolor: 'primary.main', fontSize: '0.75rem' }}>
                          {(student.name || 'U')[0].toUpperCase()}
                        </Avatar>
                        <Typography variant="body2" fontWeight={600}>
                          {student.name || "Unknown"}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ py: 0.5 }}>
                      <Typography variant="body2" fontSize="0.875rem">{student.hallTicket || "-"}</Typography>
                    </TableCell>
                    <TableCell sx={{ py: 0.5 }}>
                      {student.branch ? (
                        <Chip label={student.branch} size="small" color="primary" sx={{ height: 20, fontSize: '0.7rem' }} />
                      ) : (
                        <Typography variant="body2" color="text.secondary" fontSize="0.875rem">-</Typography>
                      )}
                    </TableCell>
                    <TableCell sx={{ py: 0.5 }}>
                      <Typography variant="body2" fontSize="0.875rem">
                        {student.year || "-"} / {student.section || "-"}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 0.5 }}>
                      {student.busNumber ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <BusIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                          <Typography variant="body2" fontSize="0.875rem" fontWeight={600}>
                            {student.busNumber}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2" fontSize="0.75rem" color="text.secondary" fontStyle="italic">
                          Not Set
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell sx={{ py: 0.5, minWidth: 150 }}>
                      {student.stage ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <LocationIcon sx={{ fontSize: 16, color: 'error.main' }} />
                          <Typography variant="body2" fontSize="0.875rem" fontWeight={500}>
                            {student.stage}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2" fontSize="0.75rem" color="text.secondary" fontStyle="italic">
                          Not Selected
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell sx={{ py: 0.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <PaymentIcon sx={{ fontSize: 16, color: 'success.main' }} />
                        <Typography variant="body2" fontWeight={700} fontSize="0.9rem" color="primary">
                          ₹{student.fee || "0"}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ py: 0.5, maxWidth: 130 }}>
                      {student.paymentMethod ? (
                        <Box>
                          <Typography variant="body2" fontSize="0.75rem" fontWeight={600} color="text.primary">
                            {student.paymentMethod.includes("Total") && "💰 Full Payment"}
                            {student.paymentMethod.includes("1st Semester") && "📅 1st Semester"}
                            {student.paymentMethod.includes("2 Semesters") && "✅ Completed (2 Sem)"}
                            {student.paymentMethod.includes("2nd Semester") && "📅 2nd Semester"}
                            {student.paymentMethod.includes("Manual") && student.paymentMethod.includes("Cash") && "💵 Cash Payment"}
                            {student.paymentMethod.includes("Manual") && !student.paymentMethod.includes("Cash") && "💵 Manual Payment"}
                            {!student.paymentMethod.includes("Total") && 
                             !student.paymentMethod.includes("Semester") && 
                             !student.paymentMethod.includes("Manual") && 
                             student.paymentMethod.substring(0, 18)}
                          </Typography>
                          {student.passStatus === "DUE" && (
                            <Chip 
                              label="DUE" 
                              size="small" 
                              color="warning" 
                              sx={{ fontSize: '0.6rem', height: 16, mt: 0.5 }}
                            />
                          )}
                        </Box>
                      ) : (
                        <Typography variant="body2" fontSize="0.75rem" color="error">
                          ❌ Not Paid
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell sx={{ py: 0.5 }}>
                      {(() => {
                        const studentPass = getStudentPass(student.id);
                        const isExpired = studentPass && studentPass.status === "expired";
                        const isActive = studentPass && studentPass.status === "active";
                        
                        return (
                          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                            <Chip
                              label={student.paymentStatus || "Pending"}
                              color={getStatusColor(student.paymentStatus)}
                              size="small"
                              sx={{ fontSize: '0.65rem', height: 18, fontWeight: 700 }}
                            />
                            {isExpired ? (
                              <Chip
                                label="Expired"
                                color="error"
                                size="small"
                                sx={{ fontSize: '0.65rem', height: 18, fontWeight: 700 }}
                              />
                            ) : isActive ? (
                              <Chip
                                label="Active"
                                color="success"
                                size="small"
                                sx={{ fontSize: '0.65rem', height: 18, fontWeight: 700 }}
                              />
                            ) : (
                              <Chip
                                label={student.passStatus || "Not Issued"}
                                color={getStatusColor(student.passStatus)}
                                size="small"
                                sx={{ fontSize: '0.65rem', height: 18, fontWeight: 700 }}
                              />
                            )}
                          </Box>
                        );
                      })()}
                    </TableCell>
                    <TableCell sx={{ py: 0.5 }}>
                      {(() => {
                        const studentPass = getStudentPass(student.id);
                        const isExpired = studentPass && studentPass.status === "expired";
                        const hasDue = studentPass && studentPass.passStatus === "DUE" && studentPass.dueAmount > 0 && !isExpired;
                        
                        if (isExpired) {
                          return (
                            <Chip
                              label="Pass Expired"
                              size="small"
                              color="error"
                              variant="outlined"
                              sx={{ fontSize: '0.6rem', height: 20 }}
                            />
                          );
                        }
                        
                        return hasDue ? (
                          <Button
                            size="small"
                            variant="contained"
                            color="warning"
                            startIcon={<AttachMoneyIcon />}
                            onClick={() => handlePayDue(student)}
                            sx={{ fontSize: '0.65rem', py: 0.25, px: 0.75, textTransform: 'none' }}
                          >
                            Pay ₹{studentPass.dueAmount}
                          </Button>
                        ) : (
                          <Typography variant="body2" fontSize="0.7rem" color="text.secondary">
                            -
                          </Typography>
                        );
                      })()}
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50, 100]}
          component="div"
          count={filteredStudents.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(event, newPage) => setPage(newPage)}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
        />
      </TableContainer>

      {/* Payment Dialog for Second Installment */}
      <Dialog 
        open={paymentDialogOpen} 
        onClose={() => !processingPayment && setPaymentDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: 'warning.light', color: 'warning.contrastText' }}>
          Collect Second Installment Payment
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedStudentForPayment && (() => {
            const studentPass = getStudentPass(selectedStudentForPayment.id);
            return (
              <Box>
                {/* Student Info */}
                <Paper elevation={2} sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
                  <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                    Student Details
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                    <Typography variant="body2">
                      <strong>Name:</strong> {selectedStudentForPayment.name}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Hall Ticket:</strong> {selectedStudentForPayment.hallTicket}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Branch:</strong> {selectedStudentForPayment.branch}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Year:</strong> {selectedStudentForPayment.year}
                    </Typography>
                  </Box>
                </Paper>

                {/* Route Info */}
                {studentPass && (
                  <Paper elevation={2} sx={{ p: 2, mb: 3, bgcolor: 'info.light', color: 'info.contrastText' }}>
                    <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                      Current Route
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Chip 
                        icon={<BusIcon />} 
                        label={`Bus: ${studentPass.busNumber}`} 
                        size="small" 
                        sx={{ bgcolor: 'white' }}
                      />
                      <Chip 
                        icon={<LocationIcon />} 
                        label={`Stage: ${studentPass.stage}`} 
                        size="small" 
                        sx={{ bgcolor: 'white' }}
                      />
                    </Box>
                  </Paper>
                )}

                {/* Payment Amount */}
                <Alert severity="warning" sx={{ mb: 3 }}>
                  <Typography variant="h6" fontWeight={700}>
                    Due Amount: ₹{studentPass?.dueAmount || 0}
                  </Typography>
                  <Typography variant="caption">
                    Second Semester Installment
                  </Typography>
                </Alert>

                <Divider sx={{ my: 2 }} />

                {/* Payment Details */}
                <Typography variant="subtitle2" fontWeight={700} gutterBottom sx={{ mt: 2 }}>
                  Payment Details
                </Typography>
                
                <TextField
                  select
                  label="Payment Method"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  fullWidth
                  size="small"
                  sx={{ mb: 2 }}
                >
                  <MenuItem value="Cash">Cash</MenuItem>
                  <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
                  <MenuItem value="Cheque">Cheque</MenuItem>
                  <MenuItem value="DD">DD</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </TextField>

                <TextField
                  label="Receipt Number (Optional)"
                  value={receiptNumber}
                  onChange={(e) => setReceiptNumber(e.target.value)}
                  fullWidth
                  size="small"
                  sx={{ mb: 2 }}
                  placeholder="Leave empty for auto-generation"
                />

                <TextField
                  label="Notes (Optional)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  fullWidth
                  size="small"
                  multiline
                  rows={2}
                  placeholder="Any additional notes..."
                />
              </Box>
            );
          })()}
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button 
            onClick={() => setPaymentDialogOpen(false)} 
            disabled={processingPayment}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleProcessPayment} 
            disabled={processingPayment}
            variant="contained"
            color="success"
            startIcon={processingPayment ? <CircularProgress size={16} /> : <AttachMoneyIcon />}
          >
            {processingPayment ? 'Processing...' : 'Confirm Payment'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
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
    </Box>
  );
}
