import { Phone, Video, ArrowLeft, Search } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useCallStore } from "../store/useCallStore";

const ChatHeader = ({ onProfileClick }) => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const { initiateStream, callUser } = useCallStore();

  const handleCall = async () => {
    await initiateStream();
    callUser(selectedUser._id);
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
        <div 
          className="relative cursor-pointer hover:opacity-90 transition-all hover:scale-105"
          onClick={onProfileClick}
        >
          <img 
            src={selectedUser.profilePic || "/avatar.svg"} 
            alt={selectedUser.username} 
            className="size-11 rounded-2xl object-cover shadow-md shadow-black/20" 
          />
          {onlineUsers.includes(selectedUser._id) && (
            <span className="absolute -bottom-1 -right-1 size-3.5 rounded-full bg-emerald-500 border-2 border-[#1e1e24] shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          )}
        </div>

        {/* User info */}
        <div 
          className="flex flex-col min-w-0 justify-center cursor-pointer hover:opacity-80"
          onClick={onProfileClick}
        >
          <h3 className="font-bold">{selectedUser.username}</h3>
          <p className="text-[11px] font-semibold tracking-wide uppercase flex items-center gap-1.5 mt-0.5">
            {onlineUsers.includes(selectedUser._id) ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse"></span>
                <span className="text-emerald-400">Online</span>
              </>
            ) : (
              <span className="text-white/40">Offline</span>
            )}
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
      </div>
    </div>
  );
};

export default ChatHeader;

