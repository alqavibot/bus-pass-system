// src/theme/theme.js
import { createTheme } from "@mui/material/styles";

// Dark & Shiny Modern Theme
const primaryColor = {
  light: "#4F46E5",      // Vibrant indigo
  main: "#4338CA",       // Deep indigo (shiny)
  dark: "#3730A3",       // Dark indigo
  contrastText: "#FFFFFF",
};

const secondaryColor = {
  light: "#06B6D4",      // Bright cyan
  main: "#0891B2",       // Deep cyan (shiny)
  dark: "#0E7490",       // Dark cyan
  contrastText: "#FFFFFF",
};

const neutral = {
  50: "#FAFAFA",
  100: "#F4F4F5",
  200: "#E4E4E7",
  300: "#D4D4D8",
  400: "#A1A1AA",
  500: "#71717A",
  600: "#52525B",
  700: "#3F3F46",
  800: "#27272A",
  900: "#18181B",
};

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: primaryColor,
    secondary: secondaryColor,
    background: {
      default: "#FAFAFA",  // Very light background
      paper: "#FFFFFF",    // White for cards
    },
    text: {
      primary: "#18181B",  // Very dark (almost black)
      secondary: "#52525B", // Dark gray
    },
    divider: "#E4E4E7",
    success: {
      light: "#4ADE80",
      main: "#16A34A",     // Dark green (shiny)
      dark: "#15803D",
      contrastText: "#FFFFFF",
    },
    warning: {
      light: "#FBBF24",
      main: "#D97706",     // Dark amber (shiny)
      dark: "#B45309",
      contrastText: "#FFFFFF",
    },
    error: {
      light: "#F87171",
      main: "#DC2626",     // Dark red (shiny)
      dark: "#B91C1C",
      contrastText: "#FFFFFF",
    },
    info: {
      light: "#38BDF8",
      main: "#0284C7",     // Dark cyan (shiny)
      dark: "#0369A1",
      contrastText: "#FFFFFF",
    },
  },
  shape: {
    borderRadius: 0,  // Sharp corners - no curves
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", sans-serif',
    h1: { 
      fontWeight: 700, 
      fontSize: "2.25rem",
      letterSpacing: "-0.025em",
    },
    h2: { 
      fontWeight: 700, 
      fontSize: "1.875rem",
      letterSpacing: "-0.02em",
    },
    h3: { 
      fontWeight: 600, 
      fontSize: "1.5rem",
      letterSpacing: "-0.015em",
    },
    h4: { 
      fontWeight: 600, 
      fontSize: "1.25rem",
    },
    h5: { 
      fontWeight: 600, 
      fontSize: "1.125rem",
    },
    h6: { 
      fontWeight: 600, 
      fontSize: "1rem",
    },
    body1: {
      fontSize: "0.9375rem",
      lineHeight: 1.6,
    },
    body2: {
      fontSize: "0.875rem",
      lineHeight: 1.57,
    },
    button: { 
      textTransform: "none", 
      fontWeight: 600,
      fontSize: "0.9375rem",
      letterSpacing: "0.01em",
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarWidth: "thin",
          "&::-webkit-scrollbar": {
            width: "8px",
            height: "8px",
          },
          "&::-webkit-scrollbar-track": {
            background: "#F3F4F6",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "#D1D5DB",
            borderRadius: "4px",
            "&:hover": {
              background: "#9CA3AF",
            },
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          backgroundColor: "#FFFFFF",
          color: "#111827",
          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
        },
      },
    },
    MuiButton: {
      defaultProps: { 
        disableElevation: false,
      },
      styleOverrides: {
        root: { 
          borderRadius: 0,  // Sharp corners
          padding: "10px 24px",
          fontWeight: 600,
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          textTransform: "none",
        },
        contained: {
          background: "linear-gradient(135deg, #4F46E5 0%, #4338CA 50%, #3730A3 100%)",
          boxShadow: "0 4px 14px 0 rgba(67, 56, 202, 0.39)",
          "&:hover": {
            background: "linear-gradient(135deg, #4338CA 0%, #3730A3 50%, #312E81 100%)",
            boxShadow: "0 6px 20px 0 rgba(67, 56, 202, 0.5)",
            transform: "translateY(-2px)",
          },
          "&:active": {
            transform: "translateY(0)",
            boxShadow: "0 2px 10px 0 rgba(67, 56, 202, 0.35)",
          },
        },
        containedSecondary: {
          background: "linear-gradient(135deg, #06B6D4 0%, #0891B2 50%, #0E7490 100%)",
          boxShadow: "0 4px 14px 0 rgba(8, 145, 178, 0.39)",
          "&:hover": {
            background: "linear-gradient(135deg, #0891B2 0%, #0E7490 50%, #155E75 100%)",
            boxShadow: "0 6px 20px 0 rgba(8, 145, 178, 0.5)",
            transform: "translateY(-2px)",
          },
        },
        outlined: {
          borderWidth: "2px",
          "&:hover": {
            borderWidth: "2px",
            backgroundColor: "rgba(79, 70, 229, 0.04)",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { 
          backgroundImage: "none",
        },
        elevation1: {
          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
        },
        elevation2: {
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        },
        elevation3: {
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { 
          borderRadius: 0,  // Sharp corners
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)",
          border: "1px solid #E4E4E7",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
            transform: "translateY(-4px)",
            borderColor: "#C4B5FD",
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 700,
          borderRadius: 0,  // Sharp corners
          height: "30px",
          transition: "all 0.2s",
        },
        filled: {
          border: "1px solid transparent",
        },
        filledPrimary: {
          background: "linear-gradient(135deg, #4F46E5 0%, #4338CA 100%)",
          color: "#FFFFFF",
          boxShadow: "0 2px 8px rgba(67, 56, 202, 0.25)",
        },
        filledSuccess: {
          background: "linear-gradient(135deg, #16A34A 0%, #15803D 100%)",
          color: "#FFFFFF",
          boxShadow: "0 2px 8px rgba(22, 163, 74, 0.25)",
        },
        filledWarning: {
          background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
          color: "#FFFFFF",
          boxShadow: "0 2px 8px rgba(245, 158, 11, 0.25)",
        },
        filledError: {
          background: "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)",
          color: "#FFFFFF",
          boxShadow: "0 2px 8px rgba(239, 68, 68, 0.25)",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            "& fieldset": {
              borderColor: "#E5E7EB",
              borderWidth: "1.5px",
            },
            "&:hover fieldset": {
              borderColor: "#3B82F6",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#3B82F6",
              borderWidth: "2px",
            },
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 0,  // Sharp corners
          fontWeight: 500,
        },
        standardSuccess: {
          backgroundColor: "#ECFDF5",
          color: "#065F46",
          border: "1px solid #D1FAE5",
        },
        standardWarning: {
          backgroundColor: "#FFFBEB",
          color: "#92400E",
          border: "1px solid #FEF3C7",
        },
        standardError: {
          backgroundColor: "#FEF2F2",
          color: "#991B1B",
          border: "1px solid #FEE2E2",
        },
        standardInfo: {
          backgroundColor: "#EFF6FF",
          color: "#1E40AF",
          border: "1px solid #DBEAFE",
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: "#F3F4F6",
        },
      },
    },
    MuiContainer: {
      defaultProps: { maxWidth: "lg" },
    },
  },
});

export default theme;


