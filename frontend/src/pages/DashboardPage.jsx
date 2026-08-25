import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useAuthStore } from "../store/useAuthStore";
import { axiosInstance } from "../lib/axios";
import { Search, UserPlus, Check, X, Users, Compass, Activity, Clock, UserCheck, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import EmptyState from "../components/EmptyState";
import UserCardSkeleton from "../components/skeletons/UserCardSkeleton";
import Avatar from "../components/Avatar";

const DashboardPage = () => {
  const { authUser, checkAuth } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [discoverUsers, setDiscoverUsers] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isDiscoverLoading, setIsDiscoverLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("discover"); // "discover", "requests"
  const [selectedProfile, setSelectedProfile] = useState(null);

  // Fetch all users for discover initially
  useEffect(() => {
    const fetchDiscover = async () => {
      try {
        const res = await axiosInstance.get(`/users/search?query=`);
        // Filter out already friends and self
        const nonFriends = res.data.filter(u => !authUser?.friends?.includes(u._id) && u._id !== authUser?._id);
        setDiscoverUsers(nonFriends);
      } catch (error) {
        console.error("Failed to fetch discover users");
      } finally {
        setIsDiscoverLoading(false);
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
      setSearchResults(res.data.filter(u => u._id !== authUser?._id));
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
      if (selectedProfile && selectedProfile._id === userId) {
        setSelectedProfile(prev => ({ ...prev, requestSent: true }));
      }
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
      checkAuth();
    } catch (error) {
      toast.error("Failed to process request");
    }
  };

  const UserCard = ({ user, isFriend, isPending }) => {
    const isSent = user.requestSent;

    return (
      <motion.div 
        layout
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={() => setSelectedProfile(user)}
        className="glass-morphism p-5 rounded-2xl flex flex-col items-center gap-4 hover-lift group relative overflow-hidden cursor-pointer border border-white/5 border-b-white/10 shadow-[inset_0_-1px_0_rgba(255,255,255,0.06)] hover:border-amber-500/30"
      >
        <div className="absolute top-0 w-full h-16 bg-gradient-to-b from-amber-500/5 to-transparent pointer-events-none" />
        
        <div className="relative mt-1">
          <Avatar user={user} size="xl" isOnline={useAuthStore.getState().onlineUsers?.includes(user._id)} />
        </div>
        
        <div className="text-center w-full min-w-0">
          <h3 className="font-bold text-base text-white truncate px-2 group-hover:text-amber-300 transition-colors">{user.username}</h3>
          <p className="text-xs text-zinc-500 truncate mt-0.5 px-2">{user.email}</p>
        </div>

        <div className="w-full pt-1">
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
              className="w-full py-2.5 rounded-xl text-xs font-semibold bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/20 border-b-red-500/30 transition-all flex items-center justify-center gap-1.5"
            >
              Remove Friend
            </button>
          ) : isSent ? (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                cancelRequest(user._id);
              }}
              className="w-full py-2.5 rounded-xl text-xs font-semibold bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/20 border-b-red-500/30 transition-all flex items-center justify-center gap-1.5"
            >
              <X size={14} /> Cancel Request
            </button>
          ) : isPending ? (
            <button 
              disabled
              className="w-full py-2.5 rounded-xl text-xs font-semibold bg-white/5 text-zinc-500 border border-white/5 border-b-white/10 cursor-not-allowed flex items-center justify-center gap-1.5"
            >
              <UserCheck size={14} /> Pending
            </button>
          ) : (
            /* Lighter / Outlined Secondary Style by default that fills solid only on hover/focus */
            <button 
              onClick={(e) => {
                e.stopPropagation();
                sendRequest(user._id);
              }}
              className="w-full py-2.5 rounded-xl text-xs font-semibold bg-white/[0.04] hover:bg-amber-500 text-zinc-300 hover:text-black border border-white/10 border-b-white/15 hover:border-amber-500 transition-all flex items-center justify-center gap-1.5 shadow-sm hover:shadow-[0_0_15px_rgba(245,158,11,0.3)]"
            >
              <UserPlus size={15} /> Add Friend
            </button>
          )}
        </div>
      </motion.div>
    );
  };

  const UserProfileModal = ({ user, onClose }) => {
    if (!user) return null;
    const isFriend = authUser?.friends?.includes(user._id);
    const isPending = user.requestSent || authUser?.friendRequests?.some(r => r.from === user._id || r.from?._id === user._id);
    const isOnline = useAuthStore.getState().onlineUsers?.includes(user._id);

    return createPortal(
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in" onClick={onClose}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-zinc-950 border border-white/10 border-b-white/20 shadow-[inset_0_-1px_0_rgba(255,255,255,0.08),0_25px_50px_-12px_rgba(0,0,0,0.7)] rounded-2xl p-8 max-w-sm w-full relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-amber-600"></div>
          
          <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors">
            <X size={18} />
          </button>
          
          <div className="flex flex-col items-center text-center">
            <div className="mb-4">
              <Avatar user={user} size="2xl" isOnline={isOnline} />
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">{user.username}</h2>
            <p className="text-xs text-amber-300/80 mt-2 font-medium bg-amber-500/10 border border-amber-500/20 px-3.5 py-1 rounded-full font-mono">
              {user.friends?.length || 0} Friends
            </p>
            {user.bio ? (
              <p className="mt-4 text-zinc-300 text-sm leading-relaxed max-w-[260px]">"{user.bio}"</p>
            ) : (
              <p className="mt-4 text-zinc-600 text-xs italic">No bio available</p>
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
                  className="w-full py-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white justify-center text-sm font-semibold transition-colors border border-red-500/20 border-b-red-500/30"
                >
                  Remove Friend
                </button>
              ) : user.requestSent ? (
                <button 
                  onClick={() => {
                    cancelRequest(user._id);
                    onClose();
                  }}
                  className="w-full py-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white justify-center text-sm font-semibold transition-colors border border-red-500/20 border-b-red-500/30"
                >
                  Cancel Request
                </button>
              ) : isPending ? (
                <button 
                  disabled
                  className="w-full py-3 rounded-xl bg-white/5 text-zinc-500 justify-center text-sm font-semibold border border-white/5 border-b-white/10 cursor-not-allowed"
                >
                  Request Pending
                </button>
              ) : (
                <button 
                  onClick={() => { 
                    sendRequest(user._id);
                  }}
                  className="w-full btn-primary py-3 rounded-xl text-sm font-bold justify-center transition-all shadow-lg flex items-center gap-2"
                >
                  <UserPlus size={16} /> Add Friend
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>,
      document.body
    );
  };

  return (
    <div className="h-full bg-bg overflow-y-auto custom-scrollbar">
      <div className="max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        
        {/* Masthead Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-500/90 block mb-1">Community Hub</span>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">Social Hub</h1>
            <p className="text-zinc-400 mt-1.5 text-sm font-normal flex items-center gap-2">
              <Activity size={15} className="text-amber-400" /> Connect with {discoverUsers.length} people worldwide
            </p>
          </div>
          
          <div className="flex bg-surface rounded-2xl p-1 border border-white/5 border-b-white/10 shadow-[inset_0_-1px_0_rgba(255,255,255,0.06)] w-full md:w-auto">
            <button 
              onClick={() => setActiveTab("discover")}
              className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${activeTab === "discover" ? "bg-amber-500/15 text-amber-300 border border-amber-500/20" : "text-zinc-400 hover:text-white hover:bg-white/5"}`}
            >
              <Compass size={17} /> Discover
            </button>
            <button 
              onClick={() => setActiveTab("requests")}
              className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${activeTab === "requests" ? "bg-amber-500/15 text-amber-300 border border-amber-500/20" : "text-zinc-400 hover:text-white hover:bg-white/5"}`}
            >
              <div className="relative">
                <Users size={17} />
                {(authUser?.friendRequests?.length > 0) && (
                  <span className="absolute -top-1 -right-2 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                  </span>
                )}
              </div>
              Requests
            </button>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="bg-surface p-2 pl-5 rounded-2xl flex items-center border border-white/10 border-b-white/15 shadow-[inset_0_-1px_0_rgba(255,255,255,0.06)] focus-within:border-amber-500/50 focus-within:shadow-[0_0_20px_rgba(245,158,11,0.1)] transition-all max-w-2xl">
          <Search className="text-zinc-500 shrink-0" size={18} />
          <form onSubmit={handleSearch} className="flex-1 flex gap-2 ml-3">
            <input
              type="text"
              className="w-full bg-transparent border-none outline-none text-white placeholder-zinc-500 py-2.5 text-base"
              placeholder="Search users by username or email..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (e.target.value === "") setSearchResults([]);
              }}
            />
            <button type="submit" className="btn-primary rounded-xl px-6 text-sm font-bold" disabled={isSearching}>
              {isSearching ? <span className="animate-pulse">...</span> : "Search"}
            </button>
          </form>
        </div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          <motion.div
            key={searchQuery ? "search" : activeTab}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25 }}
            className="w-full"
          >
            {searchQuery ? (
              <div className="space-y-6">
                <h2 className="text-lg font-bold flex items-center gap-2 text-white">
                  <Search size={18} className="text-amber-400" /> 
                  Search Results ({searchResults.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {isSearching ? (
                    Array(5).fill(0).map((_, i) => <UserCardSkeleton key={i} />)
                  ) : (
                    searchResults.map((user) => {
                      const isFriend = authUser?.friends?.includes(user._id);
                      const isPending = user.requestSent || authUser?.friendRequests?.some(r => r.from === user._id || r.from?._id === user._id);
                      return <UserCard key={user._id} user={user} isFriend={isFriend} isPending={isPending} />;
                    })
                  )}
                </div>
                {searchResults.length === 0 && !isSearching && (
                  <EmptyState 
                    variant="search"
                    title="No users found" 
                    message={`No accounts matched your search for "${searchQuery}".`} 
                  />
                )}
              </div>
            ) : activeTab === "discover" ? (
              <div className="space-y-6">
                <h2 className="text-lg font-bold flex items-center gap-2 text-white">
                  <Compass size={18} className="text-amber-400" /> 
                  People You Might Know
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {isDiscoverLoading ? (
                    Array(5).fill(0).map((_, i) => <UserCardSkeleton key={i} />)
                  ) : discoverUsers.length > 0 ? (
                    discoverUsers.map((user) => {
                      const isFriend = authUser?.friends?.includes(user._id);
                      const isPending = user.requestSent || authUser?.friendRequests?.some(r => r.from === user._id || r.from?._id === user._id);
                      return <UserCard key={user._id} user={user} isFriend={isFriend} isPending={isPending} />;
                    })
                  ) : (
                    <div className="col-span-full">
                      <EmptyState
                        variant="users"
                        title="You've connected with everyone!"
                        message="There are no more new discover profiles right now. Check back as new users join."
                      />
                    </div>
                  )}
                </div>
              </div>
            ) : activeTab === "requests" ? (
              <div className="space-y-6">
                <h2 className="text-lg font-bold flex items-center gap-2 text-white">
                  <Clock size={18} className="text-amber-400" /> 
                  Pending Friend Requests
                </h2>
                
                {(!authUser?.friendRequests || authUser.friendRequests.length === 0) ? (
                  <div className="pt-8">
                    <EmptyState 
                      variant="users"
                      title="You're all caught up!" 
                      message="Zero pending requests — you're completely up to speed. Ready to expand your circle?" 
                      actionText="Discover People"
                      onAction={() => setActiveTab("discover")}
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {authUser.friendRequests.map((request) => (
                      <motion.div 
                        key={request._id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="glass-morphism p-5 rounded-2xl flex flex-col items-center gap-4 shadow-xl border border-white/10 border-b-white/15"
                      >
                        <Avatar user={request.from} size="xl" />
                        <div className="text-center w-full">
                          <h3 className="font-bold text-base text-white truncate px-2">{request.from?.username}</h3>
                          <p className="text-xs text-amber-400 font-medium mt-0.5">Wants to connect</p>
                        </div>
                        <div className="flex gap-2.5 w-full mt-2">
                          <button 
                            onClick={() => handleRequest(request._id, "rejected")}
                            className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-red-500 hover:text-white text-zinc-400 justify-center text-xs font-semibold transition-colors border border-white/5 border-b-white/10 flex items-center gap-1.5"
                          >
                            <X size={16} /> Decline
                          </button>
                          <button 
                            onClick={() => handleRequest(request._id, "accepted")}
                            className="flex-1 btn-primary py-2.5 rounded-xl text-xs font-bold justify-center transition-all flex items-center gap-1.5"
                          >
                            <Check size={16} /> Accept
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

