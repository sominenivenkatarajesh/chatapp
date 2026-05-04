import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { Users, Search } from "lucide-react";

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  const filteredUsers = showOnlineOnly
    ? users.filter((user) => onlineUsers.includes(user._id))
    : users;

  if (isUsersLoading) return <div className="w-20 lg:w-[340px] border-r border-glass-border flex flex-col p-4 bg-bg-card">Loading...</div>;

  return (
    <aside className="h-full w-20 lg:w-[340px] border-r border-glass-border flex flex-col transition-all duration-300 bg-bg-card z-10">
      <div className="border-b border-glass-border w-full p-6">
        <div className="flex items-center gap-3 mb-4">
          <Users className="size-[22px] text-primary" />
          <span className="font-bold text-xl hidden lg:block tracking-tight">Chats</span>
        </div>
        {/* Online filter toggle */}
        <div className="hidden lg:flex items-center justify-between mt-2">
          <label className="cursor-pointer flex items-center gap-3">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="w-4 h-4 rounded border-glass-border accent-primary cursor-pointer"
            />
            <span className="text-sm font-medium text-text-secondary">Show online only</span>
          </label>
          <span className="text-xs font-bold text-primary px-2 py-1 bg-primary/10 rounded-full">
            {Math.max(0, onlineUsers.length - 1)}
          </span>
        </div>
      </div>

      <div className="overflow-y-auto w-full py-2 custom-scrollbar">
        {filteredUsers.map((user) => (
          <button
            key={user._id}
            onClick={() => setSelectedUser(user)}
            className={`
              w-full p-3 px-4 flex items-center gap-4 cursor-pointer
              transition-colors duration-200 border-l-[3px]
              ${selectedUser?._id === user._id ? "bg-white/10 border-primary" : "border-transparent hover:bg-white/5"}
            `}
          >
            <div className="relative mx-auto lg:mx-0 flex-shrink-0">
              <img
                src={user.profilePic || "/avatar.png"}
                alt={user.fullName}
                className="size-12 object-cover rounded-full border border-glass-border"
              />
              {onlineUsers.includes(user._id) && (
                <span
                  className="absolute bottom-0 right-0 size-3.5 bg-green-500 
                  rounded-full border-2 border-bg-card"
                />
              )}
            </div>

            {/* User info - only visible on larger screens */}
            <div className="hidden lg:block text-left min-w-0 flex-1">
              <div className="flex justify-between items-center mb-0.5">
                <div className={`font-semibold truncate text-[15px] ${selectedUser?._id === user._id ? "text-white" : "text-text-primary"}`}>
                  {user.fullName}
                </div>
              </div>
              <div className={`text-[13px] truncate ${onlineUsers.includes(user._id) ? "text-primary font-medium" : "text-text-muted"}`}>
                {onlineUsers.includes(user._id) ? "Active Now" : "Offline"}
              </div>
            </div>
          </button>
        ))}

        {filteredUsers.length === 0 && (
          <div className="text-center text-text-muted py-8 font-medium">No contacts found</div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
