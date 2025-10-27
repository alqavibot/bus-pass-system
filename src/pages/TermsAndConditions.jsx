// src/pages/TermsAndConditions.jsx
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

export default function TermsAndConditions() {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Terms and Conditions
        </Typography>
      </Box>

      <Paper elevation={2} sx={{ p: 4 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Last Updated: {new Date().toLocaleDateString()}
        </Typography>

        <Typography variant="body1" paragraph>
          Please read these Terms and Conditions carefully before using our Bus Pass System. By accessing or using the service, you agree to be bound by these terms.
        </Typography>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          1. Acceptance of Terms
        </Typography>
        <Typography variant="body1" paragraph>
          By registering for and using the Bus Pass System, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions, as well as our Privacy Policy.
        </Typography>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          2. Eligibility
        </Typography>
        <Box component="ul" sx={{ pl: 3, mb: 2 }}>
          <li>
            <Typography variant="body1">You must be a registered student of the institution</Typography>
          </li>
          <li>
            <Typography variant="body1">You must provide accurate and complete information during registration</Typography>
          </li>
          <li>
            <Typography variant="body1">Your hall ticket number must be valid and cannot be changed after initial setup</Typography>
          </li>
          <li>
            <Typography variant="body1">You must be authorized to use the payment method provided</Typography>
          </li>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          3. Account Registration
        </Typography>
        <Typography variant="body1" paragraph>
          <strong>Account Creation:</strong>
        </Typography>
        <Box component="ul" sx={{ pl: 3, mb: 2 }}>
          <li>
            <Typography variant="body1">You are responsible for maintaining the confidentiality of your account credentials</Typography>
          </li>
          <li>
            <Typography variant="body1">You must not share your account with others</Typography>
          </li>
          <li>
            <Typography variant="body1">You must notify us immediately of any unauthorized access</Typography>
          </li>
          <li>
            <Typography variant="body1">One account per student - multiple accounts are prohibited</Typography>
          </li>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          4. Bus Pass Purchase and Usage
        </Typography>
        <Typography variant="body1" paragraph>
          <strong>Payment Terms:</strong>
        </Typography>
        <Box component="ul" sx={{ pl: 3, mb: 2 }}>
          <li>
            <Typography variant="body1">All payments are processed securely through Razorpay or manual payment to administrators</Typography>
          </li>
          <li>
            <Typography variant="body1">Pass fees are determined by your selected bus route and stage</Typography>
          </li>
          <li>
            <Typography variant="body1">You may choose between full payment or installment payment options</Typography>
          </li>
          <li>
            <Typography variant="body1">Second installments must be paid before the deadline to maintain pass validity</Typography>
          </li>
        </Box>

        <Typography variant="body1" paragraph sx={{ mt: 2 }}>
          <strong>Pass Validity:</strong>
        </Typography>
        <Box component="ul" sx={{ pl: 3, mb: 2 }}>
          <li>
            <Typography variant="body1">Passes are valid for the current academic year only</Typography>
          </li>
          <li>
            <Typography variant="body1">Expired passes must be renewed for the new academic year</Typography>
          </li>
          <li>
            <Typography variant="body1">You must present a valid, active pass when boarding the bus</Typography>
          </li>
          <li>
            <Typography variant="body1">Digital pass display (QR code) is mandatory for verification</Typography>
          </li>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          5. Refund Policy
        </Typography>
        <Box component="ul" sx={{ pl: 3, mb: 2 }}>
          <li>
            <Typography variant="body1">
              <strong>Full Refund:</strong> Available within 7 days of purchase if pass has not been used
            </Typography>
          </li>
          <li>
            <Typography variant="body1">
              <strong>Partial Refund:</strong> Pro-rated refund may be available for extenuating circumstances (subject to approval)
            </Typography>
          </li>
          <li>
            <Typography variant="body1">
              <strong>No Refund:</strong> For used passes, expired passes, or after the refund period
            </Typography>
          </li>
          <li>
            <Typography variant="body1">Refund requests must be submitted through the support system</Typography>
          </li>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          6. Route Changes
        </Typography>
        <Box component="ul" sx={{ pl: 3, mb: 2 }}>
          <li>
            <Typography variant="body1">You may change your bus route once per semester</Typography>
          </li>
          <li>
            <Typography variant="body1">Route changes may result in fee adjustments</Typography>
          </li>
          <li>
            <Typography variant="body1">Additional fees must be paid for route upgrades</Typography>
          </li>
          <li>
            <Typography variant="body1">Route change requests are subject to seat availability</Typography>
          </li>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          7. Prohibited Activities
        </Typography>
        <Typography variant="body1" paragraph>
          You agree NOT to:
        </Typography>
        <Box component="ul" sx={{ pl: 3, mb: 2 }}>
          <li>
            <Typography variant="body1">Share or transfer your pass to another person</Typography>
          </li>
          <li>
            <Typography variant="body1">Duplicate, screenshot, or forge bus passes</Typography>
          </li>
          <li>
            <Typography variant="body1">Attempt to bypass payment or verification systems</Typography>
          </li>
          <li>
            <Typography variant="body1">Use the system for any fraudulent or illegal purposes</Typography>
          </li>
          <li>
            <Typography variant="body1">Interfere with or disrupt the system's operation</Typography>
          </li>
          <li>
            <Typography variant="body1">Access another user's account without authorization</Typography>
          </li>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          8. Consequences of Violation
        </Typography>
        <Typography variant="body1" paragraph>
          Violation of these terms may result in:
        </Typography>
        <Box component="ul" sx={{ pl: 3, mb: 2 }}>
          <li>
            <Typography variant="body1">Immediate suspension or termination of your pass</Typography>
          </li>
          <li>
            <Typography variant="body1">Account deactivation</Typography>
          </li>
          <li>
            <Typography variant="body1">Forfeiture of fees paid (no refund)</Typography>
          </li>
          <li>
            <Typography variant="body1">Disciplinary action by the institution</Typography>
          </li>
          <li>
            <Typography variant="body1">Legal action for fraudulent activities</Typography>
          </li>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          9. Service Modifications
        </Typography>
        <Typography variant="body1" paragraph>
          We reserve the right to:
        </Typography>
        <Box component="ul" sx={{ pl: 3, mb: 2 }}>
          <li>
            <Typography variant="body1">Modify, suspend, or discontinue any part of the service</Typography>
          </li>
          <li>
            <Typography variant="body1">Change bus routes, schedules, or fees with notice</Typography>
          </li>
          <li>
            <Typography variant="body1">Update these Terms and Conditions at any time</Typography>
          </li>
          <li>
            <Typography variant="body1">Refuse service to anyone for any reason</Typography>
          </li>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          10. Limitation of Liability
        </Typography>
        <Typography variant="body1" paragraph>
          The Bus Pass System and institution shall not be liable for:
        </Typography>
        <Box component="ul" sx={{ pl: 3, mb: 2 }}>
          <li>
            <Typography variant="body1">Bus delays, cancellations, or route changes</Typography>
          </li>
          <li>
            <Typography variant="body1">Loss or damage to personal property</Typography>
          </li>
          <li>
            <Typography variant="body1">System downtime or technical issues</Typography>
          </li>
          <li>
            <Typography variant="body1">Payment processing errors by third-party services</Typography>
          </li>
          <li>
            <Typography variant="body1">Indirect, incidental, or consequential damages</Typography>
          </li>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          11. Governing Law
        </Typography>
        <Typography variant="body1" paragraph>
          These Terms and Conditions shall be governed by and construed in accordance with the laws of India. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of courts in [Your City/State].
        </Typography>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          12. Contact Information
        </Typography>
        <Typography variant="body1" paragraph>
          For questions about these Terms and Conditions:
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

        <Box sx={{ mt: 4, p: 2, bgcolor: 'primary.light', borderRadius: 1 }}>
          <Typography variant="body2" color="primary.contrastText">
            By using the Bus Pass System, you acknowledge that you have read and understood these Terms and Conditions and agree to be bound by them.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}

