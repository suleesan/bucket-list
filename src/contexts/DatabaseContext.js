import { createContext, useContext } from "react";
import { supabase } from "../supabase";
import { useAuth } from "./AuthContext";

const DatabaseContext = createContext();

export function useDatabase() {
  return useContext(DatabaseContext);
}

export function DatabaseProvider({ children }) {
  const { currentUser } = useAuth();

  // GROUPS
  const createGroup = async (name, imageUrl = null) => {
    try {
      const { data, error } = await supabase
        .from("groups")
        .insert([
          {
            name,
            image_url: imageUrl,
            created_by: currentUser.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Add the creator as a member
      await supabase.from("group_members").insert([
        {
          group_id: data.id,
          user_id: currentUser.id,
        },
      ]);

      return data.id;
    } catch (error) {
      console.error("Error creating group:", error);
      throw error;
    }
  };

  function generateGroupCode(length = 6) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < length; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  async function getGroups() {
    // Get all groups for the user
    const { data: groups, error } = await supabase
      .from("groups")
      .select("*, group_members!inner(user_id)")
      .eq("group_members.user_id", currentUser.id);
    if (error) throw error;

    for (const group of groups) {
      const { count } = await supabase
        .from("group_members")
        .select("*", { count: "exact", head: true })
        .eq("group_id", group.id);
      group.memberCount = count;
    }

    return groups;
  }

  async function getGroup(groupId) {
    const { data, error } = await supabase
      .from("groups")
      .select("*")
      .eq("id", groupId)
      .single();
    if (error) throw error;
    return data;
  }

  async function addGroupMember(groupId, userId) {
    const { error } = await supabase
      .from("group_members")
      .insert([{ group_id: groupId, user_id: userId }]);
    if (error) throw error;
  }

  async function joinGroupByCode(code) {
    const { data, error } = await supabase
      .from("groups")
      .select("id")
      .eq("code", code)
      .single();
    if (error || !data) throw new Error("Invalid group code");
    await addGroupMember(data.id, currentUser.id);
    return data.id;
  }

  // BUCKET LIST ITEMS
  async function createBucketListItem(groupId, item) {
    const { data, error } = await supabase
      .from("bucket_list_items")
      .insert([{ ...item, group_id: groupId, created_by: currentUser.id }])
      .select()
      .single();
    if (error) throw error;
    return data.id;
  }

  async function getBucketListItems(groupId) {
    const { data, error } = await supabase
      .from("bucket_list_items")
      .select("*")
      .eq("group_id", groupId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  }

  async function updateBucketListItem(itemId, updates) {
    const { error } = await supabase
      .from("bucket_list_items")
      .update(updates)
      .eq("id", itemId);
    if (error) throw error;
  }

  async function deleteBucketListItem(itemId) {
    const { error } = await supabase
      .from("bucket_list_items")
      .delete()
      .eq("id", itemId);
    if (error) throw error;
  }

  // COMMENTS
  async function getComments(itemId) {
    const { data, error } = await supabase
      .from("comments")
      .select("*, profiles(username)")
      .eq("item_id", itemId)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return data;
  }

  async function addComment(itemId, content) {
    const { error } = await supabase
      .from("comments")
      .insert([{ item_id: itemId, created_by: currentUser.id, content }]);
    if (error) throw error;
  }

  async function deleteComment(commentId) {
    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId);
    if (error) throw error;
  }

  // DATE SUGGESTIONS
  // async function getDateSuggestions(itemId) {
  //   const { data, error } = await supabase
  //     .from("date_suggestions")
  //     .select("*, profiles(username)")
  //     .eq("item_id", itemId)
  //     .order("created_at", { ascending: true });
  //   if (error) throw error;
  //   return data;
  // }

  // async function addDateSuggestion(itemId, date) {
  //   const { error } = await supabase
  //     .from("date_suggestions")
  //     .insert([{ item_id: itemId, suggested_by: currentUser.id, date }]);
  //   if (error) throw error;
  // }

  // async function updateDateSuggestion(suggestionId, updates) {
  //   const { error } = await supabase
  //     .from("date_suggestions")
  //     .update(updates)
  //     .eq("id", suggestionId);
  //   if (error) throw error;
  // }

  // async function deleteDateSuggestion(suggestionId) {
  //   const { error } = await supabase
  //     .from("date_suggestions")
  //     .delete()
  //     .eq("id", suggestionId);
  //   if (error) throw error;
  // }

  // UPVOTES
  async function upvoteBucketListItem(itemId) {
    const { error } = await supabase
      .from("upvotes")
      .insert([{ item_id: itemId, user_id: currentUser.id }]);
    if (error) throw error;
  }

  async function removeUpvoteBucketListItem(itemId) {
    const { error } = await supabase
      .from("upvotes")
      .delete()
      .eq("item_id", itemId)
      .eq("user_id", currentUser.id);
    if (error) throw error;
  }

  async function getUpvotes(itemId) {
    const { data, error } = await supabase
      .from("upvotes")
      .select("user_id")
      .eq("item_id", itemId);
    if (error) throw error;
    return data;
  }

  // USERS
  async function getUser(userId) {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    if (error) throw error;
    return data;
  }

  async function getUsersByIds(userIds) {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .in("id", userIds);
    if (error) throw error;
    return data;
  }

  // GROUPS
  const updateGroup = async (groupId, updates) => {
    try {
      const { error } = await supabase
        .from("groups")
        .update(updates)
        .eq("id", groupId);

      if (error) throw error;
    } catch (error) {
      console.error("Error updating group:", error);
      throw error;
    }
  };

  async function deleteGroup(groupId) {
    const { error } = await supabase.from("groups").delete().eq("id", groupId);
    if (error) throw error;
  }

  const uploadImage = async (file, path) => {
    try {
      // Ensure the path starts with either 'groups/' or 'items/'
      if (!path.startsWith("groups/") && !path.startsWith("items/")) {
        throw new Error(
          'Image path must start with either "groups/" or "items/"'
        );
      }

      const { data, error } = await supabase.storage
        .from("bucket-list-images")
        .upload(path, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (error) throw error;

      const {
        data: { publicUrl },
      } = supabase.storage.from("bucket-list-images").getPublicUrl(path);

      return publicUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  };

  const value = {
    createGroup,
    getGroups,
    getGroup,
    addGroupMember,
    joinGroupByCode,
    createBucketListItem,
    getBucketListItems,
    updateBucketListItem,
    deleteBucketListItem,
    getComments,
    addComment,
    deleteComment,
    // getDateSuggestions,
    // addDateSuggestion,
    // updateDateSuggestion,
    // deleteDateSuggestion,
    upvoteBucketListItem,
    removeUpvoteBucketListItem,
    getUpvotes,
    getUser,
    getUsersByIds,
    updateGroup,
    deleteGroup,
    uploadImage,
  };

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  );
}
