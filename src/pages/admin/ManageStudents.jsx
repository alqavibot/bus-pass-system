// src/pages/admin/ManageStudents.jsx
import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  TextField,
  Box,
  List,
  ListItem,
  ListItemText,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
} from "@mui/material";
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

export default function ManageStudents() {
  const [students, setStudents] = useState([]);
  const [qname, setQname] = useState("");
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

  return (
    <Container>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h6">Manage Students</Typography>
        <TextField
          placeholder="Search name/hallticket"
          value={qname}
          onChange={(e) => setQname(e.target.value)}
        />
      </Box>

      <List>
        {students
          .filter((s) => {
            if (!qname) return true;
            const q = qname.toLowerCase();
            return (
              String(s.name || "").toLowerCase().includes(q) ||
              String(s.hallTicket || "").toLowerCase().includes(q)
            );
          })
          .map((s) => (
            <ListItem
              key={s.id}
              sx={{ alignItems: "flex-start", mb: 2 }} // extra space between details and buttons
              secondaryAction={
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button
                    onClick={() => openAssign(s)}
                    variant="outlined"
                    sx={{ minWidth: 100 }}
                  >
                    Assign
                  </Button>

                  <Button
                    onClick={() => removeAssignment(s)}
                    variant="outlined"
                    color="error"
                    sx={{ minWidth: 100 }}
                  >
                    Remove
                  </Button>

                  {s.paymentStatus === "success" &&
                    s.passStatus !== "Issued" && (
                      <Button
                        onClick={() => issuePass(s)}
                        variant="contained"
                        color="success"
                      >
                        Issue Pass
                      </Button>
                    )}
                </Box>
              }
            >
              <ListItemText
                primary={`${s.name} (${s.hallTicket || "no HT"})`}
                secondary={`Bus: ${s.busNumber || "-"} • Stage: ${
                  s.stage || "-"
                } • Fee: ₹${s.fee || "-"} • Payment: ${
                  s.paymentStatus || "pending"
                } • Pass: ${s.passStatus || "Not Issued"}`}
              />
            </ListItem>
          ))}
      </List>

      {/* Assign Bus Dialog */}
      <Dialog open={assignOpen} onClose={() => setAssignOpen(false)}>
        <DialogTitle>Assign Bus & Stage</DialogTitle>
        <DialogContent>
          {/* Bus Select */}
          <TextField
            select
            label="Bus"
            value={selectedBusId}
            onChange={(e) => {
              setSelectedBusId(e.target.value);
              setSelectedStageId(""); // reset stage
            }}
            fullWidth
            sx={{ mb: 2 }}
          >
            <MenuItem value="">-- Select Bus --</MenuItem>
            {buses.map((b) => (
              <MenuItem key={b.id} value={b.id}>
                {b.busNumber}
              </MenuItem>
            ))}
          </TextField>

          {/* Stage Select */}
          <TextField
            select
            label="Stage"
            value={selectedStageId}
            onChange={(e) => setSelectedStageId(e.target.value)}
            fullWidth
          >
            <MenuItem value="">-- Select Stage --</MenuItem>
            {(buses.find((b) => b.id === selectedBusId)?.stages || []).map(
              (s) => (
                <MenuItem key={s.id} value={s.id}>
                  {s.stageName} (₹{s.fee || 0})
                </MenuItem>
              )
            )}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAssignSave}
            disabled={!selectedBusId || !selectedStageId}
          >
            Assign
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
