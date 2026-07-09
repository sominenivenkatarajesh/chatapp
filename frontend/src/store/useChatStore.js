import { create } from "zustand";
import { toast } from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  mutualFriends: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isMutualFriendsLoading: false,
  unreadCounts: {}, // { userId: count }

  getMutualFriends: async (userId) => {
    set({ isMutualFriendsLoading: true });
    try {
      const res = await axiosInstance.get(`/users/mutual-friends/${userId}`);
      set({ mutualFriends: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch mutual friends");
    } finally {
      set({ isMutualFriendsLoading: false });
    }
  },

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      const users = res.data;
      set({ users });

      // Initialize unread counts from server
      const counts = {};
      users.forEach(user => {
        counts[user._id] = user.unreadCount || 0;
      });
      set({ unreadCounts: counts });

      // Request browser notification permission if not already granted
      if ("Notification" in window && Notification.permission === "default") {
        Notification.requestPermission();
      }
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },


  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
      // When opening chat, mark as seen
      get().markMessagesAsSeen(userId);
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  markMessagesAsSeen: async (userId) => {
    try {
      await axiosInstance.post(`/messages/mark-seen/${userId}`);
      // Clear local unread count
      set((state) => ({
        unreadCounts: { ...state.unreadCounts, [userId]: 0 }
      }));
    } catch (error) {
      console.log("Error in markMessagesAsSeen:", error);
    }
  },

  subscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.on("newMessage", (newMessage) => {
      const { selectedUser, messages, unreadCounts, users } = get();
      
      const isChatOpen = selectedUser && newMessage.senderId === selectedUser._id;
      const isDocumentHidden = document.hidden;

      if (isChatOpen && !isDocumentHidden) {
        set({ messages: [...messages, newMessage] });
        get().markMessagesAsSeen(selectedUser._id);
      } else {
        if (isChatOpen) {
          // If chat is open but document is hidden, just add the message
          set({ messages: [...messages, newMessage] });
        }
        
        // Increment unread count for the sender
        set({
          unreadCounts: {
            ...unreadCounts,
            [newMessage.senderId]: (unreadCounts[newMessage.senderId] || 0) + 1
          }
        });

        // Trigger Browser Push Notification
        if ("Notification" in window && Notification.permission === "granted") {
          const sender = users.find(u => u._id === newMessage.senderId);
          const senderName = sender ? sender.fullName : "Someone";
          
          let bodyText = newMessage.text;
          if (!bodyText) {
             if (newMessage.image) bodyText = "📷 Sent an image";
             else if (newMessage.fileUrl) bodyText = "📎 Sent a file";
             else bodyText = "Sent a new message";
          }

          new Notification(`New message from ${senderName}`, {
            body: bodyText,
            icon: sender?.profilePic || "/avatar.png", // fallback to default avatar
          });
        }
      }
    });

    socket.on("messagesSeen", ({ seenBy }) => {
      const { selectedUser, messages } = get();
      if (selectedUser && seenBy === selectedUser._id) {
        set({
          messages: messages.map((m) => ({ ...m, isSeen: true }))
        });
      }
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      socket.off("newMessage");
      socket.off("messagesSeen");
    }
  },

  setSelectedUser: (selectedUser) => {
    set({ selectedUser });
    if (selectedUser) {
      get().markMessagesAsSeen(selectedUser._id);
    }
  },

}));
