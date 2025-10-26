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
} from "@mui/material";
import {
  Person as PersonIcon,
  DirectionsBus as BusIcon,
  LocationOn as LocationIcon,
  Payment as PaymentIcon,
  CardMembership as PassIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import {
  collection,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../../firebase/config";

const BRANCHES = ["ALL", "CSE", "IT", "AIML", "ECE", "DIPLOMA", "PHARMACY", "EEE"];

export default function ManageStudents() {
  const [students, setStudents] = useState([]);
  const [qname, setQname] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("ALL");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  // Students
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "users"), (snap) => {
      const arr = [];
      snap.forEach((d) => arr.push({ id: d.id, ...d.data() }));
      setStudents(arr);
    });
    return () => unsub();
  }, []);

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
    <Box sx={{ width: '100%', height: '100%', p: 2 }}>
      {/* Compact Header with Stats Inline */}
      <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
        {/* Title and Controls Row */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, flexWrap: "wrap", gap: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, display: "flex", alignItems: "center", gap: 1 }}>
              <PersonIcon /> Manage Students
            </Typography>
            <Chip 
              label={`${filteredStudents.length} ${selectedBranch === "ALL" ? "Total" : selectedBranch}`} 
              color="primary" 
              sx={{ fontWeight: 600 }}
            />
            <Chip 
              label={`${students.filter(s => s.paymentStatus === "success").length} Paid`} 
              color="success" 
              size="small"
            />
            <Chip 
              label={`${students.filter(s => s.passStatus === "Issued").length} Passes`} 
              color="warning" 
              size="small"
            />
          </Box>
          
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <TextField
              select
              size="small"
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
              placeholder="Search..."
              value={qname}
              onChange={(e) => setQname(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 0.5, color: "text.secondary", fontSize: 20 }} />,
              }}
              sx={{ minWidth: 250 }}
            />
          </Box>
        </Box>
      </Paper>

      {/* Students Table */}
      <TableContainer component={Paper} elevation={1} sx={{ maxHeight: 'calc(100vh - 220px)' }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, bgcolor: "primary.main", color: "primary.contrastText", py: 1.5 }}>Student</TableCell>
              <TableCell sx={{ fontWeight: 700, bgcolor: "primary.main", color: "primary.contrastText", py: 1.5 }}>Hall Ticket</TableCell>
              <TableCell sx={{ fontWeight: 700, bgcolor: "primary.main", color: "primary.contrastText", py: 1.5 }}>Branch</TableCell>
              <TableCell sx={{ fontWeight: 700, bgcolor: "primary.main", color: "primary.contrastText", py: 1.5 }}>Year/Sec</TableCell>
              <TableCell sx={{ fontWeight: 700, bgcolor: "primary.main", color: "primary.contrastText", py: 1.5 }}>Bus</TableCell>
              <TableCell sx={{ fontWeight: 700, bgcolor: "primary.main", color: "primary.contrastText", py: 1.5 }}>Stage</TableCell>
              <TableCell sx={{ fontWeight: 700, bgcolor: "primary.main", color: "primary.contrastText", py: 1.5 }}>Fee</TableCell>
              <TableCell sx={{ fontWeight: 700, bgcolor: "primary.main", color: "primary.contrastText", py: 1.5 }}>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredStudents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
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
                    <TableCell sx={{ py: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 28, height: 28, bgcolor: 'primary.main', fontSize: '0.75rem' }}>
                          {(student.name || 'U')[0].toUpperCase()}
                        </Avatar>
                        <Typography variant="body2" fontWeight={600}>
                          {student.name || "Unknown"}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ py: 1 }}>
                      <Typography variant="body2" fontSize="0.875rem">{student.hallTicket || "-"}</Typography>
                    </TableCell>
                    <TableCell sx={{ py: 1 }}>
                      {student.branch ? (
                        <Chip label={student.branch} size="small" color="primary" sx={{ height: 22, fontSize: '0.7rem' }} />
                      ) : (
                        <Typography variant="body2" color="text.secondary" fontSize="0.875rem">-</Typography>
                      )}
                    </TableCell>
                    <TableCell sx={{ py: 1 }}>
                      <Typography variant="body2" fontSize="0.875rem">
                        {student.year || "-"} / {student.section || "-"}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 1 }}>
                      <Typography variant="body2" fontSize="0.875rem">{student.busNumber || "-"}</Typography>
                    </TableCell>
                    <TableCell sx={{ py: 1 }}>
                      <Typography variant="body2" fontSize="0.875rem">{student.stage || "-"}</Typography>
                    </TableCell>
                    <TableCell sx={{ py: 1 }}>
                      <Typography variant="body2" fontWeight={600} fontSize="0.875rem">
                        ₹{student.fee || "0"}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 1 }}>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Chip
                          label={student.paymentStatus || "Pending"}
                          color={getStatusColor(student.paymentStatus)}
                          size="small"
                          sx={{ fontSize: '0.65rem', height: 18, fontWeight: 700 }}
                        />
                        <Chip
                          label={student.passStatus || "Not Issued"}
                          color={getStatusColor(student.passStatus)}
                          size="small"
                          sx={{ fontSize: '0.65rem', height: 18, fontWeight: 700 }}
                        />
                      </Box>
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
    </Box>
  );
}
