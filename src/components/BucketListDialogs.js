import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  MenuItem,
} from "@mui/material";
import ImageIcon from "@mui/icons-material/Image";

const BucketListDialogs = ({
  openDialog,
  editDialog,
  newItem,
  editingItem,
  loading,
  previewUrl,
  onCloseDialog,
  onCloseEditDialog,
  onAddItem,
  onEditItem,
  onImageChange,
  setNewItem,
  setEditingItem,
  setImageFile,
  setPreviewUrl,
}) => {
  return (
    <>
      <Dialog
        open={openDialog}
        onClose={() => onCloseDialog()}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ pt: 3 }}>
          <Typography variant="subtitle1" component="div" fontWeight="bold">
            Add New Bucket List Item
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Title"
              value={newItem.title}
              onChange={(e) =>
                setNewItem({ ...newItem, title: e.target.value })
              }
              disabled={loading}
              sx={{ mb: 2 }}
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
              value={newItem.description}
              onChange={(e) =>
                setNewItem({ ...newItem, description: e.target.value })
              }
              disabled={loading}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Location"
              value={newItem.location}
              onChange={(e) =>
                setNewItem({ ...newItem, location: e.target.value })
              }
              disabled={loading}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Date"
              type="date"
              value={newItem.date}
              onChange={(e) => setNewItem({ ...newItem, date: e.target.value })}
              disabled={loading}
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Time"
              type="time"
              value={newItem.time}
              onChange={(e) => setNewItem({ ...newItem, time: e.target.value })}
              disabled={loading}
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2 }}
            />
            <TextField
              select
              label="Status"
              value={newItem.status}
              onChange={(e) =>
                setNewItem({ ...newItem, status: e.target.value })
              }
              fullWidth
              sx={{ mt: 2 }}
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
              sx={{ mt: 2, mb: 2 }}
            >
              Upload Image
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={onImageChange}
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
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              onCloseDialog();
              setImageFile(null);
              setPreviewUrl(null);
            }}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={onAddItem}
            variant="contained"
            disabled={loading || !newItem.title.trim()}
            sx={{
              bgcolor: "primary.main",
              "&:hover": { bgcolor: "primary.dark" },
            }}
          >
            Add Item
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={editDialog}
        onClose={() => onCloseEditDialog()}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ color: "black" }}>
          <Typography variant="subtitle1" component="div" fontWeight="bold">
            Edit Bucket List Item
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Title"
              value={editingItem?.title || ""}
              onChange={(e) =>
                setEditingItem({ ...editingItem, title: e.target.value })
              }
              disabled={loading}
              sx={{ mb: 2 }}
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
              value={editingItem?.description || ""}
              onChange={(e) =>
                setEditingItem({ ...editingItem, description: e.target.value })
              }
              disabled={loading}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Location"
              value={editingItem?.location || ""}
              onChange={(e) =>
                setEditingItem({ ...editingItem, location: e.target.value })
              }
              disabled={loading}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Date"
              type="date"
              value={editingItem?.date || ""}
              onChange={(e) =>
                setEditingItem({ ...editingItem, date: e.target.value })
              }
              disabled={loading}
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => onCloseEditDialog()} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={() => onEditItem(editingItem)}
            variant="contained"
            disabled={loading || !editingItem?.title.trim()}
            sx={{
              bgcolor: "primary.main",
              "&:hover": { bgcolor: "primary.dark" },
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default BucketListDialogs;
