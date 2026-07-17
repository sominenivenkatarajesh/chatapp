import { useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useMusicStore } from "../store/useMusicStore";
import { Music, Play, Plus, Users, Copy, Check, LogOut, Send, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import Avatar from "../components/Avatar";

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
    toast.success("Room ID copied!");
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
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <Music className="size-10 text-primary" /> Listening Parties
            </h1>
            <p className="text-zinc-400 mt-2 text-sm font-medium">
              Join your friends and listen to music or watch videos together in real-time.
            </p>
          </div>
        </div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          <motion.div
            key={roomId ? "active-room" : "room-list"}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            {roomId ? (
              <div className="space-y-8">
                {/* Active Room Dashboard */}
                <div className="glass-morphism p-8 rounded-2xl border border-white/10 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-primary/50 to-purple-500/50 pointer-events-none left-0" />
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                      <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Activity className="text-primary animate-pulse" size={24} /> 
                        You are in a Listening Party
                      </h2>
                      <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-black/40 p-3 rounded-xl border border-white/5">
                        <span className="text-zinc-400 font-medium whitespace-nowrap">Room ID:</span>
                        <code className="text-white bg-white/10 px-3 py-1 rounded font-mono text-lg">{roomId}</code>
                        <button 
                          onClick={handleCopy}
                          className="btn bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg transition-all flex-shrink-0"
                          title="Copy Room ID"
                        >
                          {copied ? <Check size={18} className="text-green-400" /> : <Copy size={18} />}
                        </button>
                      </div>
                    </div>
                    <button 
                      onClick={leaveRoom}
                      className="btn bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white px-6 py-3 rounded-xl font-bold transition-colors shadow-lg"
                    >
                      <LogOut size={18} className="mr-2" /> Leave Party
                    </button>
                  </div>
                </div>

                {/* Invite Friends Section */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Users size={20} className="text-primary" /> Invite Friends
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {users.length > 0 ? users.map(user => (
                      <div key={user._id} className="glass-morphism p-4 rounded-xl border border-white/10 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <Avatar user={user} size="sm" />
                          <span className="font-bold truncate">{user.username}</span>
                        </div>
                        <button 
                          onClick={() => inviteUser(user._id)}
                          className="btn bg-primary/20 text-indigo-300 hover:bg-primary hover:text-white p-2 rounded-lg transition-colors flex-shrink-0"
                          title="Invite"
                        >
                          <Send size={16} />
                        </button>
                      </div>
                    )) : (
                      <div className="col-span-full text-zinc-500 p-4 bg-white/5 rounded-xl border border-white/5">
                        No friends available to invite.
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
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-2xl blur-xl transition-all duration-300 group-hover:opacity-100 opacity-50"></div>
                    <div className="relative h-full glass-morphism p-8 rounded-2xl border border-white/10 hover:border-indigo-500/50 transition-all duration-300 flex flex-col justify-between gap-6 overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-10">
                         <Music size={100} />
                      </div>
                      <div className="relative z-10">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center mb-4 text-indigo-400">
                          <Plus size={24} />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Start a New Party</h3>
                        <p className="text-zinc-400 text-sm leading-relaxed">
                          Create a private listening room. Invite your friends, share the queue, and vibe together in real-time.
                        </p>
                      </div>
                      <button onClick={createRoom} className="btn-primary w-full py-4 rounded-xl text-lg relative z-10 group-hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all">
                        Create Room
                      </button>
                    </div>
                  </div>

                  {/* Join Party Card */}
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur-xl transition-all duration-300 group-hover:opacity-100 opacity-50"></div>
                    <div className="relative h-full glass-morphism p-8 rounded-2xl border border-white/10 hover:border-purple-500/50 transition-all duration-300 flex flex-col justify-between gap-6 overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-10">
                         <Users size={100} />
                      </div>
                      <div className="relative z-10">
                        <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center mb-4 text-purple-400">
                          <Users size={24} />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Join an Existing Party</h3>
                        <p className="text-zinc-400 text-sm leading-relaxed">
                          Already have a Room ID from a friend? Paste it below and jump right into the music.
                        </p>
                      </div>
                      <form onSubmit={handleJoin} className="relative z-10 flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                          <input 
                            type="text" 
                            placeholder="Enter Room ID..."
                            value={joinInput}
                            onChange={(e) => setJoinInput(e.target.value)}
                            className="input-field w-full pl-4 bg-black/40 h-[52px]"
                          />
                        </div>
                        <button type="submit" disabled={!joinInput.trim()} className="btn-primary px-8 h-[52px] rounded-xl flex-shrink-0 disabled:opacity-50">
                          Join
                        </button>
                      </form>
                    </div>
                  </div>
                </div>

                {/* Active Public Rooms */}
                <div className="space-y-6">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Music size={20} className="text-primary" /> 
                    Public Listening Parties
                  </h2>
                  
                  {activeMusicRooms.length === 0 ? (
                    <div className="glass-morphism p-12 rounded-2xl border-dashed border-2 border-white/10 flex items-center justify-center text-zinc-400 flex-col gap-5 max-w-3xl mx-auto mt-6 text-center hover:border-indigo-500/30 transition-colors">
                      <div className="relative">
                        <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-xl animate-pulse"></div>
                        <div className="relative p-6 bg-zinc-900/80 rounded-full border border-white/10 shadow-2xl backdrop-blur-sm">
                          <Music size={40} className="text-indigo-400/70" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-2">It's quiet here...</h3>
                        <p className="text-zinc-500">No public parties are currently active. Be the first to start one!</p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {activeMusicRooms.map((room) => (
                        <motion.div 
                          key={room.roomId}
                          layout
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="glass-morphism p-5 rounded-2xl flex flex-col items-center gap-4 shadow-xl border border-white/10 group overflow-hidden relative hover-lift"
                        >
                          {room.currentVideo && (
                            <div className="absolute inset-0 z-0 opacity-20">
                              <img src={room.currentVideo.thumbnail} className="w-full h-full object-cover blur-xl" alt="" />
                            </div>
                          )}
                          <div className="relative z-10 w-full flex flex-col items-center text-center">
                            <div className="size-20 rounded-2xl bg-zinc-800 flex items-center justify-center mb-2 overflow-hidden border border-white/10 shadow-lg">
                               {room.currentVideo ? (
                                 <img src={room.currentVideo.thumbnail} className="w-full h-full object-cover" alt="" />
                               ) : (
                                 <Music className="size-8 text-zinc-500" />
                               )}
                            </div>
                            <h3 className="font-bold text-lg truncate px-2 w-full">{room.hostName}'s Room</h3>
                            <p className="text-xs text-primary font-medium mt-1">{room.membersCount} listening</p>
                            {room.currentVideo && (
                              <p className="text-xs text-zinc-400 mt-2 truncate w-full px-4">
                                Now playing: {room.currentVideo.title}
                              </p>
                            )}
                            {room.host === authUser._id ? (
                              <div className="mt-4 w-full flex gap-2">
                                <button 
                                  onClick={() => {
                                    useMusicStore.setState({ roomId: room.roomId, isPlayerOpen: true });
                                    // re-join the socket room to start receiving events again
                                    useAuthStore.getState().socket.emit("joinMusicRoom", { roomId: room.roomId });
                                  }}
                                  className="w-full btn bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500 hover:text-white justify-center py-2 transition-colors shadow-lg"
                                >
                                  Return
                                </button>
                                <button 
                                  onClick={() => {
                                    useAuthStore.getState().socket.emit("leaveMusicRoom", { roomId: room.roomId });
                                  }}
                                  className="w-full btn bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white justify-center py-2 transition-colors shadow-lg"
                                >
                                  Close
                                </button>
                              </div>
                            ) : (
                              <button 
                                onClick={() => joinRoom(room.roomId)}
                                className="mt-4 w-full btn bg-primary/20 text-primary hover:bg-primary hover:text-black justify-center py-2 transition-colors shadow-lg"
                              >
                                <Play size={16} className="mr-2" /> Join Party
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
