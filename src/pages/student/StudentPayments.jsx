// src/pages/student/StudentPayments.jsx
import React, { useEffect, useState } from "react";
import { Container, Typography, TextField, MenuItem, Button, Box, Card, CardContent } from "@mui/material";
import { db } from "../../firebase/config";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function StudentPayments() {
  const [buses, setBuses] = useState([]);
  const [stages, setStages] = useState([]);
  const [selectedBus, setSelectedBus] = useState("");
  const [selectedStage, setSelectedStage] = useState("");
  const navigate = useNavigate();

  // ✅ Fetch all buses (real-time)
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "buses"), (snap) => {
      const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setBuses(arr);
    });
    return () => unsub();
  }, []);

  // ✅ Fetch stages of selected bus (real-time, linked by busId)
  useEffect(() => {
    if (!selectedBus) {
      setStages([]);
      return;
    }
    const q = query(collection(db, "stages"), where("busId", "==", selectedBus));
    const unsub = onSnapshot(q, (snap) => {
      const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setStages(arr);
    });
    return () => unsub();
  }, [selectedBus]);

  // ✅ Navigate to PaymentOptions page
  const handleMakePayment = () => {
    const bus = buses.find((b) => b.id === selectedBus);
    const stage = stages.find((s) => s.id === selectedStage);

    if (!bus || !stage) {
      alert("Please select valid bus and stage");
      return;
    }

    navigate("/payment/options", { state: { bus, stage } });
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
            Make a Payment
          </Typography>

          {/* Select Bus */}
          <Box sx={{ mb: 2 }}>
            <TextField
              select
              label="Select Bus"
              value={selectedBus}
              onChange={(e) => {
                setSelectedBus(e.target.value);
                setSelectedStage(""); // reset stage when bus changes
              }}
              fullWidth
            >
              <MenuItem value="">-- Select Bus --</MenuItem>
              {buses.map((b) => (
                <MenuItem key={b.id} value={b.id}>
                  Bus {b.number} (Driver: {b.driver})
                </MenuItem>
              ))}
            </TextField>
          </Box>

          {/* Select Stage */}
          {selectedBus && (
            <Box sx={{ mb: 2 }}>
              <TextField
                select
                label="Select Stage"
                value={selectedStage}
                onChange={(e) => setSelectedStage(e.target.value)}
                fullWidth
              >
                <MenuItem value="">-- Select Stage --</MenuItem>
                {stages.length === 0 ? (
                  <MenuItem disabled>This bus has no stages</MenuItem>
                ) : (
                  stages.map((s) => (
                    <MenuItem key={s.id} value={s.id}>
                      {s.name} (₹{s.fullFee})
                    </MenuItem>
                  ))
                )}
              </TextField>
            </Box>
          )}

          {/* Payment Button */}
          <Button
            variant="contained"
            color="primary"
            disabled={!selectedBus || !selectedStage}
            onClick={handleMakePayment}
            fullWidth
          >
            Continue
          </Button>
        </CardContent>
      </Card>
    </Container>
  );
}
