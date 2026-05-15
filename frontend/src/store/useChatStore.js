import { create } from "zustand";
import { toast } from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  unreadCounts: {}, // { userId: count }

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
      const { selectedUser, messages, unreadCounts } = get();
      
      if (selectedUser && newMessage.senderId === selectedUser._id) {
        set({ messages: [...messages, newMessage] });
        get().markMessagesAsSeen(selectedUser._id);
      } else {
        // Increment unread count for the sender
        set({
          unreadCounts: {
            ...unreadCounts,
            [newMessage.senderId]: (unreadCounts[newMessage.senderId] || 0) + 1
          }
        });
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
