// src/pages/admin/ManageStudents.jsx
import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  TextField,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Chip,
  Grid,
  Avatar,
  Divider,
  IconButton,
  Tooltip,
  Alert,
  Paper,
} from "@mui/material";
import {
  Person as PersonIcon,
  DirectionsBus as BusIcon,
  LocationOn as LocationIcon,
  Payment as PaymentIcon,
  CardMembership as PassIcon,
  Search as SearchIcon,
  Assignment as AssignmentIcon,
  RemoveCircle as RemoveIcon,
  CheckCircle as CheckIcon,
} from "@mui/icons-material";
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebase/config";
import { generatePassToken } from "../../services/passGenerator";

const BRANCHES = ["ALL", "CSE", "IT", "AIML", "ECE", "DIPLOMA", "PHARMACY", "EEE"];

export default function ManageStudents() {
  const [students, setStudents] = useState([]);
  const [qname, setQname] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("ALL");
  const [selected, setSelected] = useState(null);
  const [buses, setBuses] = useState([]);
  const [assignOpen, setAssignOpen] = useState(false);
  const [selectedBusId, setSelectedBusId] = useState("");
  const [selectedStageId, setSelectedStageId] = useState("");

  // Students
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "users"), (snap) => {
      const arr = [];
      snap.forEach((d) => arr.push({ id: d.id, ...d.data() }));
      setStudents(arr);
    });
    return () => unsub();
  }, []);

  // Buses
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "buses"), (snap) => {
      const arr = [];
      snap.forEach((d) => arr.push({ id: d.id, ...d.data() }));
      setBuses(arr);
    });
    return () => unsub();
  }, []);

  const openAssign = (student) => {
    setSelected(student);
    setAssignOpen(true);
    setSelectedBusId(student.busId || "");
    setSelectedStageId(student.stageId || "");
  };

  const handleAssignSave = async () => {
    if (!selected) return;

    const busDoc = buses.find((b) => b.id === selectedBusId);
    const stageObj = busDoc?.stages?.find((s) => s.id === selectedStageId);

    if (!busDoc || !stageObj) {
      alert("Please select both bus and stage.");
      return;
    }

    const update = {
      busId: selectedBusId,
      busNumber: busDoc.busNumber,
      stageId: selectedStageId,
      stage: stageObj.stageName,
      fee: stageObj.fee,
      paymentStatus: "pending",
      passStatus: "Not Issued",
      updatedAt: serverTimestamp(),
    };

    await updateDoc(doc(db, "users", selected.id), update);
    setAssignOpen(false);
    alert(`Assigned Bus ${busDoc.busNumber}, Stage ${stageObj.stageName}`);
  };

  const removeAssignment = async (student) => {
    if (!window.confirm("Remove bus & stage assignment for this student?"))
      return;
    await updateDoc(doc(db, "users", student.id), {
      busId: null,
      busNumber: null,
      stageId: null,
      stage: null,
      fee: null,
      paymentStatus: "pending",
      passStatus: "Not Issued",
      updatedAt: serverTimestamp(),
    });
    alert("Assignment removed.");
  };

  // Manual Issue Pass (fallback if auto fails)
  const issuePass = async (student) => {
    if (!window.confirm("Issue pass for this student?")) return;
    const token = generatePassToken(student.id);

    const passDoc = {
      passId: token,
      passToken: token,
      status: "active",
      studentId: student.id,
      studentName: student.name,
      hallTicket: student.hallTicket,
      academicYear: student.academicYear || null,
      issuedAt: serverTimestamp(),
    };

    await setDoc(doc(db, "passes", student.id), passDoc);
    await updateDoc(doc(db, "users", student.id), {
      passStatus: "Issued",
      passToken: token,
      updatedAt: serverTimestamp(),
    });

    alert("Pass issued.");
  };

  // Filter students based on search and branch
  const filteredStudents = students.filter((s) => {
    // Branch filter
    if (selectedBranch !== "ALL" && s.branch !== selectedBranch) {
      return false;
    }
    
    // Search filter
    if (!qname) return true;
    const q = qname.toLowerCase();
    return (
      String(s.name || "").toLowerCase().includes(q) ||
      String(s.hallTicket || "").toLowerCase().includes(q) ||
      String(s.email || "").toLowerCase().includes(q) ||
      String(s.branch || "").toLowerCase().includes(q)
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

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header Section */}
      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Box>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
              👥 Manage Students
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Assign buses, manage payments, and issue passes for students
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <TextField
              select
              label="Filter by Branch"
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              sx={{ minWidth: 150 }}
            >
              {BRANCHES.map((branch) => (
                <MenuItem key={branch} value={branch}>
                  {branch}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              placeholder="Search students..."
              value={qname}
              onChange={(e) => setQname(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />,
              }}
              sx={{ minWidth: 300 }}
            />
          </Box>
        </Box>
        
        {/* Stats */}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={3}>
            <Box sx={{ textAlign: "center", p: 2, bgcolor: "primary.light", borderRadius: 2 }}>
              <Typography variant="h4" color="primary.contrastText">
                {filteredStudents.length}
              </Typography>
              <Typography variant="body2" color="primary.contrastText">
                {selectedBranch === "ALL" ? "Total Students" : `${selectedBranch} Students`}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Box sx={{ textAlign: "center", p: 2, bgcolor: "success.light", borderRadius: 2 }}>
              <Typography variant="h4" color="success.contrastText">
                {students.filter(s => s.paymentStatus === "success").length}
              </Typography>
              <Typography variant="body2" color="success.contrastText">
                Paid Students
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Box sx={{ textAlign: "center", p: 2, bgcolor: "warning.light", borderRadius: 2 }}>
              <Typography variant="h4" color="warning.contrastText">
                {students.filter(s => s.passStatus === "Issued").length}
              </Typography>
              <Typography variant="body2" color="warning.contrastText">
                Passes Issued
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Box sx={{ textAlign: "center", p: 2, bgcolor: "info.light", borderRadius: 2 }}>
              <Typography variant="h4" color="info.contrastText">
                {students.filter(s => s.busNumber).length}
              </Typography>
              <Typography variant="body2" color="info.contrastText">
                Bus Assigned
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Students Grid */}
      <Grid container spacing={3}>
        {filteredStudents.map((student) => (
          <Grid item xs={12} sm={6} lg={4} key={student.id}>
            <Card 
              elevation={2} 
              sx={{ 
                height: "100%", 
                display: "flex", 
                flexDirection: "column",
                transition: "transform 0.2s ease-in-out",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: 4,
                }
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                {/* Student Header */}
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Avatar sx={{ bgcolor: "primary.main", mr: 2 }}>
                    <PersonIcon />
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {student.name || "Unknown"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {student.hallTicket || "No Hall Ticket"}
                    </Typography>
                  </Box>
                  {student.branch && (
                    <Chip
                      label={student.branch}
                      size="small"
                      color="primary"
                      sx={{ fontWeight: 600 }}
                    />
                  )}
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Student Details */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <Typography variant="body2">
                      <strong>Year:</strong> {student.year || "-"} | <strong>Section:</strong> {student.section || "-"}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <BusIcon sx={{ mr: 1, fontSize: 20, color: "text.secondary" }} />
                    <Typography variant="body2">
                      <strong>Bus:</strong> {student.busNumber || "Not Assigned"}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <LocationIcon sx={{ mr: 1, fontSize: 20, color: "text.secondary" }} />
                    <Typography variant="body2">
                      <strong>Stage:</strong> {student.stage || "Not Assigned"}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <PaymentIcon sx={{ mr: 1, fontSize: 20, color: "text.secondary" }} />
                    <Typography variant="body2">
                      <strong>Fee:</strong> ₹{student.fee || "0"}
                    </Typography>
                  </Box>
                </Box>

                {/* Status Chips */}
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
                  <Chip
                    label={`Payment: ${student.paymentStatus || "Pending"}`}
                    color={getStatusColor(student.paymentStatus)}
                    size="small"
                  />
                  <Chip
                    label={`Pass: ${student.passStatus || "Not Issued"}`}
                    color={getStatusColor(student.passStatus)}
                    size="small"
                  />
                </Box>
              </CardContent>

              {/* Action Buttons */}
              <CardActions sx={{ p: 2, pt: 0 }}>
                <Box sx={{ display: "flex", gap: 1, width: "100%" }}>
                  <Tooltip title="Assign Bus & Stage">
                  <Button
                      onClick={() => openAssign(student)}
                    variant="outlined"
                      startIcon={<AssignmentIcon />}
                      size="small"
                      sx={{ flex: 1 }}
                  >
                    Assign
                  </Button>
                  </Tooltip>

                  {student.busNumber && (
                    <Tooltip title="Remove Assignment">
                      <IconButton
                        onClick={() => removeAssignment(student)}
                    color="error"
                        size="small"
                      >
                        <RemoveIcon />
                      </IconButton>
                    </Tooltip>
                  )}

                  {student.paymentStatus === "success" && student.passStatus !== "Issued" && (
                    <Tooltip title="Issue Pass">
                      <IconButton
                        onClick={() => issuePass(student)}
                        color="success"
                        size="small"
                      >
                        <CheckIcon />
                      </IconButton>
                    </Tooltip>
                    )}
                </Box>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Empty State */}
      {filteredStudents.length === 0 && (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <PersonIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {qname ? "No students found matching your search" : "No students registered yet"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {qname ? "Try adjusting your search criteria" : "Students will appear here once they register"}
          </Typography>
        </Box>
      )}

      {/* Assign Bus Dialog */}
      <Dialog 
        open={assignOpen} 
        onClose={() => setAssignOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <AssignmentIcon sx={{ mr: 1 }} />
            Assign Bus & Stage
          </Box>
        </DialogTitle>
        <DialogContent>
          {selected && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Assigning bus and stage for <strong>{selected.name}</strong> ({selected.hallTicket})
            </Alert>
          )}
          
          <TextField
            select
            label="Select Bus"
            value={selectedBusId}
            onChange={(e) => {
              setSelectedBusId(e.target.value);
              setSelectedStageId(""); // reset stage
            }}
            fullWidth
            sx={{ mb: 2 }}
            helperText="Choose a bus to see available stages"
          >
            <MenuItem value="">-- Select Bus --</MenuItem>
            {buses.map((b) => (
              <MenuItem key={b.id} value={b.id}>
                Bus {b.busNumber} - {b.driver || "Driver"}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Select Stage"
            value={selectedStageId}
            onChange={(e) => setSelectedStageId(e.target.value)}
            fullWidth
            disabled={!selectedBusId}
            helperText={!selectedBusId ? "Select a bus first" : "Choose a stage for this bus"}
          >
            <MenuItem value="">-- Select Stage --</MenuItem>
            {(buses.find((b) => b.id === selectedBusId)?.stages || []).map(
              (s) => (
                <MenuItem key={s.id} value={s.id}>
                  {s.stageName} - ₹{s.fee || 0}
                </MenuItem>
              )
            )}
          </TextField>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setAssignOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleAssignSave}
            disabled={!selectedBusId || !selectedStageId}
            startIcon={<AssignmentIcon />}
          >
            Assign Bus & Stage
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
