import { useState, useEffect } from "react";
import {
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Typography,
  Box,
  IconButton,
} from "@mui/material";
import { useDatabase } from "../contexts/DatabaseContext";
import DeleteIcon from "@mui/icons-material/Delete";

const MessagesSection = ({ itemId, currentUser, maxHeight, itemCreatorId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [userMap, setUserMap] = useState({});
  const [commentCount, setCommentCount] = useState(0);
  const {
    getComments,
    addComment,
    deleteComment,
    getUsersByIds,
    getCommentCount,
  } = useDatabase();

  // fetch messages, message count, and users
  useEffect(() => {
    if (!itemId) return;
    let isMounted = true;
    getComments(itemId).then((commentData) => {
      if (!isMounted) return;
      setComments(commentData);

      // fetch each message's user
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
    getCommentCount(itemId).then((count) => {
      if (!isMounted) return;
      setCommentCount(count);
    });
    return () => {
      isMounted = false;
    };
  }, [itemId, getComments, getUsersByIds, getCommentCount]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    await addComment(itemId, newComment);
    setNewComment("");
    const commentData = await getComments(itemId);
    setComments(commentData);
    const count = await getCommentCount(itemId);
    setCommentCount(count);
  };

  const canDeleteComment = (comment) => {
    return (
      currentUser &&
      (comment.created_by === currentUser.id ||
        itemCreatorId === currentUser.id)
    );
  };

  const handleDeleteComment = async (commentId) => {
    await deleteComment(commentId);
    const commentData = await getComments(itemId);
    setComments(commentData);
    const count = await getCommentCount(itemId);
    setCommentCount(count);
  };

  return (
    <Box>
      <Typography variant="subtitle2" sx={{ mb: 2, color: "text.secondary" }}>
        Messages {commentCount > 0 && `(${commentCount})`}
      </Typography>
      <List sx={{ maxHeight: maxHeight || "300px", overflowY: "auto", mb: 2 }}>
        {comments.length === 0 && (
          <Typography color="text.secondary" align="center" sx={{ mt: 2 }}>
            No messages yet. Be the first to message!
          </Typography>
        )}
        {comments.map((comment) => (
          <ListItem
            alignItems="flex-start"
            key={comment.id}
            secondaryAction={
              canDeleteComment(comment) && (
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
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {userMap[comment.created_by]?.username || "Unknown"}
                  </Typography>
                  <Typography variant="body3" color="text.secondary">
                    {comment.created_at
                      ? new Date(comment.created_at).toLocaleDateString(
                          undefined,
                          {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )
                      : ""}
                  </Typography>
                </Box>
              }
              secondary={comment.content || comment.text}
              slotProps={{ secondary: { sx: { color: "text.primary" } } }}
            />
          </ListItem>
        ))}
      </List>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <TextField
          fullWidth
          variant="outlined"
          size="small"
          placeholder="Add a message..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleAddComment();
            }
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 1,
              "& fieldset": {
                borderColor: "transparent",
              },
              "&:hover fieldset": {
                borderColor: "rgba(0, 0, 0, 0.23)",
              },
              "&.Mui-focused fieldset": {
                borderColor: "primary.main",
              },
            },
          }}
        />
        <Button
          variant="contained"
          onClick={handleAddComment}
          disabled={!newComment.trim()}
          size="small"
        >
          Send
        </Button>
      </Box>
    </Box>
  );
};

export default MessagesSection;
