import { create } from "zustand";
import { useAuthStore } from "./useAuthStore";
import Peer from "simple-peer";

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

  initiateStream: async () => {
    try {
      const currentStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      set({ stream: currentStream });
      return currentStream;
    } catch (err) {
      console.error("Failed to get local stream", err);
    }
  },

  answerCall: (incomingCall) => {
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
          { urls: 'stun:global.stun.twilio.com:3478' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      }
    });

    peer.on("signal", (data) => {
      socket.emit("answerCall", { signal: data, to: incomingCall.from });
    });

    peer.on("stream", (currentStream) => {
      set((state) => ({
        peers: [...state.peers.filter(p => p.userId !== incomingCall.from), { peer, userId: incomingCall.from, stream: currentStream }]
      }));
    });

    peer.signal(incomingCall.signal);

    set((state) => ({
        peers: [...state.peers, { peer, userId: incomingCall.from }]
    }));
  },

  callUser: (id) => {
    // Check if already in call with this person
    if (get().peers.find(p => p.userId === id)) return;

    const { stream } = get();
    const socket = useAuthStore.getState().socket;
    const authUser = useAuthStore.getState().authUser;

    const peer = new Peer({ 
      initiator: true, 
      trickle: false, 
      stream,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:global.stun.twilio.com:3478' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      }
    });

    peer.on("signal", (data) => {
      socket.emit("callUser", {
        userToCall: id,
        signalData: data,
        from: authUser._id,
        name: authUser.fullName,
      });
    });

    peer.on("stream", (currentStream) => {
      set((state) => ({
        peers: [...state.peers.filter(p => p.userId !== id), { peer, userId: id, stream: currentStream }]
      }));
    });

    const handleCallAccepted = (signal) => {
      peer.signal(signal);
      set({ callAccepted: true });
    };

    socket.on("callAccepted", handleCallAccepted);

    set((state) => ({
        peers: [...state.peers, { peer, userId: id }]
    }));
  },

  leaveCall: () => {
    set({ callEnded: true });
    const { peers, stream } = get();
    const socket = useAuthStore.getState().socket;

    peers.forEach(({ peer, userId }) => {
      if (peer) peer.destroy();
      socket.emit("endCall", { to: userId, accepted: get().callAccepted });
    });

    if (stream) stream.getTracks().forEach(track => track.stop());
    
    window.location.reload(); 
  },

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
