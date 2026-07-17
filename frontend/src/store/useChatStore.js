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
  typingUsers: [], // Array of userIds currently typing
  replyingToMessage: null,
  editingMessage: null,

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


  getMessages: async (userOrGroupId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userOrGroupId}`);
      set({ messages: res.data });
      // When opening chat, mark as seen (if it's a user chat)
      get().markMessagesAsSeen(userOrGroupId);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  createGroup: async (name, memberIds) => {
    try {
      const res = await axiosInstance.post("/groups", { name, members: memberIds });
      set(state => ({
        users: [res.data, ...state.users]
      }));
      toast.success("Group created!");
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create group");
      throw error;
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages, users, replyingToMessage, editingMessage } = get();
    try {
      if (editingMessage) {
        const res = await axiosInstance.put(`/messages/${editingMessage._id}/edit`, { text: messageData.text });
        set({
          messages: messages.map(m => m._id === editingMessage._id ? res.data : m),
          editingMessage: null
        });
        return;
      }

      if (replyingToMessage) {
        messageData.replyTo = replyingToMessage._id;
      }

      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      set({ 
        messages: [...messages, res.data],
        replyingToMessage: null 
      });
      
      // Move the selectedUser to the top of the users list
      const updatedUsers = users.filter(u => u._id !== selectedUser._id);
      const userToMove = users.find(u => u._id === selectedUser._id);
      if (userToMove) {
        set({ users: [userToMove, ...updatedUsers] });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error sending message");
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

        // Move the sender to the top of the users list
        const updatedUsers = users.filter(u => u._id !== newMessage.senderId);
        const userToMove = users.find(u => u._id === newMessage.senderId);
        if (userToMove) {
          set({ users: [userToMove, ...updatedUsers] });
        }

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

    socket.on("userTyping", ({ userId }) => {
      const { typingUsers } = get();
      if (!typingUsers.includes(userId)) {
        set({ typingUsers: [...typingUsers, userId] });
      }
    });

    socket.on("userStoppedTyping", ({ userId }) => {
      set({ typingUsers: get().typingUsers.filter(id => id !== userId) });
    });

    socket.on("messageEdited", ({ messageId, text }) => {
      set(state => ({
        messages: state.messages.map(m => 
          m._id === messageId ? { ...m, text, isEdited: true } : m
        )
      }));
    });

    socket.on("messageDeleted", ({ messageId }) => {
      set(state => ({
        messages: state.messages.map(m => 
          m._id === messageId ? { ...m, isDeleted: true, text: "", image: "", fileUrl: "", fileName: "" } : m
        )
      }));
    });

    socket.on("messageReacted", ({ messageId, reactions }) => {
      set(state => ({
        messages: state.messages.map(m => 
          m._id === messageId ? { ...m, reactions } : m
        )
      }));
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      socket.off("newMessage");
      socket.off("messagesSeen");
      socket.off("userTyping");
      socket.off("userStoppedTyping");
      socket.off("messageEdited");
      socket.off("messageDeleted");
      socket.off("messageReacted");
    }
  },

  setSelectedUser: (selectedUser) => {
    set({ selectedUser });
    if (selectedUser) {
      get().markMessagesAsSeen(selectedUser._id);
    }
  },

  emitTyping: () => {
    const socket = useAuthStore.getState().socket;
    const { selectedUser } = get();
    if (socket && selectedUser) {
      socket.emit("typing", { to: selectedUser._id });
    }
  },

  emitStopTyping: () => {
    const socket = useAuthStore.getState().socket;
    const { selectedUser } = get();
    if (socket && selectedUser) {
      socket.emit("stopTyping", { to: selectedUser._id });
    }
  },

  setReplyingToMessage: (msg) => set({ replyingToMessage: msg, editingMessage: null }),
  setEditingMessage: (msg) => set({ editingMessage: msg, replyingToMessage: null }),

  deleteConversation: async (userId) => {
    try {
      await axiosInstance.delete(`/messages/conversation/${userId}`);
      set(state => ({
        messages: [],
        users: state.users.filter(u => u._id !== userId)
      }));
      toast.success("Conversation deleted");
    } catch (error) {
      toast.error(error.response?.data?.message || "Error deleting conversation");
    }
  },

  deleteMessage: async (messageId) => {
    try {
      await axiosInstance.delete(`/messages/${messageId}`);
      set(state => ({
        messages: state.messages.map(m => 
          m._id === messageId ? { ...m, isDeleted: true, text: "", image: "", fileUrl: "", fileName: "" } : m
        )
      }));
    } catch (error) {
      toast.error(error.response?.data?.message || "Error deleting message");
    }
  },

  reactToMessage: async (messageId, emoji) => {
    try {
      const res = await axiosInstance.post(`/messages/${messageId}/react`, { emoji });
      set(state => ({
        messages: state.messages.map(m => 
          m._id === messageId ? { ...m, reactions: res.data } : m
        )
      }));
    } catch (error) {
      toast.error(error.response?.data?.message || "Error reacting to message");
    }
  },

  pinChat: async (userId) => {
    try {
      const res = await axiosInstance.post(`/messages/pin-chat/${userId}`);
      const pinnedChats = res.data.pinnedChats;
      set(state => ({
        users: state.users.map(u => ({
          ...u,
          isPinned: pinnedChats.includes(u._id)
        })).sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          return new Date(b.lastMessageTime) - new Date(a.lastMessageTime);
        })
      }));
    } catch (error) {
      toast.error("Error pinning chat");
    }
  },

  archiveChat: async (userId) => {
    try {
      const res = await axiosInstance.post(`/messages/archive-chat/${userId}`);
      const archivedChats = res.data.archivedChats;
      set(state => ({
        users: state.users.map(u => ({
          ...u,
          isArchived: archivedChats.includes(u._id)
        }))
      }));
    } catch (error) {
      toast.error("Error archiving chat");
    }
  }

}));
