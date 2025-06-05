import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Button,
  Box,
  Grid,
  Alert,
  CircularProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useDatabase } from "../contexts/DatabaseContext";
import { useAuth } from "../contexts/AuthContext";
import BucketListItem from "../components/BucketListItem";
import BucketListDialogs from "../components/BucketListDialogs";
import { supabase } from "../supabase";

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
    getGroup,
    getUsersByIds,
    rsvpBucketListItem,
    removeRsvpBucketListItem,
    deleteBucketListItem,
    uploadImage,
    updateBucketListItem,
  } = useDatabase();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [newItem, setNewItem] = useState({
    title: "",
    description: "",
    location: "",
    date: "",
    time: "",
    status: "idea",
  });

  const [creators, setCreators] = useState({});
  const [upvoters, setUpvoters] = useState({});

  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [commentItemId, setCommentItemId] = useState(null);
  const [commentCounts, setCommentCounts] = useState({});
  const [commentUsers, setCommentUsers] = useState({});

  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [statusFilter, setStatusFilter] = useState("all");

  const fetchCommentCounts = async (items) => {
    const counts = {};
    for (const item of items) {
      const { count, error } = await supabase
        .from("comments")
        .select("*", { count: "exact", head: true })
        .eq("item_id", item.id);
      counts[item.id] = count || 0;
    }
    setCommentCounts(counts);
  };

  const fetchCommentUsers = async (items) => {
    const allCommenters = new Set();
    for (const item of items) {
      const { data: comments } = await supabase
        .from("comments")
        .select("created_by")
        .eq("item_id", item.id);
      comments?.forEach((c) => allCommenters.add(c.created_by));
    }
    const userIds = Array.from(allCommenters).filter(Boolean);
    if (userIds.length > 0) {
      const users = await getUsersByIds(userIds);
      const userMap = {};
      users.forEach((user) => {
        userMap[user.id] = user;
      });
      setCommentUsers(userMap);
    } else {
      setCommentUsers({});
    }
  };

  const loadGroupAndItems = async () => {
    try {
      setLoading(true);
      const group = await getGroup(groupId);
      setGroupName(group.name);
      const groupItems = await getBucketListItems(groupId);

      const sortedItems = groupItems.sort((a, b) => {
        if (!a.date) return 1;
        if (!b.date) return -1;
        return new Date(a.date) - new Date(b.date);
      });

      setItems(sortedItems);
      await fetchCommentCounts(sortedItems);
      await fetchCommentUsers(sortedItems);
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

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setPreviewUrl(previewUrl);
      setNewItem((prev) => ({ ...prev, image_url: previewUrl }));
    }
  };

  const handleAddItem = async () => {
    if (!newItem.title.trim()) return;

    setLoading(true);
    setError("");

    try {
      let imageUrl = null;
      if (imageFile) {
        imageUrl = await uploadImage(
          imageFile,
          `items/${Date.now()}_${imageFile.name}`
        );
      }

      const newItemId = await createBucketListItem(groupId, {
        ...newItem,
        image_url: imageUrl,
      });

      const createdItem = {
        id: newItemId,
        ...newItem,
        image_url: imageUrl,
        createdBy: currentUser.uid,
        createdAt: new Date(),
        status: newItem.status || "idea",
        dateSuggestions: [],
        upvotes: [],
      };

      setItems((prevItems) => [createdItem, ...prevItems]);

      setNewItem({
        title: "",
        description: "",
        location: "",
        date: "",
        time: "",
        status: "idea",
        image_url: null,
      });
      setImageFile(null);
      setPreviewUrl(null);
      setOpenDialog(false);
    } catch (error) {
      setError("Failed to create bucket list item");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRsvp = async (itemId) => {
    try {
      await rsvpBucketListItem(itemId);
      setItems((prevItems) =>
        prevItems.map((item) =>
          item.id === itemId
            ? { ...item, upvotes: [...(item.upvotes || []), currentUser.id] }
            : item
        )
      );
    } catch (error) {
      setError("Failed to RSVP");
      console.error(error);
    }
  };

  const handleRemoveRsvp = async (itemId) => {
    try {
      await removeRsvpBucketListItem(itemId);
      setItems((prevItems) =>
        prevItems.map((item) =>
          item.id === itemId
            ? {
                ...item,
                upvotes: (item.upvotes || []).filter(
                  (id) => id !== currentUser.id
                ),
              }
            : item
        )
      );
    } catch (error) {
      setError("Failed to remove RSVP");
      console.error(error);
    }
  };

  const handleEditItem = async (itemId, editedItem) => {
    try {
      await updateBucketListItem(itemId, editedItem);

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

  const handleOpenComments = (itemId) => {
    setCommentItemId(itemId);
    setCommentDialogOpen(true);
  };

  // const handleCloseComments = () => {
  //   setCommentDialogOpen(false);
  //   setCommentItemId(null);
  // };

  // const handleCommentCountChange = (itemId, count) => {
  //   setCommentCounts((prev) => ({
  //     ...prev,
  //     [itemId]: count,
  //   }));
  // };

  const handleDeleteItem = async (itemId) => {
    try {
      await deleteBucketListItem(itemId);
      await loadGroupAndItems();
    } catch (error) {
      setError("Failed to delete bucket list item");
      console.error(error);
    }
  };

  const handleImageUpload = async (itemId, file) => {
    try {
      const imageUrl = await uploadImage(
        file,
        `items/${itemId}_${Date.now()}_${file.name}`
      );
      await updateBucketListItem(itemId, { image_url: imageUrl });
      setItems((prevItems) =>
        prevItems.map((item) =>
          item.id === itemId ? { ...item, image_url: imageUrl } : item
        )
      );
      return imageUrl;
    } catch (error) {
      setError("Failed to upload image");
      console.error(error);
      throw error;
    }
  };

  const filteredItems =
    statusFilter === "all"
      ? items
      : items.filter((item) => item.status === statusFilter);

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
          mb: 2,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: "bold",
            }}
          >
            {groupName}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="outlined"
            onClick={() => navigate("/")}
            sx={{
              borderColor: "primary.main",
              color: "primary.main",
              "&:hover": {
                borderColor: "primary.dark",
                color: "primary.dark",
              },
            }}
          >
            Return to Groups
          </Button>
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
            Add Activity
          </Button>
        </Box>
      </Box>
      <Box sx={{ mb: 4, display: "flex", gap: 1 }}>
        {["all", "idea", "planning", "done"].map((status) => (
          <Button
            key={status}
            variant={statusFilter === status ? "contained" : "text"}
            onClick={() => setStatusFilter(status)}
            sx={{
              textTransform: "capitalize",
              color: statusFilter === status ? "white" : "black",
              backgroundColor:
                statusFilter === status ? "black" : "transparent",
              "&:hover": {
                backgroundColor:
                  statusFilter === status ? "#4A4A4A" : "rgba(0, 0, 0, 0.1)",
                color: statusFilter === status ? "white" : "black",
              },
              fontWeight: statusFilter === status ? "bold" : "normal",
            }}
          >
            {status === "all" ? "All" : status}
          </Button>
        ))}
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
      ) : filteredItems.length === 0 ? (
        <Grid>
          <Typography variant="subtitle1" color="primary.main" gutterBottom>
            {statusFilter === "all"
              ? "No bucket list items yet"
              : `No ${statusFilter} items found`}
          </Typography>
          <Typography variant="body2" color="primary.main">
            {statusFilter === "all"
              ? 'Click the "Add Activity" button to create your first bucket list item'
              : `Try selecting a different filter or add a new ${statusFilter} item`}
          </Typography>
        </Grid>
      ) : (
        <Grid container spacing={3}>
          {filteredItems.map((item) => (
            <Grid size={{ xs: 6, sm: 3 }} key={item.id}>
              <BucketListItem
                item={item}
                creators={creators}
                upvoters={upvoters}
                commentUsers={commentUsers}
                currentUser={currentUser}
                onEdit={handleEditItem}
                onUpvote={handleRsvp}
                onRemoveUpvote={handleRemoveRsvp}
                onOpenComments={handleOpenComments}
                onDelete={handleDeleteItem}
                commentCount={commentCounts[item.id] || 0}
                onImageUpload={handleImageUpload}
              />
            </Grid>
          ))}
        </Grid>
      )}

      <BucketListDialogs
        openDialog={openDialog}
        editDialog={editDialog}
        newItem={newItem}
        editingItem={editingItem}
        loading={loading}
        previewUrl={previewUrl}
        onCloseDialog={() => setOpenDialog(false)}
        onCloseEditDialog={() => setEditDialog(false)}
        onAddItem={handleAddItem}
        onEditItem={handleEditItem}
        onImageChange={handleImageChange}
        setNewItem={setNewItem}
        setEditingItem={setEditingItem}
        setImageFile={setImageFile}
        setPreviewUrl={setPreviewUrl}
      />
    </Container>
  );
};

export default BucketList;
