import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from "@mui/material";

const SuggestDateDialog = ({ open, value, onChange, onClose, onSubmit }) => (
  <Dialog open={open} onClose={onClose}>
    <DialogTitle>Suggest a Date</DialogTitle>
    <DialogContent>
      <TextField
        autoFocus
        margin="dense"
        label="Date"
        type="date"
        fullWidth
        value={value}
        onChange={(e) => onChange(e.target.value)}
        InputLabelProps={{ shrink: true }}
      />
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Cancel</Button>
      <Button onClick={onSubmit} variant="contained" disabled={!value}>
        Suggest
      </Button>
    </DialogActions>
  </Dialog>
);

export default SuggestDateDialog;
