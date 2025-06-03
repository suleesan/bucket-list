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
      const code = generateGroupCode();

      const { data, error } = await supabase
        .from("groups")
        .insert([
          {
            name,
            image_url: imageUrl,
            created_by: currentUser.id,
            code,
          },
        ])
        .select()
        .single();

      if (error) throw error;

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
    try {
      // find group
      const { data: groups, error: groupError } = await supabase
        .from("groups")
        .select("id")
        .eq("code", code);

      if (groupError) {
        console.error("Error finding group:", groupError);
        throw new Error("Failed to find group");
      }

      if (!groups || groups.length === 0) {
        console.error("No group found with code:", code);
        throw new Error("Invalid group code");
      }

      const group = groups[0];

      // check if user is already a member
      const { data: memberships, error: membershipError } = await supabase
        .from("group_members")
        .select("group_id")
        .eq("user_id", currentUser.id)
        .eq("group_id", group.id);

      if (membershipError) {
        console.error("Error checking membership:", membershipError);
        throw new Error("Failed to check group membership");
      }

      if (memberships && memberships.length > 0) {
        throw new Error("You are already a member of this group");
      }

      const { error: joinError } = await supabase
        .from("group_members")
        .insert([{ group_id: group.id, user_id: currentUser.id }]);

      if (joinError) {
        console.error("Error joining group:", joinError);
        throw new Error("Failed to join group");
      }
      return group.id;
    } catch (error) {
      console.error("Error in joinGroupByCode:", error);
      throw error;
    }
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
    const { data: items, error: itemsError } = await supabase
      .from("bucket_list_items")
      .select("*")
      .eq("group_id", groupId)
      .order("created_at", { ascending: false });
    if (itemsError) throw itemsError;

    // fetch upvotes (RSVPs) for each item
    const itemsWithUpvotes = await Promise.all(
      items.map(async (item) => {
        const { data: upvotes, error: upvotesError } = await supabase
          .from("upvotes")
          .select("user_id")
          .eq("item_id", item.id);
        if (upvotesError) throw upvotesError;
        return {
          ...item,
          upvotes: upvotes.map((u) => u.user_id),
        };
      })
    );

    return itemsWithUpvotes;
  }

  async function updateBucketListItem(itemId, updates) {
    const allowedFields = [
      "title",
      "description",
      "location",
      "date",
      "status",
      "image_url",
    ];
    const filteredUpdates = Object.keys(updates)
      .filter((key) => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = updates[key];
        return obj;
      }, {});

    const { error } = await supabase
      .from("bucket_list_items")
      .update(filteredUpdates)
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
      .select("id, content, created_at, created_by, profiles!inner(username)")
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

  // RSVPs (formerly UPVOTES)
  async function rsvpBucketListItem(itemId) {
    const { error } = await supabase
      .from("upvotes")
      .insert([{ item_id: itemId, user_id: currentUser.id }]);
    if (error) throw error;
  }

  async function removeRsvpBucketListItem(itemId) {
    const { error } = await supabase
      .from("upvotes")
      .delete()
      .eq("item_id", itemId)
      .eq("user_id", currentUser.id);
    if (error) throw error;
  }

  async function getRsvps(itemId) {
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
  const updateGroup = async (groupId, groupData) => {
    try {
      const validFields = ["name", "image_url"];
      const updateData = Object.keys(groupData)
        .filter((key) => validFields.includes(key))
        .reduce((obj, key) => {
          obj[key] = groupData[key];
          return obj;
        }, {});

      const { data, error } = await supabase
        .from("groups")
        .update(updateData)
        .eq("id", groupId);

      if (error) throw error;
      return data;
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
      if (!path.startsWith("groups/") && !path.startsWith("items/")) {
        throw new Error(
          'Image path must start with either "groups/" or "items/"'
        );
      }

      // remove file if it exists
      try {
        await supabase.storage.from("bucket-list-images").remove([path]);
      } catch (removeError) {}

      // upload new file
      const { data, error } = await supabase.storage
        .from("bucket-list-images")
        .upload(path, file, {
          cacheControl: "3600",
          upsert: false, // CHANGED FROM TRUE!!
        });

      if (error) {
        // keep just in case for future ref
        console.error("Supabase storage error:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          statusCode: error.statusCode,
        });
        throw error;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("bucket-list-images").getPublicUrl(path);

      return publicUrl;
    } catch (error) {
      // keep just in case for future ref
      console.error("Error uploading image:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        statusCode: error.statusCode,
        stack: error.stack,
      });
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
    rsvpBucketListItem,
    removeRsvpBucketListItem,
    getRsvps,
    getUser,
    getUsersByIds,
    updateGroup,
    deleteGroup,
    uploadImage,
    loadGroups: getGroups,
  };

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  );
}
