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
  connectionRef: null,

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
    set({ callAccepted: true });
    const { stream } = get();
    const socket = useAuthStore.getState().socket;

    const peer = new Peer({ initiator: false, trickle: false, stream });

    peer.on("signal", (data) => {
      socket.emit("answerCall", { signal: data, to: incomingCall.from });
    });

    peer.on("stream", (currentStream) => {
      set({ remoteStream: currentStream });
    });

    peer.signal(incomingCall.signal);

    set({ connectionRef: peer });
  },

  callUser: (id) => {
    const { stream } = get();
    const socket = useAuthStore.getState().socket;
    const authUser = useAuthStore.getState().authUser;

    const peer = new Peer({ initiator: true, trickle: false, stream });

    peer.on("signal", (data) => {
      socket.emit("callUser", {
        userToCall: id,
        signalData: data,
        from: authUser._id,
        name: authUser.fullName,
      });
    });

    peer.on("stream", (currentStream) => {
      set({ remoteStream: currentStream });
    });

    socket.on("callAccepted", (signal) => {
      set({ callAccepted: true });
      peer.signal(signal);
    });

    set({ connectionRef: peer });
  },

  leaveCall: (to) => {
    set({ callEnded: true });
    const { connectionRef, stream } = get();
    const socket = useAuthStore.getState().socket;

    if (connectionRef) connectionRef.destroy();
    if (stream) stream.getTracks().forEach(track => track.stop());
    
    socket.emit("endCall", { to });
    
    window.location.reload(); // Simplest way to reset all states
  },
}));
