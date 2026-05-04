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

  if (isUsersLoading) return <div className="w-20 lg:w-72 border-r border-glass-border flex flex-col p-4">Loading...</div>;

  return (
    <aside className="h-full w-20 lg:w-80 bg-black/10 border-r border-glass-border flex flex-col transition-all duration-300 relative z-20">
      <div className="border-b border-glass-border w-full p-4 lg:p-6 bg-white/5 backdrop-blur-md shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/20 rounded-xl text-primary">
            <Users className="size-5 lg:size-6" />
          </div>
          <span className="font-bold text-lg hidden lg:block tracking-wide">Contacts</span>
        </div>
        {/* Online filter toggle */}
        <div className="mt-4 hidden lg:flex items-center justify-between">
          <label className="cursor-pointer flex items-center gap-2 group">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="checkbox checkbox-sm checkbox-primary rounded-md"
            />
            <span className="text-sm font-medium text-text-muted group-hover:text-white transition-colors">Show online only</span>
          </label>
          <span className="text-xs font-bold px-2 py-1 bg-green-500/20 text-green-400 rounded-full border border-green-500/30">
            {Math.max(0, onlineUsers.length - 1)} Online
          </span>
        </div>
      </div>

      <div className="overflow-y-auto w-full py-2 custom-scrollbar">
        {filteredUsers.map((user) => {
          const isOnline = onlineUsers.includes(user._id);
          const isSelected = selectedUser?._id === user._id;

          return (
            <button
              key={user._id}
              onClick={() => setSelectedUser(user)}
              className={`
                w-full p-3 lg:p-4 flex items-center gap-4
                transition-all duration-200 group border-b border-white/5 last:border-0
                ${isSelected 
                  ? "bg-primary/20 hover:bg-primary/30 border-l-4 border-l-primary" 
                  : "hover:bg-white/10 border-l-4 border-l-transparent"
                }
              `}
            >
              <div className="relative mx-auto lg:mx-0">
                <div className={`size-12 rounded-full overflow-hidden border-2 transition-colors ${isSelected ? 'border-primary' : 'border-transparent group-hover:border-primary/50'}`}>
                  <img
                    src={user.profilePic || "/avatar.png"}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                {isOnline && (
                  <span
                    className="absolute bottom-0 right-0 size-3.5 bg-green-500 
                    rounded-full border-2 border-bg-main"
                  />
                )}
              </div>

              {/* User info - only visible on larger screens */}
              <div className="hidden lg:block text-left min-w-0 flex-1">
                <div className="flex justify-between items-center mb-1">
                  <div className={`font-bold truncate ${isSelected ? 'text-white' : 'text-white/90'}`}>
                    {user.fullName}
                  </div>
                </div>
                <div className={`text-xs font-medium ${isOnline ? 'text-green-400' : 'text-text-muted'}`}>
                  {isOnline ? "Active Now" : "Offline"}
                </div>
              </div>
            </button>
          );
        })}

        {filteredUsers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
            <div className="p-4 rounded-full bg-white/5">
              <Users className="size-8 text-text-muted opacity-50" />
            </div>
            <div className="text-text-muted font-medium text-sm px-4">
              {showOnlineOnly ? "No friends online right now" : "No friends found"}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
