// src/pages/admin/CleanupData.jsx
// Admin utility page to clear all payment data
// USE WITH CAUTION - This will delete ALL payment records!

import React, { useState } from 'react';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Alert,
  CircularProgress,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  DeleteForever as DeleteIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import { clearAllPayments, clearPaymentsAndResetPasses } from '../../utils/clearPayments';

export default function CleanupData() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [cleanupType, setCleanupType] = useState('payments'); // 'payments' or 'all'

  const handleClearPayments = async () => {
    setConfirmDialog(false);
    setLoading(true);
    setResult(null);

    try {
      let response;
      if (cleanupType === 'all') {
        response = await clearPaymentsAndResetPasses();
      } else {
        response = await clearAllPayments();
      }
      
      setResult(response);
    } catch (error) {
      setResult({
        success: false,
        error: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const openConfirmDialog = (type) => {
    setCleanupType(type);
    setConfirmDialog(true);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        🗑️ Database Cleanup Utility
      </Typography>

      <Alert severity="error" icon={<WarningIcon />} sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          ⚠️ DANGER ZONE
        </Typography>
        <Typography variant="body2">
          This utility will permanently delete data from Firestore. This action <strong>CANNOT BE UNDONE</strong>.
          Only use this for testing or when you need to start fresh with the new payment logic.
        </Typography>
      </Alert>

      {/* Option 1: Clear Payments Only */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight={600}>
            Option 1: Clear Payment Records Only
          </Typography>
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="body2" color="text.secondary" paragraph>
            This will delete all payment records from the database, including:
          </Typography>
          <Box component="ul" sx={{ pl: 2 }}>
            <li>All successful payments</li>
            <li>All pending payments</li>
            <li>All failed payments</li>
            <li>All payment history</li>
          </Box>
          
          <Alert severity="info" sx={{ mt: 2, mb: 2 }}>
            <Typography variant="body2">
              <strong>Note:</strong> This will NOT affect student passes. Existing passes will remain,
              but payment history will be cleared.
            </Typography>
          </Alert>

          <Button
            variant="contained"
            color="warning"
            startIcon={<DeleteIcon />}
            onClick={() => openConfirmDialog('payments')}
            disabled={loading}
            fullWidth
            size="large"
          >
            Clear All Payment Records
          </Button>
        </CardContent>
      </Card>

      {/* Option 2: Clear Payments AND Reset Passes */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight={600} color="error">
            Option 2: Clear Payments AND Reset Passes
          </Typography>
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="body2" color="text.secondary" paragraph>
            This will delete all payment records AND reset all student passes:
          </Typography>
          <Box component="ul" sx={{ pl: 2 }}>
            <li>All payment records (as in Option 1)</li>
            <li>All pass documents from /passes collection</li>
            <li>All pass-related fields from user profiles (busNumber, stage, fee, etc.)</li>
            <li>Students will need to make new payments</li>
            <li>Students will need new passes to be issued</li>
          </Box>
          
          <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
            <Typography variant="body2">
              <strong>⚠️ WARNING:</strong> This is a complete reset! Use this only when starting completely
              fresh or after an academic year change.
            </Typography>
          </Alert>

          <Button
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => openConfirmDialog('all')}
            disabled={loading}
            fullWidth
            size="large"
          >
            Clear Payments AND Reset Passes
          </Button>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading && (
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <CircularProgress size={60} sx={{ mb: 2 }} />
            <Typography variant="h6">
              Cleaning up database...
            </Typography>
            <Typography variant="body2" color="text.secondary">
              This may take a few moments. Please do not close this page.
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Result Display */}
      {result && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            {result.success ? (
              <>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <CheckIcon color="success" fontSize="large" />
                  <Typography variant="h6" color="success.main">
                    Cleanup Successful!
                  </Typography>
                </Box>
                <Alert severity="success">
                  <Typography variant="body1">
                    {result.message}
                  </Typography>
                  {result.deleted > 0 && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      • Deleted {result.deleted} payment records
                    </Typography>
                  )}
                  {result.passesDeleted > 0 && (
                    <Typography variant="body2">
                      • Deleted {result.passesDeleted} pass documents
                    </Typography>
                  )}
                  {result.usersUpdated > 0 && (
                    <Typography variant="body2">
                      • Cleared pass data from {result.usersUpdated} user profiles
                    </Typography>
                  )}
                </Alert>
              </>
            ) : (
              <>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <WarningIcon color="error" fontSize="large" />
                  <Typography variant="h6" color="error">
                    Cleanup Failed
                  </Typography>
                </Box>
                <Alert severity="error">
                  <Typography variant="body1">
                    Error: {result.error}
                  </Typography>
                </Alert>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog} onClose={() => setConfirmDialog(false)}>
        <DialogTitle sx={{ color: 'error.main' }}>
          ⚠️ Confirm Cleanup Action
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            Are you absolutely sure you want to proceed?
          </Typography>
          {cleanupType === 'payments' ? (
            <Typography variant="body2" color="text.secondary">
              This will permanently delete <strong>all payment records</strong> from the database.
            </Typography>
          ) : (
            <Typography variant="body2" color="text.secondary">
              This will permanently delete <strong>all payment records AND reset all passes</strong>.
              Students will need to make new payments.
            </Typography>
          )}
          <Alert severity="error" sx={{ mt: 2 }}>
            <strong>This action cannot be undone!</strong>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog(false)} variant="outlined">
            Cancel
          </Button>
          <Button 
            onClick={handleClearPayments} 
            variant="contained" 
            color="error"
            startIcon={<DeleteIcon />}
          >
            Yes, Delete Everything
          </Button>
        </DialogActions>
      </Dialog>

      {/* Info Card */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            ℹ️ When to Use This Tool
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Typography variant="body2" color="text.secondary" paragraph>
            Use this cleanup utility in the following scenarios:
          </Typography>
          <Box component="ul" sx={{ pl: 2 }}>
            <li>Testing the new duplicate payment prevention logic</li>
            <li>Starting a new academic year with a clean slate</li>
            <li>Removing test/dummy payment data</li>
            <li>After fixing payment system bugs</li>
          </Box>
          <Alert severity="warning" sx={{ mt: 2 }}>
            <strong>Recommendation:</strong> After cleanup, inform all students that they need to
            make new payments to receive their bus passes.
          </Alert>
        </CardContent>
      </Card>
    </Container>
  );
}

