// src/pages/admin/ManageStages.jsx
import React, { useState, useEffect } from "react";
import {
  Typography,
  TextField,
  Button,
  Box,
  IconButton,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Paper,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid,
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
import { Edit, Delete, Add } from "@mui/icons-material";

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

  // Cancel Edit
  const handleCancel = () => {
    setNewStage({
      busId: "",
      name: "",
      fullFee: "",
      installment1: "",
      installment2: "",
    });
    setEditId(null);
  };

  // Delete Stage
  const handleDelete = async (id) => {
    if (window.confirm("Deleting this stage cannot be undone. Continue?")) {
      await deleteDoc(doc(db, "stages", id));
    }
  };

  // Sort buses by number in ascending order
  const sortedBuses = [...buses].sort((a, b) => {
    const numA = parseInt(a.number) || 0;
    const numB = parseInt(b.number) || 0;
    return numA - numB;
  });

  // Group stages by bus
  const busesWithStages = sortedBuses.map(bus => ({
    ...bus,
    stages: stages.filter(s => s.busId === bus.id)
  })).filter(bus => bus.stages.length > 0);

  return (
    <Box sx={{ width: '100%', height: '100%', p: 2 }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
        🚏 Manage Stages
      </Typography>

      {/* Add/Edit Form */}
      <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
          {editId ? "Edit Stage" : "Add New Stage"}
        </Typography>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={1.5}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Bus</InputLabel>
                <Select
                  value={newStage.busId}
                  onChange={(e) => setNewStage({ ...newStage, busId: e.target.value })}
                  required
                  label="Bus"
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 300,
                      },
                    },
                  }}
                >
                  {sortedBuses.map((bus) => (
                    <MenuItem 
                      key={bus.id} 
                      value={bus.id}
                      sx={{ 
                        whiteSpace: 'normal',
                        py: 1.5,
                      }}
                    >
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          Bus {bus.number}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Driver: {bus.driver}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Stage Name"
                size="small"
                fullWidth
                value={newStage.name}
                onChange={(e) => setNewStage({ ...newStage, name: e.target.value })}
                required
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                label="Full Fee (₹)"
                type="number"
                size="small"
                fullWidth
                value={newStage.fullFee}
                onChange={(e) => setNewStage({ ...newStage, fullFee: e.target.value })}
                required
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                label="1st Installment (₹)"
                type="number"
                size="small"
                fullWidth
                value={newStage.installment1}
                onChange={(e) =>
                  setNewStage({ ...newStage, installment1: e.target.value })
                }
                required
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                label="2nd Installment (₹)"
                type="number"
                size="small"
                fullWidth
                value={newStage.installment2}
                onChange={(e) =>
                  setNewStage({ ...newStage, installment2: e.target.value })
                }
                required
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 1 }}>
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
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* Stages Grouped by Bus - With Scrolling */}
      {stages.length === 0 ? (
        <Alert severity="info">No stages added yet. Add your first stage above!</Alert>
      ) : (
        <TableContainer component={Paper} elevation={1} sx={{ maxHeight: 'calc(100vh - 300px)', overflow: 'auto' }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ 
                  fontWeight: 700, 
                  bgcolor: "primary.main", 
                  color: "primary.contrastText", 
                  width: '16%',
                  borderTop: '3px solid #000',
                  borderLeft: '3px solid #000',
                  borderRight: '2px solid rgba(255,255,255,0.3)',
                  borderBottom: 'none',
                  py: 2,
                }}>
                  Bus Number
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 700, 
                  bgcolor: "primary.main", 
                  color: "primary.contrastText", 
                  width: '28%',
                  borderTop: '3px solid #000',
                  borderBottom: 'none',
                  py: 2,
                }}>
                  Stage Name
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 700, 
                  bgcolor: "primary.main", 
                  color: "primary.contrastText", 
                  width: '14%',
                  borderTop: '3px solid #000',
                  borderBottom: 'none',
                  py: 2,
                }} align="right">
                  Full Fee
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 700, 
                  bgcolor: "primary.main", 
                  color: "primary.contrastText", 
                  width: '14%',
                  borderTop: '3px solid #000',
                  borderBottom: 'none',
                  py: 2,
                }} align="right">
                  1st Installment
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 700, 
                  bgcolor: "primary.main", 
                  color: "primary.contrastText", 
                  width: '14%',
                  borderTop: '3px solid #000',
                  borderBottom: 'none',
                  py: 2,
                }} align="right">
                  2nd Installment
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 700, 
                  bgcolor: "primary.main", 
                  color: "primary.contrastText", 
                  width: '14%',
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
              {busesWithStages.map((bus, busIndex) => (
                <React.Fragment key={bus.id}>
                  {bus.stages.map((stage, stageIndex) => (
                    <TableRow 
                      key={stage.id}
                      hover
                      sx={{ 
                        '&:hover': { bgcolor: 'action.hover' },
                        bgcolor: editId === stage.id ? 'action.selected' : 'inherit'
                      }}
                    >
                      {/* Show bus number only for the first stage of each bus */}
                      {stageIndex === 0 ? (
                        <TableCell 
                          sx={{ 
                            py: 2, 
                            height: '60px',
                            fontWeight: 700, 
                            bgcolor: 'primary.main',
                            color: 'primary.contrastText',
                            borderBottom: stageIndex === bus.stages.length - 1 ? '3px solid #000' : '1px solid rgba(255,255,255,0.3)',
                            borderTop: busIndex === 0 ? 'none' : '3px solid #000',
                            borderLeft: '3px solid #000',
                            borderRight: '2px solid rgba(255,255,255,0.3)',
                            width: '16%',
                          }}
                          rowSpan={bus.stages.length}
                        >
                          <Typography variant="body2" fontWeight={700} fontSize="1rem">
                            Bus {bus.number}
                          </Typography>
                          <Typography variant="caption" sx={{ opacity: 0.9 }}>
                            {bus.driver}
                          </Typography>
                        </TableCell>
                      ) : null}
                      
                      <TableCell sx={{ 
                        py: 2,
                        height: '60px',
                        width: '28%',
                        borderBottom: stageIndex === bus.stages.length - 1 ? '3px solid #000' : '1px solid rgba(0,0,0,0.3)',
                        borderTop: stageIndex === 0 && busIndex !== 0 ? '3px solid #000' : undefined,
                      }}>
                        <Typography variant="body2">
                          {stage.name}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ 
                        py: 2,
                        height: '60px',
                        width: '14%',
                        borderBottom: stageIndex === bus.stages.length - 1 ? '3px solid #000' : '1px solid rgba(0,0,0,0.3)',
                        borderTop: stageIndex === 0 && busIndex !== 0 ? '3px solid #000' : undefined,
                      }} align="right">
                        <Typography variant="body2" fontWeight={600}>
                          ₹{stage.fullFee}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ 
                        py: 2,
                        height: '60px',
                        width: '14%',
                        borderBottom: stageIndex === bus.stages.length - 1 ? '3px solid #000' : '1px solid rgba(0,0,0,0.3)',
                        borderTop: stageIndex === 0 && busIndex !== 0 ? '3px solid #000' : undefined,
                      }} align="right">
                        <Typography variant="body2">
                          ₹{stage.installment1}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ 
                        py: 2,
                        height: '60px',
                        width: '14%',
                        borderBottom: stageIndex === bus.stages.length - 1 ? '3px solid #000' : '1px solid rgba(0,0,0,0.3)',
                        borderTop: stageIndex === 0 && busIndex !== 0 ? '3px solid #000' : undefined,
                      }} align="right">
                        <Typography variant="body2">
                          ₹{stage.installment2}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ 
                        py: 2,
                        height: '60px',
                        width: '14%',
                        borderBottom: stageIndex === bus.stages.length - 1 ? '3px solid #000' : '1px solid rgba(0,0,0,0.3)',
                        borderTop: stageIndex === 0 && busIndex !== 0 ? '3px solid #000' : undefined,
                        borderRight: '3px solid #000',
                      }} align="center">
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleEdit(stage)}
                            title="Edit"
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(stage.id)}
                            title="Delete"
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
