import { Phone, Video, X, UserMinus } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useCallStore } from "../store/useCallStore";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers, checkAuth } = useAuthStore();
  const { initiateStream, callUser } = useCallStore();

  const handleCall = async () => {
    await initiateStream();
    callUser(selectedUser._id);
  };

  const handleRemoveFriend = async () => {
    if (!window.confirm(`Are you sure you want to remove ${selectedUser.fullName} from your friends?`)) return;
    try {
      await axiosInstance.delete(`/users/remove/${selectedUser._id}`);
      toast.success("Friend removed");
      setSelectedUser(null);
      checkAuth();
    } catch (error) {
      toast.error("Failed to remove friend");
    }
  };

  return (
    <div className="px-4 py-3 border-b border-white/5 bg-[#202c33] shadow-md z-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="relative cursor-pointer hover:opacity-80 transition-opacity">
            <img 
              src={selectedUser.profilePic || "/avatar.png"} 
              alt={selectedUser.fullName} 
              className="size-11 rounded-full object-cover border border-glass-border" 
            />
            {onlineUsers.includes(selectedUser._id) && (
              <span className="absolute bottom-0 right-0 size-3.5 bg-green-500 border-2 border-bg-card rounded-full"></span>
            )}
          </div>

          {/* User info */}
          <div>
            <h3 className="font-bold text-[16px] leading-tight tracking-wide">{selectedUser.fullName}</h3>
            <p className={`text-[13px] font-medium mt-0.5 ${onlineUsers.includes(selectedUser._id) ? "text-primary" : "text-text-muted"}`}>
              {onlineUsers.includes(selectedUser._id) ? "Active Now" : "Offline"}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button className="p-2.5 rounded-full hover:bg-white/10 text-primary transition-colors cursor-pointer" onClick={handleCall}>
            <Phone className="size-[22px]" />
          </button>
          <button className="p-2.5 rounded-full hover:bg-white/10 text-primary transition-colors cursor-pointer" onClick={handleCall}>
            <Video className="size-[22px]" />
          </button>
          <div className="w-px h-6 bg-glass-border mx-1"></div>
          <button className="p-2.5 rounded-full hover:bg-red-500/10 text-text-muted hover:text-red-500 transition-colors cursor-pointer" onClick={handleRemoveFriend} title="Remove Friend">
            <UserMinus className="size-5" />
          </button>
          <button className="p-2.5 rounded-full hover:bg-white/10 text-text-muted transition-colors cursor-pointer" onClick={() => setSelectedUser(null)}>
            <X className="size-[22px]" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
