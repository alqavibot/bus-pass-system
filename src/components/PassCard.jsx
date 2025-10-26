// src/components/PassCard.jsx
import React, { useRef } from "react";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Box,
  Avatar,
  Divider,
  Chip,
} from "@mui/material";
import {
  Download as DownloadIcon,
  Print as PrintIcon,
  OpenInNew as OpenInNewIcon,
} from "@mui/icons-material";
import { QRCodeCanvas } from "qrcode.react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useNotification } from "../context/NotificationContext";

/*
  PassCard props:
    - profile: student profile doc (should include uid, name, hallticket, profilePhotoUrl, academicYear, busNumber, stageName, lastPaymentDate, lastPaymentAmount, passToken, passStatus)
*/

export default function PassCard({ profile }) {
  const passRef = useRef();
  const { showNotification } = useNotification();
  
  // Determine actual pass status
  const isExpired = profile.isExpired || profile.status === "expired";
  const isYearMismatch = profile.academicYear && profile.currentAcademicYear && 
                         profile.academicYear !== profile.currentAcademicYear;
  const actualStatus = isExpired ? "EXPIRED" : isYearMismatch ? "INVALID" : 
                       profile.passStatus || profile.status || "Not Issued";

  const downloadPass = async () => {
    if (!passRef.current) return;
    try {
      showNotification("📥 Generating PDF... Please wait", "info", 2000);
      
      // render with a higher scale for quality
      const canvas = await html2canvas(passRef.current, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");

      // PAN card approx size: 85.6 mm x 53.98 mm (width x height)
      // Create PDF with exact size in mm
      const mmWidth = 85.6;
      const mmHeight = 53.98;
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: [mmHeight, mmWidth], // jsPDF expects [height, width] for custom
      });

      // Add image to fill the page
      pdf.addImage(imgData, "PNG", 0, 0, mmWidth, mmHeight);
      const filename = `bus-pass-${profile.hallticket || profile.uid || "student"}.pdf`;
      pdf.save(filename);
      
      showNotification("✅ Bus pass downloaded successfully!", "success");
    } catch (err) {
      console.error("Download pass failed:", err);
      showNotification("❌ Failed to download pass. Please try again.", "error");
    }
  };

  const printPass = () => {
    if (!passRef.current) return;
    
    // Create a print-specific window
    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) {
      showNotification("⚠️ Please allow pop-ups to print the pass.", "warning");
      return;
    }

    // Clone the pass element
    const passElement = passRef.current.cloneNode(true);
    
    // Create print-friendly HTML
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Bus Pass - ${profile.name || 'Student'}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Roboto', Arial, sans-serif; 
              padding: 20px;
              background: white;
            }
            @media print {
              body { padding: 0; }
              .no-print { display: none !important; }
              @page { 
                size: landscape;
                margin: 10mm;
              }
            }
          </style>
        </head>
        <body>
          ${passElement.outerHTML}
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

  // Use the actual origin or fallback to production URL
  const baseUrl = window.location.origin.includes('localhost') 
    ? window.location.origin // Will be replaced with network IP when running
    : window.location.origin;
  
  const qrValue = `${baseUrl}/verify/${profile.uid || ""}?token=${profile.passToken || ""}`;

  return (
    <Box>
      {/* PASS VIEW (front + back) */}
      <Grid container spacing={3} ref={passRef} sx={{ alignItems: "stretch" }}>
        {/* Front side */}
        <Grid item xs={12} md={6}>
          <Card 
            elevation={4} 
            sx={{ 
              height: "100%",
              border: isExpired || isYearMismatch ? '3px solid #f44336' : '3px solid #4caf50',
              borderRadius: 2
            }}
          >
            <CardContent sx={{ p: 3 }}>
              {/* Header with Status Badge */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mb: 2,
                pb: 2,
                borderBottom: '2px solid #e0e0e0'
              }}>
                <Typography variant="h5" fontWeight={700} color="primary">
                  BUS PASS
                </Typography>
                <Chip
                  label={actualStatus}
                  color={isExpired || isYearMismatch ? "error" : 
                         profile.passStatus === "NO DUE" ? "success" : "warning"}
                  sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}
                />
              </Box>

              {/* Student Info with Photo */}
              <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                <Avatar
                  src={profile.profilePhotoUrl || "/logo.png"}
                  alt={profile.name || ""}
                  sx={{ 
                    width: 100, 
                    height: 100, 
                    borderRadius: 2,
                    border: '2px solid #1976d2'
                  }}
                  variant="rounded"
                />

                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    {profile.name || "Name"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <strong>Hall Ticket:</strong> {profile.hallticket || "-"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Class:</strong> {profile.classSection || profile.section || "-"}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Pass Details */}
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Academic Year
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {profile.academicYear || "-"}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Bus Number
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {profile.busNumber || profile.busId || "-"}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Stage
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {profile.stageName || profile.stageId || "-"}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Amount Paid
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {profile.lastPaymentAmount ? `₹${Number(profile.lastPaymentAmount)}` : "-"}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Payment Date
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {profile.lastPaymentDate ? (
                      profile.lastPaymentDate.toDate ? 
                        profile.lastPaymentDate.toDate().toLocaleDateString() : 
                        new Date(profile.lastPaymentDate).toLocaleDateString()
                    ) : "-"}
                  </Typography>
                </Box>
                
                <Box sx={{ gridColumn: 'span 2' }}>
                  <Typography variant="caption" color="text.secondary">
                    Payment Method
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {profile.paymentMethod || "One Time Payment"}
                  </Typography>
                </Box>
              </Box>

              {/* Due Amount Warning */}
              {profile.dueAmount !== undefined && profile.dueAmount !== null && (
                Number(profile.dueAmount) > 0 ? (
                  <Box sx={{ 
                    mt: 2, 
                    p: 1.5, 
                    bgcolor: '#fff3e0', 
                    borderRadius: 1,
                    border: '1px solid #ff9800'
                  }}>
                    <Typography variant="body2" color="warning.dark" fontWeight={700}>
                      ⚠️ Due Amount: ₹{Number(profile.dueAmount)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Pay second semester fee to clear dues
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ 
                    mt: 2, 
                    p: 1.5, 
                    bgcolor: '#e8f5e9', 
                    borderRadius: 1,
                    border: '1px solid #4caf50'
                  }}>
                    <Typography variant="body2" color="success.dark" fontWeight={700}>
                      ✅ Due Amount: ₹0 (No Dues)
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      All fees paid
                    </Typography>
                  </Box>
                )
              )}

              {/* Expired/Invalid Warning */}
              {(isExpired || isYearMismatch) && (
                <Box sx={{ 
                  mt: 2, 
                  p: 1.5, 
                  bgcolor: '#ffebee', 
                  borderRadius: 1,
                  border: '2px solid #f44336'
                }}>
                  <Typography variant="body2" color="error" fontWeight={700}>
                    {isExpired ? '❌ PASS EXPIRED' : '❌ INVALID FOR CURRENT YEAR'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {isYearMismatch ? `Current Year: ${profile.currentAcademicYear}` : 'Please get a new pass'}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Back side - QR */}
        <Grid item xs={12} md={6}>
          <Card 
            elevation={4} 
            sx={{ 
              height: "100%", 
              display: "flex", 
              flexDirection: "column",
              alignItems: "center", 
              justifyContent: "center",
              border: '3px solid #1976d2',
              borderRadius: 2,
              bgcolor: '#f5f5f5'
            }}
          >
            <CardContent sx={{ textAlign: "center", p: 4 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom color="primary">
                SCAN TO VERIFY
              </Typography>
              
              <Box sx={{ 
                p: 2, 
                bgcolor: 'white', 
                borderRadius: 2,
                display: 'inline-block',
                boxShadow: 2
              }}>
                <QRCodeCanvas value={qrValue} size={220} />
              </Box>
              
              <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
                Scan with phone camera to verify pass
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ textAlign: 'left' }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Pass ID: {profile.passToken ? profile.passToken.slice(0, 12) + '...' : '-'}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  Valid: {isExpired || isYearMismatch ? 'NO' : 'YES'}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  Status: {actualStatus}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Actions */}
      <Box sx={{ mt: 3, display: "flex", gap: 2, flexWrap: "wrap" }}>
        <Button 
          variant="contained" 
          startIcon={<DownloadIcon />}
          onClick={downloadPass} 
          disabled={!profile.passToken}
          sx={{ flex: { xs: '1 1 100%', sm: '0 1 auto' } }}
        >
          Download PDF
        </Button>

        <Button
          variant="contained"
          color="secondary"
          startIcon={<PrintIcon />}
          onClick={printPass}
          disabled={!profile.passToken}
          sx={{ flex: { xs: '1 1 100%', sm: '0 1 auto' } }}
        >
          Print Pass
        </Button>

        <Button
          variant="outlined"
          startIcon={<OpenInNewIcon />}
          onClick={() => {
            // open verify URL in a new tab
            const url = `${window.location.origin}/verify/${profile.uid || ""}?token=${profile.passToken || ""}`;
            window.open(url, "_blank");
          }}
          disabled={!profile.passToken}
          sx={{ flex: { xs: '1 1 100%', sm: '0 1 auto' } }}
        >
          Verify Page
        </Button>
      </Box>
    </Box>
  );
}
