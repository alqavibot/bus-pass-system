// src/theme/theme.js
import { createTheme } from "@mui/material/styles";

const primaryColor = {
  light: "#2F6FED",
  main: "#1E4BD1",
  dark: "#1639A3",
  contrastText: "#FFFFFF",
};

const neutral = {
  50: "#F8FAFC",
  100: "#F1F5F9",
  200: "#E2E8F0",
  300: "#CBD5E1",
  400: "#94A3B8",
  500: "#64748B",
  600: "#475569",
  700: "#334155",
  800: "#1F2937",
  900: "#0F172A",
};

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: primaryColor,
    secondary: {
      light: "#14B8A6",
      main: "#0EA5A4",
      dark: "#0B7E7E",
      contrastText: "#FFFFFF",
    },
    background: {
      default: neutral[50],
      paper: "#FFFFFF",
    },
    text: {
      primary: neutral[800],
      secondary: neutral[600],
    },
    divider: neutral[200],
  },
  shape: {
    borderRadius: 10,
  },
  typography: {
    fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          boxShadow: "0 1px 2px rgba(16,24,40,.08)",
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 10 },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { borderRadius: 12 },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { borderRadius: 14 },
      },
    },
    MuiContainer: {
      defaultProps: { maxWidth: "lg" },
    },
  },
});

export default theme;


