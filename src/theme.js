import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#000000",
      light: "#4A4A4A",
      dark: "#000000",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#5d9cc0",
      light: "#b8e0f7",
      dark: "#3a6d8c",
      contrastText: "#fff",
    },
    status: {
      done: "rgba(202, 245, 161, 0.5)",
      planning: "rgba(255, 230, 179, 0.8)",
      idea: "rgba(254, 156, 154, 0.37)",
    },
    background: {
      default: "#F4F2EC",
      paper: "#F4F2EC",
    },
    text: {
      primary: "#000000",
      secondary: "#000000",
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
      color: "#000000",
    },
    h2: {
      fontFamily: '"Nanum Myeongjo", serif',
      fontSize: "2rem",
      fontWeight: 600,
      color: "#000000",
    },
    h3: {
      fontFamily: '"Nanum Myeongjo", serif',
      fontSize: "1.75rem",
      fontWeight: 600,
      color: "#000000",
    },
    h4: {
      fontFamily: '"Nanum Myeongjo", serif',
      fontSize: "1.5rem",
      fontWeight: 600,
      color: "#000000",
    },
    h5: {
      fontFamily: '"Nanum Myeongjo", serif',
      fontSize: "1.25rem",
      fontWeight: 500,
      color: "#000000",
    },
    h6: {
      fontFamily: '"Nanum Myeongjo", serif',
      fontSize: "1rem",
      fontWeight: 500,
      color: "#000000",
    },
    subtitle1: {
      fontFamily: '"Figtree", sans-serif',
      fontSize: "1rem",
      fontWeight: 500,
      color: "#000000",
    },
    subtitle2: {
      fontFamily: '"Figtree", sans-serif',
      fontSize: "0.875rem",
      fontWeight: 500,
      color: "#000000",
    },
    body1: {
      fontFamily: '"Figtree", sans-serif',
      fontSize: "1rem",
      color: "#000000",
    },
    body2: {
      fontFamily: '"Figtree", sans-serif',
      fontSize: "0.875rem",
      color: "#000000",
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
          boxShadow: "none",
          border: "1px solid black",
        },
      },
    },
  },
});

export default theme;
