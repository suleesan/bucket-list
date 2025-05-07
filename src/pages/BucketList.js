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
  CircularProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useDatabase } from "../contexts/DatabaseContext";
import { useAuth } from "../contexts/AuthContext";
import BucketListItem from "../components/BucketListItem";
import SuggestDateDialog from "../components/SuggestDateDialog";
import CommentSection from "../components/CommentSection";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

const BucketList = () => {
  const { groupId } = useParams();
  const [items, setItems] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const {
    createBucketListItem,
    getBucketListItems,
    addDateSuggestion,
    voteForDate,
    getGroup,
    getUsersByIds,
    upvoteBucketListItem,
    removeUpvoteBucketListItem,
    deleteDateSuggestion,
    editDateSuggestion,
    deleteBucketListItem,
    updateBucketListItem,
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

  // Comment dialog state
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [commentItemId, setCommentItemId] = useState(null);

  const [commentCounts, setCommentCounts] = useState({});

  const fetchCommentCounts = async (items) => {
    const counts = {};
    for (const item of items) {
      const commentsRef = collection(
        db,
        "bucketListItems",
        item.id,
        "comments"
      );
      const snapshot = await getDocs(commentsRef);
      counts[item.id] = snapshot.size;
    }
    setCommentCounts(counts);
  };

  const loadGroupAndItems = async () => {
    try {
      setLoading(true);
      const group = await getGroup(groupId);
      setGroupName(group.name);
      const groupItems = await getBucketListItems(groupId);
      setItems(groupItems);
      await fetchCommentCounts(groupItems);
    } catch (error) {
      setError("Failed to load group and items");
      console.error(error);
    } finally {
      setLoading(false);
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
      const newItemId = await createBucketListItem(groupId, newItem);
      // Create a new item object with the returned ID
      const createdItem = {
        id: newItemId,
        ...newItem,
        createdBy: currentUser.uid,
        createdAt: new Date(),
        status: false,
        dateSuggestions: [],
        upvotes: [],
      };
      // Update the items state immediately
      setItems((prevItems) => [createdItem, ...prevItems]);
      // Reset form and close dialog
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
      const newSuggestion = {
        date: formattedDate,
        suggestedBy: currentUser.uid,
        votes: [],
      };

      // Update UI optimistically
      setItems((prevItems) =>
        prevItems.map((item) =>
          item.id === suggestDateItemId
            ? {
                ...item,
                dateSuggestions: [
                  ...(item.dateSuggestions || []),
                  newSuggestion,
                ],
              }
            : item
        )
      );

      await addDateSuggestion(suggestDateItemId, formattedDate);
      setSuggestDateDialogOpen(false);
      setSuggestDateItemId(null);
      setSuggestedDate("");
    } catch (error) {
      // Revert optimistic update on error
      setItems((prevItems) =>
        prevItems.map((item) =>
          item.id === suggestDateItemId
            ? {
                ...item,
                dateSuggestions: item.dateSuggestions.slice(0, -1),
              }
            : item
        )
      );
      setError("Failed to add date suggestion");
      console.error(error);
    }
  };

  const handleVoteForDate = async (itemId, suggestionIndex) => {
    try {
      await voteForDate(itemId, suggestionIndex);
      await loadGroupAndItems();
    } catch (error) {
      setError("Failed to vote for date");
      console.error(error);
    }
  };

  const handleEditItem = async (itemId, editedItem) => {
    try {
      await updateBucketListItem(itemId, editedItem);
      // Update items optimistically
      setItems((prevItems) =>
        prevItems.map((item) =>
          item.id === itemId ? { ...item, ...editedItem } : item
        )
      );
    } catch (error) {
      setError("Failed to update bucket list item");
      console.error(error);
    }
  };

  // Handler to open comment dialog
  const handleOpenComments = (itemId) => {
    setCommentItemId(itemId);
    setCommentDialogOpen(true);
  };

  const handleCloseComments = () => {
    setCommentDialogOpen(false);
    setCommentItemId(null);
  };

  const handleCommentCountChange = (itemId, count) => {
    setCommentCounts((prev) => ({
      ...prev,
      [itemId]: count,
    }));
  };

  const handleDeleteDateSuggestion = async (itemId, suggestionIndex) => {
    try {
      // Update UI optimistically
      setItems((prevItems) =>
        prevItems.map((item) =>
          item.id === itemId
            ? {
                ...item,
                dateSuggestions: item.dateSuggestions.filter(
                  (_, index) => index !== suggestionIndex
                ),
              }
            : item
        )
      );

      await deleteDateSuggestion(itemId, suggestionIndex);
    } catch (error) {
      // Revert optimistic update on error
      await loadGroupAndItems();
      setError("Failed to delete date suggestion");
      console.error(error);
    }
  };

  const handleEditDateSuggestion = async (itemId, suggestionIndex, newDate) => {
    try {
      // Format date as MM-DD-YYYY
      const [yyyy, mm, dd] = newDate.split("-");
      const formattedDate = `${mm}-${dd}-${yyyy}`;

      // Update UI optimistically
      setItems((prevItems) =>
        prevItems.map((item) =>
          item.id === itemId
            ? {
                ...item,
                dateSuggestions: item.dateSuggestions.map((suggestion, index) =>
                  index === suggestionIndex
                    ? { ...suggestion, date: formattedDate }
                    : suggestion
                ),
              }
            : item
        )
      );

      await editDateSuggestion(itemId, suggestionIndex, formattedDate);
    } catch (error) {
      // Revert optimistic update on error
      await loadGroupAndItems();
      setError("Failed to edit date suggestion");
      console.error(error);
    }
  };

  const handleDeleteItem = async (itemId) => {
    try {
      await deleteBucketListItem(itemId);
      await loadGroupAndItems(); // Refresh the list after deletion
    } catch (error) {
      setError("Failed to delete bucket list item");
      console.error(error);
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
      ) : items.length === 0 ? (
        <Grid>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No bucket list items yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Click the "Add Item" button to create your first bucket list item
          </Typography>
        </Grid>
      ) : (
        <Grid container spacing={3}>
          {items.map((item) => (
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
                  // Update items optimistically
                  setItems((prevItems) =>
                    prevItems.map((item) =>
                      item.id === itemId
                        ? {
                            ...item,
                            upvotes: [...(item.upvotes || []), userId],
                          }
                        : item
                    )
                  );
                }}
                onRemoveUpvote={async (itemId, userId) => {
                  await removeUpvoteBucketListItem(itemId, userId);
                  // Update items optimistically
                  setItems((prevItems) =>
                    prevItems.map((item) =>
                      item.id === itemId
                        ? {
                            ...item,
                            upvotes: (item.upvotes || []).filter(
                              (id) => id !== userId
                            ),
                          }
                        : item
                    )
                  );
                }}
                openSuggestDateDialog={openSuggestDateDialog}
                handleVoteForDate={handleVoteForDate}
                onOpenComments={handleOpenComments}
                handleDeleteDateSuggestion={handleDeleteDateSuggestion}
                handleEditDateSuggestion={handleEditDateSuggestion}
                onDelete={handleDeleteItem}
                commentCount={commentCounts[item.id] || 0}
              />
            </Grid>
          ))}
        </Grid>
      )}

      <SuggestDateDialog
        open={suggestDateDialogOpen}
        value={suggestedDate}
        onChange={setSuggestedDate}
        onClose={() => setSuggestDateDialogOpen(false)}
        onSubmit={handleSubmitSuggestDate}
      />

      <CommentSection
        open={commentDialogOpen}
        onClose={handleCloseComments}
        itemId={commentItemId}
        currentUser={currentUser}
        itemTitle={items.find((item) => item.id === commentItemId)?.title}
        onCommentCountChange={handleCommentCountChange}
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
