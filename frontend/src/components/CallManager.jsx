import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useCallStore } from "../store/useCallStore";
import { useAuthStore } from "../store/useAuthStore";
import { Phone, PhoneOff, Video, VideoOff, Maximize2, Minimize2, UserPlus, X, User } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import Avatar from "./Avatar";

const PeerVideo = ({ peerData, isMinimized }) => {
  const videoRef = useRef();
  const { users } = useChatStore();
  const user = users.find(u => u._id === peerData.userId);

  useEffect(() => {
    if (videoRef.current && peerData.stream) {
      videoRef.current.srcObject = peerData.stream;
      videoRef.current.play().catch(e => console.log("Play error:", e));
    }
  }, [peerData.stream]);

  return (
    <div className={`relative bg-zinc-900 rounded-2xl overflow-hidden border border-white/10 shadow-xl ${isMinimized ? 'aspect-square' : 'aspect-video'}`}>
      {peerData.stream ? (
        <video playsInline ref={videoRef} autoPlay className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-800/50 backdrop-blur-sm">
           <div className="size-16 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20 animate-pulse">
              <User className="size-8 text-amber-400/50" />
           </div>
           <p className="mt-4 text-xs text-zinc-400 font-medium animate-pulse uppercase tracking-widest">Connecting...</p>
        </div>
      )}
      {!isMinimized && (
        <div className="absolute bottom-4 left-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-xl text-xs border border-white/10 flex items-center gap-2 text-white">
          <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
          {user?.username || "Partner"}
        </div>
      )}
    </div>
  );
};

const CallManager = () => {
  const {
    callAccepted,
    stream,
    peers,
    answerCall,
    leaveCall,
    callUser,
    isMuted,
    isCameraOff,
    toggleAudio,
    toggleVideo,
    resetCallState,
    isMinimized,
    showCallUI,
    toggleMinimize
  } = useCallStore();

  const { users } = useChatStore();
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);
  const onlineUsers = useAuthStore((state) => state.onlineUsers);
  const myVideoRef = useRef();
  const socket = useAuthStore((state) => state.socket);

  useEffect(() => {
    if (socket) {
      const handleIncomingCall = (data) => {
        setIncomingCall(data);
      };
      
      const handleCallEnded = () => {
        toast("Call disconnected", { icon: "📞" });
        resetCallState();
        setIncomingCall(null);
      };

      socket.on("incomingCall", handleIncomingCall);
      socket.on("callEnded", handleCallEnded);

      return () => {
        socket.off("incomingCall", handleIncomingCall);
        socket.off("callEnded", handleCallEnded);
      };
    }
  }, [socket, resetCallState]);

  useEffect(() => {
    if (myVideoRef.current && stream && !isCameraOff) {
      myVideoRef.current.srcObject = stream;
      myVideoRef.current.play().catch(e => console.log("Play error:", e));
    }
  }, [stream, isCameraOff]);

  if (!stream && !incomingCall) return null;

  return createPortal(
    <>
      <AnimatePresence>
        {incomingCall && !callAccepted && (
          <motion.div 
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] w-[90%] max-w-md"
          >
            <div className="bg-zinc-950/95 backdrop-blur-xl p-4 border border-amber-500/30 rounded-3xl shadow-2xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-2xl bg-amber-500/20 flex items-center justify-center border border-amber-500/30">
                  <Video className="text-amber-400 size-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white truncate">{incomingCall.name}</h4>
                  <p className="text-[10px] text-amber-400/90 uppercase tracking-widest font-bold animate-pulse">Incoming Call...</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    useCallStore.getState().initiateStream().then(() => {
                        answerCall(incomingCall);
                        setIncomingCall(null);
                    });
                  }}
                  className="size-10 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black flex items-center justify-center transition-all shadow-lg shadow-emerald-500/20"
                >
                  <Phone size={18} />
                </button>
                <button
                  onClick={() => {
                    leaveCall(incomingCall.from);
                    setIncomingCall(null);
                  }}
                  className="size-10 rounded-2xl bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-all shadow-lg shadow-red-500/20"
                >
                  <PhoneOff size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCallUI && (
          <motion.div
            layout
            initial={false}
            animate={isMinimized ? {
              width: 280,
              height: "auto",
              bottom: 24,
              right: 24,
              top: "auto",
              left: "auto",
              borderRadius: 24,
              zIndex: 150
            } : {
              width: "100%",
              height: "100%",
              top: 0,
              left: 0,
              borderRadius: 0,
              zIndex: 100
            }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={`fixed overflow-hidden border border-white/10 shadow-2xl flex flex-col bg-zinc-950/95 backdrop-blur-xl`}
          >
            <div className={`flex items-center justify-between p-4 border-b border-white/5 ${isMinimized ? 'bg-zinc-900/50' : ''}`}>
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-xl bg-amber-500/20 flex items-center justify-center border border-amber-500/30">
                  <Video className="text-amber-400 size-4" />
                </div>
                {!isMinimized && <h3 className="font-bold text-sm text-white">Video Session</h3>}
                {isMinimized && <span className="text-xs font-medium text-zinc-400">Call Active</span>}
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={toggleMinimize}
                  className="p-2 rounded-xl hover:bg-white/5 transition-colors text-zinc-400 hover:text-white"
                >
                  {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                </button>
                {!isMinimized && (
                   <button 
                    onClick={() => leaveCall()}
                    className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>

            <div className={`flex-1 overflow-y-auto custom-scrollbar p-4 ${isMinimized ? 'max-h-80' : 'flex items-center justify-center'}`}>
              <div className={`grid gap-4 w-full h-full ${
                  isMinimized ? 'grid-cols-1' : 
                  peers.length === 0 ? 'grid-cols-1 max-w-2xl mx-auto' : 
                  peers.length === 1 ? 'grid-cols-1 md:grid-cols-2 max-w-5xl mx-auto' : 
                  'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto'
              }`}>
                <div className={`relative bg-zinc-900 rounded-2xl overflow-hidden border border-white/10 group ${isMinimized ? 'aspect-square' : 'aspect-video shadow-2xl'}`}>
                  {isCameraOff ? (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-800">
                      <div className={`${isMinimized ? 'size-12 text-xl' : 'size-20 text-4xl'} rounded-2xl bg-amber-500/20 text-amber-300 flex items-center justify-center uppercase font-bold font-mono border border-amber-500/30`}>
                        {useAuthStore.getState().authUser?.username?.charAt(0)}
                      </div>
                      {!isMinimized && <p className="mt-4 text-zinc-400 font-medium">Camera Off</p>}
                    </div>
                  ) : (
                    <video playsInline muted ref={myVideoRef} autoPlay className="w-full h-full object-cover" />
                  )}
                  {!isMinimized && <div className="absolute bottom-4 left-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-xl text-xs border border-white/10 text-white">You</div>}
                </div>

                {peers.map((peerData) => (
                   <PeerVideo key={peerData.userId} peerData={peerData} isMinimized={isMinimized} />
                ))}
              </div>
            </div>

            {!isMinimized && (
              <div className="p-6 border-t border-white/5 mt-auto bg-black/30 backdrop-blur-md">
                <div className="flex items-center justify-center gap-5">
                  <button
                    onClick={toggleAudio}
                    className={`p-4 rounded-2xl transition-all duration-300 ${isMuted ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-white/5 hover:bg-white/10 text-white border border-white/5'}`}
                  >
                    {isMuted ? <PhoneOff className="rotate-[135deg]" size={24} /> : <Phone size={24} />}
                  </button>

                  <button
                    onClick={toggleVideo}
                    className={`p-4 rounded-2xl transition-all duration-300 ${isCameraOff ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-white/5 hover:bg-white/10 text-white border border-white/5'}`}
                  >
                    {isCameraOff ? <VideoOff size={24} /> : <Video size={24} />}
                  </button>

                  <div className="relative">
                    <button
                      onClick={() => setShowAddFriend(!showAddFriend)}
                      className={`p-4 rounded-2xl transition-all duration-300 ${showAddFriend ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'bg-white/5 hover:bg-white/10 text-white border border-white/5'}`}
                    >
                      <UserPlus size={24} />
                    </button>
                    
                    {showAddFriend && (
                      <div className="absolute bottom-full mb-6 left-1/2 -translate-x-1/2 w-80 bg-zinc-900/95 backdrop-blur-xl p-4 border border-white/10 rounded-3xl shadow-2xl z-[155] animate-in slide-in-from-bottom-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3 border-b border-white/5 pb-2.5">Invite to Session</h4>
                        <div className="max-h-60 overflow-y-auto custom-scrollbar flex flex-col gap-2">
                          {users.filter(u => onlineUsers?.includes(u._id) && !peers.find(p => p.userId === u._id)).map(user => (
                            <button
                              key={user._id}
                              onClick={() => {
                                useCallStore.getState().inviteToGroupCall(user._id);
                                toast.success(`Inviting ${user.username} to group...`);
                                setShowAddFriend(false);
                              }}
                              className="flex items-center gap-3 p-2.5 hover:bg-white/5 rounded-2xl transition-all group"
                            >
                              <Avatar user={user} size="sm" />
                              <div className="flex flex-col text-left">
                                <span className="text-sm font-medium text-white">{user.username}</span>
                                <span className="text-[10px] text-emerald-400 font-semibold">Online</span>
                              </div>
                              <Phone className="size-4 ml-auto text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => leaveCall()}
                    className="p-4 rounded-2xl bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20 transition-all border border-red-400/20"
                  >
                    <PhoneOff size={24} />
                  </button>
                </div>
              </div>
            )}

            {isMinimized && (
               <div className="flex justify-center gap-2 p-3 bg-black/40 border-t border-white/5">
                  <button onClick={toggleAudio} className={`p-2 rounded-xl ${isMuted ? 'text-red-500' : 'text-zinc-400'}`}>
                    {isMuted ? <PhoneOff size={16} className="rotate-[135deg]" /> : <Phone size={16} />}
                  </button>
                  <button onClick={() => leaveCall()} className="p-2 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors">
                    <PhoneOff size={16} />
                  </button>
               </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>,
    document.body
  );
};

export default CallManager;

