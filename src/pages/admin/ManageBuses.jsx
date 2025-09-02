// src/pages/admin/ManageBuses.jsx
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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
} from "@mui/material";
import { ExpandMore, Edit, Delete } from "@mui/icons-material";
import { db } from "../../firebase/config";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  where,
  getDocs,
} from "firebase/firestore";

export default function ManageBuses() {
  const [buses, setBuses] = useState([]);
  const [newBus, setNewBus] = useState({ number: "", driver: "" });
  const [editId, setEditId] = useState(null);

  // Real-time fetch
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "buses"), (snapshot) => {
      setBuses(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  // Add or Update Bus
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newBus.number) return;

    if (editId) {
      await updateDoc(doc(db, "buses", editId), newBus);
      setEditId(null);
    } else {
      await addDoc(collection(db, "buses"), newBus);
    }

    setNewBus({ number: "", driver: "" });
  };

  // Edit Bus
  const handleEdit = (bus) => {
    setNewBus({ number: bus.number, driver: bus.driver });
    setEditId(bus.id);
  };

  // Delete Bus + its stages
  const handleDelete = async (id) => {
    if (window.confirm("Deleting this bus will also delete its stages. Continue?")) {
      await deleteDoc(doc(db, "buses", id));

      // Delete all stages for this bus
      const stageQuery = query(collection(db, "stages"), where("busId", "==", id));
      const snapshot = await getDocs(stageQuery);
      snapshot.forEach(async (stageDoc) => {
        await deleteDoc(doc(db, "stages", stageDoc.id));
      });
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h5" gutterBottom>
        🚌 Manage Buses
      </Typography>

      {/* Add/Edit Form */}
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: "flex", gap: 2, mb: 3 }}
      >
        <TextField
          label="Bus Number"
          value={newBus.number}
          onChange={(e) => setNewBus({ ...newBus, number: e.target.value })}
          required
        />
        <TextField
          label="Driver Name"
          value={newBus.driver}
          onChange={(e) => setNewBus({ ...newBus, driver: e.target.value })}
        />
        <Button type="submit" variant="contained" color="primary">
          {editId ? "Update" : "Add"}
        </Button>
      </Box>

      {/* Accordion for Existing Buses */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography>View Existing Buses ({buses.length})</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {/* Scrollable list */}
          <Paper sx={{ maxHeight: 300, overflow: "auto" }}>
            <List>
              {buses.map((bus) => (
                <ListItem
                  key={bus.id}
                  secondaryAction={
                    <>
                      <IconButton onClick={() => handleEdit(bus)}>
                        <Edit />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(bus.id)}>
                        <Delete />
                      </IconButton>
                    </>
                  }
                >
                  <ListItemText
                    primary={`Bus ${bus.number}`}
                    secondary={`Driver: ${bus.driver || "N/A"}`}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </AccordionDetails>
      </Accordion>
    </Container>
  );
}
