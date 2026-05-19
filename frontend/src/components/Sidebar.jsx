import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { Search, User } from "lucide-react";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading, unreadCounts } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  // Sort and filter users
  const filteredUsers = users
    .filter((user) => (user?.fullName || "").toLowerCase().includes((searchTerm || "").toLowerCase()))
    .sort((a, b) => {
      const aOnline = onlineUsers?.includes(a._id);
      const bOnline = onlineUsers?.includes(b._id);
      if (aOnline && !bOnline) return -1;
      if (!aOnline && bOnline) return 1;
      return 0;
    });

  const onlineCount = users.filter(u => onlineUsers?.includes(u._id)).length;

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-full lg:w-[360px] flex flex-col bg-[#0f0f13]/80 backdrop-blur-2xl z-10 border-r border-white/5 transition-all duration-300">
      {/* Sidebar Header */}
      <div className="h-[72px] px-6 flex items-center justify-between border-b border-white/5 bg-transparent">
        <h2 className="text-white font-extrabold text-xl tracking-tight flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 text-white"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
          </span>
          Messages
        </h2>
        <div className="flex items-center gap-3 text-white/50">
          <button className="hover:text-white hover:bg-white/10 p-2 rounded-full transition-all">
            <User size={20} />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-5 py-4 border-b border-white/5 bg-transparent">
        <div className="relative flex items-center bg-black/20 border border-white/5 rounded-2xl px-4 py-2.5 focus-within:bg-black/40 focus-within:border-indigo-500/50 focus-within:shadow-[0_0_15px_rgba(99,102,241,0.15)] transition-all">
          <Search className="size-4.5 text-white/40 mr-3" />
          <input
            type="text"
            placeholder="Search conversations..."
            className="bg-transparent border-none outline-none text-white text-[14px] w-full placeholder-white/30"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Stats Summary */}
      <div className="px-6 py-3 flex justify-between items-center text-xs font-semibold tracking-wider uppercase text-white/40 bg-transparent">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
          {onlineCount} Online
        </span>
        <span>
          {users.length} Total
        </span>
      </div>

      {/* User List */}
      <div className="overflow-y-auto w-full custom-scrollbar flex-1 px-3 space-y-1 pb-4">
        {filteredUsers.map((user) => {
          const isOnline = onlineUsers?.includes(user._id);
          const isSelected = selectedUser?._id === user._id;
          
          return (
            <button
              key={user._id}
              onClick={() => setSelectedUser(user)}
              className={`
                w-full p-3 flex items-center gap-3 cursor-pointer rounded-2xl
                transition-all duration-200 border border-transparent
                ${isSelected 
                  ? "bg-white/10 border-white/10 shadow-lg backdrop-blur-md" 
                  : "hover:bg-white/5 hover:border-white/5"}
              `}
            >
              <div className="relative flex-shrink-0">
                <img
                  src={user.profilePic || "/avatar.png"}
                  alt={user.fullName}
                  className={`size-12 object-cover rounded-2xl transition-transform duration-300 ${isSelected ? "scale-105 shadow-md" : ""}`}
                />
                {isOnline && (
                  <span className="absolute -bottom-1 -right-1 size-3.5 rounded-full bg-emerald-500 border-2 border-[#0f0f13] shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                )}
              </div>

              <div className="flex flex-col text-left min-w-0 flex-1 justify-center pr-1">
                <div className="flex justify-between items-center mb-0.5">
                  <span className={`font-semibold truncate text-[15px] ${isSelected ? "text-white" : "text-white/90"}`}>
                    {user.fullName}
                  </span>
                  <span className={`text-[11px] font-medium tracking-wide ${isOnline ? "text-emerald-400" : "text-white/30"}`}>
                    {isOnline ? "ONLINE" : "OFFLINE"}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className={`text-[13px] truncate flex-1 ${isSelected ? "text-indigo-200" : "text-white/50"}`}>
                    {isOnline ? "Active now" : "Last seen recently"}
                  </div>
                  {(unreadCounts?.[user._id] || 0) > 0 && (
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-[11px] font-bold min-w-[20px] h-[20px] rounded-full flex items-center justify-center px-1.5 shadow-[0_2px_8px_rgba(99,102,241,0.5)] animate-in zoom-in duration-300">
                      {unreadCounts[user._id]}
                    </div>
                  )}
                </div>
              </div>
            </button>
          );
        })}


        {filteredUsers.length === 0 && (
          <div className="text-center text-white/40 py-16 px-6 flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <Search size={24} className="opacity-50" />
            </div>
            <p className="text-sm font-semibold text-white/70">No conversations found</p>
            <p className="text-xs mt-1.5 opacity-70">Try searching for a different name</p>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;




