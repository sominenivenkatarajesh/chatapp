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
    <aside className="h-full w-full lg:w-[400px] flex flex-col transition-all duration-300 bg-wa-sidebar z-10 border-r border-wa-border">
      {/* Sidebar Header */}
      <div className="h-[60px] bg-wa-panel px-4 flex items-center justify-between">
        <h2 className="text-wa-primary font-bold text-lg">Chats</h2>
        <div className="flex items-center gap-2 text-wa-secondary">
          <User size={20} />
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-3 py-2 bg-wa-sidebar border-b border-wa-border/30">
        <div className="relative flex items-center bg-wa-panel rounded-lg px-3 py-1.5 focus-within:bg-wa-active transition-colors">
          <Search className="size-4 text-wa-secondary mr-4" />
          <input
            type="text"
            placeholder="Search contacts..."
            className="bg-transparent border-none outline-none text-wa-primary text-[14px] w-full placeholder-wa-muted"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Stats Summary */}
      <div className="px-4 py-3 bg-wa-sidebar border-b border-wa-border/10 flex justify-between items-center">
        <span className="text-[12px] text-wa-accent font-bold uppercase tracking-wider">
          {onlineCount} Online
        </span>
        <span className="text-[12px] text-wa-muted font-bold uppercase tracking-wider">
          {users.length} Total
        </span>
      </div>

      {/* User List */}
      <div className="overflow-y-auto w-full custom-scrollbar flex-1 bg-wa-sidebar">
        {filteredUsers.map((user) => {
          const isOnline = onlineUsers?.includes(user._id);
          return (
            <button
              key={user._id}
              onClick={() => setSelectedUser(user)}
              className={`
                w-full h-[72px] px-3 flex items-center gap-3 cursor-pointer
                transition-colors duration-100
                ${selectedUser?._id === user._id ? "bg-wa-active" : "hover:bg-wa-hover"}
              `}
            >
              <div className="relative flex-shrink-0 ml-1">
                <img
                  src={user.profilePic || "/avatar.png"}
                  alt={user.fullName}
                  className="size-12 object-cover rounded-full"
                />
                <span
                  className={`absolute bottom-0.5 right-0.5 size-3 rounded-full border-2 border-wa-sidebar
                    ${isOnline ? "bg-wa-accent" : "bg-[#3b4a54]"}
                  `}
                />
              </div>

              <div className="flex flex-col text-left min-w-0 flex-1 h-full justify-center border-b border-wa-border/30 pr-2">
                <div className="flex justify-between items-center">
                  <span className="font-normal truncate text-wa-primary text-[17px]">
                    {user.fullName}
                  </span>
                  <span className={`text-[12px] ${isOnline ? "text-wa-accent font-medium" : "text-wa-muted"}`}>
                  {isOnline ? "online" : "offline"}
                </span>
              </div>
              <div className="flex justify-between items-center mt-0.5">
                <div className="text-[14px] truncate text-wa-secondary flex-1">
                  {isOnline ? "Active now" : "Last seen recently"}
                </div>
                {(unreadCounts?.[user._id] || 0) > 0 && (
                  <div className="bg-wa-accent text-white text-[11px] font-bold min-w-[20px] h-[20px] rounded-full flex items-center justify-center px-1 animate-in zoom-in duration-300">
                    {unreadCounts[user._id]}
                  </div>
                )}
              </div>
            </div>
          </button>
        );
      })}


        {filteredUsers.length === 0 && (
          <div className="text-center text-wa-muted py-12 px-6">
            <p className="text-sm font-medium">No contacts found</p>
            <p className="text-xs mt-1">Try a different search term</p>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;




