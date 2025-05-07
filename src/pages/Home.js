import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Button,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  TextField,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Snackbar,
  CircularProgress,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useDatabase } from "../contexts/DatabaseContext";
import MuiAlert from "@mui/material/Alert";

const Home = () => {
  const [groups, setGroups] = useState([]);
  const [newGroupName, setNewGroupName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { createGroup, getGroups, joinGroupByCode } = useDatabase();

  useEffect(() => {
    const loadGroups = async () => {
      try {
        if (currentUser) {
          setLoading(true);
          const userGroups = await getGroups();
          setGroups(userGroups);
        }
      } catch (error) {
        setError("Failed to load groups");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadGroups();
  }, [currentUser, getGroups]);

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;

    setLoading(true);
    setError("");

    try {
      const groupId = await createGroup(newGroupName);
      setNewGroupName("");
      setShowCreateDialog(false);
      navigate(`/bucket-list/${groupId}`);
    } catch (error) {
      setError("Failed to create group");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async () => {
    if (!joinCode.trim()) return;

    setLoading(true);
    setError("");

    try {
      const groupId = await joinGroupByCode(joinCode.toUpperCase());
      setShowJoinDialog(false);
      setJoinCode("");
      navigate(`/bucket-list/${groupId}`);
    } catch (error) {
      setError("Invalid group code or failed to join group");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
  };

  if (!currentUser) {
    return (
      <Container maxWidth="md" sx={{ mt: 8 }}>
        <Paper
          elevation={0}
          sx={{
            p: 6,
            textAlign: "center",
            borderRadius: 4,
          }}
        >
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: "bold",
            }}
          >
            Welcome to Rally
          </Typography>
          <Typography variant="h5" color="text.secondary" paragraph>
            Create and share your bucket list with friends
          </Typography>
          <Box
            sx={{ mt: 4, display: "flex", gap: 2, justifyContent: "center" }}
          >
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate("/login")}
              sx={{
                bgcolor: "primary.main",
                "&:hover": { bgcolor: "primary.dark" },
              }}
            >
              Get Started
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          sx={{
            color: "#5D8AA8",
            fontWeight: "bold",
          }}
        >
          My Groups
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="contained"
            onClick={() => setShowJoinDialog(true)}
            sx={{
              bgcolor: "primary.main",
              "&:hover": { bgcolor: "primary.dark" },
            }}
          >
            Join Group
          </Button>
          <Button
            variant="contained"
            onClick={() => setShowCreateDialog(true)}
            sx={{
              bgcolor: "primary.main",
              "&:hover": { bgcolor: "primary.dark" },
            }}
          >
            Create New Group
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "50vh",
            width: "100%",
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {groups.length === 0 ? (
            <Grid item xs={12}>
              <Card
                sx={{
                  p: 4,
                  textAlign: "center",
                  background:
                    "linear-gradient(45deg, #F0F8FF 30%, #b8e0f7 90%)",
                }}
              >
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No groups yet
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Create a new group to get started with your bucket list
                </Typography>
              </Card>
            </Grid>
          ) : (
            groups.map((group) => (
              <Grid size={{ xs: 12, sm: 6 }} key={group.id}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    background:
                      "linear-gradient(45deg, #F0F8FF 30%, #b8e0f7 90%)",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      transition: "transform 0.2s",
                    },
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 2,
                      }}
                    >
                      <Typography
                        variant="h5"
                        component="h2"
                        sx={{
                          color: "#5D8AA8",
                          fontWeight: "bold",
                        }}
                      >
                        {group.name}
                      </Typography>
                      <Tooltip title="Copy group code">
                        <IconButton
                          onClick={() => copyToClipboard(group.code)}
                          size="small"
                          sx={{ color: "#5D8AA8" }}
                        >
                          <ContentCopyIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                    <Box sx={{ mb: 1 }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        gutterBottom
                      >
                        Members:
                      </Typography>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {group.memberDetails?.map((member) => (
                          <Typography
                            key={member.id}
                            variant="body2"
                            sx={{
                              bgcolor: "primary.light",
                              color: "primary.contrastText",
                              px: 1,
                              py: 0.5,
                              borderRadius: 1,
                            }}
                          >
                            {member.username}
                          </Typography>
                        ))}
                      </Box>
                    </Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Code: {group.code}
                    </Typography>
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={() => navigate(`/bucket-list/${group.id}`)}
                      sx={{
                        mt: 2,
                        bgcolor: "primary.main",
                        "&:hover": { bgcolor: "primary.dark" },
                      }}
                    >
                      View Bucket List
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      )}

      <Dialog open={showJoinDialog} onClose={() => setShowJoinDialog(false)}>
        <DialogTitle>Join a Group</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Group Code"
            type="text"
            fullWidth
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            placeholder="Enter 6-digit group code"
            inputProps={{ maxLength: 6 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowJoinDialog(false)}>Cancel</Button>
          <Button
            onClick={handleJoinGroup}
            variant="contained"
            disabled={!joinCode.trim() || loading}
          >
            Join
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
      >
        <DialogTitle>Create a New Group</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Group Name"
            type="text"
            fullWidth
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            disabled={loading}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCreateDialog(false)}>Cancel</Button>
          <Button
            onClick={handleCreateGroup}
            variant="contained"
            disabled={!newGroupName.trim() || loading}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={copySuccess}
        autoHideDuration={2000}
        onClose={() => setCopySuccess(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <MuiAlert
          onClose={() => setCopySuccess(false)}
          severity="success"
          sx={{ width: "100%" }}
        >
          Group code copied!
        </MuiAlert>
      </Snackbar>
    </Container>
  );
};

export default Home;
