import { useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { axiosInstance } from "../lib/axios";
import { Search, UserPlus, Check, X, Users } from "lucide-react";
import toast from "react-hot-toast";

const DashboardPage = () => {
  const { authUser, checkAuth } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
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
      // Update local state to immediately disable the button
      setSearchResults(prev => prev.map(u => u._id === userId ? { ...u, requestSent: true } : u));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send request");
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

  return (
    <div className="h-full py-8 bg-bg-main overflow-y-auto custom-scrollbar">
      <div className="max-w-6xl mx-auto p-4 space-y-8">
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-morphism p-6 rounded-2xl border border-glass-border flex items-center gap-4 hover:border-primary/50 transition-colors">
            <div className="p-4 bg-primary/10 text-primary rounded-xl">
              <Users size={24} />
            </div>
            <div>
              <p className="text-text-secondary text-sm">Total Friends</p>
              <p className="text-2xl font-bold">{authUser?.friends?.length || 0}</p>
            </div>
          </div>
          
          <div className="glass-morphism p-6 rounded-2xl border border-glass-border flex items-center gap-4 hover:border-primary/50 transition-colors">
            <div className="p-4 bg-yellow-500/10 text-yellow-500 rounded-xl">
              <UserPlus size={24} />
            </div>
            <div>
              <p className="text-text-secondary text-sm">Pending Requests</p>
              <p className="text-2xl font-bold">{authUser?.friendRequests?.length || 0}</p>
            </div>
          </div>

          <div className="glass-morphism p-6 rounded-2xl border border-glass-border flex items-center gap-4 hover:border-primary/50 transition-colors">
            <div className="p-4 bg-green-500/10 text-green-500 rounded-xl">
              <Check size={24} />
            </div>
            <div>
              <p className="text-text-secondary text-sm">Profile Status</p>
              <p className="text-2xl font-bold">Active</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Search Section */}
          <section className="glass-morphism p-8 rounded-2xl border border-glass-border flex flex-col h-[500px]">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Search className="text-primary" /> Find People
            </h2>
            <form onSubmit={handleSearch} className="flex gap-4 mb-6">
              <input
                type="text"
                className="input-field pl-5 flex-1"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="btn btn-primary px-6" disabled={isSearching}>
                {isSearching ? "..." : "Search"}
              </button>
            </form>

            <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
              {searchResults.length === 0 && !isSearching && (
                <div className="h-full flex items-center justify-center text-text-secondary">
                  Search for users to add them as friends
                </div>
              )}
              {searchResults.map((user) => {
                const isFriend = authUser?.friends?.includes(user._id);
                // The user has sent a request to us, OR we have sent a request to them
                const isPending = user.requestSent || authUser?.friendRequests?.some(r => r.from === user._id);
                
                return (
                  <div key={user._id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-glass-border hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-3">
                      <img src={user.profilePic || "/avatar.png"} alt="" className="size-10 rounded-full object-cover" />
                      <div>
                        <div className="font-medium">{user.fullName}</div>
                        <div className="text-xs text-text-secondary">{user.email}</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {isFriend ? (
                        <button 
                          onClick={async () => {
                            try {
                              await axiosInstance.delete(`/users/remove/${user._id}`);
                              toast.success("Friend removed");
                              checkAuth();
                            } catch (error) {
                              toast.error("Failed to remove friend");
                            }
                          }}
                          className="btn btn-sm bg-red-500/10 text-red-500 hover:bg-red-500/20"
                        >
                          Remove
                        </button>
                      ) : (
                        <button 
                          onClick={() => sendRequest(user._id)}
                          className="btn btn-sm bg-primary/10 text-primary hover:bg-primary/20"
                          disabled={isPending}
                        >
                          {isPending ? "Pending" : <UserPlus size={16} />}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Requests Section */}
          <section className="glass-morphism p-8 rounded-2xl border border-glass-border flex flex-col h-[500px]">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Users className="text-primary" /> Friend Requests
            </h2>
            <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
              {(!authUser?.friendRequests || authUser.friendRequests.length === 0) ? (
                <div className="h-full flex items-center justify-center text-text-secondary flex-col gap-2">
                  <div className="p-4 bg-white/5 rounded-full">
                    <Users size={32} className="opacity-50" />
                  </div>
                  <p>No pending friend requests</p>
                </div>
              ) : (
                authUser.friendRequests.map((request) => (
                  <div key={request._id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-glass-border hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-3">
                      <img src={request.from?.profilePic || "/avatar.png"} alt="" className="size-10 rounded-full object-cover" />
                      <div>
                        <div className="font-medium">{request.from?.fullName}</div>
                        <div className="text-xs text-text-secondary">Wants to be friends</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleRequest(request._id, "accepted")}
                        className="btn btn-sm bg-green-500/20 text-green-500 hover:bg-green-500/30"
                      >
                        <Check size={16} />
                      </button>
                      <button 
                        onClick={() => handleRequest(request._id, "rejected")}
                        className="btn btn-sm bg-red-500/20 text-red-500 hover:bg-red-500/30"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
