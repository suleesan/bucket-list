import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  MenuItem,
  List,
  ListItem,
  Stack,
} from "@mui/material";
import EventIcon from "@mui/icons-material/Event";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import PersonIcon from "@mui/icons-material/Person";
import PeopleIcon from "@mui/icons-material/People";
import ImageIcon from "@mui/icons-material/Image";
import AssignmentIcon from "@mui/icons-material/Assignment";
import { useState, useEffect } from "react";
import { useDatabase } from "../contexts/DatabaseContext";

const BucketListItem = ({
  item,
  creators,
  upvoters,
  commentUsers,
  currentUser,
  onEdit,
  onUpvote,
  onRemoveUpvote,
  onOpenComments,
  onDelete,
  commentCount,
  onImageUpload,
}) => {
  const [editItemDialogOpen, setEditItemDialogOpen] = useState(false);
  const [editedItem, setEditedItem] = useState(null);
  const [comments, setComments] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [localCommentUsers, setLocalCommentUsers] = useState({});
  const [creator, setCreator] = useState(null);
  const [attendeesDialogOpen, setAttendeesDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [currentUserProfile, setCurrentUserProfile] = useState(null);
  const { getComments, getUsersByIds, deleteComment, addComment } =
    useDatabase();

  // Fetch creator's profile
  useEffect(() => {
    if (!item.created_by) return;
    getUsersByIds([item.created_by]).then((users) => {
      if (users && users.length > 0) {
        setCreator(users[0]);
      }
    });
  }, [item.created_by, getUsersByIds]);

  // Fetch current user's profile
  useEffect(() => {
    if (!currentUser?.id) return;
    getUsersByIds([currentUser.id]).then((users) => {
      if (users && users.length > 0) {
        setCurrentUserProfile(users[0]);
      }
    });
  }, [currentUser?.id, getUsersByIds]);

  useEffect(() => {
    if (!item.id) return;
    getComments(item.id).then(async (data) => {
      setComments(data);

      const userIds = [...new Set(data.map((c) => c.created_by))];
      const users = await getUsersByIds(userIds);
      const userMap = {};
      users.forEach((user) => {
        userMap[user.id] = user;
      });
      setLocalCommentUsers(userMap);
    });
  }, [item.id, getComments, getUsersByIds]);

  const handleOpenEditItemDialog = () => {
    setEditedItem(item);
    setEditItemDialogOpen(true);
  };

  const handleCloseEditItemDialog = () => {
    setEditItemDialogOpen(false);
    setEditedItem(null);
    setImageFile(null);
  };

  const handleSaveItemEdit = async () => {
    let imageUrl = editedItem.image_url;
    if (imageFile) {
      imageUrl = await onImageUpload(item.id, imageFile);
    }
    onEdit(item.id, { ...editedItem, image_url: imageUrl });
    handleCloseEditItemDialog();
  };

  const handleDeleteItem = () => {
    onDelete(item.id);
    handleCloseEditItemDialog();
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setEditedItem((prev) => ({ ...prev, image_url: previewUrl }));
    }
  };

  const handleOpenAttendeesDialog = () => {
    setAttendeesDialogOpen(true);
  };

  const handleCloseAttendeesDialog = () => {
    setAttendeesDialogOpen(false);
  };

  const handleOpenDetailDialog = () => {
    setDetailDialogOpen(true);
  };

  const handleCloseDetailDialog = () => {
    setDetailDialogOpen(false);
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      await addComment(item.id, newComment);
      const updatedComments = await getComments(item.id);
      setComments(updatedComments);
      setNewComment("");

      // Update local comment users map
      const userIds = [...new Set(updatedComments.map((c) => c.created_by))];
      const users = await getUsersByIds(userIds);
      const userMap = {};
      users.forEach((user) => {
        userMap[user.id] = user;
      });
      setLocalCommentUsers(userMap);
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment(commentId);
      const updatedComments = await getComments(item.id);
      setComments(updatedComments);

      // Update comment users map
      const userIds = [...new Set(updatedComments.map((c) => c.created_by))];
      const users = await getUsersByIds(userIds);
      const userMap = {};
      users.forEach((user) => {
        userMap[user.id] = user;
      });
      setLocalCommentUsers(userMap);
    } catch (error) {
      console.error("Failed to delete comment:", error);
    }
  };

  return (
    <Card
      onClick={handleOpenDetailDialog}
      sx={{
        display: "flex",
        flexDirection: "column",
        background: "#fff",
        height: "100%",
        cursor: "pointer",
        "&:hover": {
          transform: "translateY(-4px)",
          transition: "transform 0.2s",
        },
      }}
    >
      <Box
        sx={{
          height: "200px",
          backgroundColor: "background.default",
          position: "relative",
          backgroundImage: item.image_url ? `url(${item.image_url})` : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {item.date && (
          <Chip
            label={
              new Date(item.date).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              }) +
              (item.time
                ? ` ${new Date(`2000-01-01T${item.time}`).toLocaleTimeString(
                    undefined,
                    {
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    }
                  )}`
                : "")
            }
            size="small"
            sx={{
              position: "absolute",
              top: 8,
              left: 8,
              backgroundColor: "rgba(255, 255, 255, 0.7)",
              "& .MuiChip-label": {
                px: 1,
                fontSize: "0.875rem",
                fontFamily: (theme) => theme.typography.body2.fontFamily,
                display: "flex",
                alignItems: "center",
              },
            }}
          />
        )}
        {currentUser && item.created_by === currentUser.id && (
          <Button
            variant="outlined"
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenEditItemDialog();
            }}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              borderColor: "text.primary",
              color: "text.primary",
              backgroundColor: "rgba(255, 255, 255, 0.5)",
              opacity: 0,
              transition: "opacity 0.2s",
              "&:hover": {
                borderColor: "text.primary",
                color: "text.primary",
                backgroundColor: "rgba(255, 255, 255, 0.7)",
              },
              ".MuiCard-root:hover &": {
                opacity: 1,
              },
            }}
          >
            Edit
          </Button>
        )}
        {currentUser && item.upvotes?.includes(currentUser.id) && (
          <Chip
            label="Rallied"
            size="small"
            sx={{
              position: "absolute",
              bottom: 8,
              right: 8,
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              color: "primary.main",
              fontWeight: 600,
              "& .MuiChip-label": {
                px: 1,
                fontSize: "0.75rem",
                fontFamily: (theme) => theme.typography.body2.fontFamily,
              },
            }}
          />
        )}
      </Box>
      <CardContent
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
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
            <Box>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}
              >
                <Typography variant="subtitle1">{item.title}</Typography>
                <Chip
                  label={
                    <Typography variant="body2">
                      {typeof item.status === "string"
                        ? item.status.charAt(0).toUpperCase() +
                          item.status.slice(1)
                        : "Idea"}
                    </Typography>
                  }
                  size="small"
                  sx={{
                    backgroundColor: (theme) =>
                      item.status === "done"
                        ? theme.palette.status.done
                        : item.status === "planning"
                        ? theme.palette.status.planning
                        : theme.palette.status.idea,
                    color: "text.primary",
                    fontWeight: 500,
                  }}
                />
              </Box>
              <Typography
                variant="body2"
                sx={{ mb: 1, display: "flex", alignItems: "center", gap: 0.5 }}
              >
                <PersonIcon sx={{ fontSize: 16 }} />
                Added by{" "}
                {currentUser && item.created_by === currentUser.id
                  ? "me"
                  : creator?.username || "Unknown"}
              </Typography>
              {(() => {
                const upvotes = item.upvotes;
                const upvArr = upvoters[item.id] || [];
                if (
                  upvotes?.length === 1 &&
                  upvArr.length === 1 &&
                  upvArr[0]?.id === upvotes[0] &&
                  upvArr[0]?.username
                ) {
                  return (
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 1,
                        display: "block",
                        alignItems: "center",
                        wordBreak: "break-word",
                        lineHeight: 1.8,
                      }}
                    >
                      <PeopleIcon sx={{ fontSize: 16, mb: "-2px", mr: 0.5 }} />
                      {upvArr[0].username} is going
                    </Typography>
                  );
                }
                if (
                  upvotes?.length === 2 &&
                  upvArr.length === 2 &&
                  upvArr[0]?.username &&
                  upvArr[1]?.username
                ) {
                  return (
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 1,
                        display: "block",
                        alignItems: "center",
                        wordBreak: "break-word",
                        lineHeight: 1.8,
                      }}
                    >
                      <PeopleIcon sx={{ fontSize: 16, mb: "-2px", mr: 0.5 }} />
                      {upvArr[0].username} and {upvArr[1].username} are going
                    </Typography>
                  );
                }
                if (upvotes?.length > 2 && upvArr[0]?.username) {
                  return (
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 1,
                        display: "block",
                        alignItems: "center",
                        wordBreak: "break-word",
                        lineHeight: 1.8,
                      }}
                    >
                      <PeopleIcon sx={{ fontSize: 16, mb: "-2px", mr: 0.5 }} />
                      {upvArr[0].username} and {upvotes.length - 1} other
                      {upvotes.length - 1 === 1 ? " person" : " people"} are
                      going
                    </Typography>
                  );
                }
                return null;
              })()}
            </Box>
          </Box>
        </Box>
      </CardContent>
      <Dialog
        open={attendeesDialogOpen}
        onClose={handleCloseAttendeesDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ m: 0, p: 2 }}>
          <Typography variant="subtitle1" component="div">
            Attendees
          </Typography>
          <IconButton
            aria-label="close"
            onClick={handleCloseAttendeesDialog}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
            }}
            size="large"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {upvoters[item.id]?.map((user) => (
              <Chip
                key={user.id}
                label={user.username}
                sx={{
                  backgroundColor: "background.default",
                  "& .MuiChip-label": {
                    px: 1,
                    fontSize: "0.875rem",
                    fontFamily: (theme) => theme.typography.body2.fontFamily,
                  },
                }}
              />
            ))}
          </Stack>
        </DialogContent>
      </Dialog>

      <Dialog
        open={editItemDialogOpen}
        onClose={(event, reason) => {
          if (reason === "backdropClick") {
            event.stopPropagation();
          }
          handleCloseEditItemDialog();
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ m: 0, p: 2 }}>
          <Typography variant="subtitle1" component="div">
            Edit Bucket List Item
          </Typography>
          <IconButton
            aria-label="close"
            onClick={(e) => {
              e.stopPropagation();
              handleCloseEditItemDialog();
            }}
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
            label="Title"
            value={editedItem?.title || ""}
            onChange={(e) =>
              setEditedItem({ ...editedItem, title: e.target.value })
            }
            onClick={(e) => e.stopPropagation()}
            sx={{ mb: 2, mt: 2 }}
            inputProps={{
              maxLength: 100,
              pattern: ".*",
              inputMode: "text",
            }}
          />
          <TextField
            fullWidth
            label="Description"
            multiline
            rows={3}
            value={editedItem?.description || ""}
            onChange={(e) =>
              setEditedItem({ ...editedItem, description: e.target.value })
            }
            onClick={(e) => e.stopPropagation()}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Location"
            value={editedItem?.location || ""}
            onChange={(e) =>
              setEditedItem({ ...editedItem, location: e.target.value })
            }
            onClick={(e) => e.stopPropagation()}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Date"
            type="date"
            value={editedItem?.date || ""}
            onChange={(e) =>
              setEditedItem({ ...editedItem, date: e.target.value })
            }
            onClick={(e) => e.stopPropagation()}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Time"
            type="time"
            value={editedItem?.time || ""}
            onChange={(e) =>
              setEditedItem({ ...editedItem, time: e.target.value })
            }
            onClick={(e) => e.stopPropagation()}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
          />

          <TextField
            select
            label="Status"
            value={editedItem?.status || "idea"}
            onChange={(e) =>
              setEditedItem({ ...editedItem, status: e.target.value })
            }
            onClick={(e) => e.stopPropagation()}
            fullWidth
            sx={{ mb: 2 }}
          >
            <MenuItem value="idea">Idea</MenuItem>
            <MenuItem value="planning">Planning</MenuItem>
            <MenuItem value="done">Done</MenuItem>
          </TextField>

          <Button
            component="label"
            variant="outlined"
            startIcon={<ImageIcon />}
            fullWidth
            onClick={(e) => e.stopPropagation()}
            sx={{ mb: 2 }}
          >
            Upload Image
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={handleImageChange}
              onClick={(e) => e.stopPropagation()}
            />
          </Button>
          {editedItem?.image_url && (
            <Box
              onClick={(e) => e.stopPropagation()}
              sx={{
                width: "100%",
                height: "200px",
                backgroundImage: `url(${editedItem.image_url})`,
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
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteItem();
            }}
            color="error"
            startIcon={<DeleteIcon />}
          >
            Delete Item
          </Button>
          <Box>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                handleCloseEditItemDialog();
              }}
              sx={{ mr: 1 }}
            >
              Cancel
            </Button>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                handleSaveItemEdit();
              }}
              variant="contained"
              disabled={!editedItem?.title?.trim()}
            >
              Save Changes
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      <Dialog
        open={detailDialogOpen}
        onClose={(event, reason) => {
          handleCloseDetailDialog();
        }}
        maxWidth="md"
        fullWidth
        BackdropProps={{
          onClick: (e) => {
            e.stopPropagation();
          },
        }}
      >
        <DialogTitle sx={{ m: 0, p: 2 }}>
          <Typography variant="subtitle1" component="div">
            {item.title}
          </Typography>
          <IconButton
            aria-label="close"
            onClick={(e) => {
              e.stopPropagation();
              handleCloseDetailDialog();
            }}
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
          <Box sx={{ mb: 3 }}>
            {item.image_url && (
              <Box
                sx={{
                  width: "100%",
                  height: "300px",
                  backgroundImage: `url(${item.image_url})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  borderRadius: 1,
                  mb: 3,
                }}
              />
            )}

            {/* Rally Button */}
            <Box sx={{ mb: 3 }}>
              <Button
                startIcon={
                  currentUser && item.upvotes?.includes(currentUser.id) ? (
                    <span>✅</span>
                  ) : (
                    <span>❓</span>
                  )
                }
                onClick={(e) => {
                  e.stopPropagation();
                  if (!currentUser) return;
                  item.upvotes?.includes(currentUser.id)
                    ? onRemoveUpvote(item.id)
                    : onUpvote(item.id);
                }}
                variant="outlined"
                sx={{
                  color:
                    currentUser && item.upvotes?.includes(currentUser.id)
                      ? "primary.main"
                      : "text.primary",
                  borderColor:
                    currentUser && item.upvotes?.includes(currentUser.id)
                      ? "primary.main"
                      : "text.primary",
                  "&:hover": {
                    backgroundColor:
                      currentUser && item.upvotes?.includes(currentUser.id)
                        ? "rgba(0, 0, 0, 0.04)"
                        : "rgba(0, 0, 0, 0.04)",
                  },
                }}
              >
                {currentUser && item.upvotes?.includes(currentUser.id)
                  ? "Rallied"
                  : "Rally"}
              </Button>
            </Box>

            <Box sx={{ mb: 4 }}>
              {/* Status */}
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    minWidth: "120px",
                    color: "text.secondary",
                    gap: 0.5,
                  }}
                >
                  <AssignmentIcon sx={{ fontSize: 16 }} />
                  <Typography variant="body2">Status</Typography>
                </Box>
                <Chip
                  label={
                    <Typography variant="body2">
                      {typeof item.status === "string"
                        ? item.status.charAt(0).toUpperCase() +
                          item.status.slice(1)
                        : "Idea"}
                    </Typography>
                  }
                  size="small"
                  sx={{
                    backgroundColor: (theme) =>
                      item.status === "done"
                        ? theme.palette.status.done
                        : item.status === "planning"
                        ? theme.palette.status.planning
                        : theme.palette.status.idea,
                    color: "text.primary",
                    fontWeight: 500,
                  }}
                />
              </Box>

              {/* Host */}
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    minWidth: "120px",
                    color: "text.secondary",
                    gap: 0.5,
                  }}
                >
                  <PersonIcon sx={{ fontSize: 16 }} />
                  <Typography variant="body2">Host</Typography>
                </Box>
                <Typography variant="body2">
                  {currentUser && item.created_by === currentUser.id
                    ? "You"
                    : creator?.username || "Unknown"}
                </Typography>
              </Box>

              {/* Date */}
              {item.date && (
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      minWidth: "120px",
                      color: "text.secondary",
                      gap: 0.5,
                    }}
                  >
                    <EventIcon sx={{ fontSize: 16 }} />
                    <Typography variant="body2">Date & Time</Typography>
                  </Box>
                  <Typography variant="body2">
                    {new Date(item.date).toLocaleDateString(undefined, {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                    {item.time &&
                      ` at ${new Date(
                        `2000-01-01T${item.time}`
                      ).toLocaleTimeString(undefined, {
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      })}`}
                  </Typography>
                </Box>
              )}

              {/* Location */}
              {item.location && (
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      minWidth: "120px",
                      color: "text.secondary",
                      gap: 0.5,
                    }}
                  >
                    <LocationOnIcon sx={{ fontSize: 16 }} />
                    <Typography variant="body2">Location</Typography>
                  </Box>
                  <Typography variant="body2">{item.location}</Typography>
                </Box>
              )}

              {/* Attendees */}
              {upvoters[item.id] && upvoters[item.id].length > 0 && (
                <Box sx={{ display: "flex", alignItems: "flex-start", mb: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      minWidth: "120px",
                      color: "text.secondary",
                      gap: 0.5,
                    }}
                  >
                    <PeopleIcon sx={{ fontSize: 16 }} />
                    <Typography variant="body2">Going</Typography>
                  </Box>
                  <Box>
                    {upvoters[item.id].map((user, index) => (
                      <Typography
                        key={user.id}
                        variant="body2"
                        component="span"
                      >
                        {user.username}
                        {index < upvoters[item.id].length - 1 && ", "}
                      </Typography>
                    ))}
                  </Box>
                </Box>
              )}
            </Box>

            {/* Description */}
            {item.description && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Description
                </Typography>
                <Typography variant="body1">{item.description}</Typography>
              </Box>
            )}

            {/* Comments */}
            <Box>
              <Typography
                variant="subtitle2"
                sx={{ mb: 2, color: "text.secondary" }}
              >
                Comments
              </Typography>

              {comments.length > 0 && (
                <Box sx={{ maxHeight: "300px", overflowY: "auto", mb: 2 }}>
                  {comments.map((comment) => (
                    <Box key={comment.id} sx={{ display: "flex", mb: 2 }}>
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          borderRadius: "50%",
                          backgroundColor: "primary.main",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          mr: 1.5,
                          flexShrink: 0,
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{ color: "white", fontWeight: "bold" }}
                        >
                          {currentUser && comment.created_by === currentUser.id
                            ? currentUserProfile?.username
                                ?.charAt(0)
                                .toUpperCase() || "Y"
                            : localCommentUsers?.[comment.created_by]?.username
                                ?.charAt(0)
                                .toUpperCase() || "U"}
                        </Typography>
                      </Box>
                      <Box sx={{ flexGrow: 1 }}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mb: 0.5,
                          }}
                        >
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {currentUser &&
                            comment.created_by === currentUser.id
                              ? "You"
                              : localCommentUsers?.[comment.created_by]
                                  ?.username || "Unknown"}
                          </Typography>
                          <Typography variant="body3" color="text.secondary">
                            {new Date(comment.created_at).toLocaleDateString(
                              undefined,
                              {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </Typography>
                          {currentUser &&
                            comment.created_by === currentUser.id && (
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteComment(comment.id);
                                }}
                                sx={{
                                  ml: "auto",
                                  opacity: 0,
                                  transition: "opacity 0.2s",
                                  ".MuiBox-root:hover &": {
                                    opacity: 1,
                                  },
                                  color: "text.secondary",
                                  "&:hover": {
                                    color: "error.main",
                                  },
                                }}
                              >
                                <DeleteIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                            )}
                        </Box>
                        <Typography variant="body2">
                          {comment.content}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}

              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    backgroundColor: "primary.main",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mr: 1.5,
                    flexShrink: 0,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{ color: "white", fontWeight: "bold" }}
                  >
                    {currentUserProfile?.username?.charAt(0).toUpperCase() ||
                      "Y"}
                  </Typography>
                </Box>
                <TextField
                  fullWidth
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleAddComment();
                    }
                  }}
                  variant="outlined"
                  size="small"
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
              </Box>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default BucketListItem;
