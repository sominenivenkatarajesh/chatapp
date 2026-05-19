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
    <div className="h-[72px] px-6 border-b border-white/5 bg-white/5 backdrop-blur-md z-20 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-3 sm:gap-4 flex-1">
        {/* Back Button (Mobile only) */}
        <button 
          className="lg:hidden p-2.5 -ml-3 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-all"
          onClick={() => setSelectedUser(null)}
        >
          <ArrowLeft className="size-5" />
        </button>

        {/* Avatar */}
        <div className="relative cursor-pointer hover:opacity-90 transition-all hover:scale-105">
          <img 
            src={selectedUser.profilePic || "/avatar.png"} 
            alt={selectedUser.fullName} 
            className="size-11 rounded-2xl object-cover shadow-md shadow-black/20" 
          />
          {onlineUsers.includes(selectedUser._id) && (
            <span className="absolute -bottom-1 -right-1 size-3.5 rounded-full bg-emerald-500 border-2 border-[#1e1e24] shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          )}
        </div>

        {/* User info */}
        <div className="flex flex-col min-w-0 justify-center">
          <h3 className="font-bold text-white text-[16px] tracking-wide leading-tight truncate">{selectedUser.fullName}</h3>
          <p className={`text-[12px] font-medium tracking-wider uppercase mt-1 ${onlineUsers.includes(selectedUser._id) ? "text-emerald-400" : "text-white/40"}`}>
            {onlineUsers.includes(selectedUser._id) ? "online" : "offline"}
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 sm:gap-3 text-white/50">
        <button className="p-2.5 rounded-full hover:bg-white/10 hover:text-white transition-all shadow-sm" onClick={handleCall} title="Voice Call">
          <Phone className="size-[18px]" />
        </button>
        <button className="p-2.5 rounded-full hover:bg-white/10 hover:text-white transition-all shadow-sm" onClick={handleCall} title="Video Call">
          <Video className="size-5" />
        </button>
        <div className="w-px h-6 bg-white/10 mx-1"></div>
        <button className="p-2.5 rounded-full hover:bg-white/10 hover:text-white transition-all shadow-sm" title="Search Message">
          <Search className="size-[18px]" />
        </button>
        <button className="p-2.5 rounded-full hover:bg-red-500/10 hover:text-red-500 transition-all shadow-sm" onClick={handleRemoveFriend} title="Remove Friend">
          <UserMinus className="size-[18px]" />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;

