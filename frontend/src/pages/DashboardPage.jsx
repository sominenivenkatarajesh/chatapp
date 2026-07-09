import { useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useMusicStore } from "../store/useMusicStore";
import { axiosInstance } from "../lib/axios";
import { Search, UserPlus, Check, X, Users, Compass, Activity, Clock, Music, Play } from "lucide-react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

const DashboardPage = () => {
  const { authUser, checkAuth } = useAuthStore();
  const { activeMusicRooms, joinRoom } = useMusicStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [discoverUsers, setDiscoverUsers] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState("discover"); // "discover", "requests"
  const [selectedProfile, setSelectedProfile] = useState(null);

  // Fetch all users for discover initially
  useEffect(() => {
    const fetchDiscover = async () => {
      try {
        const res = await axiosInstance.get(`/users/search?query=`);
        // Filter out already friends
        const nonFriends = res.data.filter(u => !authUser?.friends?.includes(u._id));
        setDiscoverUsers(nonFriends);
      } catch (error) {
        console.error("Failed to fetch discover users");
      }
    };
    if (authUser) {
      fetchDiscover();
    }
  }, [authUser]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const res = await axiosInstance.get(`/users/search?query=${searchQuery}`);
      setSearchResults(res.data);
    } catch (error) {
      toast.error("Search failed");
    } finally {
      setIsSearching(false);
    }
  };

  const sendRequest = async (userId) => {
    try {
      await axiosInstance.post(`/users/request/${userId}`);
      toast.success("Friend request sent!");
      
      // Update local state
      const updateFn = prev => prev.map(u => u._id === userId ? { ...u, requestSent: true } : u);
      setSearchResults(updateFn);
      setDiscoverUsers(updateFn);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send request");
    }
  };

  const cancelRequest = async (userId) => {
    try {
      await axiosInstance.delete(`/users/request/cancel/${userId}`);
      toast.success("Friend request cancelled");
      
      const updateFn = prev => prev.map(u => u._id === userId ? { ...u, requestSent: false } : u);
      setSearchResults(updateFn);
      setDiscoverUsers(updateFn);
      if (selectedProfile && selectedProfile._id === userId) {
        setSelectedProfile(prev => ({ ...prev, requestSent: false }));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to cancel request");
    }
  };

  const handleRequest = async (requestId, action) => {
    try {
      await axiosInstance.post("/users/request-handle", { requestId, action });
      toast.success(`Request ${action}`);
      checkAuth(); // Refresh user data to update friend lists
    } catch (error) {
      toast.error("Failed to process request");
    }
  };

  const UserCard = ({ user, isFriend, isPending }) => (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      onClick={() => setSelectedProfile(user)}
      className="glass-morphism p-5 rounded-2xl flex flex-col items-center gap-4 hover-lift group relative overflow-hidden cursor-pointer"
    >
      <div className="absolute top-0 w-full h-16 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
      
      <div className="relative">
        <img src={user.profilePic || "/avatar.svg"} alt="" className="size-20 rounded-[1.25rem] object-cover shadow-lg border border-white/10 group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute -bottom-2 -right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-full border border-white/10 flex items-center gap-1 shadow-xl">
          <div className="size-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[9px] font-bold uppercase tracking-wider text-green-400">Online</span>
        </div>
      </div>
      
      <div className="text-center w-full">
        <h3 className="font-bold text-lg truncate px-2">{user.username}</h3>
        <p className="text-xs text-text-secondary truncate mt-1 px-2">{user.email}</p>
      </div>

      <div className="w-full pt-2">
        {isFriend ? (
          <button 
            onClick={async (e) => {
              e.stopPropagation();
              try {
                await axiosInstance.delete(`/users/remove/${user._id}`);
                toast.success("Friend removed");
                checkAuth();
              } catch (error) {
                toast.error("Failed to remove friend");
              }
            }}
            className="w-full btn bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white justify-center py-2.5 transition-colors"
          >
            Remove Friend
          </button>
        ) : (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              if (user.requestSent) {
                cancelRequest(user._id);
              } else if (!isPending) {
                sendRequest(user._id);
              }
            }}
            className={`w-full btn justify-center py-2.5 transition-all shadow-lg ${user.requestSent ? 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white' : isPending ? 'bg-white/10 text-white/50 cursor-not-allowed' : 'btn-primary'}`}
            disabled={isPending && !user.requestSent}
          >
            {user.requestSent ? "Cancel Request" : isPending ? "Request Sent" : (
              <>
                <UserPlus size={18} /> Add Friend
              </>
            )}
          </button>
        )}
      </div>
    </motion.div>
  );

  const UserProfileModal = ({ user, onClose }) => {
    if (!user) return null;
    const isFriend = authUser?.friends?.includes(user._id);
    const isPending = user.requestSent || authUser?.friendRequests?.some(r => r.from === user._id);

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-zinc-950 border border-white/10 rounded-3xl p-8 max-w-sm w-full shadow-2xl relative"
        >
          <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors">
            <X size={20} />
          </button>
          
          <div className="flex flex-col items-center text-center">
            <img src={user.profilePic || "/avatar.svg"} alt={user.username} className="size-28 rounded-full object-cover border-4 border-white/5 shadow-xl mb-4" />
            <h2 className="text-2xl font-bold text-white">{user.username}</h2>
            <p className="text-sm text-zinc-400 mt-2 font-medium bg-white/5 px-4 py-1.5 rounded-full">
              {user.friends?.length || 0} Friends
            </p>
            {user.bio && (
              <p className="mt-4 text-zinc-300 text-sm leading-relaxed max-w-[250px]">"{user.bio}"</p>
            )}
            
            <div className="w-full mt-8">
              {isFriend ? (
                <button 
                  onClick={async () => {
                    try {
                      await axiosInstance.delete(`/users/remove/${user._id}`);
                      toast.success("Friend removed");
                      checkAuth();
                      onClose();
                    } catch (error) {
                      toast.error("Failed to remove friend");
                    }
                  }}
                  className="w-full btn bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white justify-center py-3 rounded-xl transition-colors"
                >
                  Remove Friend
                </button>
              ) : (
                <button 
                  onClick={() => { 
                    if (user.requestSent) {
                      cancelRequest(user._id);
                    } else if (!isPending) {
                      sendRequest(user._id);
                    }
                  }}
                  className={`w-full btn justify-center py-3 rounded-xl transition-all shadow-lg ${user.requestSent ? 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white' : isPending ? 'bg-white/10 text-white/50 cursor-not-allowed' : 'btn-primary'}`}
                  disabled={isPending && !user.requestSent}
                >
                  {user.requestSent ? "Cancel Request" : isPending ? "Request Sent" : (
                    <>
                      <UserPlus size={18} className="mr-2" /> Add Friend
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    );
  };

  return (
    <div className="h-full bg-[#09090b] overflow-y-auto custom-scrollbar">
      <div className="max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">Social Hub</h1>
            <p className="text-zinc-400 mt-2 text-sm font-medium flex items-center gap-2">
              <Activity size={16} className="text-primary" /> Connect with {discoverUsers.length} people worldwide
            </p>
          </div>
          
          <div className="flex bg-[#18181b] rounded-2xl p-1 border border-white/5 w-full md:w-auto">
            <button 
              onClick={() => setActiveTab("discover")}
              className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${activeTab === "discover" ? "bg-white/10 text-white" : "text-zinc-500 hover:text-white hover:bg-white/5"}`}
            >
              <Compass size={18} /> Discover
            </button>
            <button 
              onClick={() => setActiveTab("requests")}
              className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${activeTab === "requests" ? "bg-white/10 text-white" : "text-zinc-500 hover:text-white hover:bg-white/5"}`}
            >
              <div className="relative">
                <Users size={18} />
                {(authUser?.friendRequests?.length > 0) && (
                  <span className="absolute -top-1 -right-2 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                )}
              </div>
              Requests
            </button>
            <button 
              onClick={() => setActiveTab("music")}
              className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${activeTab === "music" ? "bg-white/10 text-white" : "text-zinc-500 hover:text-white hover:bg-white/5"}`}
            >
              <Music size={18} /> Listening Parties
              {activeMusicRooms.length > 0 && (
                <span className="ml-1 bg-primary text-black text-xs px-2 py-0.5 rounded-full">{activeMusicRooms.length}</span>
              )}
            </button>
          </div>
        </div>

        {/* Global Search */}
        <div className="bg-[#18181b] p-2 pl-6 rounded-[2rem] flex items-center border border-white/10 focus-within:border-primary/50 transition-all max-w-2xl">
          <Search className="text-zinc-500" size={20} />
          <form onSubmit={handleSearch} className="flex-1 flex gap-2 ml-4">
            <input
              type="text"
              className="w-full bg-transparent border-none outline-none text-white placeholder-zinc-500 py-3 text-lg"
              placeholder="Search users by username or email..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (e.target.value === "") setSearchResults([]);
              }}
            />
            <button type="submit" className="btn btn-primary rounded-xl px-8" disabled={isSearching}>
              {isSearching ? <span className="animate-pulse">...</span> : "Search"}
            </button>
          </form>
        </div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          <motion.div
            key={searchQuery ? "search" : activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            {searchQuery ? (
              <div className="space-y-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Search size={20} className="text-primary" /> 
                  Search Results ({searchResults.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {searchResults.map((user) => {
                    const isFriend = authUser?.friends?.includes(user._id);
                    const isPending = user.requestSent || authUser?.friendRequests?.some(r => r.from === user._id);
                    return <UserCard key={user._id} user={user} isFriend={isFriend} isPending={isPending} />;
                  })}
                </div>
                {searchResults.length === 0 && !isSearching && (
                  <div className="text-center py-20 text-zinc-500">No users found matching "{searchQuery}"</div>
                )}
              </div>
            ) : activeTab === "discover" ? (
              <div className="space-y-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Compass size={20} className="text-primary" /> 
                  People You Might Know
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {discoverUsers.map((user) => {
                    const isFriend = authUser?.friends?.includes(user._id);
                    const isPending = user.requestSent || authUser?.friendRequests?.some(r => r.from === user._id);
                    return <UserCard key={user._id} user={user} isFriend={isFriend} isPending={isPending} />;
                  })}
                </div>
              </div>
            ) : activeTab === "requests" ? (
              <div className="space-y-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Clock size={20} className="text-primary" /> 
                  Pending Friend Requests
                </h2>
                
                {(!authUser?.friendRequests || authUser.friendRequests.length === 0) ? (
                  <div className="glass-morphism p-12 rounded-3xl flex items-center justify-center text-text-secondary flex-col gap-4 max-w-2xl mx-auto mt-12 text-center">
                    <div className="p-6 bg-white/5 rounded-full border border-white/10 shadow-2xl">
                      <Users size={48} className="opacity-40" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">You're all caught up!</h3>
                      <p>You have no pending friend requests at the moment. Try discovering new people.</p>
                    </div>
                    <button onClick={() => setActiveTab("discover")} className="btn bg-white/10 hover:bg-white/20 mt-4 px-8 py-3 rounded-full">
                      Browse Discover
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {authUser.friendRequests.map((request) => (
                      <motion.div 
                        key={request._id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="glass-morphism p-5 rounded-2xl flex flex-col items-center gap-4 shadow-xl border border-white/10"
                      >
                        <img src={request.from?.profilePic || "/avatar.svg"} alt="" className="size-20 rounded-full object-cover shadow-lg border-2 border-primary/50" />
                        <div className="text-center w-full">
                          <h3 className="font-bold text-lg truncate px-2">{request.from?.username}</h3>
                          <p className="text-xs text-primary font-medium mt-1">Wants to connect</p>
                        </div>
                        <div className="flex gap-3 w-full mt-2">
                          <button 
                            onClick={() => handleRequest(request._id, "rejected")}
                            className="flex-1 btn bg-white/5 hover:bg-red-500 hover:text-white text-zinc-400 justify-center py-2.5 transition-colors border border-white/5"
                          >
                            <X size={18} />
                          </button>
                          <button 
                            onClick={() => handleRequest(request._id, "accepted")}
                            className="flex-1 btn bg-primary/20 text-indigo-300 hover:bg-primary hover:text-white justify-center py-2.5 transition-colors shadow-[0_0_15px_rgba(99,102,241,0.2)]"
                          >
                            <Check size={18} /> Accept
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            ) : activeTab === "music" ? (
              <div className="space-y-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Music size={20} className="text-primary" /> 
                  Active Listening Parties
                </h2>
                
                {activeMusicRooms.length === 0 ? (
                  <div className="glass-morphism p-12 rounded-3xl flex items-center justify-center text-text-secondary flex-col gap-4 max-w-2xl mx-auto mt-12 text-center">
                    <div className="p-6 bg-white/5 rounded-full border border-white/10 shadow-2xl">
                      <Music size={48} className="opacity-40" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">It's quiet here...</h3>
                      <p>None of your friends are hosting a listening party right now. Why not start one?</p>
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
                        className="glass-morphism p-5 rounded-2xl flex flex-col items-center gap-4 shadow-xl border border-white/10 group overflow-hidden relative"
                      >
                        {room.currentVideo && (
                          <div className="absolute inset-0 z-0 opacity-20">
                            <img src={room.currentVideo.thumbnail} className="w-full h-full object-cover blur-xl" />
                          </div>
                        )}
                        <div className="relative z-10 w-full flex flex-col items-center text-center">
                          <div className="size-20 rounded-2xl bg-zinc-800 flex items-center justify-center mb-2 overflow-hidden border border-white/10 shadow-lg">
                             {room.currentVideo ? (
                               <img src={room.currentVideo.thumbnail} className="w-full h-full object-cover" />
                             ) : (
                               <Music className="size-8 text-zinc-500" />
                             )}
                          </div>
                          <h3 className="font-bold text-lg truncate px-2 w-full">{room.hostName}'s Room</h3>
                          <p className="text-xs text-primary font-medium mt-1">{room.membersCount} listening</p>
                          {room.currentVideo && (
                            <p className="text-[10px] text-zinc-400 mt-2 truncate w-full px-4">
                              Now playing: {room.currentVideo.title}
                            </p>
                          )}
                          <button 
                            onClick={() => joinRoom(room.roomId)}
                            className="mt-4 w-full btn bg-primary/20 text-primary hover:bg-primary hover:text-black justify-center py-2 transition-colors shadow-lg"
                          >
                            <Play size={16} className="mr-2" /> Join Party
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            ) : null}
          </motion.div>
        </AnimatePresence>

        <AnimatePresence>
          {selectedProfile && (
            <UserProfileModal user={selectedProfile} onClose={() => setSelectedProfile(null)} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DashboardPage;
