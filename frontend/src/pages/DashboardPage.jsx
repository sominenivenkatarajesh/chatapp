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
    <div className="h-screen pt-20 bg-bg-main overflow-y-auto">
      <div className="max-w-4xl mx-auto p-4 space-y-8">
        {/* Search Section */}
        <section className="glass-morphism p-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Search className="text-primary" /> Find Friends
          </h2>
          <form onSubmit={handleSearch} className="flex gap-4">
            <input
              type="text"
              className="input-field"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="btn btn-primary" disabled={isSearching}>
              {isSearching ? "Searching..." : "Search"}
            </button>
          </form>

          <div className="mt-8 space-y-4">
            {searchResults.map((user) => (
              <div key={user._id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-glass-border">
                <div className="flex items-center gap-3">
                  <img src={user.profilePic || "/avatar.png"} alt="" className="size-10 rounded-full object-cover" />
                  <div>
                    <div className="font-medium">{user.fullName}</div>
                    <div className="text-sm text-text-secondary">{user.email}</div>
                  </div>
                </div>
                <button 
                  onClick={() => sendRequest(user._id)}
                  className="btn btn-sm hover:bg-white/10"
                >
                  <UserPlus size={18} />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Requests Section */}
        {authUser?.friendRequests?.length > 0 && (
          <section className="glass-morphism p-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Users className="text-primary" /> Friend Requests
            </h2>
            <div className="space-y-4">
              {authUser.friendRequests.map((request) => (
                <div key={request._id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-glass-border">
                  <div className="flex items-center gap-3">
                    <img src={request.from?.profilePic || "/avatar.png"} alt="" className="size-10 rounded-full object-cover" />
                    <div className="font-medium">{request.from?.fullName}</div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleRequest(request._id, "accepted")}
                      className="btn btn-sm bg-green-500/20 text-green-500 hover:bg-green-500/30"
                    >
                      <Check size={18} />
                    </button>
                    <button 
                      onClick={() => handleRequest(request._id, "rejected")}
                      className="btn btn-sm bg-red-500/20 text-red-500 hover:bg-red-500/30"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
