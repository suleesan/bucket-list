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
  Alert,
  IconButton,
  Tooltip,
  Snackbar,
  CircularProgress,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useDatabase } from "../contexts/DatabaseContext";
import MuiAlert from "@mui/material/Alert";
import { supabase } from "../supabase";
import { GroupDialogs } from "../components/GroupDialogs";

const Home = () => {
  const [groups, setGroups] = useState([]);
  const [copySuccess, setCopySuccess] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [newGroupName, setNewGroupName] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [editImageFile, setEditImageFile] = useState(null);
  const [editPreviewUrl, setEditPreviewUrl] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const {
    getGroups,
    getBucketListItems,
    getUsersByIds,
    createGroup,
    joinGroupByCode,
    updateGroup,
    deleteGroup,
    uploadImage,
  } = useDatabase();

  const loadGroupsWithDetails = async () => {
    try {
      if (currentUser) {
        setLoading(true);
        const userGroups = await getGroups();

        if (!userGroups || userGroups.length === 0) {
          setGroups([]);
          setError("");
          return;
        }

        const groupsWithDetails = await Promise.all(
          userGroups.map(async (group) => {
            const items = await getBucketListItems(group.id);
            const sortedItems = items.sort((a, b) => {
              if (!a.date) return 1;
              if (!b.date) return -1;
              return new Date(a.date) - new Date(b.date);
            });

            const { data: members } = await supabase
              .from("group_members")
              .select("user_id")
              .eq("group_id", group.id);

            const memberIds = members.map((m) => m.user_id);
            const memberDetails = await getUsersByIds(memberIds);

            return {
              ...group,
              items: sortedItems.slice(0, 2), // fetch 2 items
              memberDetails,
            };
          })
        );
        setGroups(groupsWithDetails);
        setError("");
      }
    } catch (error) {
      setError("Failed to load groups");
      setGroups([]);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGroupsWithDetails();
  }, [currentUser, getGroups, getBucketListItems, getUsersByIds]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
  };

  const handleImageChange = (event, isEdit = false) => {
    const file = event.target.files[0];
    if (file) {
      if (isEdit) {
        setEditImageFile(file);
        const previewUrl = URL.createObjectURL(file);
        setEditPreviewUrl(previewUrl);
        setEditingGroup((prev) => ({ ...prev, image_url: previewUrl }));
      } else {
        setImageFile(file);
        const previewUrl = URL.createObjectURL(file);
        setPreviewUrl(previewUrl);
      }
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;
    setLoading(true);
    setError("");

    try {
      let imageUrl = null;
      if (imageFile) {
        try {
          imageUrl = await uploadImage(
            imageFile,
            `groups/${Date.now()}_${imageFile.name}`
          );
        } catch (uploadError) {
          console.error("Image upload failed for new group:", {
            error: uploadError,
            message: uploadError.message,
            details: uploadError.details,
            hint: uploadError.hint,
            code: uploadError.code,
          });
          throw uploadError;
        }
      }

      const groupId = await createGroup(newGroupName, imageUrl);

      setNewGroupName("");
      setImageFile(null);
      setPreviewUrl(null);
      setShowCreateDialog(false);
      navigate(`/bucket-list/${groupId}`);
    } catch (error) {
      console.error("Failed to create group:", {
        error: error,
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      setError("Failed to create group");
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
    setLoading(true);
    setError("");
    try {
      let imageUrl = editingGroup.image_url;
      if (editImageFile) {
        try {
          imageUrl = await uploadImage(
            editImageFile,
            `groups/${editingGroup.id}_${Date.now()}_${editImageFile.name}`
          );
        } catch (uploadError) {
          console.error("Image upload failed for group edit:", {
            error: uploadError,
            message: uploadError.message,
            details: uploadError.details,
            hint: uploadError.hint,
            code: uploadError.code,
          });
          throw uploadError;
        }
      }

      await updateGroup(editingGroup.id, {
        ...editingGroup,
        image_url: imageUrl,
      });

      setEditDialogOpen(false);
      setEditingGroup(null);
      setEditImageFile(null);
      setEditPreviewUrl(null);

      return true;
    } catch (error) {
      console.error("Failed to update group:", {
        error: error,
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      setError("Failed to update group");
      return false;
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
      handleCloseEditDialog();
      return true;
    } catch (error) {
      console.error("Error deleting group:", error);
      setError(error.message || "Failed to delete group. Please try again.");
      setDeleteConfirmOpen(true);
      return false;
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
            Welcome to Rally 💫
          </Typography>
          <Typography variant="subtitle1" paragraph>
            Create and share your bucket list with friends
          </Typography>
          <Box
            sx={{ mt: 4, display: "flex", gap: 2, justifyContent: "center" }}
          >
            <Button
              variant="contained"
              onClick={() => navigate("/login")}
              sx={{
                bgcolor: "primary.main",
                "&:hover": { bgcolor: "primary.dark" },
                px: 6,
                py: 1.5,
                minWidth: "100px",
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
            startIcon={<AddIcon />}
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
        // GROUPS
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
                <Typography
                  variant="subtitle1"
                  component="div"
                  color="text.secondary"
                  gutterBottom
                >
                  No groups yet
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Create a new group to get started with your bucket list
                </Typography>
              </Card>
            </Grid>
          ) : (
            groups.map((group) => (
              <Grid size={{ xs: 12, sm: 4 }} key={group.id}>
                <Card
                  onClick={() => navigate(`/bucket-list/${group.id}`)}
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    background: "#fff",
                    cursor: "pointer",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      transition: "transform 0.2s",
                      boxShadow: 3,
                    },
                  }}
                >
                  <Box
                    sx={{
                      height: "250px",
                      backgroundColor: "background.default",
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
                      onClick={(e) => {
                        e.stopPropagation(); // don't let card click when clicking edit
                        handleOpenEditDialog(group);
                      }}
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
                          fontWeight: "bold",
                        }}
                      >
                        {group.name}
                      </Typography>
                      <Tooltip title="Copy group code">
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation(); // don't let card click when copying
                            copyToClipboard(group.code);
                          }}
                          size="small"
                          sx={{ color: "primary.main" }}
                        >
                          <ContentCopyIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                    <Box sx={{ mb: 2 }}>
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
                        <Typography variant="body2">{group.code}</Typography>
                      </Box>
                      <Box sx={{ mb: 1 }}>
                        <Typography
                          variant="body2"
                          gutterBottom
                          sx={{ fontWeight: "bold" }}
                        >
                          Members ({group.memberCount}):
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 1,
                            alignItems: "center",
                          }}
                        >
                          {group.members?.map((member) => (
                            <Box
                              key={member.id}
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                                bgcolor: "background.default",
                                px: 1,
                                py: 0.5,
                                borderRadius: 1,
                              }}
                            >
                              <Typography variant="body2">
                                {member.username}
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    </Box>
                    {group.items && group.items.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            mb: 1,
                            fontWeight: "bold",
                          }}
                        >
                          Upcoming Events
                        </Typography>
                        {group.items.map((item, index) => (
                          <Box
                            key={item.id}
                            sx={{
                              backgroundColor: "background.default",
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
                              <Typography variant="body2">
                                {item.title}
                              </Typography>
                              {item.date && (
                                <Typography variant="body2">
                                  {new Date(item.date).toLocaleDateString()}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      )}

      {/* DIALOGS (abstracted) */}
      <GroupDialogs
        showJoinDialog={showJoinDialog}
        setShowJoinDialog={setShowJoinDialog}
        showCreateDialog={showCreateDialog}
        setShowCreateDialog={setShowCreateDialog}
        joinCode={joinCode}
        setJoinCode={setJoinCode}
        newGroupName={newGroupName}
        setNewGroupName={setNewGroupName}
        previewUrl={previewUrl}
        editDialogOpen={editDialogOpen}
        editingGroup={editingGroup}
        setEditingGroup={setEditingGroup}
        editPreviewUrl={editPreviewUrl}
        deleteConfirmOpen={deleteConfirmOpen}
        loading={loading}
        handleImageChange={handleImageChange}
        handleCreateGroup={handleCreateGroup}
        handleJoinGroup={handleJoinGroup}
        handleCloseEditDialog={handleCloseEditDialog}
        handleSaveEdit={handleSaveEdit}
        handleDeleteClick={handleDeleteClick}
        handleDeleteConfirm={handleDeleteConfirm}
        handleDeleteCancel={handleDeleteCancel}
      />

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
