// src/pages/PrivacyPolicy.jsx
import React from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Divider,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import IconButton from '@mui/material/IconButton';

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Privacy Policy
        </Typography>
      </Box>

      <Paper elevation={2} sx={{ p: 4 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Last Updated: {new Date().toLocaleDateString()}
        </Typography>

        <Typography variant="h6" sx={{ fontWeight: 600, mt: 3, mb: 2 }}>
          1. Information We Collect
        </Typography>
        <Typography variant="body1" paragraph>
          We collect the following information when you register and use our Bus Pass System:
        </Typography>
        <Box component="ul" sx={{ pl: 3, mb: 2 }}>
          <li>
            <Typography variant="body1">
              <strong>Personal Information:</strong> Name, email address, hall ticket number, branch, year, section
            </Typography>
          </li>
          <li>
            <Typography variant="body1">
              <strong>Payment Information:</strong> Payment method, transaction details, receipt numbers (payment card details are processed securely by Razorpay)
            </Typography>
          </li>
          <li>
            <Typography variant="body1">
              <strong>Bus Pass Information:</strong> Selected bus number, stage/route, pass status, academic year
            </Typography>
          </li>
          <li>
            <Typography variant="body1">
              <strong>Usage Data:</strong> Login times, pass verification logs
            </Typography>
          </li>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          2. How We Use Your Information
        </Typography>
        <Typography variant="body1" paragraph>
          We use your information for the following purposes:
        </Typography>
        <Box component="ul" sx={{ pl: 3, mb: 2 }}>
          <li>
            <Typography variant="body1">To issue and manage your bus pass</Typography>
          </li>
          <li>
            <Typography variant="body1">To process payments and maintain transaction records</Typography>
          </li>
          <li>
            <Typography variant="body1">To verify your identity during bus boarding</Typography>
          </li>
          <li>
            <Typography variant="body1">To communicate important updates about your pass or payment status</Typography>
          </li>
          <li>
            <Typography variant="body1">To improve our services and user experience</Typography>
          </li>
          <li>
            <Typography variant="body1">To comply with legal and regulatory requirements</Typography>
          </li>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          3. Data Security
        </Typography>
        <Typography variant="body1" paragraph>
          We implement appropriate security measures to protect your personal information:
        </Typography>
        <Box component="ul" sx={{ pl: 3, mb: 2 }}>
          <li>
            <Typography variant="body1">Firebase Authentication for secure user login</Typography>
          </li>
          <li>
            <Typography variant="body1">Encrypted data transmission using HTTPS/SSL</Typography>
          </li>
          <li>
            <Typography variant="body1">Secure payment processing through Razorpay (PCI DSS compliant)</Typography>
          </li>
          <li>
            <Typography variant="body1">Role-based access control (students and administrators)</Typography>
          </li>
          <li>
            <Typography variant="body1">Regular security audits and updates</Typography>
          </li>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          4. Information Sharing
        </Typography>
        <Typography variant="body1" paragraph>
          We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
        </Typography>
        <Box component="ul" sx={{ pl: 3, mb: 2 }}>
          <li>
            <Typography variant="body1">With payment processors (Razorpay) to complete transactions</Typography>
          </li>
          <li>
            <Typography variant="body1">With authorized college/institution administrators for pass management</Typography>
          </li>
          <li>
            <Typography variant="body1">With bus drivers/conductors for pass verification purposes</Typography>
          </li>
          <li>
            <Typography variant="body1">When required by law or legal process</Typography>
          </li>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          5. Your Rights
        </Typography>
        <Typography variant="body1" paragraph>
          You have the following rights regarding your personal information:
        </Typography>
        <Box component="ul" sx={{ pl: 3, mb: 2 }}>
          <li>
            <Typography variant="body1">Access and view your personal data</Typography>
          </li>
          <li>
            <Typography variant="body1">Update or correct inaccurate information</Typography>
          </li>
          <li>
            <Typography variant="body1">Request deletion of your account (subject to record-keeping requirements)</Typography>
          </li>
          <li>
            <Typography variant="body1">Download your payment history and pass records</Typography>
          </li>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          6. Data Retention
        </Typography>
        <Typography variant="body1" paragraph>
          We retain your information for as long as necessary to provide our services and comply with legal obligations:
        </Typography>
        <Box component="ul" sx={{ pl: 3, mb: 2 }}>
          <li>
            <Typography variant="body1">Active pass data: Duration of academic year</Typography>
          </li>
          <li>
            <Typography variant="body1">Payment records: Minimum 7 years for accounting purposes</Typography>
          </li>
          <li>
            <Typography variant="body1">Expired passes: Archived for historical reference</Typography>
          </li>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          7. Changes to Privacy Policy
        </Typography>
        <Typography variant="body1" paragraph>
          We may update this Privacy Policy from time to time. We will notify you of any significant changes by:
        </Typography>
        <Box component="ul" sx={{ pl: 3, mb: 2 }}>
          <li>
            <Typography variant="body1">Posting the updated policy on this page</Typography>
          </li>
          <li>
            <Typography variant="body1">Updating the "Last Updated" date</Typography>
          </li>
          <li>
            <Typography variant="body1">Sending email notifications for major changes</Typography>
          </li>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          8. Contact Information
        </Typography>
        <Typography variant="body1" paragraph>
          If you have any questions or concerns about this Privacy Policy or your personal data, please contact:
        </Typography>
        <Box sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 1 }}>
          <Typography variant="body1">
            <strong>Email:</strong> support@buspasssystem.com
          </Typography>
          <Typography variant="body1">
            <strong>Phone:</strong> +91 XXXXX-XXXXX
          </Typography>
          <Typography variant="body1">
            <strong>Address:</strong> [Your Institution Address]
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}

