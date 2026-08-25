import { Phone, Video, ArrowLeft, Search, Music } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useCallStore } from "../store/useCallStore";
import { useMusicStore } from "../store/useMusicStore";
import Avatar from "./Avatar";

const ChatHeader = ({ onProfileClick }) => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const { initiateStream, callUser, callGroup } = useCallStore();

  const handleCall = async () => {
    if (selectedUser.isGroup) {
      await callGroup(selectedUser.members);
    } else {
      await initiateStream();
      callUser(selectedUser._id);
    }
  };

  const handleMusicInvite = () => {
    const { roomId, createRoom, inviteUser } = useMusicStore.getState();
    if (!roomId) {
      createRoom();
    }
    setTimeout(() => {
      inviteUser(selectedUser._id);
    }, 100);
  };

  const isOnline = onlineUsers?.includes(selectedUser._id);

  return (
    <div className="h-[72px] px-6 border-b border-white/5 bg-zinc-950/80 backdrop-blur-md z-30 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
        {/* Back Button (Mobile only) */}
        <button 
          className="lg:hidden p-2 -ml-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"
          onClick={() => setSelectedUser(null)}
        >
          <ArrowLeft className="size-5" />
        </button>

        {/* Avatar */}
        <div 
          className="cursor-pointer hover:opacity-90 transition-all shrink-0"
          onClick={onProfileClick}
        >
          <Avatar 
            user={selectedUser} 
            size="md" 
            isOnline={isOnline} 
          />
        </div>

        {/* User/Group info */}
        <div 
          className="flex flex-col min-w-0 justify-center cursor-pointer hover:opacity-85"
          onClick={onProfileClick}
        >
          <h3 className="font-bold text-sm sm:text-base text-white truncate">{selectedUser.username || selectedUser.name}</h3>
          <p className="text-[11px] font-semibold tracking-wide uppercase flex items-center gap-1.5 mt-0.5">
            {selectedUser.isGroup ? (
              <span className="text-zinc-400">{selectedUser.members?.length || 0} Members</span>
            ) : isOnline ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse"></span>
                <span className="text-emerald-400 font-bold">Online</span>
              </>
            ) : (
              <span className="text-zinc-500 font-medium">Offline</span>
            )}
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-1 sm:gap-2 text-zinc-400">
        <button className="p-2 sm:p-2.5 rounded-xl hover:bg-white/5 hover:text-white transition-all" onClick={handleCall} title="Voice Call">
          <Phone className="size-4 sm:size-[18px]" />
        </button>
        <button className="p-2 sm:p-2.5 rounded-xl hover:bg-white/5 hover:text-white transition-all" onClick={handleCall} title="Video Call">
          <Video className="size-4.5 sm:size-5" />
        </button>
        <button className="p-2 sm:p-2.5 rounded-xl hover:bg-amber-500/15 hover:text-amber-400 transition-all" onClick={handleMusicInvite} title="Listen to Music Together">
          <Music className="size-4.5 sm:size-5" />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;


