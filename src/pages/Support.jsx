// src/pages/Support.jsx
import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import IconButton from '@mui/material/IconButton';

export default function Support() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real application, you would send this to a backend
    console.log('Support request:', formData);
    setSubmitted(true);
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const faqs = [
    {
      question: 'How do I register for a bus pass?',
      answer: 'Navigate to the Register page, fill in your details (name, email, hall ticket, branch, year), and create an account. After registration, complete your profile and proceed to select your bus and stage to make payment.',
    },
    {
      question: 'What payment methods are accepted?',
      answer: 'We accept online payments via Razorpay (credit/debit cards, UPI, net banking) and manual cash payments through administrators. You can also choose installment payments (two semesters) or full payment options.',
    },
    {
      question: 'Can I change my bus route after payment?',
      answer: 'Yes, you can change your route once per semester using the "Change Route" option in the Student Payments page. Additional fees may apply if you upgrade to a higher-priced route.',
    },
    {
      question: 'What if I pay the first installment but miss the second?',
      answer: 'Your pass will show "DUE" status. You can pay the second installment online or in cash to the administrator. Once paid, your pass will be updated to "NO DUE" and remain active.',
    },
    {
      question: 'How do I download my bus pass?',
      answer: 'Go to "My Pass" page after successful payment. Your digital pass with QR code will be displayed. Click the "Download Pass" button to save it as a PDF for offline use.',
    },
    {
      question: 'What should I do if my pass shows as expired?',
      answer: 'Passes expire at the end of each academic year. When a new academic year begins, you need to purchase a new pass. Contact the administrator if you believe your pass expired incorrectly.',
    },
    {
      question: 'Why can\'t I change my hall ticket number?',
      answer: 'Hall ticket numbers are permanent identifiers and cannot be changed after initial setup to maintain data integrity. Please ensure you enter the correct hall ticket during registration.',
    },
    {
      question: 'How do I verify my pass when boarding the bus?',
      answer: 'Open the "My Pass" page on your mobile device and show the QR code to the bus driver/conductor. They will scan it to verify your pass is active and valid.',
    },
    {
      question: 'What happens if I pay by mistake or to the wrong route?',
      answer: 'Contact support immediately through this form or call our helpline. Refunds are available within 7 days if the pass hasn\'t been used. Provide your payment receipt and details.',
    },
    {
      question: 'Can I get a refund if I don\'t use the bus anymore?',
      answer: 'Pro-rated refunds may be available for extenuating circumstances (medical, transfer, etc.). Submit a refund request through this support form with valid documentation.',
    },
    {
      question: 'How do I reset my password?',
      answer: 'On the login page, click "Forgot Password". Enter your registered email address, and you\'ll receive a password reset link. Follow the instructions in the email to set a new password.',
    },
    {
      question: 'Who should I contact for bus schedule or route changes?',
      answer: 'Bus schedules and routes are managed by the administration. Contact the transport office directly or reach out through this support form for queries about timing and routes.',
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Support & Help Center
        </Typography>
      </Box>

      {submitted && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSubmitted(false)}>
          Thank you! Your support request has been submitted. We'll get back to you within 24-48 hours.
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Contact Information */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Contact Us
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'start', mb: 3 }}>
              <EmailIcon color="primary" sx={{ mr: 2, mt: 0.5 }} />
              <Box>
                <Typography variant="subtitle2" fontWeight={600}>
                  Email
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  support@buspasssystem.com
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'start', mb: 3 }}>
              <PhoneIcon color="primary" sx={{ mr: 2, mt: 0.5 }} />
              <Box>
                <Typography variant="subtitle2" fontWeight={600}>
                  Phone
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  +91 XXXXX-XXXXX
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Mon-Fri: 9:00 AM - 5:00 PM
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'start', mb: 3 }}>
              <LocationOnIcon color="primary" sx={{ mr: 2, mt: 0.5 }} />
              <Box>
                <Typography variant="subtitle2" fontWeight={600}>
                  Office Address
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  [Your Institution Name]
                  <br />
                  [Address Line 1]
                  <br />
                  [Address Line 2]
                  <br />
                  [City, State - Pincode]
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Support Hours
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Monday - Friday: 9:00 AM - 5:00 PM
              <br />
              Saturday: 9:00 AM - 1:00 PM
              <br />
              Sunday & Holidays: Closed
            </Typography>
          </Paper>
        </Grid>

        {/* Contact Form */}
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Submit a Support Request
            </Typography>

            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Your Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Message"
                    name="message"
                    multiline
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                    required
                    placeholder="Please describe your issue or question in detail..."
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    fullWidth
                    sx={{ mt: 2 }}
                  >
                    Submit Request
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>

        {/* FAQ Section */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <HelpOutlineIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Frequently Asked Questions
              </Typography>
            </Box>

            {faqs.map((faq, index) => (
              <Accordion key={index} elevation={0} sx={{ '&:before': { display: 'none' } }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {faq.question}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" color="text.secondary">
                    {faq.answer}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Paper>
        </Grid>

        {/* Quick Links */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Useful Links
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => navigate('/privacy')}
                >
                  Privacy Policy
                </Button>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => navigate('/terms')}
                >
                  Terms & Conditions
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

