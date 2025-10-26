// src/components/PaymentReceipt.jsx
import React, { useRef } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Divider,
  Grid,
  Paper,
} from "@mui/material";
import {
  Download as DownloadIcon,
  Print as PrintIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function PaymentReceipt({ payment, student, onClose }) {
  const receiptRef = useRef();

  const downloadReceipt = async () => {
    if (!receiptRef.current) return;
    try {
      const canvas = await html2canvas(receiptRef.current, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`payment-receipt-${payment.id || Date.now()}.pdf`);
    } catch (err) {
      console.error("Download receipt failed:", err);
      alert("Failed to download receipt. Check console for details.");
    }
  };

  const printReceipt = () => {
    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) {
      alert("Please allow pop-ups to print the receipt.");
      return;
    }

    const receiptElement = receiptRef.current.cloneNode(true);
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Payment Receipt - ${payment.id || 'Transaction'}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Roboto', Arial, sans-serif; 
              padding: 20px;
              background: white;
            }
            @media print {
              body { padding: 0; }
              @page { 
                size: portrait;
                margin: 15mm;
              }
            }
          </style>
        </head>
        <body>
          ${receiptElement.outerHTML}
          <script>
            window.onload = function() {
              window.print();
              setTimeout(() => window.close(), 100);
            }
          </script>
        </body>
      </html>
    `);
    
    printWindow.document.close();
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "-";
    try {
      return timestamp.toDate ? timestamp.toDate().toLocaleString() : new Date(timestamp).toLocaleString();
    } catch {
      return "-";
    }
  };

  const formatReceiptNumber = (receiptNum, academicYear) => {
    if (receiptNum) {
      // Format: 2024-25/001, 2024-25/002, etc.
      const paddedNum = String(receiptNum).padStart(4, '0');
      return academicYear ? `${academicYear}/${paddedNum}` : paddedNum;
    }
    return "-";
  };

  return (
    <Box>
      {/* Receipt Content */}
      <Paper ref={receiptRef} elevation={3} sx={{ p: 4, maxWidth: 800, mx: "auto", bgcolor: "white" }}>
        {/* Header */}
        <Box sx={{ textAlign: "center", mb: 3, pb: 2, borderBottom: "3px solid #1976d2" }}>
          <Typography variant="h4" fontWeight={700} color="primary" gutterBottom>
            PAYMENT RECEIPT
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Bus Pass Management System
          </Typography>
          {payment.status === "success" && (
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1, mt: 1 }}>
              <CheckCircleIcon color="success" />
              <Typography variant="h6" color="success.main" fontWeight={600}>
                PAYMENT SUCCESSFUL
              </Typography>
            </Box>
          )}
        </Box>

        {/* Receipt Details */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">
              Receipt No.
            </Typography>
            <Typography variant="body1" fontWeight={600}>
              {formatReceiptNumber(payment.receiptNumber, payment.academicYear)}
            </Typography>
          </Grid>
          <Grid item xs={6} sx={{ textAlign: "right" }}>
            <Typography variant="caption" color="text.secondary">
              Date & Time
            </Typography>
            <Typography variant="body1" fontWeight={600}>
              {formatDate(payment.paidAt || payment.createdAt)}
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        {/* Student Details */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom color="primary">
            Student Details
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Name
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {student?.name || "-"}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Hall Ticket
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {student?.hallTicket || "-"}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Branch
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {student?.branch || "-"}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Year & Section
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {student?.year || "-"} - {student?.section || "-"}
              </Typography>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Payment Details */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom color="primary">
            Payment Details
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Payment Mode
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {payment.paymentMode === "TOTAL" ? "Total Payment" : 
                 payment.installmentType === "FIRST_SEM" ? "First Semester" : "Second Semester"}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Bus & Stage
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {student?.busNumber || payment.busNumber || "-"} - {student?.stage || payment.stage || "-"}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Payment Method
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {payment.mode || "Online"}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Status
              </Typography>
              <Typography variant="body1" fontWeight={600} color={payment.status === "success" ? "success.main" : "warning.main"}>
                {payment.status?.toUpperCase() || "PENDING"}
              </Typography>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Amount Section */}
        <Box sx={{ bgcolor: "#f5f5f5", p: 2, borderRadius: 1, mb: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="h6" fontWeight={600}>
              Amount Paid
            </Typography>
            <Typography variant="h4" fontWeight={700} color="primary">
              ₹{payment.amount || 0}
            </Typography>
          </Box>
        </Box>

        {/* Footer */}
        <Box sx={{ mt: 4, pt: 2, borderTop: "1px solid #e0e0e0" }}>
          <Typography variant="caption" color="text.secondary" align="center" display="block">
            This is a computer-generated receipt and does not require a signature.
          </Typography>
          <Typography variant="caption" color="text.secondary" align="center" display="block" sx={{ mt: 0.5 }}>
            For any queries, please contact the administration.
          </Typography>
        </Box>
      </Paper>

      {/* Actions */}
      <Box sx={{ mt: 3, display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
        <Button 
          variant="contained" 
          startIcon={<DownloadIcon />}
          onClick={downloadReceipt}
        >
          Download PDF
        </Button>

        <Button
          variant="contained"
          color="secondary"
          startIcon={<PrintIcon />}
          onClick={printReceipt}
        >
          Print Receipt
        </Button>

        {onClose && (
          <Button
            variant="outlined"
            onClick={onClose}
          >
            Close
          </Button>
        )}
      </Box>
    </Box>
  );
}

