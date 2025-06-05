import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDatabase } from "../contexts/DatabaseContext";
import { GroupDialogs } from "../components/GroupDialogs";

export const useGroupDialogs = () => {
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [newGroupName, setNewGroupName] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [editImageFile, setEditImageFile] = useState(null);
  const [editPreviewUrl, setEditPreviewUrl] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const {
    createGroup,
    joinGroupByCode,
    updateGroup,
    deleteGroup,
    uploadImage,
  } = useDatabase();

  const handleImageChange = (event, isEdit = false) => {
    const file = event.target.files[0];
    if (file) {
      if (isEdit) {
        setEditImageFile(file);
        const previewUrl = URL.createObjectURL(file);
        setEditPreviewUrl(previewUrl);
        setEditingGroup((prev) => ({ ...prev, image_url: previewUrl }));
      } else {
        setImageFile(file);
        const previewUrl = URL.createObjectURL(file);
        setPreviewUrl(previewUrl);
      }
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;
    setLoading(true);
    setError("");

    try {
      let imageUrl = null;
      if (imageFile) {
        try {
          imageUrl = await uploadImage(
            imageFile,
            `groups/${Date.now()}_${imageFile.name}`
          );
        } catch (uploadError) {
          console.error("Image upload failed for new group:", {
            error: uploadError,
            message: uploadError.message,
            details: uploadError.details,
            hint: uploadError.hint,
            code: uploadError.code,
          });
          throw uploadError;
        }
      }

      const groupId = await createGroup(newGroupName, imageUrl);

      setNewGroupName("");
      setImageFile(null);
      setPreviewUrl(null);
      setShowCreateDialog(false);
      navigate(`/bucket-list/${groupId}`);
    } catch (error) {
      console.error("Failed to create group:", {
        error: error,
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      setError("Failed to create group");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async () => {
    if (!joinCode.trim()) return;

    setLoading(true);
    setError("");

    try {
      const groupId = await joinGroupByCode(joinCode.toUpperCase());
      setShowJoinDialog(false);
      setJoinCode("");
      navigate(`/bucket-list/${groupId}`);
    } catch (error) {
      setError("Invalid group code or failed to join group");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEditDialog = (group) => {
    setEditingGroup(group);
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    if (editPreviewUrl) {
      URL.revokeObjectURL(editPreviewUrl);
    }
    setEditDialogOpen(false);
    setEditingGroup(null);
    setEditImageFile(null);
    setEditPreviewUrl(null);
  };

  const handleSaveEdit = async () => {
    setLoading(true);
    setError("");
    try {
      let imageUrl = editingGroup.image_url;
      if (editImageFile) {
        try {
          imageUrl = await uploadImage(
            editImageFile,
            `groups/${editingGroup.id}_${Date.now()}_${editImageFile.name}`
          );
        } catch (uploadError) {
          console.error("Image upload failed for group edit:", {
            error: uploadError,
            message: uploadError.message,
            details: uploadError.details,
            hint: uploadError.hint,
            code: uploadError.code,
          });
          throw uploadError;
        }
      }

      await updateGroup(editingGroup.id, {
        ...editingGroup,
        image_url: imageUrl,
      });

      setEditDialogOpen(false);
      setEditingGroup(null);
      setEditImageFile(null);
      setEditPreviewUrl(null);

      return true;
    } catch (error) {
      console.error("Failed to update group:", {
        error: error,
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      setError("Failed to update group");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = () => {
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!editingGroup) return;

    setLoading(true);
    setError("");
    setDeleteConfirmOpen(false);

    try {
      await deleteGroup(editingGroup.id);
      handleCloseEditDialog();
      return true;
    } catch (error) {
      console.error("Error deleting group:", error);
      setError(error.message || "Failed to delete group. Please try again.");
      setDeleteConfirmOpen(true);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
  };

  const dialogs = (
    <GroupDialogs
      showJoinDialog={showJoinDialog}
      setShowJoinDialog={setShowJoinDialog}
      showCreateDialog={showCreateDialog}
      setShowCreateDialog={setShowCreateDialog}
      joinCode={joinCode}
      setJoinCode={setJoinCode}
      newGroupName={newGroupName}
      setNewGroupName={setNewGroupName}
      previewUrl={previewUrl}
      editDialogOpen={editDialogOpen}
      editingGroup={editingGroup}
      setEditingGroup={setEditingGroup}
      editPreviewUrl={editPreviewUrl}
      deleteConfirmOpen={deleteConfirmOpen}
      loading={loading}
      handleImageChange={handleImageChange}
      handleCreateGroup={handleCreateGroup}
      handleJoinGroup={handleJoinGroup}
      handleCloseEditDialog={handleCloseEditDialog}
      handleSaveEdit={handleSaveEdit}
      handleDeleteClick={handleDeleteClick}
      handleDeleteConfirm={handleDeleteConfirm}
      handleDeleteCancel={handleDeleteCancel}
    />
  );

  return {
    showJoinDialog,
    setShowJoinDialog,
    showCreateDialog,
    setShowCreateDialog,
    joinCode,
    setJoinCode,
    newGroupName,
    setNewGroupName,
    imageFile,
    previewUrl,
    editDialogOpen,
    editingGroup,
    setEditingGroup,
    editPreviewUrl,
    deleteConfirmOpen,
    loading,
    setLoading,
    error,
    setError,
    handleImageChange,
    handleCreateGroup,
    handleJoinGroup,
    handleOpenEditDialog,
    handleCloseEditDialog,
    handleSaveEdit,
    handleDeleteClick,
    handleDeleteConfirm,
    handleDeleteCancel,
    dialogs,
  };
};
