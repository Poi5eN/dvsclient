// src/theme.js
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: { main: "#2c3e50", light: "#34495e", dark: "#1a252f" },
    secondary: { main: "#e74c3c", light: "#ec7063", dark: "#c0392b" },
    tertiary: { main: "#3498db", light: "#5dade2", dark: "#2874a6" },
    accent: { main: "#2ecc71", light: "#58d68d", dark: "#27ae60" },
    background: { default: "#ecf0f1", paper: "#ffffff" },
    text: { primary: "#2c3e50", secondary: "#7f8c8d" },
  },
  typography: {
    fontFamily: "Poppins, sans-serif",
    h3: { fontSize: "1.75rem", fontWeight: 700, color: "#2c3e50" }, // Reduced from ~2rem
    h4: { fontSize: "1.25rem", fontWeight: 600 }, // Reduced from ~1.5rem
    h5: { fontSize: "1rem", fontWeight: 500 }, // Added for consistency
    h6: { fontSize: "0.875rem", fontWeight: 500, color: "#7f8c8d" }, // Reduced
    body1: { fontSize: "0.75rem", color: "#555" }, // Reduced
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: { borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.05)", padding: "8px", transition: "all 0.3s ease-in-out" }, // Reduced padding
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 6, textTransform: "none", padding: "4px 12px", fontSize: "0.75rem" }, // Reduced size
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: { borderRadius: 6, fontSize: "0.75rem" }, // Reduced size
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: { margin: "4px 0" }, // Reduced margin
      },
    },
  },
});

export default theme;