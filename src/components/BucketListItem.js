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
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import PersonIcon from "@mui/icons-material/Person";
import EditDateSuggestionDialog from "./EditDateSuggestionDialog";
import { useState } from "react";

const BucketListItem = ({
  item,
  creators,
  upvoters,
  dateSuggestionUsers,
  currentUser,
  onEdit,
  onUpvote,
  onRemoveUpvote,
  openSuggestDateDialog,
  handleVoteForDate,
  onOpenComments,
  handleDeleteDateSuggestion,
  handleEditDateSuggestion,
  onDelete,
  commentCount,
}) => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingSuggestionIndex, setEditingSuggestionIndex] = useState(null);
  const [editItemDialogOpen, setEditItemDialogOpen] = useState(false);
  const [editedItem, setEditedItem] = useState(null);

  // ensure date is in MM-DD-YYYY format
  const formatDateForDisplay = (dateStr) => {
    try {
      const date = new Date(dateStr);
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const year = date.getFullYear();
      return `${month}-${day}-${year}`;
    } catch (error) {
      return dateStr;
    }
  };

  // for firebase reasons,
  const formatDateForInput = (dateStr) => {
    try {
      const [month, day, year] = dateStr.split("-");
      return `${year}-${month}-${day}`;
    } catch (error) {
      return dateStr;
    }
  };

  const handleOpenEditDialog = (index, e) => {
    e.stopPropagation();
    setEditingSuggestionIndex(index);
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setEditingSuggestionIndex(null);
  };

  const handleSaveEdit = (newDate) => {
    const formattedDate = formatDateForDisplay(newDate);
    handleEditDateSuggestion(item.id, editingSuggestionIndex, formattedDate);
    handleCloseEditDialog();
  };

  const handleDeleteSuggestion = () => {
    handleDeleteDateSuggestion(item.id, editingSuggestionIndex);
    handleCloseEditDialog();
  };

  const handleOpenEditItemDialog = () => {
    setEditedItem(item);
    setEditItemDialogOpen(true);
  };

  const handleCloseEditItemDialog = () => {
    setEditItemDialogOpen(false);
    setEditedItem(null);
  };

  const handleSaveItemEdit = () => {
    onEdit(item.id, editedItem);
    handleCloseEditItemDialog();
  };

  const handleDeleteItem = () => {
    onDelete(item.id);
    handleCloseEditItemDialog();
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
          backgroundColor: "#A0CBCF",
          position: "relative",
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
              <Typography
                variant="h5"
                component="h2"
                sx={{ color: "primary.main", fontWeight: "bold" }}
              >
                {item.title}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <PersonIcon sx={{ fontSize: 16 }} />
                {creators[item.id]?.username || "Unknown"}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <LocationOnIcon sx={{ fontSize: 16 }} />
                {item.location || "Unknown"}
              </Typography>
            </Box>
          </Box>

          {/* <Typography color="text.secondary" paragraph>
            {item.description}
          </Typography> */}
          {/* {item.dateSuggestions?.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Date Suggestions:
              </Typography>
              {item.dateSuggestions.map((suggestion, index) => (
                <Chip
                  key={index}
                  label={
                    <>
                      {formatDateForDisplay(suggestion.date)}
                      {suggestion.suggestedBy &&
                      dateSuggestionUsers[suggestion.suggestedBy]?.username
                        ? ` • ${
                            dateSuggestionUsers[suggestion.suggestedBy].username
                          }`
                        : ""}
                    </>
                  }
                  onClick={() => currentUser && handleVoteForDate(index)}
                  sx={{ mr: 1, mb: 1 }}
                  deleteIcon={
                    suggestion.suggestedBy === currentUser?.uid ? (
                      <EditIcon
                        onClick={(e) => handleOpenEditDialog(index, e)}
                        sx={{ cursor: "pointer" }}
                      />
                    ) : undefined
                  }
                  onDelete={
                    suggestion.suggestedBy === currentUser?.uid
                      ? (e) => handleOpenEditDialog(index, e)
                      : undefined
                  }
                />
              ))}
            </Box>
          )} */}
        </Box>
        <Button
          variant="outlined"
          fullWidth
          onClick={() => openSuggestDateDialog(item.id)}
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
        <Box>
          <Button
            startIcon={
              item.upvotes?.includes(currentUser.uid) ? (
                <FavoriteIcon sx={{ color: "primary.main" }} />
              ) : (
                <FavoriteBorderIcon sx={{ color: "black" }} />
              )
            }
            onClick={async () => {
              if (item.upvotes?.includes(currentUser.uid)) {
                await onRemoveUpvote(item.id, currentUser.uid);
              } else {
                await onUpvote(item.id, currentUser.uid);
              }
            }}
            sx={{ color: "black" }}
          >
            {item.upvotes?.length || 0}
          </Button>
          {upvoters[item.id]?.map((user) => (
            <Typography key={user.id} variant="caption" sx={{ mr: 1 }}>
              {user.username}
            </Typography>
          ))}
        </Box>
        <Button
          startIcon={<ChatBubbleOutlineIcon />}
          onClick={() => onOpenComments(item.id)}
        >
          Comment {commentCount > 0 && `(${commentCount})`}
        </Button>
      </CardContent>
      <EditDateSuggestionDialog
        open={editDialogOpen}
        onClose={handleCloseEditDialog}
        currentDate={
          editingSuggestionIndex !== null
            ? formatDateForInput(
                item.dateSuggestions[editingSuggestionIndex].date
              )
            : ""
        }
        onSave={handleSaveEdit}
        onDelete={handleDeleteSuggestion}
      />
      <Dialog
        open={editItemDialogOpen}
        onClose={handleCloseEditItemDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ m: 0, p: 2 }}>
          Edit Bucket List Item
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
          />
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
