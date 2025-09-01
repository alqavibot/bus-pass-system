import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase/config";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { Navigate } from "react-router-dom";

// MUI imports
import {
  Container,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Radio,
  RadioGroup,
  FormControlLabel,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material";

export default function Payment() {
  const { user } = useAuth();
  const [buses, setBuses] = useState([]);
  const [stages, setStages] = useState([]);
  const [busId, setBusId] = useState("");
  const [stageId, setStageId] = useState("");
  const [fee, setFee] = useState(0);
  const [paymentType, setPaymentType] = useState("full"); // full | installment
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  if (!user) return <Navigate to="/login" />;

  // 🔹 Load all buses from Firestore
  useEffect(() => {
    async function loadBuses() {
      const snap = await getDocs(collection(db, "buses"));
      const list = [];
      snap.forEach((doc) => list.push({ id: doc.id, ...doc.data() }));
      setBuses(list);
    }
    loadBuses();
  }, []);

  // 🔹 When bus changes → update stage list
  useEffect(() => {
    const selected = buses.find((b) => b.id === busId);
    if (selected && Array.isArray(selected.stages)) {
      setStages(selected.stages);
    } else {
      setStages([]);
    }
    setStageId("");
    setFee(0);
  }, [busId, buses]);

  // 🔹 When stage changes → update fee
  useEffect(() => {
    if (stageId) {
      const stage =
        stages.find((s) => s.id === stageId || s.stageName === stageId) || null;
      if (stage) {
        setFee(stage.fullFee || stage.price || 0);
      }
    }
  }, [stageId, stages]);

  // 🔹 Fake payment → (later Razorpay integration)
  const handlePay = async () => {
    if (!busId || !stageId) {
      setMsg("Please select bus and stage.");
      return;
    }
    setLoading(true);
    setMsg("");

    try {
      let amount = fee;
      if (paymentType === "installment") {
        amount = Math.ceil(fee / 2);
      }

      const ref = doc(db, "users", user.uid);
      await updateDoc(ref, {
        busId,
        stageId,
        lastPaymentDate: new Date().toISOString(),
      });

      await addDoc(collection(db, "users", user.uid, "payments"), {
        busId,
        stageId,
        amount,
        type: paymentType,
        status: "success",
        createdAt: serverTimestamp(),
      });

      setMsg(`✅ Payment successful! Paid ₹${amount}`);
    } catch (err) {
      console.error("Payment error", err);
      setMsg("❌ Payment failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 5 }}>
      <Typography variant="h5" gutterBottom>
        Bus Fee Payment
      </Typography>

      {/* Bus selection */}
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Select Bus</InputLabel>
        <Select value={busId} onChange={(e) => setBusId(e.target.value)}>
          <MenuItem value="">-- Select --</MenuItem>
          {buses.map((b) => (
            <MenuItem key={b.id} value={b.id}>
              {b.busNumber || b.id}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Stage selection */}
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Select Stage</InputLabel>
        <Select
          value={stageId}
          onChange={(e) => setStageId(e.target.value)}
          disabled={!stages.length}
        >
          <MenuItem value="">-- Select --</MenuItem>
          {stages.map((s, idx) => (
            <MenuItem key={s.id || idx} value={s.id || s.stageName}>
              {s.stageName} (₹{s.fullFee ?? s.price ?? "-"})
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Fee + payment type */}
      {fee > 0 && (
        <>
          <Typography variant="body1" sx={{ mb: 1 }}>
            Fee for this stage: ₹{fee}
          </Typography>
          <RadioGroup
            value={paymentType}
            onChange={(e) => setPaymentType(e.target.value)}
          >
            <FormControlLabel
              value="full"
              control={<Radio />}
              label={`Full Payment (₹${fee})`}
            />
            <FormControlLabel
              value="installment"
              control={<Radio />}
              label={`Installment (₹${Math.ceil(fee / 2)} now)`}
            />
          </RadioGroup>
        </>
      )}

      {/* Pay Button */}
      <Button
        variant="contained"
        color="primary"
        fullWidth
        onClick={handlePay}
        disabled={loading}
        sx={{ mt: 3 }}
      >
        {loading ? <CircularProgress size={24} /> : "Pay Now"}
      </Button>

      {/* Status message */}
      {msg && (
        <Alert
          severity={msg.startsWith("✅") ? "success" : "error"}
          sx={{ mt: 3 }}
        >
          {msg}
        </Alert>
      )}
    </Container>
  );
}
