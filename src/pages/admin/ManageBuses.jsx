// src/pages/admin/ManageBuses.jsx
import React, { useState, useEffect } from "react";
import {
  Typography,
  TextField,
  Button,
  Box,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
} from "@mui/material";
import { Edit, Delete, Add } from "@mui/icons-material";
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
      const busData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      // Sort buses by number in ascending order
      busData.sort((a, b) => {
        const numA = parseInt(a.number) || 0;
        const numB = parseInt(b.number) || 0;
        return numA - numB;
      });
      setBuses(busData);
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

  // Cancel Edit
  const handleCancel = () => {
    setNewBus({ number: "", driver: "" });
    setEditId(null);
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
    <Box sx={{ width: '100%', height: '100%', p: 2 }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
        🚌 Manage Buses
      </Typography>

      {/* Add/Edit Form */}
      <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
          {editId ? "Edit Bus" : "Add New Bus"}
        </Typography>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: "flex", gap: 1.5, alignItems: "center" }}
        >
          <TextField
            label="Bus Number"
            size="small"
            value={newBus.number}
            onChange={(e) => setNewBus({ ...newBus, number: e.target.value })}
            required
            sx={{ flex: 1 }}
          />
          <TextField
            label="Driver Name"
            size="small"
            value={newBus.driver}
            onChange={(e) => setNewBus({ ...newBus, driver: e.target.value })}
            sx={{ flex: 1 }}
          />
          <Button 
            type="submit" 
            variant="contained" 
            size="small"
            startIcon={editId ? <Edit /> : <Add />}
          >
            {editId ? "Update" : "Add"}
          </Button>
          {editId && (
            <Button 
              variant="outlined" 
              size="small"
              onClick={handleCancel}
            >
              Cancel
            </Button>
          )}
        </Box>
      </Paper>

      {/* Buses Table - With Scrolling */}
      {buses.length === 0 ? (
        <Alert severity="info">No buses added yet. Add your first bus above!</Alert>
      ) : (
        <TableContainer component={Paper} elevation={1} sx={{ maxHeight: 'calc(100vh - 300px)', overflow: 'auto' }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ 
                  fontWeight: 700, 
                  bgcolor: "primary.main", 
                  color: "primary.contrastText", 
                  width: '15%',
                  borderTop: '3px solid #000',
                  borderLeft: '3px solid #000',
                  borderBottom: 'none',
                  py: 2,
                }}>
                  #
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 700, 
                  bgcolor: "primary.main", 
                  color: "primary.contrastText", 
                  width: '30%',
                  borderTop: '3px solid #000',
                  borderBottom: 'none',
                  py: 2,
                }}>
                  Bus Number
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 700, 
                  bgcolor: "primary.main", 
                  color: "primary.contrastText", 
                  width: '40%',
                  borderTop: '3px solid #000',
                  borderBottom: 'none',
                  py: 2,
                }}>
                  Driver Name
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 700, 
                  bgcolor: "primary.main", 
                  color: "primary.contrastText", 
                  width: '15%',
                  borderTop: '3px solid #000',
                  borderRight: '3px solid #000',
                  borderBottom: 'none',
                  py: 2,
                }} align="center">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {buses.map((bus, index) => (
                <TableRow 
                  key={bus.id}
                  hover
                  sx={{ 
                    '&:hover': { bgcolor: 'action.hover' },
                    bgcolor: editId === bus.id ? 'action.selected' : 'inherit'
                  }}
                >
                  <TableCell sx={{ 
                    py: 2, 
                    height: '60px',
                    borderLeft: '3px solid #000',
                    borderBottom: index === buses.length - 1 ? '3px solid #000' : '1px solid rgba(0,0,0,0.3)',
                  }}>
                    <Typography variant="body2" fontWeight={600}>
                      {index + 1}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ 
                    py: 2, 
                    height: '60px',
                    borderBottom: index === buses.length - 1 ? '3px solid #000' : '1px solid rgba(0,0,0,0.3)',
                  }}>
                    <Typography variant="body2" fontWeight={600}>
                      {bus.number}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ 
                    py: 2, 
                    height: '60px',
                    borderBottom: index === buses.length - 1 ? '3px solid #000' : '1px solid rgba(0,0,0,0.3)',
                  }}>
                    <Typography variant="body2">
                      {bus.driver || "-"}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ 
                    py: 2, 
                    height: '60px',
                    borderRight: '3px solid #000',
                    borderBottom: index === buses.length - 1 ? '3px solid #000' : '1px solid rgba(0,0,0,0.3)',
                  }} align="center">
                    <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleEdit(bus)}
                        title="Edit"
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(bus.id)}
                        title="Delete"
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
