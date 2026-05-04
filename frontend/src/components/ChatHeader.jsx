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

  const isOnline = onlineUsers.includes(selectedUser._id);

  return (
    <div className="p-4 sm:p-5 border-b border-glass-border bg-white/5 backdrop-blur-md shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="relative group">
            <div className="size-12 rounded-full overflow-hidden border-2 border-primary/30 shadow-md transition-transform duration-300 group-hover:scale-105">
              <img 
                src={selectedUser.profilePic || "/avatar.png"} 
                alt={selectedUser.fullName} 
                className="w-full h-full object-cover" 
              />
            </div>
            {isOnline && (
              <span className="absolute bottom-0 right-0 size-3.5 bg-green-500 border-2 border-bg-main rounded-full" />
            )}
          </div>

          {/* User info */}
          <div className="flex flex-col">
            <h3 className="font-bold text-white text-lg tracking-wide">{selectedUser.fullName}</h3>
            <p className={`text-xs font-medium flex items-center gap-1.5 ${isOnline ? 'text-green-400' : 'text-text-muted'}`}>
              {isOnline ? (
                <>
                  <span className="size-1.5 bg-green-500 rounded-full animate-pulse" />
                  Active Now
                </>
              ) : (
                "Offline"
              )}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button 
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all shadow-sm border border-white/10 hover:border-white/20" 
            onClick={handleCall}
            title="Audio Call"
          >
            <Phone className="size-5" />
          </button>
          <button 
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all shadow-sm border border-white/10 hover:border-white/20" 
            onClick={handleCall}
            title="Video Call"
          >
            <Video className="size-5" />
          </button>
          <div className="w-px h-6 bg-glass-border mx-1 hidden sm:block" />
          <button 
            className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all shadow-sm border border-red-500/20 hover:border-red-500/40" 
            onClick={handleRemoveFriend}
            title="Remove Friend"
          >
            <UserMinus className="size-5" />
          </button>
          <button 
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all shadow-sm border border-white/10 hover:border-white/20 ml-1" 
            onClick={() => setSelectedUser(null)}
            title="Close Chat"
          >
            <X className="size-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
