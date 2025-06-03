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
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import PersonIcon from "@mui/icons-material/Person";
import PeopleIcon from "@mui/icons-material/People";
import ImageIcon from "@mui/icons-material/Image";
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
  const { getComments, getUsersByIds } = useDatabase();

  // get latest 2 comments for this item
  useEffect(() => {
    if (!item.id) return;
    getComments(item.id).then(async (data) => {
      setComments(data.slice(-2));

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

  return (
    <Card
      sx={{
        display: "flex",
        flexDirection: "column",
        background: "#fff",
        height: "100%",
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
        <Button
          variant="outlined"
          size="small"
          onClick={handleOpenEditItemDialog}
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
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
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
              {item.date && (
                <Typography
                  variant="body2"
                  sx={{
                    mb: 1,
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    color: "primary.main",
                  }}
                >
                  <EventIcon sx={{ fontSize: 16 }} />
                  {new Date(item.date).toLocaleDateString(undefined, {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </Typography>
              )}
              <Typography
                variant="body2"
                sx={{ mb: 1, display: "flex", alignItems: "center", gap: 0.5 }}
              >
                <PersonIcon sx={{ fontSize: 16 }} />
                {creator?.username || "Unknown"}
              </Typography>
              <Typography
                variant="body2"
                sx={{ mb: 1, display: "flex", alignItems: "center", gap: 0.5 }}
              >
                <LocationOnIcon sx={{ fontSize: 16 }} />
                {item.location || "Unknown"}
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
                        cursor: "pointer",
                        "&:hover": { opacity: 0.8 },
                        wordBreak: "break-word",
                        lineHeight: 1.8,
                      }}
                      onClick={handleOpenAttendeesDialog}
                    >
                      <PeopleIcon sx={{ fontSize: 16, mb: "-2px", mr: 0.5 }} />
                      <Chip
                        label={upvArr[0].username}
                        size="small"
                        sx={{
                          backgroundColor: "background.default",
                          height: "20px",
                          verticalAlign: "middle",
                          mx: 0.5,
                          "& .MuiChip-label": {
                            px: 1,
                            fontSize: "0.875rem",
                            fontFamily: (theme) => theme.typography.body2.fontFamily,
                            lineHeight: "20px",
                            display: "flex",
                            alignItems: "center",
                          },
                        }}
                      />
                      {" is going"}
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
                        cursor: "pointer",
                        "&:hover": { opacity: 0.8 },
                        wordBreak: "break-word",
                        lineHeight: 1.8,
                      }}
                      onClick={handleOpenAttendeesDialog}
                    >
                      <PeopleIcon sx={{ fontSize: 16, mb: "-2px", mr: 0.5 }} />
                      <Chip
                        label={upvArr[0].username}
                        size="small"
                        sx={{
                          backgroundColor: "background.default",
                          height: "20px",
                          verticalAlign: "middle",
                          mx: 0.5,
                          "& .MuiChip-label": {
                            px: 1,
                            fontSize: "0.875rem",
                            fontFamily: (theme) => theme.typography.body2.fontFamily,
                            lineHeight: "20px",
                            display: "flex",
                            alignItems: "center",
                          },
                        }}
                      />
                      {" and "}
                      <Chip
                        label={upvArr[1].username}
                        size="small"
                        sx={{
                          backgroundColor: "background.default",
                          height: "20px",
                          verticalAlign: "middle",
                          mx: 0.5,
                          "& .MuiChip-label": {
                            px: 1,
                            fontSize: "0.875rem",
                            fontFamily: (theme) => theme.typography.body2.fontFamily,
                            lineHeight: "20px",
                            display: "flex",
                            alignItems: "center",
                          },
                        }}
                      />
                      {" are going"}
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
                        cursor: "pointer",
                        "&:hover": { opacity: 0.8 },
                        wordBreak: "break-word",
                        lineHeight: 1.8,
                      }}
                      onClick={handleOpenAttendeesDialog}
                    >
                      <PeopleIcon sx={{ fontSize: 16, mb: "-2px", mr: 0.5 }} />
                      <Chip
                        label={upvArr[0].username}
                        size="small"
                        sx={{
                          backgroundColor: "background.default",
                          height: "20px",
                          verticalAlign: "middle",
                          mx: 0.5,
                          "& .MuiChip-label": {
                            px: 1,
                            fontSize: "0.875rem",
                            fontFamily: (theme) => theme.typography.body2.fontFamily,
                            lineHeight: "20px",
                            display: "flex",
                            alignItems: "center",
                          },
                        }}
                      />
                      {` and ${upvotes.length - 1} other${
                        upvotes.length - 1 === 1 ? " person" : " people"
                      } are going`}
                    </Typography>
                  );
                }
                return null;
              })()}
            </Box>
          </Box>
        </Box>
        
        {/* Comments section moved here */}
        {comments.length > 0 && (
          <List sx={{ py: 0 }}>
            {comments.map((comment) => (
              <ListItem key={comment.id} sx={{ py: 0.5, pl: 0 }}>
                <Typography
                  variant="body2"
                  sx={{
                    width: "100%",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    display: "flex",
                    gap: 1,
                  }}
                >
                  <Box component="span" sx={{ fontWeight: 500, flexShrink: 0 }}>
                    {localCommentUsers?.[comment.created_by]?.username ||
                      "Unknown"}
                    :
                  </Box>
                  <Box component="span">{comment.content}</Box>
                </Typography>
              </ListItem>
            ))}
          </List>
        )}
        
        <Box sx={{ display: "flex", alignItems: "center", gap: 0, mt: 2 }}>
          <Button
            startIcon={
              item.upvotes?.includes(currentUser.id) ? (
                <span>✅</span>
              ) : (
                <span>❓</span>
              )
            }
            onClick={() =>
              item.upvotes?.includes(currentUser.id)
                ? onRemoveUpvote(item.id)
                : onUpvote(item.id)
            }
            sx={{
              color: item.upvotes?.includes(currentUser.id)
                ? "primary.main"
                : "text.primary",
              minWidth: 0,
              px: 0.5,
              mr: 0.5,
              "&:hover": {
                px: 1.5,
              },
            }}
          >
            {item.upvotes?.includes(currentUser.id) ? "Rallied" : "Rally"}
          </Button>
          <Button
            startIcon={<ChatBubbleOutlineIcon />}
            onClick={() => onOpenComments(item.id)}
            sx={{ color: "text.primary", minWidth: 0, px: 0.5 }}
          >
            {commentCount > 0 ? commentCount : ""}
          </Button>
        </Box>
      </CardContent>

      {/* Attendees Dialog */}
      <Dialog
        open={attendeesDialogOpen}
        onClose={handleCloseAttendeesDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ m: 0, p: 2 }}>
          <Typography variant="subtitle1">
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
        onClose={handleCloseEditItemDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ m: 0, p: 2 }}>
          <Typography variant="subtitle1">Edit Bucket List Item</Typography>
          <IconButton
            aria-label="close"
            onClick={handleCloseEditItemDialog}
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
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Location"
            value={editedItem?.location || ""}
            onChange={(e) =>
              setEditedItem({ ...editedItem, location: e.target.value })
            }
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
          {editedItem?.image_url && (
            <Box
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
            onClick={handleDeleteItem}
            color="error"
            startIcon={<DeleteIcon />}
          >
            Delete Item
          </Button>
          <Box>
            <Button onClick={handleCloseEditItemDialog} sx={{ mr: 1 }}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveItemEdit}
              variant="contained"
              disabled={!editedItem?.title?.trim()}
            >
              Save Changes
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default BucketListItem;
