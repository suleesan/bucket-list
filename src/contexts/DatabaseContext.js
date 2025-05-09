import { createContext, useContext, useState, useEffect } from "react";
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  setDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "./AuthContext";

const DatabaseContext = createContext();

export function useDatabase() {
  return useContext(DatabaseContext);
}

export function DatabaseProvider({ children }) {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);

  function generateGroupCode(length = 6) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < length; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  // Groups operations
  const createGroup = async (groupName) => {
    try {
      const groupCode = generateGroupCode();
      const groupRef = await addDoc(collection(db, "groups"), {
        name: groupName,
        createdBy: currentUser.uid,
        members: [currentUser.uid],
        createdAt: serverTimestamp(),
        code: groupCode,
      });
      return groupRef.id;
    } catch (error) {
      throw error;
    }
  };

  const getUser = async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, "users", userId));
      return userDoc.exists()
        ? userDoc.data()
        : { username: "Unknown User", id: userId };
    } catch (error) {
      console.error("Error getting user:", error);
      return { displayName: "Unknown User" };
    }
  };

  const getGroups = async () => {
    try {
      const groupsRef = collection(db, "groups");
      const q = query(
        groupsRef,
        where("members", "array-contains", currentUser.uid),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      const groups = [];

      for (const doc of querySnapshot.docs) {
        const groupData = { id: doc.id, ...doc.data() };
        const memberDetails = await Promise.all(
          groupData.members.map(async (memberId) => {
            const userData = await getUser(memberId);
            return { id: memberId, ...userData };
          })
        );
        groups.push({ ...groupData, memberDetails });
      }
      return groups;
    } catch (error) {
      console.error("Error getting groups:", error);
      throw error;
    }
  };

  const getGroup = async (groupId) => {
    try {
      const groupDoc = await getDoc(doc(db, "groups", groupId));
      if (!groupDoc.exists()) {
        throw new Error("Group not found");
      }
      return {
        id: groupDoc.id,
        ...groupDoc.data(),
      };
    } catch (error) {
      throw error;
    }
  };

  const addGroupMember = async (groupId, userId) => {
    try {
      const groupRef = doc(db, "groups", groupId);
      await updateDoc(groupRef, {
        members: arrayUnion(userId),
      });
    } catch (error) {
      throw error;
    }
  };

  const joinGroupByCode = async (code) => {
    try {
      const groupsRef = collection(db, "groups");
      const q = query(groupsRef, where("code", "==", code));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        throw new Error("Invalid group code");
      }

      const groupDoc = querySnapshot.docs[0];
      const groupId = groupDoc.id;
      // Add user to group members
      await addGroupMember(groupId, currentUser.uid);
      return groupId;
    } catch (error) {
      throw error;
    }
  };

  const createBucketListItem = async (groupId, item) => {
    try {
      const itemRef = await addDoc(collection(db, "bucketListItems"), {
        ...item,
        groupId,
        createdBy: currentUser.uid,
        createdAt: serverTimestamp(),
        status: item.status || "idea",
        dateSuggestions: [],
      });
      return itemRef.id;
    } catch (error) {
      throw error;
    }
  };

  const getBucketListItems = async (groupId) => {
    try {
      const itemsQuery = query(
        collection(db, "bucketListItems"),
        where("groupId", "==", groupId),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(itemsQuery);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      throw error;
    }
  };

  const updateBucketListItem = async (itemId, updates) => {
    try {
      const itemRef = doc(db, "bucketListItems", itemId);
      await updateDoc(itemRef, updates);
    } catch (error) {
      throw error;
    }
  };

  const deleteBucketListItem = async (itemId) => {
    try {
      await deleteDoc(doc(db, "bucketListItems", itemId));
    } catch (error) {
      throw error;
    }
  };

  const addDateSuggestion = async (itemId, date) => {
    try {
      const itemRef = doc(db, "bucketListItems", itemId);
      await updateDoc(itemRef, {
        dateSuggestions: arrayUnion({
          date,
          suggestedBy: currentUser.uid,
          votes: [currentUser.uid],
          createdAt: new Date().toISOString(),
        }),
      });
    } catch (error) {
      throw error;
    }
  };

  const voteForDate = async (itemId, suggestionIndex) => {
    try {
      const itemRef = doc(db, "bucketListItems", itemId);
      const item = await getDoc(itemRef);
      const dateSuggestions = item.data().dateSuggestions;

      if (dateSuggestions[suggestionIndex].votes.includes(currentUser.uid)) {
        // Remove vote
        dateSuggestions[suggestionIndex].votes = dateSuggestions[
          suggestionIndex
        ].votes.filter((id) => id !== currentUser.uid);
      } else {
        // Add vote
        dateSuggestions[suggestionIndex].votes.push(currentUser.uid);
      }

      await updateDoc(itemRef, { dateSuggestions });
    } catch (error) {
      throw error;
    }
  };

  // Upvote an item
  const upvoteBucketListItem = async (itemId, userId) => {
    const itemRef = doc(db, "bucketListItems", itemId);
    await updateDoc(itemRef, {
      upvotes: arrayUnion(userId),
    });
  };

  // Remove upvote
  const removeUpvoteBucketListItem = async (itemId, userId) => {
    const itemRef = doc(db, "bucketListItems", itemId);
    await updateDoc(itemRef, {
      upvotes: arrayRemove(userId),
    });
  };

  // Fetch user info for upvoters
  const getUsersByIds = async (userIds) => {
    const users = [];
    for (const uid of userIds) {
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        users.push({ id: uid, ...userDoc.data() });
      }
    }
    return users;
  };

  const deleteDateSuggestion = async (itemId, suggestionIndex) => {
    const itemRef = doc(db, "bucketListItems", itemId);
    const itemSnap = await getDoc(itemRef);
    const dateSuggestions = itemSnap.data().dateSuggestions || [];
    dateSuggestions.splice(suggestionIndex, 1);
    await updateDoc(itemRef, { dateSuggestions });
  };

  const editDateSuggestion = async (itemId, suggestionIndex, newDate) => {
    const itemRef = doc(db, "bucketListItems", itemId);
    const itemSnap = await getDoc(itemRef);
    const dateSuggestions = itemSnap.data().dateSuggestions || [];
    dateSuggestions[suggestionIndex].date = newDate;
    await updateDoc(itemRef, { dateSuggestions });
  };

  const updateGroup = async (groupId, updates) => {
    try {
      const groupRef = doc(db, "groups", groupId);
      await updateDoc(groupRef, updates);
    } catch (error) {
      throw error;
    }
  };

  const deleteGroup = async (groupId) => {
    try {
      console.log("Starting group deletion for groupId:", groupId);

      // First verify the group exists and user has permission
      const groupRef = doc(db, "groups", groupId);
      const groupDoc = await getDoc(groupRef);

      if (!groupDoc.exists()) {
        throw new Error("Group not found");
      }

      const groupData = groupDoc.data();
      if (groupData.createdBy !== currentUser.uid) {
        throw new Error("You don't have permission to delete this group");
      }

      // Delete all bucket list items in the group
      const itemsQuery = query(
        collection(db, "bucketListItems"),
        where("groupId", "==", groupId)
      );
      const itemsSnapshot = await getDocs(itemsQuery);
      console.log("Found items to delete:", itemsSnapshot.size);

      // Delete each item and its subcollections
      for (const itemDoc of itemsSnapshot.docs) {
        try {
          // Delete comments subcollection
          const commentsQuery = query(
            collection(db, "bucketListItems", itemDoc.id, "comments")
          );
          const commentsSnapshot = await getDocs(commentsQuery);
          console.log(
            `Deleting ${commentsSnapshot.size} comments for item ${itemDoc.id}`
          );

          for (const commentDoc of commentsSnapshot.docs) {
            await deleteDoc(
              doc(db, "bucketListItems", itemDoc.id, "comments", commentDoc.id)
            );
          }

          // Delete the item itself
          await deleteDoc(doc(db, "bucketListItems", itemDoc.id));
          console.log("Deleted item:", itemDoc.id);
        } catch (itemError) {
          console.error("Error deleting item:", itemDoc.id, itemError);
          throw new Error(`Failed to delete item: ${itemError.message}`);
        }
      }

      // Finally, delete the group
      await deleteDoc(groupRef);
      console.log("Successfully deleted group:", groupId);

      return true;
    } catch (error) {
      console.error("Error in deleteGroup:", error);
      throw error;
    }
  };

  const value = {
    loading,
    createGroup,
    getGroups,
    getGroup,
    addGroupMember,
    joinGroupByCode,
    createBucketListItem,
    getBucketListItems,
    updateBucketListItem,
    deleteBucketListItem,
    addDateSuggestion,
    voteForDate,
    upvoteBucketListItem,
    removeUpvoteBucketListItem,
    getUsersByIds,
    deleteDateSuggestion,
    editDateSuggestion,
    updateGroup,
    deleteGroup,
  };

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  );
}
