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
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import ImageIcon from "@mui/icons-material/Image";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useDatabase } from "../contexts/DatabaseContext";
import MuiAlert from "@mui/material/Alert";
import { supabase } from "../supabase";

const Home = () => {
  const [groups, setGroups] = useState([]);
  const [newGroupName, setNewGroupName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [editImageFile, setEditImageFile] = useState(null);
  const [editPreviewUrl, setEditPreviewUrl] = useState(null);
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const {
    createGroup,
    getGroups,
    joinGroupByCode,
    updateGroup,
    deleteGroup,
    getBucketListItems,
    getUsersByIds,
    uploadImage,
    onImageUpload,
  } = useDatabase();

  useEffect(() => {
    const loadGroups = async () => {
      try {
        if (currentUser) {
          setLoading(true);
          const userGroups = await getGroups();
          console.log("Loaded groups:", userGroups); // Debug log

          if (!userGroups || userGroups.length === 0) {
            setGroups([]); // No groups found, but this is not an error
            setError(""); // Clear any previous error
          } else {
            // Fetch items and member details for each group
            const groupsWithDetails = await Promise.all(
              userGroups.map(async (group) => {
                console.log("Processing group:", group); // Debug log
                // Fetch items
                const items = await getBucketListItems(group.id);
                // Sort items by date, with items without dates at the end
                const sortedItems = items.sort((a, b) => {
                  if (!a.date) return 1;
                  if (!b.date) return -1;
                  return new Date(a.date) - new Date(b.date);
                });

                // Fetch member details
                const { data: members } = await supabase
                  .from("group_members")
                  .select("user_id")
                  .eq("group_id", group.id);

                const memberIds = members.map((m) => m.user_id);
                const memberDetails = await getUsersByIds(memberIds);

                return {
                  ...group,
                  items: sortedItems.slice(0, 5), // Get up to 5 items
                  memberDetails,
                };
              })
            );
            console.log("Groups with details:", groupsWithDetails); // Debug log
            setGroups(groupsWithDetails);
            setError("");
          }
        }
      } catch (error) {
        setError("Failed to load groups");
        setGroups([]);
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadGroups();
  }, [currentUser, getGroups, getBucketListItems, getUsersByIds]);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setPreviewUrl(previewUrl);
    }
  };

  const handleEditImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setEditImageFile(file);
      // Create a preview URL for the image
      const previewUrl = URL.createObjectURL(file);
      setEditPreviewUrl(previewUrl);
      setEditingGroup((prev) => ({ ...prev, image_url: previewUrl }));
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;
    setLoading(true);
    setError("");

    try {
      let imageUrl = null;
      if (imageFile) {
        imageUrl = await uploadImage(
          imageFile,
          `groups/${Date.now()}_${imageFile.name}`
        );
      }

      const groupId = await createGroup(newGroupName, imageUrl);
      setNewGroupName("");
      setImageFile(null);
      setPreviewUrl(null);
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

  const handleOpenEditDialog = (group) => {
    setEditingGroup(group);
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    if (editPreviewUrl) {
      URL.revokeObjectURL(editPreviewUrl);
    }
    setEditDialogOpen(false);
    setEditingGroup(null);
    setEditImageFile(null);
    setEditPreviewUrl(null);
  };

  const handleSaveEdit = async () => {
    if (!editingGroup?.name.trim()) return;

    setLoading(true);
    setError("");

    try {
      let imageUrl;
      if (editImageFile) {
        imageUrl = await uploadImage(
          editImageFile,
          `groups/${editingGroup.id}_${Date.now()}_${editImageFile.name}`
        );
        await updateGroup(editingGroup.id, {
          name: editingGroup.name,
          image_url: imageUrl,
        });
      } else {
        await updateGroup(editingGroup.id, {
          name: editingGroup.name,
        });
      }

      setGroups((prevGroups) =>
        prevGroups.map((group) =>
          group.id === editingGroup.id
            ? {
                ...group,
                name: editingGroup.name,
                image_url: editImageFile ? imageUrl : group.image_url,
              }
            : group
        )
      );

      handleCloseEditDialog();
    } catch (error) {
      setError("Failed to update group");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = () => {
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!editingGroup) return;

    setLoading(true);
    setError("");
    setDeleteConfirmOpen(false);

    try {
      await deleteGroup(editingGroup.id);

      setGroups((prevGroups) =>
        prevGroups.filter((group) => group.id !== editingGroup.id)
      );

      handleCloseEditDialog();

      setDeleteSuccess(true);
    } catch (error) {
      console.error("Error deleting group:", error);
      setError(error.message || "Failed to delete group. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
  };

  if (!currentUser) {
    return (
      <Container
        maxWidth="md"
        sx={{
          mt: 4,
          height: "calc(100vh - 64px - 32px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 6,
            textAlign: "center",
            borderRadius: 4,
            width: "100%",
            transform: "translateY(-10%)",
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
            Welcome to Rally!
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
                fontSize: "1.2rem",
                px: 6,
                py: 1.5,
                minWidth: "200px",
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
                  background: "#fff",
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
                    background: "#fff",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      transition: "transform 0.2s",
                    },
                  }}
                >
                  <Box
                    sx={{
                      height: "250px",
                      backgroundColor: "#A0CBCF",
                      position: "relative",
                      backgroundImage: group.image_url
                        ? `url(${group.image_url})`
                        : "none",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  >
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleOpenEditDialog(group)}
                      sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        borderColor: "black",
                        color: "black",
                        backgroundColor: "rgba(255, 255, 255, 0.5)",
                        opacity: 0,
                        transition: "opacity 0.2s",
                        "&:hover": {
                          borderColor: "black",
                          color: "black",
                          backgroundColor: "rgba(255, 255, 255, 0.7)",
                        },
                        ".MuiCard-root:hover &": {
                          opacity: 1,
                        },
                      }}
                    >
                      Edit
                    </Button>
                  </Box>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 1,
                      }}
                    >
                      <Typography
                        variant="h5"
                        component="h2"
                        sx={{
                          color: "black",
                          fontWeight: "bold",
                        }}
                      >
                        {group.name}
                      </Typography>
                      <Tooltip title="Copy group code">
                        <IconButton
                          onClick={() => copyToClipboard(group.code)}
                          size="small"
                          sx={{ color: "primary.main" }}
                        >
                          <ContentCopyIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: "bold",
                          mb: 1,
                          color: "black",
                        }}
                      >
                        Group Information
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                          mb: 1,
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: "bold", color: "black" }}
                        >
                          Code:
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {group.code}
                        </Typography>
                      </Box>
                      <Box sx={{ mb: 1 }}>
                        <Typography
                          variant="body2"
                          gutterBottom
                          sx={{ fontWeight: "bold", color: "black" }}
                        >
                          Members:
                        </Typography>
                        <Box
                          sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}
                        >
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
                    </Box>
                    {group.items && group.items.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: "bold",
                            mb: 1,
                            color: "black",
                          }}
                        >
                          Upcoming Events
                        </Typography>
                        {group.items.map((item, index) => (
                          <Box
                            key={item.id}
                            sx={{
                              backgroundColor: "primary.light",
                              borderRadius: 1,
                              p: 1.5,
                              mb: 1,
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                              }}
                            >
                              <Typography
                                variant="subtitle1"
                                sx={{
                                  fontWeight: "medium",
                                  color: "primary.contrastText",
                                }}
                              >
                                {item.title}
                              </Typography>
                              {item.date && (
                                <Typography
                                  variant="body2"
                                  sx={{
                                    color: "primary.contrastText",
                                    opacity: 0.9,
                                    ml: 1,
                                  }}
                                >
                                  {new Date(item.date).toLocaleDateString()}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    )}
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
            inputProps={{
              maxLength: 50,
              pattern: ".*",
              inputMode: "text",
            }}
            sx={{ mb: 2 }}
          />
          <Button
            component="label"
            variant="outlined"
            startIcon={<ImageIcon />}
            fullWidth
            sx={{ mb: 2 }}
          >
            Upload Image
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={handleImageChange}
            />
          </Button>
          {previewUrl && (
            <Box
              sx={{
                width: "100%",
                height: "200px",
                backgroundImage: `url(${previewUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                mb: 2,
                borderRadius: 1,
              }}
            />
          )}
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

      <Dialog
        open={editDialogOpen}
        onClose={handleCloseEditDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ m: 0, p: 2 }}>
          Edit Group
          <IconButton
            aria-label="close"
            onClick={handleCloseEditDialog}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
            size="large"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <TextField
            fullWidth
            label="Group Name"
            value={editingGroup?.name || ""}
            onChange={(e) =>
              setEditingGroup({ ...editingGroup, name: e.target.value })
            }
            sx={{ mb: 2, mt: 2 }}
            inputProps={{
              maxLength: 50,
              pattern: ".*",
              inputMode: "text",
            }}
          />
          <Button
            component="label"
            variant="outlined"
            startIcon={<ImageIcon />}
            fullWidth
            sx={{ mb: 2 }}
          >
            Upload Image
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={handleEditImageChange}
            />
          </Button>
          {(editPreviewUrl || editingGroup?.image_url) && (
            <Box
              sx={{
                width: "100%",
                height: "200px",
                backgroundImage: `url(${
                  editPreviewUrl || editingGroup?.image_url
                })`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                mb: 2,
                borderRadius: 1,
              }}
            />
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: "space-between", px: 2 }}>
          <Button
            onClick={handleDeleteClick}
            color="error"
            startIcon={<DeleteIcon />}
            disabled={loading}
          >
            Delete Group
          </Button>
          <Box>
            <Button
              onClick={handleCloseEditDialog}
              sx={{ mr: 1 }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              variant="contained"
              disabled={!editingGroup?.name?.trim() || loading}
            >
              Save Changes
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteConfirmOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this group? This action cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={loading}
          >
            Delete
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

      <Snackbar
        open={deleteSuccess}
        autoHideDuration={2000}
        onClose={() => setDeleteSuccess(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <MuiAlert
          onClose={() => setDeleteSuccess(false)}
          severity="success"
          sx={{ width: "100%" }}
        >
          Group deleted successfully!
        </MuiAlert>
      </Snackbar>
    </Container>
  );
};

export default Home;
