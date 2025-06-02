import { useState, useEffect } from "react";
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Tabs,
  Tab,
} from "@mui/material";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { styled } from "@mui/material/styles";
import { supabase } from "../supabase";

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  maxWidth: 400,
  margin: "0 auto",
}));

const StyledForm = styled("form")(({ theme }) => ({
  width: "100%",
  marginTop: theme.spacing(3),
}));

const StyledButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(3, 0, 2),
}));

const Login = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signup, login, showCheckEmailMessage, setShowCheckEmailMessage } =
    useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const checkEmailConfirmation = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user?.email_confirmed_at) {
        navigate("/");
      }
    };
    checkEmailConfirmation();
  }, [navigate]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setError("");
    setShowCheckEmailMessage(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (activeTab === 0) {
        // Sign up
        if (!username || !email || !password) {
          throw new Error("Please fill in all fields");
        }
        if (username.length < 3) {
          throw new Error("Username must be at least 3 characters long");
        }
        if (password.length < 6) {
          throw new Error("Password must be at least 6 characters long");
        }
        await signup(username, email, password);
        // Do NOT navigate to "/" after sign up; show check email message instead
      } else {
        // Log in
        if (!email || !password) {
          throw new Error("Please fill in all fields");
        }
        await login(email, password);
        navigate("/");
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container
      component="main"
      maxWidth="xs"
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <StyledPaper elevation={3} sx={{ marginTop: "100px" }}>
        <Typography component="h1" variant="h5" sx={{ fontWeight: "bold" }}>
          {activeTab === 0 ? "Create Account" : "Sign In"}
        </Typography>
        <Box sx={{ width: "100%", mt: 2 }}>
          <Tabs value={activeTab} onChange={handleTabChange} centered>
            <Tab label="Sign Up" />
            <Tab label="Sign In" />
          </Tabs>
        </Box>
        <StyledForm onSubmit={handleSubmit}>
          {activeTab === 0 && (
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          )}
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {showCheckEmailMessage && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Check your email to finish authenticating!
            </Alert>
          )}
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
          <StyledButton
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {activeTab === 0 ? "Sign Up" : "Sign In"}
          </StyledButton>
        </StyledForm>
      </StyledPaper>
    </Container>
  );
};

export default Login;
