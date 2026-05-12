import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { Users, Search, MessageSquare, MoreVertical, LogOut, LayoutDashboard } from "lucide-react";
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

  if (isUsersLoading) return <div className="w-20 lg:w-[400px] border-r border-[#313d45] flex flex-col p-4 bg-[#111b21]">Loading...</div>;

  return (
    <aside className="h-full w-20 lg:w-[400px] border-r border-[#313d45] flex flex-col transition-all duration-300 bg-[#111b21] z-10">
      {/* Sidebar Header (WhatsApp style) */}
      <div className="h-[60px] bg-[#202c33] px-4 flex items-center justify-between">
        <Link to="/profile">
          <img
            src={authUser?.profilePic || "/avatar.png"}
            alt="Profile"
            className="size-10 rounded-full object-cover cursor-pointer hover:opacity-90"
          />
        </Link>
        <div className="flex items-center gap-3 text-[#aebac1]">
          <Link to="/dashboard" title="Dashboard">
            <LayoutDashboard className="size-6 cursor-pointer hover:text-white" />
          </Link>
          <button onClick={logout} title="Logout">
            <LogOut className="size-6 cursor-pointer hover:text-white" />
          </button>
          <MoreVertical className="size-6 cursor-pointer hover:text-white" />
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-2 bg-[#111b21]">
        <div className="relative flex items-center bg-[#202c33] rounded-lg px-3 py-1.5 focus-within:bg-[#2a3942]">
          <Search className="size-4 text-[#8696a0] mr-3" />
          <input
            type="text"
            placeholder="Search or start new chat"
            className="bg-transparent border-none outline-none text-[#d1d7db] text-[14px] w-full placeholder-[#8696a0]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Online filter toggle */}
      <div className="px-4 py-2 border-b border-[#313d45]">
        <label className="cursor-pointer flex items-center gap-3">
          <input
            type="checkbox"
            checked={showOnlineOnly}
            onChange={(e) => setShowOnlineOnly(e.target.checked)}
            className="w-4 h-4 rounded border-[#313d45] accent-[#00a884] cursor-pointer"
          />
          <span className="text-sm font-medium text-[#8696a0]">Show online only</span>
        </label>
      </div>

      <div className="overflow-y-auto w-full custom-scrollbar flex-1">
        {filteredUsers.map((user) => (
          <button
            key={user._id}
            onClick={() => setSelectedUser(user)}
            className={`
              w-full h-[72px] px-4 flex items-center gap-4 cursor-pointer
              transition-colors duration-200 border-b border-[#313d45]/30
              ${selectedUser?._id === user._id ? "bg-[#2a3942]" : "hover:bg-[#202c33]"}
            `}
          >
            <div className="relative flex-shrink-0">
              <img
                src={user.profilePic || "/avatar.png"}
                alt={user.fullName}
                className="size-12 object-cover rounded-full"
              />
              {onlineUsers.includes(user._id) && (
                <span
                  className="absolute bottom-0.5 right-0.5 size-3 bg-[#00a884] 
                  rounded-full border-2 border-[#111b21]"
                />
              )}
            </div>

            <div className="hidden lg:flex flex-col text-left min-w-0 flex-1 border-b border-[#313d45]/0 py-3">
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium truncate text-[#d1d7db] text-[17px]">
                  {user.fullName}
                </span>
                <span className="text-[12px] text-[#8696a0]">
                  {onlineUsers.includes(user._id) ? "Active" : ""}
                </span>
              </div>
              <div className="text-[14px] truncate text-[#8696a0]">
                {onlineUsers.includes(user._id) ? "Active Now" : "Offline"}
              </div>
            </div>
          </button>
        ))}

        {filteredUsers.length === 0 && (
          <div className="text-center text-[#8696a0] py-8 font-medium">No contacts found</div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;

