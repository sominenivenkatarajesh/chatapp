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
        
        // When someone accepts, we could theoretically tell them to connect to others.
        // But for a flexible group call where everyone can invite, 
        // we keep the architecture decentralized. A calls B, A calls C. 
        // A sees B and C. If B wants to see C, B can just invite C.
      }
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
  },

  answerCall: (incomingCall) => {
    get().setupSocketListeners();
    set({ callAccepted: true, callPartnerId: incomingCall.from });
    const { stream } = get();
    const socket = useAuthStore.getState().socket;

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
      // If we already have peers, this is an additional person being added.
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

  leaveCall: (userId) => {
    const { peers, stream, callAccepted } = get();
    const socket = useAuthStore.getState().socket;

    if (userId) {
      const peerObj = peers.find(p => p.userId === userId);
      if (peerObj && peerObj.peer) peerObj.peer.destroy();
      
      set((state) => ({
        peers: state.peers.filter(p => p.userId !== userId)
      }));
      socket.emit("endCall", { to: userId, accepted: false });
      
      if (get().peers.length === 0) {
        get().resetCallState();
      }
    } else {
      peers.forEach(({ peer, userId: pId }) => {
        if (peer) peer.destroy();
        socket.emit("endCall", { to: pId, accepted: callAccepted });
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
