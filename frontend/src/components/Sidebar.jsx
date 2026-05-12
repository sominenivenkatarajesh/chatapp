import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { Search } from "lucide-react";

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  // Filter to show ONLY online users
  const filteredUsers = users
    .filter((user) => onlineUsers.includes(user._id))
    .filter((user) => user.fullName.toLowerCase().includes(searchTerm.toLowerCase()));

  if (isUsersLoading) return <div className="w-[400px] border-r border-wa-border flex flex-col bg-wa-sidebar"></div>;

  return (
    <aside className="h-full w-full lg:w-[400px] flex flex-col transition-all duration-300 bg-wa-sidebar z-10 border-r border-wa-border">
      {/* Sidebar Header - Simplified */}
      <div className="h-[60px] bg-wa-panel px-4 flex items-center">
        <h2 className="text-wa-primary font-bold text-lg">Chats</h2>
      </div>

      {/* Search Bar */}
      <div className="px-3 py-2 bg-wa-sidebar border-b border-wa-border/30">
        <div className="relative flex items-center bg-wa-panel rounded-lg px-3 py-1.5 focus-within:bg-wa-active transition-colors">
          <Search className="size-4 text-wa-secondary mr-4" />
          <input
            type="text"
            placeholder="Search online users"
            className="bg-transparent border-none outline-none text-wa-primary text-[14px] w-full placeholder-wa-muted"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Online Users Count */}
      <div className="px-4 py-3 bg-wa-sidebar border-b border-wa-border/10">
        <span className="text-[13px] text-wa-accent font-medium uppercase tracking-wider">
          Online — {filteredUsers.length}
        </span>
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
              <span
                className="absolute bottom-0.5 right-0.5 size-3 bg-wa-accent 
                rounded-full border-2 border-wa-sidebar"
              />
            </div>

            <div className="flex flex-col text-left min-w-0 flex-1 h-full justify-center border-b border-wa-border/30 pr-2">
              <div className="flex justify-between items-center">
                <span className="font-normal truncate text-wa-primary text-[17px]">
                  {user.fullName}
                </span>
                <span className="text-[12px] text-wa-accent">
                  online
                </span>
              </div>
              <div className="text-[14px] truncate text-wa-secondary mt-0.5">
                Active now
              </div>
            </div>
          </button>
        ))}

        {filteredUsers.length === 0 && (
          <div className="text-center text-wa-muted py-12 px-6">
            <p className="text-sm font-medium">No one is online right now</p>
            <p className="text-xs mt-1">Check back later or search for other users</p>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;



