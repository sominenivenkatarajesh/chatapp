import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { Users, Search, MessageSquare, MoreVertical, LogOut, LayoutDashboard, CircleDashed, MessageSquarePlus, Users2 } from "lucide-react";
import { Link } from "react-router-dom";

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading } = useChatStore();
  const { onlineUsers, authUser, logout } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  const filteredUsers = users
    .filter((user) => (showOnlineOnly ? onlineUsers.includes(user._id) : true))
    .filter((user) => user.fullName.toLowerCase().includes(searchTerm.toLowerCase()));

  if (isUsersLoading) return <div className="w-[400px] border-r border-wa-border flex flex-col bg-wa-sidebar"></div>;

  return (
    <aside className="h-full w-full lg:w-[400px] flex flex-col transition-all duration-300 bg-wa-sidebar z-10">
      {/* Sidebar Header (WhatsApp style) */}
      <div className="h-[60px] bg-wa-panel px-4 flex items-center justify-between">
        <Link to="/profile">
          <img
            src={authUser?.profilePic || "/avatar.png"}
            alt="Profile"
            className="size-10 rounded-full object-cover cursor-pointer hover:opacity-90"
          />
        </Link>
        <div className="flex items-center gap-2">
          <button className="wa-icon-btn" title="Community"><Users2 size={20} /></button>
          <button className="wa-icon-btn" title="Status"><CircleDashed size={20} /></button>
          <button className="wa-icon-btn" title="New Chat"><MessageSquarePlus size={20} /></button>
          <div className="relative group">
            <button className="wa-icon-btn" title="Menu"><MoreVertical size={20} /></button>
            <div className="absolute right-0 top-full mt-1 w-48 bg-wa-panel shadow-xl rounded-md hidden group-hover:block z-50 border border-wa-border">
              <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 hover:bg-wa-active text-wa-primary text-sm">
                <LayoutDashboard size={18} /> Dashboard
              </Link>
              <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-wa-active text-[#ed4956] text-sm">
                <LogOut size={18} /> Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-3 py-2 bg-wa-sidebar border-b border-wa-border/30">
        <div className="relative flex items-center bg-wa-panel rounded-lg px-3 py-1.5 focus-within:bg-wa-active transition-colors">
          <Search className="size-4 text-wa-secondary mr-4" />
          <input
            type="text"
            placeholder="Search or start new chat"
            className="bg-transparent border-none outline-none text-wa-primary text-[14px] w-full placeholder-wa-muted"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Filter Chips */}
      <div className="px-3 py-2 flex gap-2">
        <button 
          onClick={() => setShowOnlineOnly(false)}
          className={`px-3 py-1.5 rounded-full text-[13px] font-medium transition-colors ${!showOnlineOnly ? 'bg-wa-accent/20 text-wa-accent' : 'bg-wa-panel text-wa-secondary hover:bg-wa-active'}`}
        >
          All
        </button>
        <button 
          onClick={() => setShowOnlineOnly(true)}
          className={`px-3 py-1.5 rounded-full text-[13px] font-medium transition-colors ${showOnlineOnly ? 'bg-wa-accent/20 text-wa-accent' : 'bg-wa-panel text-wa-secondary hover:bg-wa-active'}`}
        >
          Online
        </button>
      </div>

      {/* User List */}
      <div className="overflow-y-auto w-full custom-scrollbar flex-1 bg-wa-sidebar">
        {filteredUsers.map((user) => (
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
              {onlineUsers.includes(user._id) && (
                <span
                  className="absolute bottom-0 right-0 size-3 bg-wa-accent 
                  rounded-full border-2 border-wa-sidebar"
                />
              )}
            </div>

            <div className="flex flex-col text-left min-w-0 flex-1 h-full justify-center border-b border-wa-border/30 pr-2">
              <div className="flex justify-between items-center">
                <span className="font-normal truncate text-wa-primary text-[17px]">
                  {user.fullName}
                </span>
                <span className="text-[12px] text-wa-muted">
                  {onlineUsers.includes(user._id) ? "online" : ""}
                </span>
              </div>
              <div className="text-[14px] truncate text-wa-secondary mt-0.5">
                {onlineUsers.includes(user._id) ? "Active now" : "Offline"}
              </div>
            </div>
          </button>
        ))}

        {filteredUsers.length === 0 && (
          <div className="text-center text-wa-muted py-8 font-medium text-sm">No contacts found</div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;


