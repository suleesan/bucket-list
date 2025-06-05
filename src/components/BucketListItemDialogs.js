import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  IconButton,
  MenuItem,
  Box,
  Typography,
  Chip,
  Stack,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import ImageIcon from "@mui/icons-material/Image";
import AssignmentIcon from "@mui/icons-material/Assignment";
import PersonIcon from "@mui/icons-material/Person";
import EventIcon from "@mui/icons-material/Event";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PeopleIcon from "@mui/icons-material/People";
import MessagesSection from "./MessagesSection";

const BucketListItemDialogs = ({
  item,
  currentUser,
  upvoters,
  creator,
  editItemDialogOpen,
  detailDialogOpen,
  attendeesDialogOpen,
  editedItem,
  onCloseEditDialog,
  onCloseDetailDialog,
  onCloseAttendeesDialog,
  onEditItem,
  onDeleteItem,
  onImageChange,
  onUpvote,
  onRemoveUpvote,
  onOpenComments,
  onSaveItemEdit,
}) => {
  return (
    <>
      {/* Edit Dialog */}
      <Dialog
        open={editItemDialogOpen}
        onClose={(event, reason) => {
          if (reason === "backdropClick") {
            event.stopPropagation();
          }
          onCloseEditDialog();
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
              onCloseEditDialog();
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
              onChange={onImageChange}
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
          <TextField
            fullWidth
            label="Title"
            value={editedItem?.title || ""}
            onChange={(e) =>
              onEditItem({ ...editedItem, title: e.target.value })
            }
            onClick={(e) => e.stopPropagation()}
            sx={{ mb: 2, mt: 2 }}
            slotProps={{
              htmlInput: {
                maxLength: 100,
                pattern: ".*",
                inputMode: "text",
              },
            }}
          />
          <TextField
            fullWidth
            label="Description"
            multiline
            rows={3}
            value={editedItem?.description || ""}
            onChange={(e) =>
              onEditItem({ ...editedItem, description: e.target.value })
            }
            onClick={(e) => e.stopPropagation()}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Location"
            value={editedItem?.location || ""}
            onChange={(e) =>
              onEditItem({ ...editedItem, location: e.target.value })
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
              onEditItem({ ...editedItem, date: e.target.value })
            }
            onClick={(e) => e.stopPropagation()}
            slotProps={{
              inputLabel: {
                shrink: true,
              },
            }}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Time"
            type="time"
            value={editedItem?.time || ""}
            onChange={(e) =>
              onEditItem({ ...editedItem, time: e.target.value })
            }
            onClick={(e) => e.stopPropagation()}
            slotProps={{
              inputLabel: {
                shrink: true,
              },
            }}
            sx={{ mb: 2 }}
          />

          <TextField
            select
            label="Status"
            value={editedItem?.status || "idea"}
            onChange={(e) =>
              onEditItem({ ...editedItem, status: e.target.value })
            }
            onClick={(e) => e.stopPropagation()}
            fullWidth
            sx={{ mb: 2 }}
          >
            <MenuItem value="idea">Idea</MenuItem>
            <MenuItem value="planning">Planning</MenuItem>
            <MenuItem value="done">Done</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "space-between", px: 2 }}>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onDeleteItem();
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
                onCloseEditDialog();
              }}
              sx={{ mr: 1 }}
            >
              Cancel
            </Button>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onSaveItemEdit();
              }}
              variant="contained"
              disabled={!editedItem?.title?.trim()}
            >
              Save Changes
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog
        open={detailDialogOpen}
        onClose={(event, reason) => {
          onCloseDetailDialog();
        }}
        maxWidth="md"
        fullWidth
        slotProps={{
          backdrop: {
            onClick: (e) => {
              e.stopPropagation();
            },
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
              onCloseDetailDialog();
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
            <MessagesSection
              itemId={item.id}
              currentUser={currentUser}
              onCommentCountChange={onOpenComments}
            />
          </Box>
        </DialogContent>
      </Dialog>

      {/* Attendees Dialog */}
      <Dialog
        open={attendeesDialogOpen}
        onClose={onCloseAttendeesDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ m: 0, p: 2 }}>
          <Typography variant="subtitle1" component="div">
            Attendees
          </Typography>
          <IconButton
            aria-label="close"
            onClick={onCloseAttendeesDialog}
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
    </>
  );
};

export default BucketListItemDialogs;
