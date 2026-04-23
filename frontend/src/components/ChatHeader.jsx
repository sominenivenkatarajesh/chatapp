import { Phone, Video, X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useCallStore } from "../store/useCallStore";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const { initiateStream, callUser } = useCallStore();

  const handleCall = async () => {
    await initiateStream();
    callUser(selectedUser._id);
  };

  return (
    <div className="p-2.5 border-b border-glass-border">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="avatar">
            <div className="size-10 rounded-full relative">
              <img src={selectedUser.profilePic || "/avatar.png"} alt={selectedUser.fullName} className="rounded-full" />
            </div>
          </div>

          {/* User info */}
          <div>
            <h3 className="font-medium">{selectedUser.fullName}</h3>
            <p className="text-sm text-text-muted">
              {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button className="btn btn-sm hover:bg-white/10" onClick={handleCall}>
            <Phone className="size-5" />
          </button>
          <button className="btn btn-sm hover:bg-white/10" onClick={handleCall}>
            <Video className="size-5" />
          </button>
          <button className="btn btn-sm hover:bg-white/10" onClick={() => setSelectedUser(null)}>
            <X className="size-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
