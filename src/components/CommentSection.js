import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Typography,
  Box,
} from "@mui/material";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { useDatabase } from "../contexts/DatabaseContext";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";

const CommentSection = ({
  open,
  onClose,
  itemId,
  currentUser,
  itemTitle,
  onCommentCountChange,
}) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [userMap, setUserMap] = useState({});
  const { getUsersByIds } = useDatabase();

  useEffect(() => {
    if (!itemId) return;
    const q = query(
      collection(db, "bucketListItems", itemId, "comments"),
      orderBy("createdAt", "asc")
    );
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const commentData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setComments(commentData);
      onCommentCountChange(itemId, commentData.length);
      // Fetch user info for all unique UIDs
      const uids = Array.from(
        new Set(commentData.map((c) => c.createdBy).filter(Boolean))
      );
      if (uids.length > 0) {
        const users = await getUsersByIds(uids);
        const map = {};
        users.forEach((u) => (map[u.id] = u));
        setUserMap(map);
      }
    });
    return () => unsubscribe();
  }, [itemId, getUsersByIds, onCommentCountChange]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    await addDoc(collection(db, "bucketListItems", itemId, "comments"), {
      text: newComment,
      createdBy: currentUser.uid,
      createdAt: serverTimestamp(),
    });
    setNewComment("");
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ m: 0, p: 2 }}>
        <Typography variant="h5" fontWeight="bold">
          Comments for {itemTitle}
        </Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
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
        <List>
          {comments.length === 0 && (
            <Typography color="text.secondary" align="center" sx={{ mt: 2 }}>
              No comments yet. Be the first to comment!
            </Typography>
          )}
          {comments.map((comment) => (
            <ListItem
              alignItems="flex-start"
              key={comment.id}
              secondaryAction={
                comment.createdBy === currentUser.uid && (
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={async () => {
                      await deleteDoc(
                        doc(
                          db,
                          "bucketListItems",
                          itemId,
                          "comments",
                          comment.id
                        )
                      );
                    }}
                    size="small"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                )
              }
            >
              <ListItemText
                primary={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography>
                      {userMap[comment.createdBy]?.username || "Unknown"}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ color: (theme) => theme.palette.grey[500] }}
                    >
                      {comment.createdAt?.toDate
                        ? comment.createdAt.toDate().toLocaleString()
                        : ""}
                    </Typography>
                  </Box>
                }
                secondary={comment.text}
              />
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions
        sx={{ flexDirection: "column", alignItems: "stretch", gap: 1, p: 2 }}
      >
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleAddComment();
            }
          }}
        />
        <Button
          variant="contained"
          onClick={handleAddComment}
          disabled={!newComment.trim()}
          sx={{ mt: 1 }}
        >
          Post
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CommentSection;
