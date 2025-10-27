import React, { useState } from "react";
import { TextField, Button, Container, Typography, Box, Card, CardContent, Link, Dialog, DialogTitle, DialogContent, DialogActions, Alert, InputAdornment, IconButton } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { auth, db } from "../firebase/config";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../context/NotificationContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Sign in with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Fetch their Firestore profile
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        console.log("✅ User Profile:", docSnap.data());

        showNotification("✅ Login successful! Welcome back.", "success");
        // ✅ Navigate student to their dashboard
        setTimeout(() => navigate("/student/dashboard"), 1000);
      } else {
        showNotification("❌ Profile not found. Please register first.", "error");
      }
    } catch (error) {
      console.error("❌ Login Error:", error);
      showNotification(`❌ Login failed: ${error.message}`, "error");
    }

    setLoading(false);
  };

  const handlePasswordReset = async () => {
    if (!resetEmail) {
      showNotification("❌ Please enter your email address", "error");
      return;
    }

    setResetLoading(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetSuccess(true);
      showNotification("✅ Password reset email sent! Check your inbox.", "success");
    } catch (error) {
      console.error("❌ Password Reset Error:", error);
      let errorMessage = "Failed to send password reset email";
      
      if (error.code === "auth/user-not-found") {
        errorMessage = "No account found with this email address";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email address";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Too many requests. Please try again later";
      }
      
      showNotification(`❌ ${errorMessage}`, "error");
    } finally {
      setResetLoading(false);
    }
  };

  const handleOpenResetDialog = () => {
    setResetEmail(email); // Pre-fill with login email if entered
    setResetSuccess(false);
    setResetDialogOpen(true);
  };

  const handleCloseResetDialog = () => {
    setResetDialogOpen(false);
    setResetEmail("");
    setResetSuccess(false);
  };

  return (
    <Container maxWidth="sm" sx={{ display: "flex", justifyContent: "center" }}>
      <Card sx={{ mt: 8, width: 480 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
            Student Login
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Sign in with your registered email and password
          </Typography>
          <form onSubmit={handleLogin}>
            <TextField
              label="Email"
              type="email"
              fullWidth
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <TextField
              label="Password"
              type={showPassword ? "text" : "password"}
              fullWidth
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      onMouseDown={(e) => e.preventDefault()}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              disabled={loading}
              sx={{ mt: 2 }}
            >
              {loading ? "Logging in..." : "Login"}
            </Button>

            <Box sx={{ mt: 2, textAlign: "center" }}>
              <Link
                component="button"
                type="button"
                variant="body2"
                onClick={(e) => {
                  e.preventDefault();
                  handleOpenResetDialog();
                }}
                sx={{ cursor: "pointer" }}
              >
                Forgot Password?
              </Link>
            </Box>

            <Box sx={{ mt: 2, textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">
                Don't have an account?{" "}
                <Link href="/register" underline="hover">
                  Register here
                </Link>
              </Typography>
            </Box>
          </form>
        </CardContent>
      </Card>

      {/* Password Reset Dialog */}
      <Dialog open={resetDialogOpen} onClose={handleCloseResetDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Reset Password</DialogTitle>
        <DialogContent>
          {resetSuccess ? (
            <Alert severity="success" sx={{ mb: 2 }}>
              <Typography variant="body2">
                Password reset email sent successfully! Please check your inbox and follow the instructions to reset your password.
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                <strong>Note:</strong> If you don't see the email, check your spam/junk folder.
              </Typography>
            </Alert>
          ) : (
            <>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Enter your registered email address and we'll send you a link to reset your password.
              </Typography>
              <TextField
                autoFocus
                label="Email Address"
                type="email"
                fullWidth
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                disabled={resetLoading}
                sx={{ mt: 1 }}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseResetDialog} disabled={resetLoading}>
            {resetSuccess ? "Close" : "Cancel"}
          </Button>
          {!resetSuccess && (
            <Button
              onClick={handlePasswordReset}
              variant="contained"
              disabled={resetLoading || !resetEmail}
            >
              {resetLoading ? "Sending..." : "Send Reset Link"}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Login;
