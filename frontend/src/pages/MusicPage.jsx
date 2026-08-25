import { useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useMusicStore } from "../store/useMusicStore";
import { Music, Play, Plus, Users, Copy, Check, LogOut, Send, Activity, Sparkles, Radio } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import Avatar from "../components/Avatar";
import EmptyState from "../components/EmptyState";

const MusicPage = () => {
  const { activeMusicRooms, joinRoom, createRoom, leaveRoom, roomId, inviteUser } = useMusicStore();
  const { authUser } = useAuthStore();
  const { users, getUsers } = useChatStore();
  const [joinInput, setJoinInput] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  const handleCopy = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Room ID copied to clipboard!");
  };

  const handleJoin = (e) => {
    e.preventDefault();
    if (joinInput.trim()) {
      joinRoom(joinInput.trim());
      setJoinInput("");
    }
  };

  return (
    <div className="h-full bg-bg overflow-y-auto custom-scrollbar">
      <div className="max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        
        {/* Masthead Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-500/90 block mb-1">Shared Experiences</span>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
              Listening Parties
            </h1>
            <p className="text-zinc-400 mt-1.5 text-sm font-normal">
              Sync music and videos in real-time with your friends across Chatly.
            </p>
          </div>
        </div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          <motion.div
            key={roomId ? "active-room" : "room-list"}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25 }}
            className="w-full"
          >
            {roomId ? (
              <div className="space-y-8">
                {/* Active Room Dashboard */}
                <div className="glass-morphism p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-amber-500 to-amber-600 pointer-events-none left-0" />
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                      <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
                        <span className="size-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span>Live Session</span>
                      </div>
                      <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        Party Session Active
                      </h2>
                      
                      {/* Monospace Room ID Display */}
                      <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-black/50 p-2.5 sm:px-4 sm:py-2.5 rounded-2xl border border-white/10">
                        <span className="text-zinc-400 text-xs font-bold uppercase tracking-wider whitespace-nowrap">Room ID</span>
                        <code className="text-amber-300 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-xl font-mono text-sm sm:text-base font-bold tracking-widest selection:bg-amber-500 selection:text-black">
                          {roomId}
                        </code>
                        <button 
                          onClick={handleCopy}
                          className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-all text-xs font-semibold flex items-center gap-1.5 border border-white/10"
                          title="Copy Room ID"
                        >
                          {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                          <span>{copied ? "Copied" : "Copy"}</span>
                        </button>
                      </div>
                    </div>
                    
                    <button 
                      onClick={leaveRoom}
                      className="px-6 py-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white font-bold text-sm transition-all border border-red-500/20 flex items-center gap-2 shadow-lg"
                    >
                      <LogOut size={16} /> Leave Party
                    </button>
                  </div>
                </div>

                {/* Invite Friends Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold flex items-center gap-2 text-white">
                    <Users size={18} className="text-amber-400" /> Invite Friends to Room
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {users.length > 0 ? users.filter(u => !u.isGroup).map(user => (
                      <div key={user._id} className="glass-morphism p-3.5 rounded-2xl border border-white/10 flex items-center justify-between gap-3 hover:border-amber-500/30 transition-colors">
                        <div className="flex items-center gap-3 overflow-hidden min-w-0">
                          <Avatar user={user} size="sm" />
                          <span className="font-semibold text-sm text-white truncate">{user.username}</span>
                        </div>
                        <button 
                          onClick={() => inviteUser(user._id)}
                          className="p-2 rounded-xl bg-white/5 hover:bg-amber-500 text-zinc-400 hover:text-black transition-all border border-white/10 hover:border-amber-500 shrink-0"
                          title="Send Invitation"
                        >
                          <Send size={14} />
                        </button>
                      </div>
                    )) : (
                      <div className="col-span-full text-zinc-500 p-6 bg-surface rounded-2xl border border-white/5 text-center text-sm">
                        No friends available to invite. Add friends from the Social Hub.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-12">
                {/* Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Create Party Card */}
                  <div className="relative group">
                    <div className="absolute inset-0 bg-amber-500/10 rounded-3xl blur-xl transition-all duration-500 group-hover:opacity-100 opacity-40"></div>
                    <div className="relative h-full glass-morphism p-8 rounded-3xl border border-white/10 hover:border-amber-500/40 transition-all duration-300 flex flex-col justify-between gap-6 overflow-hidden">
                      <div className="relative z-10">
                        <div className="size-12 rounded-2xl bg-amber-500/15 border border-amber-500/20 flex items-center justify-center mb-5 text-amber-400">
                          <Plus size={22} />
                        </div>
                        <h3 className="text-2xl font-extrabold text-white mb-2">Host a Session</h3>
                        <p className="text-zinc-400 text-sm leading-relaxed">
                          Start a new synchronized room. Queue YouTube videos or audio, invite friends, and vibe together in real-time.
                        </p>
                      </div>
                      <button 
                        onClick={createRoom} 
                        className="btn-primary w-full py-3.5 rounded-xl text-sm font-bold shadow-[0_0_20px_rgba(245,158,11,0.25)] transition-all"
                      >
                        Create Party Room
                      </button>
                    </div>
                  </div>

                  {/* Join Party Card */}
                  <div className="relative group">
                    <div className="absolute inset-0 bg-white/5 rounded-3xl blur-xl transition-all duration-500 group-hover:opacity-100 opacity-40"></div>
                    <div className="relative h-full glass-morphism p-8 rounded-3xl border border-white/10 hover:border-white/20 transition-all duration-300 flex flex-col justify-between gap-6 overflow-hidden">
                      <div className="relative z-10">
                        <div className="size-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-5 text-zinc-300">
                          <Radio size={22} />
                        </div>
                        <h3 className="text-2xl font-extrabold text-white mb-2">Join an Existing Party</h3>
                        <p className="text-zinc-400 text-sm leading-relaxed">
                          Have a Room ID from a friend? Paste the code below to jump directly into their current playlist.
                        </p>
                      </div>
                      <form onSubmit={handleJoin} className="relative z-10 flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                          <input 
                            type="text" 
                            placeholder="e.g. room-7429..."
                            value={joinInput}
                            onChange={(e) => setJoinInput(e.target.value)}
                            className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-500 outline-none focus:border-amber-500 text-sm font-mono"
                          />
                        </div>
                        <button 
                          type="submit" 
                          disabled={!joinInput.trim()} 
                          className="btn-secondary px-6 py-3 rounded-xl text-sm font-bold shrink-0 disabled:opacity-40"
                        >
                          Join Party
                        </button>
                      </form>
                    </div>
                  </div>
                </div>

                {/* Active Public Rooms */}
                <div className="space-y-6">
                  <h2 className="text-lg font-bold flex items-center gap-2 text-white">
                    <Radio size={18} className="text-amber-400" /> 
                    Active Public Sessions
                  </h2>
                  
                  {activeMusicRooms.length === 0 ? (
                    <div className="glass-morphism p-10 rounded-3xl border border-white/5 flex items-center justify-center text-center">
                      <EmptyState
                        title="The party floor is quiet"
                        message="There are no public parties currently active. Start the first session and invite your crew!"
                        actionText="Start a Party"
                        onAction={createRoom}
                      />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {activeMusicRooms.map((room) => (
                        <motion.div 
                          key={room.roomId}
                          layout
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="glass-morphism p-5 rounded-2xl flex flex-col items-center gap-4 shadow-xl border border-white/10 group overflow-hidden relative hover-lift"
                        >
                          {room.currentVideo && (
                            <div className="absolute inset-0 z-0 opacity-15">
                              <img src={room.currentVideo.thumbnail} className="w-full h-full object-cover blur-xl" alt="" />
                            </div>
                          )}
                          <div className="relative z-10 w-full flex flex-col items-center text-center">
                            <div className="size-16 rounded-2xl bg-zinc-900 flex items-center justify-center mb-2 overflow-hidden border border-white/10 shadow-lg">
                               {room.currentVideo ? (
                                 <img src={room.currentVideo.thumbnail} className="w-full h-full object-cover" alt="" />
                               ) : (
                                 <Music className="size-7 text-amber-400" />
                               )}
                            </div>
                            <h3 className="font-bold text-base text-white truncate px-2 w-full">{room.hostName}'s Party</h3>
                            <p className="text-xs text-amber-400 font-semibold mt-0.5">{room.membersCount} listening</p>
                            {room.currentVideo && (
                              <p className="text-xs text-zinc-400 mt-2 truncate w-full px-2">
                                {room.currentVideo.title}
                              </p>
                            )}
                            {room.host === authUser._id ? (
                              <div className="mt-4 w-full flex gap-2">
                                <button 
                                  onClick={() => {
                                    useMusicStore.setState({ roomId: room.roomId, isPlayerOpen: true });
                                    useAuthStore.getState().socket.emit("joinMusicRoom", { roomId: room.roomId });
                                  }}
                                  className="w-full btn-primary py-2 rounded-xl text-xs font-bold"
                                >
                                  Return
                                </button>
                                <button 
                                  onClick={() => {
                                    useAuthStore.getState().socket.emit("leaveMusicRoom", { roomId: room.roomId });
                                  }}
                                  className="w-full py-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white text-xs font-semibold border border-red-500/20 transition-colors"
                                >
                                  Close
                                </button>
                              </div>
                            ) : (
                              <button 
                                onClick={() => joinRoom(room.roomId)}
                                className="mt-4 w-full btn-primary py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md"
                              >
                                <Play size={14} /> Join Party
                              </button>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MusicPage;

