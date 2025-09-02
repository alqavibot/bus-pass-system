// src/pages/admin/ManageStages.jsx
import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  List,
  ListItem,
  ListItemText,
  IconButton,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
  Alert,
} from "@mui/material";
import { db } from "../../firebase/config";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";
import { Edit, Delete, ExpandMore } from "@mui/icons-material";

export default function ManageStages() {
  const [stages, setStages] = useState([]);
  const [buses, setBuses] = useState([]);
  const [newStage, setNewStage] = useState({
    busId: "",
    name: "",
    fullFee: "",
    installment1: "",
    installment2: "",
  });
  const [editId, setEditId] = useState(null);

  // Real-time fetch buses
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "buses"), (snapshot) => {
      setBuses(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  // Real-time fetch stages
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "stages"), (snapshot) => {
      setStages(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  // Add or Update Stage
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newStage.busId || !newStage.name || !newStage.fullFee) return;

    if (
      Number(newStage.installment1) + Number(newStage.installment2) !==
      Number(newStage.fullFee)
    ) {
      alert("Installments must add up to Full Fee");
      return;
    }

    if (editId) {
      await updateDoc(doc(db, "stages", editId), newStage);
      setEditId(null);
    } else {
      await addDoc(collection(db, "stages"), newStage);
    }

    setNewStage({
      busId: "",
      name: "",
      fullFee: "",
      installment1: "",
      installment2: "",
    });
  };

  // Edit Stage
  const handleEdit = (stage) => {
    setNewStage(stage);
    setEditId(stage.id);
  };

  // Delete Stage
  const handleDelete = async (id) => {
    if (window.confirm("Deleting this stage cannot be undone. Continue?")) {
      await deleteDoc(doc(db, "stages", id));
    }
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h5" gutterBottom>
        🚏 Manage Stages
      </Typography>

      {/* Add/Edit Form */}
      <Box component="form" onSubmit={handleSubmit} sx={{ mb: 3 }}>
        <FormControl fullWidth margin="normal">
          <InputLabel>Bus</InputLabel>
          <Select
            value={newStage.busId}
            onChange={(e) => setNewStage({ ...newStage, busId: e.target.value })}
            required
          >
            {buses.map((bus) => (
              <MenuItem key={bus.id} value={bus.id}>
                Bus {bus.number} - {bus.driver}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Stage Name"
          fullWidth
          margin="normal"
          value={newStage.name}
          onChange={(e) => setNewStage({ ...newStage, name: e.target.value })}
          required
        />

        <TextField
          label="Full Fee"
          type="number"
          fullWidth
          margin="normal"
          value={newStage.fullFee}
          onChange={(e) => setNewStage({ ...newStage, fullFee: e.target.value })}
          required
        />

        <TextField
          label="Installment 1"
          type="number"
          fullWidth
          margin="normal"
          value={newStage.installment1}
          onChange={(e) =>
            setNewStage({ ...newStage, installment1: e.target.value })
          }
          required
        />

        <TextField
          label="Installment 2"
          type="number"
          fullWidth
          margin="normal"
          value={newStage.installment2}
          onChange={(e) =>
            setNewStage({ ...newStage, installment2: e.target.value })
          }
          required
        />

        <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
          {editId ? "Update Stage" : "Add Stage"}
        </Button>
      </Box>

      {/* Grouped by Bus */}
      {buses.map((bus) => {
        const busStages = stages.filter((s) => s.busId === bus.id);

        return (
          <Accordion key={bus.id} disabled={busStages.length === 0}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography>
                Bus {bus.number} - {bus.driver}{" "}
                <small>({busStages.length} stages)</small>
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              {busStages.length === 0 ? (
                <Alert severity="info">
                  No stages created yet for this bus. Please add stages.
                </Alert>
              ) : (
                <Paper sx={{ maxHeight: 250, overflow: "auto" }}>
                  <List>
                    {busStages.map((stage) => (
                      <ListItem
                        key={stage.id}
                        secondaryAction={
                          <>
                            <IconButton onClick={() => handleEdit(stage)}>
                              <Edit />
                            </IconButton>
                            <IconButton onClick={() => handleDelete(stage.id)}>
                              <Delete />
                            </IconButton>
                          </>
                        }
                      >
                        <ListItemText
                          primary={`${stage.name}`}
                          secondary={`Full Fee: ₹${stage.fullFee}, Installments: ₹${stage.installment1} + ₹${stage.installment2}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              )}
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Container>
  );
}
