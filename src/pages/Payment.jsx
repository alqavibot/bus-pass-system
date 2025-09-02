// src/pages/student/StudentPayment.jsx
import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  Card,
  CardContent,
} from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebase/config";
import {
  doc,
  getDoc,
  addDoc,
  collection,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function StudentPayment() {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [stageFee, setStageFee] = useState(null);
  const [mode, setMode] = useState("full"); // default full
  const navigate = useNavigate();

  // Fetch profile
  useEffect(() => {
    if (!currentUser) return;
    (async () => {
      const snap = await getDoc(doc(db, "users", currentUser.uid));
      if (snap.exists()) {
        setProfile(snap.data());
      }
    })();
  }, [currentUser]);

  // Fetch stage fee
  useEffect(() => {
    if (!profile?.stage || !profile?.busId) return;
    (async () => {
      const q = await getDoc(doc(db, "stages", profile.stage));
      if (q.exists()) {
        setStageFee(q.data());
      }
    })();
  }, [profile]);

  const handlePayment = async () => {
    if (!stageFee) return;

    let amountPaid = 0;
    let dueAmount = 0;

    if (mode === "full") {
      amountPaid = stageFee.fullFee;
      dueAmount = 0;
    } else {
      amountPaid = stageFee.installment1;
      dueAmount = stageFee.installment2;
    }

    // Save payment record
    await addDoc(collection(db, "payments"), {
      studentId: currentUser.uid,
      busId: profile.busId,
      stageId: profile.stage,
      mode,
      amount: amountPaid,
      dueAmount,
      timestamp: serverTimestamp(),
      status: "paid",
    });

    // Save/update pass
    await setDoc(doc(db, "passes", currentUser.uid), {
      studentId: currentUser.uid,
      busId: profile.busId,
      stageId: profile.stage,
      status: dueAmount > 0 ? "due" : "active",
      dueAmount,
      paymentMode: mode,
      issuedAt: new Date(),
    });

    alert("Payment successful!");
    navigate("/student/dashboard");
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Fee Payment
          </Typography>

          {!stageFee ? (
            <Typography color="text.secondary">
              Loading fee details...
            </Typography>
          ) : (
            <>
              <Typography>
                Bus: {profile?.busNumber} | Stage: {profile?.stageName}
              </Typography>
              <Typography>
                Full Fee: ₹{stageFee.fullFee} | Installments: ₹
                {stageFee.installment1} + ₹{stageFee.installment2}
              </Typography>

              <RadioGroup
                value={mode}
                onChange={(e) => setMode(e.target.value)}
              >
                <FormControlLabel
                  value="full"
                  control={<Radio />}
                  label={`Full Payment (₹${stageFee.fullFee})`}
                />
                <FormControlLabel
                  value="installment"
                  control={<Radio />}
                  label={`Installment 1 (₹${stageFee.installment1}), Due: ₹${stageFee.installment2}`}
                />
              </RadioGroup>

              <Button
                variant="contained"
                color="primary"
                fullWidth
                sx={{ mt: 2 }}
                onClick={handlePayment}
              >
                Pay Now
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}
