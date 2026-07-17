import { create } from "zustand";
import { useAuthStore } from "./useAuthStore";
import Peer from "simple-peer";
import toast from "react-hot-toast";

export const useCallStore = create((set, get) => ({
  call: {},
  callAccepted: false,
  callEnded: false,
  stream: null,
  remoteStream: null,
  name: "",
  peers: [], // Array of { peer, userId, stream }
  callPartnerId: null,
  currentRoomId: null,
  isMuted: false,
  isCameraOff: false,
  isMinimized: false,
  showCallUI: false,

  initiateStream: async () => {
    try {
      const currentStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      set({ stream: currentStream });
      return currentStream;
    } catch (err) {
      console.error("Failed to get local stream", err);
      toast.error("Failed to access camera/microphone");
    }
  },

  setupSocketListeners: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket || socket.hasCallListeners) return;
    
    socket.hasCallListeners = true;

    socket.on("callAccepted", ({ signal, from }) => {
      console.log("Call accepted by:", from);
      const peerObj = get().peers.find(p => p.userId === from);
      if (peerObj && peerObj.peer && !peerObj.peer.destroyed) {
        peerObj.peer.signal(signal);
        set({ callAccepted: true });
      }
    });

    socket.on("userJoinedMesh", ({ newUserId }) => {
      console.log("New user joined room, initiating mesh connection:", newUserId);
      const { stream } = get();
      const authUser = useAuthStore.getState().authUser;
      
      const peer = new Peer({
        initiator: true,
        trickle: false,
        stream,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:global.stun.twilio.com:3478' }
          ]
        }
      });

      peer.on("signal", (data) => {
        socket.emit("meshSignal", {
          userToSignal: newUserId,
          signalData: data,
          from: authUser._id
        });
      });

      peer.on("stream", (currentStream) => {
        set((state) => ({
          peers: state.peers.map(p => p.userId === newUserId ? { ...p, stream: currentStream } : p)
        }));
      });

      peer.on("error", (err) => console.error("Mesh Peer Error:", err));

      set((state) => ({
        peers: [...state.peers.filter(p => p.userId !== newUserId), { peer, userId: newUserId }]
      }));
    });

    socket.on("meshSignal", ({ signal, from }) => {
      console.log("Mesh signal received from:", from);
      let peerObj = get().peers.find(p => p.userId === from);
      
      if (!peerObj) {
        // We received a P2P connection request from someone in the mesh
        const { stream } = get();
        const authUser = useAuthStore.getState().authUser;
        
        const peer = new Peer({
          initiator: false,
          trickle: false,
          stream,
          config: {
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:global.stun.twilio.com:3478' }
            ]
          }
        });

        peer.on("signal", (data) => {
          socket.emit("meshSignal", {
            userToSignal: from,
            signalData: data,
            from: authUser._id
          });
        });

        peer.on("stream", (currentStream) => {
          set((state) => ({
            peers: state.peers.map(p => p.userId === from ? { ...p, stream: currentStream } : p)
          }));
        });

        peer.on("error", (err) => console.error("Mesh Peer Error:", err));
        peer.signal(signal);

        set((state) => ({
          peers: [...state.peers, { peer, userId: from }]
        }));
      } else {
        // We already have a peer object, just signal it
        if (!peerObj.peer.destroyed) {
          peerObj.peer.signal(signal);
        }
      }
    });

    socket.on("callEnded", ({ from }) => {
      console.log("User left the call:", from);
      if (from) {
        const peerObj = get().peers.find(p => p.userId === from);
        if (peerObj && peerObj.peer) peerObj.peer.destroy();
        set(state => ({ peers: state.peers.filter(p => p.userId !== from) }));
        
        // If we were the only one left with them, or if it was 1-on-1
        if (get().peers.length === 0) {
          get().resetCallState();
          toast("Call ended", { icon: "📞" });
        } else {
          toast("A user left the call", { icon: "👋" });
        }
      } else {
        // Complete call termination
        get().resetCallState();
        toast("Call ended", { icon: "📞" });
      }
    });
  },

  answerCall: (incomingCall) => {
    get().setupSocketListeners();
    set({ 
      callAccepted: true, 
      callPartnerId: incomingCall.from,
      currentRoomId: incomingCall.roomId
    });
    
    const { stream } = get();
    const socket = useAuthStore.getState().socket;

    if (incomingCall.isGroup) {
      // Group call invite: just join the room, let existing users initiate to us via meshSignal
      socket.emit("joinRoom", { roomId: incomingCall.roomId });
      set({ showCallUI: true, isMinimized: false });
      return;
    }

    // Standard 1-on-1 Answer
    const peer = new Peer({ 
      initiator: false, 
      trickle: false, 
      stream,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:global.stun.twilio.com:3478' }
        ]
      }
    });

    peer.on("signal", (data) => {
      console.log("Receiver: Signaling...");
      socket.emit("answerCall", { signal: data, to: incomingCall.from });
    });

    peer.on("stream", (currentStream) => {
      console.log("Receiver: Stream received!", currentStream);
      set((state) => ({
        peers: state.peers.map(p => p.userId === incomingCall.from ? { ...p, stream: currentStream } : p)
      }));
    });

    peer.on("error", (err) => {
      console.error("Receiver: Peer error:", err);
    });

    set((state) => ({
        peers: [...state.peers.filter(p => p.userId !== incomingCall.from), { peer, userId: incomingCall.from }],
        showCallUI: true,
        isMinimized: false
    }));

    peer.signal(incomingCall.signal);
  },

  callUser: (id) => {
    get().setupSocketListeners();
    if (get().peers.find(p => p.userId === id)) return;

    const { stream } = get();
    const socket = useAuthStore.getState().socket;
    const authUser = useAuthStore.getState().authUser;

    console.log("Initiating call to:", id);
    set({ currentRoomId: authUser._id }); // As initiator, I am the room host

    const peer = new Peer({ 
      initiator: true, 
      trickle: false, 
      stream,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:global.stun.twilio.com:3478' }
        ]
      }
    });

    peer.on("signal", (data) => {
      console.log("Initiator: Signaling...");
      socket.emit("callUser", {
        userToCall: id,
        signalData: data,
        from: authUser._id,
        name: authUser.username,
      });
    });

    peer.on("stream", (currentStream) => {
      console.log("Initiator: Stream received!", currentStream);
      set((state) => ({
        peers: state.peers.map(p => p.userId === id ? { ...p, stream: currentStream } : p)
      }));
    });

    peer.on("error", (err) => {
      console.error("Initiator: Peer error:", err);
    });

    set((state) => ({
        peers: [...state.peers.filter(p => p.userId !== id), { peer, userId: id }],
        showCallUI: true,
        isMinimized: false
    }));
  },

  callGroup: async (memberIds) => {
    get().setupSocketListeners();
    const authUser = useAuthStore.getState().authUser;
    
    // Start local stream if not running
    if (!get().stream) {
      await get().initiateStream();
    }
    
    set({ currentRoomId: authUser._id, showCallUI: true, isMinimized: false });
    
    // Invite all group members to this room
    memberIds.forEach((id) => {
      if (id !== authUser._id) {
         get().inviteToGroupCall(id);
      }
    });
  },

  inviteToGroupCall: (id) => {
    const socket = useAuthStore.getState().socket;
    const authUser = useAuthStore.getState().authUser;
    const { currentRoomId } = get();
    
    if (!currentRoomId) return; // Must be in a call

    socket.emit("inviteToRoom", {
      userToInvite: id,
      roomId: currentRoomId,
      from: authUser._id,
      name: authUser.username
    });
  },

  leaveCall: (userId) => {
    const { peers, stream, callAccepted, currentRoomId } = get();
    const socket = useAuthStore.getState().socket;

    if (userId) {
      // Disconnect specific peer
      const peerObj = peers.find(p => p.userId === userId);
      if (peerObj && peerObj.peer) peerObj.peer.destroy();
      
      set((state) => ({
        peers: state.peers.filter(p => p.userId !== userId)
      }));
      socket.emit("endCall", { to: userId, roomId: currentRoomId, accepted: false });
      
      if (get().peers.length === 0) {
        get().resetCallState();
      }
    } else {
      // Disconnect from ALL peers
      peers.forEach(({ peer, userId: pId }) => {
        if (peer) peer.destroy();
        socket.emit("endCall", { to: pId, roomId: currentRoomId, accepted: callAccepted });
      });
      if (stream) stream.getTracks().forEach(track => track.stop());
      get().resetCallState();
    }
  },

  resetCallState: () => {
    set({
      peers: [],
      stream: null,
      callAccepted: false,
      callEnded: false,
      callPartnerId: null,
      currentRoomId: null,
      isMuted: false,
      isCameraOff: false,
      isMinimized: false,
      showCallUI: false,
    });
  },

  toggleMinimize: () => set((state) => ({ isMinimized: !state.isMinimized })),
  setShowCallUI: (val) => set({ showCallUI: val }),
  setMinimized: (val) => set({ isMinimized: val }),

  toggleAudio: () => {
    const { stream, isMuted } = get();
    if (stream) {
      stream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      set({ isMuted: !isMuted });
    }
  },

  toggleVideo: () => {
    const { stream, isCameraOff } = get();
    if (stream) {
      stream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      set({ isCameraOff: !isCameraOff });
    }
  },
}));
