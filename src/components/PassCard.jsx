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
} from "@mui/material";
import QRCode from "qrcode.react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

/*
  PassCard props:
    - profile: student profile doc (should include uid, name, hallticket, profilePhotoUrl, academicYear, busNumber, stageName, lastPaymentDate, lastPaymentAmount, passToken, passStatus)
*/

export default function PassCard({ profile }) {
  const passRef = useRef();

  const downloadPass = async () => {
    if (!passRef.current) return;
    try {
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
    } catch (err) {
      console.error("Download pass failed:", err);
      alert("Failed to download pass. Check console for details.");
    }
  };

  const qrValue = `${window.location.origin}/verify/${profile.uid || ""}?token=${profile.passToken || ""}`;

  return (
    <Box>
      {/* PASS VIEW (front + back) */}
      <Grid container spacing={2} ref={passRef} sx={{ alignItems: "stretch" }}>
        {/* Front side */}
        <Grid item xs={12} md={6}>
          <Card elevation={3} sx={{ height: "100%" }}>
            <CardContent sx={{ display: "flex", gap: 2 }}>
              <Avatar
                src={profile.profilePhotoUrl || "/logo.png"}
                alt={profile.name || ""}
                sx={{ width: 120, height: 120, borderRadius: 1 }}
                variant="rounded"
              />

              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" fontWeight={700}>
                  {profile.name || "Name"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Hall Ticket: <strong>{profile.hallticket || "-"}</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Class/Section: <strong>{profile.classSection || profile.section || "-"}</strong>
                </Typography>

                <Divider sx={{ my: 1 }} />

                <Typography variant="body2">
                  <strong>Academic Year:</strong> {profile.academicYear || "-"}
                </Typography>
                <Typography variant="body2">
                  <strong>Bus No:</strong> {profile.busNumber || profile.busId || "-"}
                </Typography>
                <Typography variant="body2">
                  <strong>Stage:</strong> {profile.stageName || profile.stageId || "-"}
                </Typography>
                <Typography variant="body2">
                  <strong>Paid On:</strong> {profile.lastPaymentDate ? new Date(profile.lastPaymentDate).toLocaleDateString() : "-"}
                </Typography>
                <Typography variant="body2">
                  <strong>Amount:</strong> {profile.lastPaymentAmount ? `₹${profile.lastPaymentAmount}` : "-"}
                </Typography>

                <Box sx={{ mt: 1 }}>
                  <Typography variant="subtitle2" color={profile.passStatus === "No Due" ? "green" : "orange"}>
                    Status: {profile.passStatus || "Not Issued"}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Back side - QR */}
        <Grid item xs={12} md={6}>
          <Card elevation={3} sx={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Box sx={{ textAlign: "center", p: 2 }}>
              <QRCode value={qrValue} size={200} includeMargin={true} />
              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                Scan to Verify
              </Typography>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Actions */}
      <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
        <Button variant="contained" onClick={downloadPass} disabled={!profile.passToken}>
          Download Pass (PAN size)
        </Button>

        <Button
          variant="outlined"
          onClick={() => {
            // open verify URL in a new tab
            const url = `${window.location.origin}/verify/${profile.uid || ""}?token=${profile.passToken || ""}`;
            window.open(url, "_blank");
          }}
          disabled={!profile.passToken}
        >
          Open Verify Page
        </Button>
      </Box>
    </Box>
  );
}
