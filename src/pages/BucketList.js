import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Container,
  Typography,
  Button,
  Box,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useDatabase } from "../contexts/DatabaseContext";
import { useAuth } from "../contexts/AuthContext";
import BucketListItem from "../components/BucketListItem";
import SuggestDateDialog from "../components/SuggestDateDialog";

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
    getUsersByIds,
    upvoteBucketListItem,
    removeUpvoteBucketListItem,
  } = useDatabase();
  const { currentUser } = useAuth();

  const [newItem, setNewItem] = useState({
    title: "",
    description: "",
    location: "",
    date: "",
  });

  const [creators, setCreators] = useState({});
  const [upvoters, setUpvoters] = useState({});
  const [dateSuggestionUsers, setDateSuggestionUsers] = useState({});

  const [suggestDateDialogOpen, setSuggestDateDialogOpen] = useState(false);
  const [suggestDateItemId, setSuggestDateItemId] = useState(null);
  const [suggestedDate, setSuggestedDate] = useState("");

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

  useEffect(() => {
    if (groupId) {
      loadGroupAndItems();
    }
  }, [groupId, getBucketListItems, getGroup]);

  useEffect(() => {
    const fetchUpvoters = async () => {
      const upvotersMap = {};
      for (const item of items) {
        if (item.upvotes && item.upvotes.length > 0) {
          upvotersMap[item.id] = await getUsersByIds(item.upvotes);
        } else {
          upvotersMap[item.id] = [];
        }
      }
      setUpvoters(upvotersMap);
    };
    fetchUpvoters();
  }, [items]);

  useEffect(() => {
    const fetchCreators = async () => {
      const creatorsMap = {};
      for (const item of items) {
        if (item.createdBy) {
          const [user] = await getUsersByIds([item.createdBy]);
          creatorsMap[item.id] = user;
        }
      }
      setCreators(creatorsMap);
    };
    fetchCreators();
  }, [items, getUsersByIds]);

  useEffect(() => {
    const fetchDateSuggestionUsers = async () => {
      const userMap = {};
      for (const item of items) {
        if (item.dateSuggestions && item.dateSuggestions.length > 0) {
          for (const suggestion of item.dateSuggestions) {
            const uid = suggestion.suggestedBy;
            if (uid && !userMap[uid]) {
              const [user] = await getUsersByIds([uid]);
              userMap[uid] = user;
            }
          }
        }
      }
      setDateSuggestionUsers(userMap);
    };
    fetchDateSuggestionUsers();
  }, [items, getUsersByIds]);

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

  const openSuggestDateDialog = (itemId) => {
    setSuggestDateItemId(itemId);
    setSuggestedDate("");
    setSuggestDateDialogOpen(true);
  };

  const handleSubmitSuggestDate = async () => {
    if (!suggestedDate) return;
    // Format date as MM-DD-YYYY
    const [yyyy, mm, dd] = suggestedDate.split("-");
    const formattedDate = `${mm}-${dd}-${yyyy}`;
    try {
      await addDateSuggestion(suggestDateItemId, formattedDate);
      setSuggestDateDialogOpen(false);
      setSuggestDateItemId(null);
      setSuggestedDate("");
      await loadGroupAndItems();
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

  const handleEditItem = (item) => {
    setEditingItem(item);
    setEditDialog(true);
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
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No bucket list items yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Click the "Add Item" button to create your first bucket list item
            </Typography>
          </Grid>
        ) : (
          items.map((item) => (
            <Grid size={{ xs: 6, sm: 3 }} key={item.id}>
              <BucketListItem
                item={item}
                creators={creators}
                upvoters={upvoters}
                dateSuggestionUsers={dateSuggestionUsers}
                currentUser={currentUser}
                onEdit={handleEditItem}
                onUpvote={async (itemId, userId) => {
                  await upvoteBucketListItem(itemId, userId);
                  await loadGroupAndItems();
                }}
                onRemoveUpvote={async (itemId, userId) => {
                  await removeUpvoteBucketListItem(itemId, userId);
                  await loadGroupAndItems();
                }}
                openSuggestDateDialog={openSuggestDateDialog}
                handleVoteForDate={handleVoteForDate}
              />
            </Grid>
          ))
        )}
      </Grid>

      <SuggestDateDialog
        open={suggestDateDialogOpen}
        value={suggestedDate}
        onChange={setSuggestedDate}
        onClose={() => setSuggestDateDialogOpen(false)}
        onSubmit={handleSubmitSuggestDate}
      />

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
