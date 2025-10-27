// src/pages/student/StudentPayments.jsx
import React, { useEffect, useState } from "react";
import { Container, Typography, TextField, MenuItem, Button, Box, Card, CardContent, Alert, Chip } from "@mui/material";
import { db } from "../../firebase/config";
import { collection, onSnapshot, query, where, doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function StudentPayments() {
  const { currentUser } = useAuth();
  const [buses, setBuses] = useState([]);
  const [stages, setStages] = useState([]);
  const [selectedBus, setSelectedBus] = useState("");
  const [selectedStage, setSelectedStage] = useState("");
  const [userProfile, setUserProfile] = useState(null);
  const [hasSavedBusStage, setHasSavedBusStage] = useState(false);
  const [isChangingRoute, setIsChangingRoute] = useState(false);
  const navigate = useNavigate();

  // ✅ Load user profile to check if bus/stage already saved (REAL-TIME)
  useEffect(() => {
    if (!currentUser) return;
    
    // Use real-time listener instead of one-time fetch
    const unsubscribe = onSnapshot(doc(db, "users", currentUser.uid), (docSnap) => {
      if (docSnap.exists()) {
        const profile = docSnap.data();
        setUserProfile(profile);
        
        console.log("📍 Profile loaded:", {
          busId: profile.busId,
          stageId: profile.stageId,
          busNumber: profile.busNumber,
          stage: profile.stage
        });
        
        // Check if user already has bus and stage saved
        if (profile.busId && profile.stageId) {
          setHasSavedBusStage(true);
          setSelectedBus(profile.busId);
          setSelectedStage(profile.stageId);
          console.log("✅ Saved route detected!");
        } else {
          setHasSavedBusStage(false);
          console.log("📍 No saved route - showing selection");
        }
      }
    });
    
    return () => unsubscribe();
  }, [currentUser]);

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

          {/* Show saved bus/stage info */}
          {hasSavedBusStage && !isChangingRoute && (
            <Alert severity="success" sx={{ mb: 2 }}>
              <Typography variant="body2" fontWeight={600}>
                ✅ Your Current Route
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 1, mb: 1 }}>
                <Chip 
                  label={`Bus: ${userProfile?.busNumber || 'Loading...'}`} 
                  color="primary" 
                  size="small" 
                />
                <Chip 
                  label={`Stage: ${userProfile?.stage || 'Loading...'}`} 
                  color="primary" 
                  size="small" 
                />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                  Your registered bus route
                </Typography>
                <Button 
                  size="small" 
                  onClick={() => {
                    setIsChangingRoute(true);
                    setSelectedBus("");
                    setSelectedStage("");
                  }}
                  sx={{ textTransform: 'none' }}
                >
                  🔄 Change Route
                </Button>
              </Box>
            </Alert>
          )}

          {/* Show selection for new users OR when changing route */}
          {(!hasSavedBusStage || isChangingRoute) && (
            <>
              {isChangingRoute && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  <Typography variant="body2" fontWeight={600}>
                    🔄 Changing Your Route
                  </Typography>
                  <Typography variant="caption">
                    Select your new bus and stage. This will update your registered route.
                  </Typography>
                  <Button 
                    size="small" 
                    onClick={() => {
                      setIsChangingRoute(false);
                      setSelectedBus(userProfile?.busId || "");
                      setSelectedStage(userProfile?.stageId || "");
                    }}
                    sx={{ mt: 1, textTransform: 'none' }}
                  >
                    Cancel
                  </Button>
                </Alert>
              )}
              
              {!isChangingRoute && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2" fontWeight={600}>
                    📍 First Time Setup
                  </Typography>
                  <Typography variant="caption">
                    Select your bus and stage. This will be saved for future payments.
                  </Typography>
                </Alert>
              )}

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
                  required
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
                    required
                  >
                    <MenuItem value="">-- Select Stage --</MenuItem>
                    {stages.length === 0 ? (
                      <MenuItem disabled>This bus has no stages</MenuItem>
                    ) : (
                      stages.map((s) => (
                        <MenuItem key={s.id} value={s.id}>
                          {s.name} - ₹{s.fullFee} (Full) | ₹{s.installment1} + ₹{s.installment2} (Installments)
                        </MenuItem>
                      ))
                    )}
                  </TextField>
                </Box>
              )}
            </>
          )}

          {/* Payment Button */}
          <Button
            variant="contained"
            color="primary"
            disabled={!selectedBus || !selectedStage}
            onClick={handleMakePayment}
            fullWidth
            size="large"
          >
            {isChangingRoute ? 'Update Route & Continue' : 
             hasSavedBusStage ? 'Continue to Payment' : 
             'Save & Continue to Payment'}
          </Button>
        </CardContent>
      </Card>
    </Container>
  );
}
