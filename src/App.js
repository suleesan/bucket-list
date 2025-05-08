import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import BucketList from "./pages/BucketList";
import { AuthProvider } from "./contexts/AuthContext";
import { DatabaseProvider } from "./contexts/DatabaseContext";
import theme from "./theme";

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
