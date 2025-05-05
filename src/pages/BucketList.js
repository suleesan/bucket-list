import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Box,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import EventIcon from "@mui/icons-material/Event";
import { useDatabase } from "../contexts/DatabaseContext";
import { useAuth } from "../contexts/AuthContext";

const BucketList = () => {
  const { groupId } = useParams();
  const [items, setItems] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const {
    createBucketListItem,
    getBucketListItems,
    updateBucketListItem,
    addDateSuggestion,
    voteForDate,
    getGroup,
  } = useDatabase();
  const { currentUser } = useAuth();

  const [newItem, setNewItem] = useState({
    title: "",
    description: "",
    location: "",
    date: "",
  });

  useEffect(() => {
    const loadGroupAndItems = async () => {
      try {
        const group = await getGroup(groupId);
        setGroupName(group.name);
        const groupItems = await getBucketListItems(groupId);
        setItems(groupItems);
      } catch (error) {
        setError("Failed to load group and items");
        console.error(error);
      }
    };

    if (groupId) {
      loadGroupAndItems();
    }
  }, [groupId, getBucketListItems, getGroup]);

  const handleAddItem = async () => {
    if (!newItem.title.trim()) return;

    setLoading(true);
    setError("");

    try {
      await createBucketListItem(groupId, newItem);
      setNewItem({ title: "", description: "", location: "", date: "" });
      setOpenDialog(false);
    } catch (error) {
      setError("Failed to create bucket list item");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestDate = async (itemId) => {
    try {
      const date = prompt("Enter a suggested date (YYYY-MM-DD):");
      if (date) {
        await addDateSuggestion(itemId, date);
      }
    } catch (error) {
      setError("Failed to add date suggestion");
      console.error(error);
    }
  };

  const handleVoteForDate = async (itemId, suggestionIndex) => {
    try {
      await voteForDate(itemId, suggestionIndex);
    } catch (error) {
      setError("Failed to vote for date");
      console.error(error);
    }
  };

  const handleEditItem = async () => {
    if (!editingItem.title.trim()) return;

    setLoading(true);
    setError("");

    try {
      await updateBucketListItem(editingItem.id, {
        title: editingItem.title,
        description: editingItem.description,
        location: editingItem.location,
        date: editingItem.date,
      });
      setEditingItem(null);
      setEditDialog(false);
      // Refresh items
      const groupItems = await getBucketListItems(groupId);
      setItems(groupItems);
    } catch (error) {
      setError("Failed to update bucket list item");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              color: "#5D8AA8",
              fontWeight: "bold",
            }}
          >
            {groupName}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Bucket List Items
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
          disabled={loading}
          sx={{
            bgcolor: "primary.main",
            "&:hover": { bgcolor: "primary.dark" },
          }}
        >
          Add Item
        </Button>
      </Box>

      <Grid container spacing={3}>
        {items.length === 0 ? (
          <Grid>
            <Card
              sx={{
                p: 4,
                textAlign: "center",
                background: "linear-gradient(45deg, #F0F8FF 30%, #b8e0f7 90%)",
              }}
            >
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No bucket list items yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Click the "Add Item" button to create your first bucket list
                item
              </Typography>
            </Card>
          </Grid>
        ) : (
          items.map((item) => (
            <Grid size={{ xs: 6, sm: 3 }} key={item.id}>
              <Card
                sx={{
                  height: "300px",
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
                <CardContent
                  sx={{
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                  }}
                >
                  <Box sx={{ flexGrow: 1 }}>
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
                        {item.title}
                      </Typography>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => {
                          setEditingItem(item);
                          setEditDialog(true);
                        }}
                        sx={{
                          borderColor: "primary.main",
                          color: "primary.main",
                          "&:hover": {
                            borderColor: "primary.dark",
                            color: "primary.dark",
                          },
                        }}
                      >
                        Edit
                      </Button>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Chip
                        icon={<LocationOnIcon />}
                        label={item.location}
                        variant="outlined"
                        sx={{ mr: 1, mb: 1 }}
                      />
                      <Chip
                        icon={<EventIcon />}
                        label={item.date}
                        variant="outlined"
                        sx={{ mr: 1, mb: 1 }}
                      />
                    </Box>
                    <Typography color="text.secondary" paragraph>
                      {item.description}
                    </Typography>
                    {item.dateSuggestions?.length > 0 && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Date Suggestions:
                        </Typography>
                        {item.dateSuggestions.map((suggestion, index) => (
                          <Chip
                            key={index}
                            label={`${suggestion.date} (${suggestion.votes.length} votes)`}
                            onClick={() => handleVoteForDate(item.id, index)}
                            sx={{ mr: 1, mb: 1 }}
                          />
                        ))}
                      </Box>
                    )}
                  </Box>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => handleSuggestDate(item.id)}
                    sx={{
                      borderColor: "primary.main",
                      color: "primary.main",
                      "&:hover": {
                        borderColor: "primary.dark",
                        color: "primary.dark",
                      },
                      mt: "auto",
                    }}
                  >
                    Suggest Date
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add New Bucket List Item</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Title"
              value={newItem.title}
              onChange={(e) =>
                setNewItem({ ...newItem, title: e.target.value })
              }
              disabled={loading}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              value={newItem.description}
              onChange={(e) =>
                setNewItem({ ...newItem, description: e.target.value })
              }
              disabled={loading}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Location"
              value={newItem.location}
              onChange={(e) =>
                setNewItem({ ...newItem, location: e.target.value })
              }
              disabled={loading}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Date"
              type="date"
              value={newItem.date}
              onChange={(e) => setNewItem({ ...newItem, date: e.target.value })}
              disabled={loading}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleAddItem}
            variant="contained"
            disabled={loading || !newItem.title.trim()}
            sx={{
              bgcolor: "primary.main",
              "&:hover": { bgcolor: "primary.dark" },
            }}
          >
            Add Item
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={editDialog}
        onClose={() => setEditDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Bucket List Item</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Title"
              value={editingItem?.title || ""}
              onChange={(e) =>
                setEditingItem({ ...editingItem, title: e.target.value })
              }
              disabled={loading}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              value={editingItem?.description || ""}
              onChange={(e) =>
                setEditingItem({ ...editingItem, description: e.target.value })
              }
              disabled={loading}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Location"
              value={editingItem?.location || ""}
              onChange={(e) =>
                setEditingItem({ ...editingItem, location: e.target.value })
              }
              disabled={loading}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Date"
              type="date"
              value={editingItem?.date || ""}
              onChange={(e) =>
                setEditingItem({ ...editingItem, date: e.target.value })
              }
              disabled={loading}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleEditItem}
            variant="contained"
            disabled={loading || !editingItem?.title.trim()}
            sx={{
              bgcolor: "primary.main",
              "&:hover": { bgcolor: "primary.dark" },
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default BucketList;
