import React from "react";
import { useNavigate } from "react-router-dom";
import { Container, Typography, Button, Box, Grid, Paper } from "@mui/material";

export default function Home() {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm" sx={{ textAlign: "center", marginTop: 12 }}>
      <Paper elevation={4} sx={{ padding: 5, borderRadius: 3 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          College Bus Pass System
        </Typography>
        <Typography variant="subtitle1" gutterBottom color="text.secondary">
          Please choose an option below
        </Typography>

        <Box mt={4}>
          <Grid container spacing={3} direction="column">
            <Grid item>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                onClick={() => navigate("/register")}
              >
                Register as Student
              </Button>
            </Grid>

            <Grid item>
              <Button
                fullWidth
                variant="contained"
                color="success"
                size="large"
                onClick={() => navigate("/login")}
              >
                Login as Student
              </Button>
            </Grid>

            <Grid item>
              <Button
                fullWidth
                variant="outlined"
                color="secondary"
                size="large"
                onClick={() => navigate("/admin/login")}
              >
                Login as Admin
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
}
