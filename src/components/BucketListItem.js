import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import PeopleIcon from "@mui/icons-material/People";
import { useState, useEffect } from "react";
import { useDatabase } from "../contexts/DatabaseContext";
import BucketListItemDialogs from "./BucketListItemDialogs";

const BucketListItem = ({
  item,
  upvoters,
  currentUser,
  onEdit,
  onUpvote,
  onRemoveUpvote,
  onDelete,
  onImageUpload,
}) => {
  const [editItemDialogOpen, setEditItemDialogOpen] = useState(false);
  const [editedItem, setEditedItem] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [creator, setCreator] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const { getUsersByIds } = useDatabase();

  // Fetch creator's profile
  useEffect(() => {
    if (!item.created_by) return;
    getUsersByIds([item.created_by]).then((users) => {
      if (users && users.length > 0) {
        setCreator(users[0]);
      }
    });
  }, [item.created_by, getUsersByIds]);

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

  const handleOpenDetailDialog = () => {
    setDetailDialogOpen(true);
  };

  const handleCloseDetailDialog = () => {
    setDetailDialogOpen(false);
  };

  return (
    <>
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
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 1.5,
                  }}
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
                  sx={{
                    mb: 1,
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                  }}
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
                        <PeopleIcon
                          sx={{ fontSize: 16, mb: "-2px", mr: 0.5 }}
                        />
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
                        <PeopleIcon
                          sx={{ fontSize: 16, mb: "-2px", mr: 0.5 }}
                        />
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
                        <PeopleIcon
                          sx={{ fontSize: 16, mb: "-2px", mr: 0.5 }}
                        />
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
      </Card>
      {/* DIALOGS (abstracted) */}
      <BucketListItemDialogs
        item={item}
        currentUser={currentUser}
        upvoters={upvoters}
        creator={creator}
        editItemDialogOpen={editItemDialogOpen}
        detailDialogOpen={detailDialogOpen}
        editedItem={editedItem}
        onCloseEditDialog={handleCloseEditItemDialog}
        onCloseDetailDialog={handleCloseDetailDialog}
        onEditItem={setEditedItem}
        onSaveItemEdit={handleSaveItemEdit}
        onDeleteItem={handleDeleteItem}
        onImageChange={handleImageChange}
        onUpvote={onUpvote}
        onRemoveUpvote={onRemoveUpvote}
      />
    </>
  );
};

export default BucketListItem;
