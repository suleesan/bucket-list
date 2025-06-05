import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  IconButton,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import ImageIcon from "@mui/icons-material/Image";

export const GroupDialogs = ({
  showJoinDialog,
  setShowJoinDialog,
  showCreateDialog,
  setShowCreateDialog,
  joinCode,
  setJoinCode,
  newGroupName,
  setNewGroupName,
  previewUrl,
  editDialogOpen,
  editingGroup,
  setEditingGroup,
  editPreviewUrl,
  deleteConfirmOpen,
  loading,
  handleImageChange,
  handleCreateGroup,
  handleJoinGroup,
  handleCloseEditDialog,
  handleSaveEdit,
  handleDeleteClick,
  handleDeleteConfirm,
  handleDeleteCancel,
}) => {
  return (
    <>
      {/* JOIN GROUP */}
      <Dialog open={showJoinDialog} onClose={() => setShowJoinDialog(false)}>
        <DialogTitle>Join a Group</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Group Code"
            type="text"
            fullWidth
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            placeholder="Enter 6-digit group code"
            slotProps={{ htmlInput: { maxLength: 6 } }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowJoinDialog(false)}>Cancel</Button>
          <Button
            onClick={handleJoinGroup}
            variant="contained"
            disabled={!joinCode.trim() || loading}
          >
            Join
          </Button>
        </DialogActions>
      </Dialog>

      {/* CREATE GROUP */}
      <Dialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
      >
        <DialogTitle>Create a New Group</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Group Name"
            type="text"
            fullWidth
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            disabled={loading}
            slotProps={{
              htmlInput: { maxLength: 50, pattern: ".*", inputMode: "text" },
            }}
            sx={{ mb: 2 }}
          />
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
              onChange={(e) => handleImageChange(e, false)}
            />
          </Button>
          {previewUrl && (
            <Box
              sx={{
                width: "100%",
                height: "200px",
                backgroundImage: `url(${previewUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                mb: 2,
                borderRadius: 1,
              }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCreateDialog(false)}>Cancel</Button>
          <Button
            onClick={handleCreateGroup}
            variant="contained"
            disabled={!newGroupName.trim() || loading}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* EDIT GROUP */}
      <Dialog
        open={editDialogOpen}
        onClose={handleCloseEditDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ m: 0, p: 2 }}>
          <Typography variant="subtitle1">Edit Group</Typography>
          <IconButton
            aria-label="close"
            onClick={handleCloseEditDialog}
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
            label="Group Name"
            value={editingGroup?.name || ""}
            onChange={(e) =>
              setEditingGroup({ ...editingGroup, name: e.target.value })
            }
            sx={{ mb: 2, mt: 2 }}
            slotProps={{
              htmlInput: { maxLength: 50, pattern: ".*", inputMode: "text" },
            }}
          />
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
              onChange={(e) => handleImageChange(e, true)}
            />
          </Button>
          {(editPreviewUrl || editingGroup?.image_url) && (
            <Box
              sx={{
                width: "100%",
                height: "200px",
                backgroundImage: `url(${
                  editPreviewUrl || editingGroup?.image_url
                })`,
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
            onClick={handleDeleteClick}
            color="error"
            startIcon={<DeleteIcon />}
            disabled={loading}
          >
            Delete Group
          </Button>
          <Box>
            <Button
              onClick={handleCloseEditDialog}
              sx={{ mr: 1 }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              variant="contained"
              disabled={!editingGroup?.name?.trim() || loading}
            >
              Save Changes
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteConfirmOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this group? This action cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={loading}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
