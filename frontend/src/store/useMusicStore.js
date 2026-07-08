import { create } from "zustand";
import { useAuthStore } from "./useAuthStore";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useMusicStore = create((set, get) => ({
  roomId: null,
  queue: [],
  isPlaying: false,
  currentTime: 0,
  currentVideo: null,
  activeMusicRooms: [],
  searchResults: [],
  isSearching: false,
  isPlayerOpen: false,
  inviteData: null,

  setupSocketListeners: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket || socket.hasMusicListeners) return;
    
    socket.hasMusicListeners = true;

    socket.on("updateMusicRooms", (rooms) => {
      set({ activeMusicRooms: rooms });
    });

    socket.on("musicRoomState", (state) => {
      if (get().roomId === state.roomId) {
        set({
          queue: state.queue,
          isPlaying: state.isPlaying,
          currentTime: state.currentTime,
          currentVideo: state.currentVideo
        });
      }
    });

    socket.on("musicRoomClosed", () => {
      toast("The music room was closed by the host", { icon: "📻" });
      get().leaveRoom();
    });

    socket.on("musicRoomInvite", ({ roomId, from, name }) => {
      set({ inviteData: { roomId, from, name } });
    });
  },

  createRoom: () => {
    const socket = useAuthStore.getState().socket;
    const authUser = useAuthStore.getState().authUser;
    if (!socket) return;
    
    get().setupSocketListeners();
    socket.emit("createMusicRoom", { name: authUser.username });
    set({ roomId: authUser._id, isPlayerOpen: true });
    toast.success("Music room created!");
  },

  joinRoom: (roomId) => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;
    
    get().setupSocketListeners();
    socket.emit("joinMusicRoom", { roomId });
    set({ roomId, isPlayerOpen: true, inviteData: null });
    toast.success("Joined music room");
  },

  leaveRoom: () => {
    const socket = useAuthStore.getState().socket;
    const { roomId } = get();
    if (socket && roomId) {
      socket.emit("leaveMusicRoom", { roomId });
    }
    set({
      roomId: null,
      queue: [],
      isPlaying: false,
      currentTime: 0,
      currentVideo: null,
      isPlayerOpen: false
    });
  },

  searchSongs: async (query) => {
    set({ isSearching: true });
    try {
      const res = await axiosInstance.get(`/music/search?q=${encodeURIComponent(query)}`);
      set({ searchResults: res.data });
    } catch (error) {
      toast.error("Failed to search songs");
      console.error(error);
    } finally {
      set({ isSearching: false });
    }
  },

  addToQueue: (video) => {
    const socket = useAuthStore.getState().socket;
    const { roomId } = get();
    if (socket && roomId) {
      socket.emit("addSongToQueue", { roomId, video });
      toast.success("Added to queue");
    }
  },

  playNext: () => {
    const socket = useAuthStore.getState().socket;
    const { roomId } = get();
    if (socket && roomId) {
      socket.emit("playNextSong", { roomId });
    }
  },

  syncState: (isPlaying, currentTime) => {
    const socket = useAuthStore.getState().socket;
    const { roomId } = get();
    if (socket && roomId) {
      socket.emit("syncMusicState", { roomId, isPlaying, currentTime });
      set({ isPlaying, currentTime });
    }
  },

  inviteUser: (userId) => {
    const socket = useAuthStore.getState().socket;
    const authUser = useAuthStore.getState().authUser;
    const { roomId } = get();
    if (socket && roomId) {
      socket.emit("inviteToMusicRoom", {
        userToInvite: userId,
        roomId,
        from: authUser._id,
        name: authUser.username
      });
      toast.success("Invite sent!");
    }
  },

  clearInvite: () => set({ inviteData: null }),
  togglePlayer: () => set(state => ({ isPlayerOpen: !state.isPlayerOpen }))
}));
