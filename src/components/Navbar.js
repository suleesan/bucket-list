import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useDatabase } from "../contexts/DatabaseContext";
import { useEffect, useState } from "react";

const Navbar = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const { getUser } = useDatabase();
  const [profile, setProfile] = useState(null);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      if (currentUser) {
        const userProfile = await getUser(currentUser.id);
        setProfile(userProfile);
      }
    };
    fetchProfile();
  }, [currentUser, getUser]);

  return (
    <AppBar position="static" elevation={0} sx={{ backgroundColor: 'white' }}>
      <Toolbar>
        <Typography
          variant="h5"
          component="div"
          sx={{
            flexGrow: 1,
            cursor: "pointer",
            color: "black",
            fontWeight: "bold",
          }}
          onClick={() => navigate("/")}
        >
          Rally 💫
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {currentUser ? (
            <>
              <Typography variant="body1" sx={{ mr: 2, color: "black" }}>
                {profile?.username || "User"}
              </Typography>
              <Button 
                onClick={handleLogout}
                sx={{
                  color: "black",
                  fontSize: "1rem",
                  fontFamily: '"Figtree", sans-serif',
                  fontWeight: "normal",
                  textTransform: "none",
                }}
              >
                Logout
              </Button>
            </>
          ) : (
            <Button 
              variant="contained"
              onClick={() => navigate("/login")}
              sx={{
                bgcolor: "primary.main",
                "&:hover": { bgcolor: "primary.dark" },
              }}
            >
              Get Started
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
