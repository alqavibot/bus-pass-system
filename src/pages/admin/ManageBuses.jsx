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
import { Edit, Delete } from "@mui/icons-material";

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

  // Delete Bus
  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "buses", id));
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

      {/* List of Buses */}
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
    </Container>
  );
}
