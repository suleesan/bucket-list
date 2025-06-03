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
  const { getComments, addComment, deleteComment, getUsersByIds } =
    useDatabase();

  useEffect(() => {
    if (!itemId) return;
    let isMounted = true;
    getComments(itemId).then((commentData) => {
      if (!isMounted) return;
      setComments(commentData);
      onCommentCountChange(itemId, commentData.length);
      const uids = Array.from(
        new Set(commentData.map((c) => c.created_by).filter(Boolean))
      );
      if (uids.length > 0) {
        getUsersByIds(uids).then((users) => {
          const map = {};
          users.forEach((u) => (map[u.id] = u));
          setUserMap(map);
        });
      }
    });
    return () => {
      isMounted = false;
    };
  }, [itemId, getComments, getUsersByIds, onCommentCountChange]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    await addComment(itemId, newComment);
    setNewComment("");
    const commentData = await getComments(itemId);
    setComments(commentData);
    onCommentCountChange(itemId, commentData.length);
  };

  const handleDeleteComment = async (commentId) => {
    await deleteComment(commentId);
    const commentData = await getComments(itemId);
    setComments(commentData);
    onCommentCountChange(itemId, commentData.length);
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
            <Typography color="primary.main" align="center" sx={{ mt: 2 }}>
              No comments yet. Be the first to comment!
            </Typography>
          )}
          {comments.map((comment) => (
            <ListItem
              alignItems="flex-start"
              key={comment.id}
              secondaryAction={
                comment.created_by === currentUser.id && (
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={async () => handleDeleteComment(comment.id)}
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
                      {userMap[comment.created_by]?.username || "Unknown"}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "text.primary" }}>
                      {comment.created_at
                        ? new Date(comment.created_at).toLocaleString()
                        : ""}
                    </Typography>
                  </Box>
                }
                secondary={comment.content || comment.text}
                secondaryTypographyProps={{ sx: { color: "text.primary" } }}
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
