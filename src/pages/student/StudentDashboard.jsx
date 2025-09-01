// src/pages/student/StudentDashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import {
  doc,
  onSnapshot,
  collection,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";
import {
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Divider,
} from "@mui/material";

import { auth, db } from "../../firebase/config";
import { useAuth } from "../../context/AuthContext";

export default function StudentDashboard() {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [payment, setPayment] = useState(null);
  const [pass, setPass] = useState(null);
  const navigate = useNavigate();

  // ✅ Real-time Profile Updates
  useEffect(() => {
    if (!currentUser) return;

    const unsub = onSnapshot(doc(db, "users", currentUser.uid), (docSnap) => {
      if (docSnap.exists()) {
        setProfile(docSnap.data());
      }
    });

    return () => unsub();
  }, [currentUser]);

  // ✅ Real-time Payment Updates (latest one)
  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, "payments"),
      where("studentId", "==", currentUser.uid),
      orderBy("timestamp", "desc"),
      limit(1)
    );

    const unsub = onSnapshot(q, (snap) => {
      if (!snap.empty) {
        setPayment(snap.docs[0].data());
      } else {
        setPayment(null);
      }
    });

    return () => unsub();
  }, [currentUser]);

  // ✅ Real-time Bus Pass Updates
  useEffect(() => {
    if (!currentUser) return;

    const unsub = onSnapshot(doc(db, "passes", currentUser.uid), (docSnap) => {
      if (docSnap.exists()) {
        setPass(docSnap.data());
      } else {
        setPass(null);
      }
    });

    return () => unsub();
  }, [currentUser]);

  // ✅ Logout
  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Student Dashboard
      </Typography>
      <Divider sx={{ mb: 3 }} />

      {/* Profile Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6">Profile</Typography>
          {profile ? (
            <>
              <Typography>Name: {profile.name}</Typography>
              <Typography>Hall Ticket: {profile.hallTicket}</Typography>
              <Typography>Branch/Section: {profile.section}</Typography>
              <Typography>Year: {profile.year}</Typography>
              <Typography>Stage: {profile.stage}</Typography>
              <Button
                variant="outlined"
                sx={{ mt: 2 }}
                onClick={() => navigate("/profile")}
              >
                Edit Profile
              </Button>
            </>
          ) : (
            <Typography color="text.secondary">
              No profile data found.
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Bus Info Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6">Bus Information</Typography>
          {profile ? (
            <>
              <Typography>Bus Number: {profile.busNo || "Not assigned"}</Typography>
              <Typography>Stage: {profile.stage || "N/A"}</Typography>
              <Typography>Fee: {profile.fee || "N/A"} ₹</Typography>
            </>
          ) : (
            <Typography color="text.secondary">No bus data found.</Typography>
          )}
        </CardContent>
      </Card>

      {/* Payment Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6">Payment</Typography>
          {payment ? (
            <>
              <Typography>Amount Paid: {payment.amount} ₹</Typography>
              <Typography>Mode: {payment.mode}</Typography>
              <Typography>Status: {payment.status}</Typography>
              <Typography>
                Date: {payment.timestamp?.toDate().toLocaleString()}
              </Typography>
            </>
          ) : (
            <>
              <Typography color="text.secondary">No payments found.</Typography>
              <Button
                variant="contained"
                sx={{ mt: 2 }}
                onClick={() => navigate("/payment")}
              >
                Make Payment
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Pass Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6">My Bus Pass</Typography>
          {pass ? (
            <>
              <Typography>Pass ID: {pass.passId}</Typography>
              <Typography>Status: {pass.status}</Typography>
              <Button
                variant="outlined"
                sx={{ mt: 2 }}
                onClick={() => navigate("/mypas")}
              >
                View Pass
              </Button>
            </>
          ) : (
            <Typography color="text.secondary">No pass issued yet.</Typography>
          )}
        </CardContent>
      </Card>

      {/* Logout */}
      <Grid container justifyContent="flex-end">
        <Button variant="contained" color="error" onClick={handleLogout}>
          Logout
        </Button>
      </Grid>
    </Container>
  );
}
