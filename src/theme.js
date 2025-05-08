import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#a0cccf",
      light: "#d2f1f3",
      dark: "#6b9fa1",
      contrastText: "#222",
    },
    secondary: {
      main: "#5d9cc0",
      light: "#b8e0f7",
      dark: "#3a6d8c",
      contrastText: "#fff",
    },
    background: {
      default: "#F0F8FF",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#222",
      secondary: "#5d9cc0",
    },
    error: {
      main: "#FF6B6B",
    },
    success: {
      main: "#6b9fa1",
    },
    warning: {
      main: "#FFD166",
    },
  },
  typography: {
    fontFamily: '"Nanum Myeongjo", serif',
    h1: {
      fontFamily: '"Nanum Myeongjo", serif',
      fontSize: "2.5rem",
      fontWeight: 700,
      color: "#5d9cc0",
    },
    h2: {
      fontFamily: '"Nanum Myeongjo", serif',
      fontSize: "2rem",
      fontWeight: 600,
      color: "#5d9cc0",
    },
    h3: {
      fontFamily: '"Nanum Myeongjo", serif',
      fontSize: "1.75rem",
      fontWeight: 600,
      color: "#5d9cc0",
    },
    h4: {
      fontFamily: '"Nanum Myeongjo", serif',
      fontSize: "1.5rem",
      fontWeight: 600,
      color: "#5d9cc0",
    },
    h5: {
      fontFamily: '"Nanum Myeongjo", serif',
      fontSize: "1.25rem",
      fontWeight: 500,
      color: "#5d9cc0",
    },
    h6: {
      fontFamily: '"Nanum Myeongjo", serif',
      fontSize: "1rem",
      fontWeight: 500,
      color: "#5d9cc0",
    },
    subtitle1: {
      fontFamily: '"Nanum Myeongjo", serif',
      fontSize: "1rem",
      fontWeight: 500,
      color: "#2C3E50",
    },
    subtitle2: {
      fontFamily: '"Nanum Myeongjo", serif',
      fontSize: "0.875rem",
      fontWeight: 500,
      color: "#2C3E50",
    },
    body1: {
      fontFamily: '"Nanum Myeongjo", serif',
      fontSize: "1rem",
      color: "#2C3E50",
    },
    body2: {
      fontFamily: '"Nanum Myeongjo", serif',
      fontSize: "0.875rem",
      color: "#2C3E50",
    },
    button: {
      fontFamily: '"Figtree", sans-serif',
      textTransform: "none",
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: "8px 16px",
          fontFamily: '"Figtree", sans-serif',
        },
        contained: {
          boxShadow: "none",
          "&:hover": {
            boxShadow: "none",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        },
      },
    },
  },
});

export default theme;
