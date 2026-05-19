import { Phone, Video, X, UserMinus, Search, MoreVertical, ArrowLeft } from "lucide-react";
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
    <div className="h-[60px] px-4 border-b border-white/5 bg-transparent z-20 flex items-center justify-between">
      <div className="flex items-center gap-2 sm:gap-4 flex-1">
        {/* Back Button (Mobile only) */}
        <button 
          className="lg:hidden p-2 -ml-2 text-indigo-200/70 hover:bg-white/5 rounded-full transition-colors"
          onClick={() => setSelectedUser(null)}
        >
          <ArrowLeft className="size-6" />
        </button>

        {/* Avatar */}
        <div className="relative cursor-pointer hover:opacity-90 transition-opacity">

          <img 
            src={selectedUser.profilePic || "/avatar.png"} 
            alt={selectedUser.fullName} 
            className="size-10 rounded-full object-cover" 
          />
        </div>

        {/* User info */}
        <div className="flex flex-col min-w-0">
          <h3 className="font-bold text-white text-[16px] leading-tight truncate">{selectedUser.fullName}</h3>
          <p className={`text-[13px] mt-0.5 ${onlineUsers.includes(selectedUser._id) ? "text-indigo-400" : "text-indigo-200/60"}`}>
            {onlineUsers.includes(selectedUser._id) ? "online" : "offline"}
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-3 text-indigo-200/70">
        <button className="p-2 rounded-full hover:bg-white/5 transition-colors" onClick={handleCall} title="Voice Call">
          <Phone className="size-5" />
        </button>
        <button className="p-2 rounded-full hover:bg-white/5 transition-colors" onClick={handleCall} title="Video Call">
          <Video className="size-6" />
        </button>
        <div className="w-px h-6 bg-white/10 mx-1"></div>
        <button className="p-2 rounded-full hover:bg-white/5 transition-colors" title="Search Message">
          <Search className="size-5" />
        </button>
        <button className="p-2 rounded-full hover:bg-red-500/10 hover:text-red-500 transition-colors" onClick={handleRemoveFriend} title="Remove Friend">
          <UserMinus className="size-5" />
        </button>
        <button className="p-2 rounded-full hover:bg-white/5 transition-colors" onClick={() => setSelectedUser(null)} title="Close Chat">
          <X className="size-6" />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;

