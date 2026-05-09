import { useEffect, useRef, useState } from "react";
import { useCallStore } from "../store/useCallStore";
import { useAuthStore } from "../store/useAuthStore";
import { Phone, PhoneOff, Video, VideoOff } from "lucide-react";

import { useChatStore } from "../store/useChatStore";
import { toast } from "react-hot-toast";

const PeerVideo = ({ peerData }) => {
  const videoRef = useRef();
  const { users } = useChatStore();
  const user = users.find(u => u._id === peerData.userId);

  useEffect(() => {
    if (videoRef.current && peerData.stream) {
      videoRef.current.srcObject = peerData.stream;
    }
  }, [peerData.stream]);

  return (
    <div className="relative aspect-video bg-zinc-900 rounded-2xl overflow-hidden border border-glass-border">
      <video playsInline ref={videoRef} autoPlay className="w-full h-full object-cover" />
      <div className="absolute bottom-4 left-4 px-3 py-1 bg-black/50 backdrop-blur-md rounded-lg text-xs border border-white/10 flex items-center gap-2">
        <div className="size-2 rounded-full bg-green-500 animate-pulse" />
        {user?.fullName || "Partner"}
      </div>
    </div>
  );
};

const CallManager = () => {
  const {
    callAccepted,
    callEnded,
    stream,
    peers,
    answerCall,
    leaveCall,
    callUser,
    isMuted,
    isCameraOff,
    toggleAudio,
    toggleVideo,
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
        window.location.reload();
      };

      socket.on("incomingCall", handleIncomingCall);
      socket.on("callEnded", handleCallEnded);

      return () => {
        socket.off("incomingCall", handleIncomingCall);
        socket.off("callEnded", handleCallEnded);
      };
    }
  }, [socket]);

  useEffect(() => {
    if (myVideoRef.current && stream) {
      myVideoRef.current.srcObject = stream;
      myVideoRef.current.play().catch(e => console.log("Play error:", e));
    }
  }, [stream]);

  if (!stream && !incomingCall) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="glass-morphism w-full max-w-5xl p-6 flex flex-col gap-6 max-h-[90vh] overflow-hidden">
        <div className={`grid gap-4 overflow-y-auto custom-scrollbar pr-2 ${
            peers.length === 0 ? 'grid-cols-1' : 
            peers.length === 1 ? 'grid-cols-1 md:grid-cols-2' : 
            'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
        }`}>
          {/* My Video */}
          <div className="relative aspect-video bg-zinc-900 rounded-2xl overflow-hidden border border-glass-border group">
            {isCameraOff ? (
              <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-800">
                <div className="size-20 rounded-full bg-zinc-700 flex items-center justify-center text-4xl uppercase">
                  {useAuthStore.getState().authUser?.fullName?.charAt(0)}
                </div>
                <p className="mt-4 text-zinc-400 font-medium">Camera Off</p>
              </div>
            ) : (
              <video playsInline muted ref={myVideoRef} autoPlay className="w-full h-full object-cover" />
            )}
            <div className="absolute bottom-4 left-4 px-3 py-1 bg-black/50 backdrop-blur-md rounded-lg text-xs border border-white/10">You</div>
          </div>

          {/* Remote Videos */}
          {peers.map((peerData) => (
            peerData.stream && <PeerVideo key={peerData.userId} peerData={peerData} />
          ))}
        </div>

        <div className="flex flex-col items-center gap-6 mt-auto">
          <div className="flex items-center justify-center gap-4">
            {/* Mic Toggle */}
            <button
              onClick={toggleAudio}
              className={`p-4 rounded-full transition-all duration-300 ${isMuted ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-zinc-800 hover:bg-zinc-700 text-white border border-white/5'}`}
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <PhoneOff className="rotate-[135deg]" size={24} /> : <Phone size={24} />}
            </button>

            {/* Video Toggle */}
            <button
              onClick={toggleVideo}
              className={`p-4 rounded-full transition-all duration-300 ${isCameraOff ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-zinc-800 hover:bg-zinc-700 text-white border border-white/5'}`}
              title={isCameraOff ? "Turn Camera On" : "Turn Camera Off"}
            >
              {isCameraOff ? <VideoOff size={24} /> : <Video size={24} />}
            </button>

            {/* Add Friend to Group Call */}
            <div className="relative">
              <button
                onClick={() => setShowAddFriend(!showAddFriend)}
                className={`p-4 rounded-full transition-all duration-300 ${showAddFriend ? 'bg-primary text-white' : 'bg-zinc-800 hover:bg-zinc-700 text-white border border-white/5'}`}
                title="Add to group call"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
              </button>

              {showAddFriend && (
                <div className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 w-72 glass-morphism p-4 border border-glass-border shadow-2xl z-[110] animate-in slide-in-from-bottom-2 duration-200">
                  <h4 className="text-sm font-semibold mb-3 border-b border-white/10 pb-2">Add to Call</h4>
                  <div className="max-h-60 overflow-y-auto custom-scrollbar flex flex-col gap-2">
                    {users.filter(u => onlineUsers.includes(u._id) && !peers.find(p => p.userId === u._id)).map(user => (
                      <button
                        key={user._id}
                        onClick={() => {
                          callUser(user._id);
                          toast.success(`Calling ${user.fullName}...`);
                          setShowAddFriend(false);
                        }}
                        className="flex items-center gap-3 p-2 hover:bg-white/10 rounded-xl transition-all group"
                      >
                        <div className="relative">
                            <img src={user.profilePic || "/avatar.png"} className="size-10 rounded-full object-cover border border-white/10" />
                            <div className="absolute bottom-0 right-0 size-3 bg-green-500 border-2 border-[#1a1a1a] rounded-full" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-medium truncate">{user.fullName}</span>
                            <span className="text-[10px] text-zinc-500">Available</span>
                        </div>
                        <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                            <Phone className="size-4 text-primary" />
                        </div>
                      </button>
                    ))}
                    {users.filter(u => onlineUsers.includes(u._id) && !peers.find(p => p.userId === u._id)).length === 0 && (
                        <div className="flex flex-col items-center justify-center py-4 text-zinc-500">
                            <p className="text-xs">No other online friends</p>
                        </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* End Call / Incoming Call Actions */}
            {incomingCall && !callAccepted ? (
              <div className="flex flex-col items-center gap-4 bg-zinc-900/50 p-4 rounded-2xl border border-white/5 mb-4">
                <h3 className="text-lg font-bold animate-pulse text-primary">{incomingCall.name} is calling...</h3>
                <div className="flex gap-4">
                  <button
                    className="p-4 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/20 transition-all"
                    onClick={() => {
                      useCallStore.getState().initiateStream().then(() => {
                          answerCall(incomingCall);
                          setIncomingCall(null);
                      });
                    }}
                  >
                    <Phone size={24} />
                  </button>
                  <button
                    className="p-4 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20 transition-all"
                    onClick={() => {
                      useCallStore.setState({ callPartnerId: incomingCall.from });
                      leaveCall();
                      setIncomingCall(null);
                    }}
                  >
                    <PhoneOff size={24} />
                  </button>
                </div>
              </div>
            ) : (
              <button
                className="p-4 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20 transition-all"
                onClick={() => leaveCall()}
              >
                <PhoneOff size={24} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CallManager;
