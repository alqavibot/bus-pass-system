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
  getDoc,           // ✅ added
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

    const update = {
      busId: selectedBusId,
      busNumber: busDoc?.busNumber || null,
      stageId: selectedStageId,
      stage: stageObj?.stageName || null,
      fee: stageObj?.fee ?? null,
      updatedAt: serverTimestamp(),
    };

    await updateDoc(doc(db, "users", selected.id), update);
    setAssignOpen(false);
  };

  // Manual Issue Pass (only if automation failed)
  const issuePass = async (student) => {
    if (!window.confirm("Issue pass for this student?")) return;

    // ✅ fetch current academic year
    const settingsRef = doc(db, "settings", "global");
    const settingsSnap = await getDoc(settingsRef);
    const currentYear = settingsSnap.exists()
      ? settingsSnap.data().currentAcademicYear
      : null;

    const token = generatePassToken(student.id);

    const passDoc = {
      passId: token,
      passToken: token,
      status: "active",
      studentId: student.id,
      studentName: student.name,
      hallTicket: student.hallTicket,
      academicYear: currentYear, // ✅ store academic year
      issuedAt: serverTimestamp(),
    };

    await setDoc(doc(db, "passes", student.id), passDoc);

    await updateDoc(doc(db, "users", student.id), {
      passStatus: "Issued",
      passToken: token,
      academicYear: currentYear, // ✅ keep in user too
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
              secondaryAction={
                <>
                  <Button
                    onClick={() => openAssign(s)}
                    variant="outlined"
                    sx={{ mr: 1 }}
                  >
                    Assign Bus
                  </Button>

                  {/* Manual Issue button only when payment success but pass not issued */}
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
                </>
              }
            >
              <ListItemText
                primary={`${s.name} (${s.hallTicket || "no HT"})`}
                secondary={`Bus: ${s.busNumber || "-"} • Stage: ${
                  s.stage || "-"
                } • Payment: ${s.paymentStatus || "pending"} • Pass: ${
                  s.passStatus || "Not Issued"
                }`}
              />
            </ListItem>
          ))}
      </List>

      {/* Assign Bus Dialog */}
      <Dialog open={assignOpen} onClose={() => setAssignOpen(false)}>
        <DialogTitle>Assign Bus & Stage</DialogTitle>
        <DialogContent>
          <TextField
            select
            label="Bus"
            value={selectedBusId}
            onChange={(e) => setSelectedBusId(e.target.value)}
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
                  {s.stageName} (₹{s.fee})
                </MenuItem>
              )
            )}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAssignSave}>
            Assign
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
