import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import BucketList from "./pages/BucketList";
import { AuthProvider } from "./contexts/AuthContext";
import { DatabaseProvider } from "./contexts/DatabaseContext";

const theme = createTheme({
  palette: {
    primary: {
      main: "#8dcdf2",
      light: "#b8e0f7",
      dark: "#5d9cc0",
      contrastText: "#2C3E50",
    },
    secondary: {
      main: "#5d9cc0",
      light: "#8dcdf2",
      dark: "#3a6d8c",
      contrastText: "#FFFFFF",
    },
    background: {
      default: "#F0F8FF",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#2C3E50",
      secondary: "#5d9cc0",
    },
    error: {
      main: "#FF6B6B",
    },
    success: {
      main: "#5d9cc0",
    },
    warning: {
      main: "#FFD166",
    },
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: "2.5rem",
      fontWeight: 700,
      color: "#5d9cc0",
    },
    h2: {
      fontSize: "2rem",
      fontWeight: 600,
      color: "#5d9cc0",
    },
    h3: {
      fontSize: "1.75rem",
      fontWeight: 600,
      color: "#5d9cc0",
    },
    h4: {
      fontSize: "1.5rem",
      fontWeight: 600,
      color: "#5d9cc0",
    },
    h5: {
      fontSize: "1.25rem",
      fontWeight: 500,
      color: "#5d9cc0",
    },
    h6: {
      fontSize: "1rem",
      fontWeight: 500,
      color: "#5d9cc0",
    },
    subtitle1: {
      fontSize: "1rem",
      fontWeight: 500,
      color: "#2C3E50",
    },
    subtitle2: {
      fontSize: "0.875rem",
      fontWeight: 500,
      color: "#2C3E50",
    },
    body1: {
      fontSize: "1rem",
      color: "#2C3E50",
    },
    body2: {
      fontSize: "0.875rem",
      color: "#2C3E50",
    },
    button: {
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

function App() {
  return (
    <AuthProvider>
      <DatabaseProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Router>
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/bucket-list/:groupId" element={<BucketList />} />
            </Routes>
          </Router>
        </ThemeProvider>
      </DatabaseProvider>
    </AuthProvider>
  );
}

export default App;
