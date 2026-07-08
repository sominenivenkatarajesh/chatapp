import { useEffect, useRef, useState } from "react";
import { useCallStore } from "../store/useCallStore";
import { useAuthStore } from "../store/useAuthStore";
import { Phone, PhoneOff, Video, VideoOff, Maximize2, Minimize2, UserPlus, X, User } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

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
    <div className={`relative bg-zinc-900 rounded-2xl overflow-hidden border border-glass-border shadow-xl ${isMinimized ? 'aspect-square' : 'aspect-video'}`}>
      {peerData.stream ? (
        <video playsInline ref={videoRef} autoPlay className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-800/50 backdrop-blur-sm">
           <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 animate-pulse">
              <User className="size-8 text-primary/50" />
           </div>
           <p className="mt-4 text-xs text-zinc-400 font-medium animate-pulse uppercase tracking-widest">Connecting...</p>
        </div>
      )}
      {!isMinimized && (
        <div className="absolute bottom-4 left-4 px-3 py-1 bg-black/50 backdrop-blur-md rounded-lg text-xs border border-white/10 flex items-center gap-2">
          <div className="size-2 rounded-full bg-green-500 animate-pulse" />
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

  return (
    <>
      <AnimatePresence>
        {incomingCall && !callAccepted && (
          <motion.div 
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] w-[90%] max-w-md"
          >
            <div className="glass-morphism p-4 border border-glass-border shadow-2xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                  <Video className="text-primary size-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm truncate">{incomingCall.name}</h4>
                  <p className="text-[10px] text-zinc-400 uppercase tracking-widest animate-pulse">Incoming Call...</p>
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
                  className="size-10 rounded-full bg-green-500 hover:bg-green-600 text-white flex items-center justify-center transition-all shadow-lg shadow-green-500/20"
                >
                  <Phone size={18} />
                </button>
                <button
                  onClick={() => {
                    leaveCall(incomingCall.from);
                    setIncomingCall(null);
                  }}
                  className="size-10 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-all shadow-lg shadow-red-500/20"
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
            className={`fixed glass-morphism overflow-hidden border border-glass-border shadow-2xl flex flex-col bg-zinc-950/90 backdrop-blur-xl`}
          >
            <div className={`flex items-center justify-between p-4 border-b border-white/5 ${isMinimized ? 'bg-zinc-900/50' : ''}`}>
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                  <Video className="text-primary size-4" />
                </div>
                {!isMinimized && <h3 className="font-bold text-sm">Video Session</h3>}
                {isMinimized && <span className="text-xs font-medium text-zinc-400">Call Active</span>}
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={toggleMinimize}
                  className="p-2 rounded-lg hover:bg-white/5 transition-colors text-zinc-400 hover:text-white"
                >
                  {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                </button>
                {!isMinimized && (
                   <button 
                    onClick={() => leaveCall()}
                    className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors"
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
                <div className={`relative bg-zinc-900 rounded-2xl overflow-hidden border border-glass-border group ${isMinimized ? 'aspect-square' : 'aspect-video shadow-2xl'}`}>
                  {isCameraOff ? (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-800">
                      <div className={`${isMinimized ? 'size-12 text-xl' : 'size-20 text-4xl'} rounded-full bg-zinc-700 flex items-center justify-center uppercase font-bold`}>
                        {useAuthStore.getState().authUser?.username?.charAt(0)}
                      </div>
                      {!isMinimized && <p className="mt-4 text-zinc-400 font-medium">Camera Off</p>}
                    </div>
                  ) : (
                    <video playsInline muted ref={myVideoRef} autoPlay className="w-full h-full object-cover" />
                  )}
                  {!isMinimized && <div className="absolute bottom-4 left-4 px-3 py-1 bg-black/50 backdrop-blur-md rounded-lg text-xs border border-white/10">You</div>}
                </div>

                {peers.map((peerData) => (
                   <PeerVideo key={peerData.userId} peerData={peerData} isMinimized={isMinimized} />
                ))}
              </div>
            </div>

            {!isMinimized && (
              <div className="p-8 border-t border-white/5 mt-auto bg-black/20 backdrop-blur-md">
                <div className="flex items-center justify-center gap-6">
                  <button
                    onClick={toggleAudio}
                    className={`p-5 rounded-2xl transition-all duration-300 ${isMuted ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-white/5 hover:bg-white/10 text-white border border-white/5'}`}
                  >
                    {isMuted ? <PhoneOff className="rotate-[135deg]" size={28} /> : <Phone size={28} />}
                  </button>

                  <button
                    onClick={toggleVideo}
                    className={`p-5 rounded-2xl transition-all duration-300 ${isCameraOff ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-white/5 hover:bg-white/10 text-white border border-white/5'}`}
                  >
                    {isCameraOff ? <VideoOff size={28} /> : <Video size={28} />}
                  </button>

                  <div className="relative">
                    <button
                      onClick={() => setShowAddFriend(!showAddFriend)}
                      className={`p-5 rounded-2xl transition-all duration-300 ${showAddFriend ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white/5 hover:bg-white/10 text-white border border-white/5'}`}
                    >
                      <UserPlus size={28} />
                    </button>
                    
                    {showAddFriend && (
                      <div className="absolute bottom-full mb-6 left-1/2 -translate-x-1/2 w-80 glass-morphism p-4 border border-glass-border shadow-2xl z-[110] animate-in slide-in-from-bottom-2">
                        <h4 className="text-sm font-semibold mb-4 border-b border-white/5 pb-3">Invite to Session</h4>
                        <div className="max-h-60 overflow-y-auto custom-scrollbar flex flex-col gap-2">
                          {users.filter(u => onlineUsers?.includes(u._id) && !peers.find(p => p.userId === u._id)).map(user => (
                            <button
                              key={user._id}
                              onClick={() => {
                                callUser(user._id);
                                toast.success(`Calling ${user.username}...`);
                                setShowAddFriend(false);
                              }}
                              className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl transition-all group"
                            >
                              <img src={user.profilePic || "/avatar.svg"} className="size-10 rounded-full object-cover border border-white/10" />
                              <div className="flex flex-col text-left">
                                <span className="text-sm font-medium">{user.username}</span>
                                <span className="text-[10px] text-green-500">Available</span>
                              </div>
                              <Phone className="size-4 ml-auto text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => leaveCall()}
                    className="p-5 rounded-2xl bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20 transition-all border border-red-400/20"
                  >
                    <PhoneOff size={28} />
                  </button>
                </div>
              </div>
            )}

            {isMinimized && (
               <div className="flex justify-center gap-2 p-3 bg-black/40 border-t border-white/5">
                  <button onClick={toggleAudio} className={`p-2 rounded-lg ${isMuted ? 'text-red-500' : 'text-zinc-400'}`}>
                    {isMuted ? <PhoneOff size={16} className="rotate-[135deg]" /> : <Phone size={16} />}
                  </button>
                  <button onClick={() => leaveCall()} className="p-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors">
                    <PhoneOff size={16} />
                  </button>
               </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CallManager;
