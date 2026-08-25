import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { X, UserMinus, Image as ImageIcon, Palette, Users } from "lucide-react";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import Avatar from "./Avatar";

const FriendProfileSidebar = ({ isOpen, onClose }) => {
  const { selectedUser, setSelectedUser, mutualFriends, getMutualFriends, isMutualFriendsLoading } = useChatStore();
  const { authUser, onlineUsers, checkAuth, updateChatSettings } = useAuthStore();
  const [selectedColor, setSelectedColor] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (isOpen && selectedUser) {
      getMutualFriends(selectedUser._id);
      const settings = authUser?.chatSettings?.[selectedUser._id];
      if (settings?.themeColor) setSelectedColor(settings.themeColor);
      else setSelectedColor("");
    }
  }, [isOpen, selectedUser, getMutualFriends, authUser]);

  if (!isOpen || !selectedUser) return null;

  const handleColorChange = (color) => {
    setSelectedColor(color);
    updateChatSettings(selectedUser._id, { themeColor: color });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      setIsUploading(true);
      await updateChatSettings(selectedUser._id, { backgroundImage: reader.result });
      setIsUploading(false);
    };
  };

  const clearBackgroundImage = () => {
    updateChatSettings(selectedUser._id, { backgroundImage: "" });
  };

  const handleRemoveFriend = async () => {
    if (!window.confirm(`Are you sure you want to remove ${selectedUser.username}?`)) return;
    try {
      await axiosInstance.delete(`/users/remove/${selectedUser._id}`);
      toast.success("Friend removed");
      setSelectedUser(null);
      checkAuth();
      onClose();
    } catch (error) {
      toast.error("Failed to remove friend");
    }
  };

  const colors = ["", "#d97706", "#f59e0b", "#0f766e", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899", "#ef4444", "#18181b"];

  const settings = authUser?.chatSettings?.[selectedUser._id];
  const bgImage = settings?.backgroundImage;
  const isOnline = onlineUsers?.includes(selectedUser._id);

  return (
    <div className={`fixed inset-y-0 right-0 w-80 bg-zinc-950 border-l border-white/10 shadow-2xl z-50 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}>
      <div className="h-[72px] px-6 border-b border-white/5 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-500/90 block mb-0.5">Details</span>
          <h2 className="font-bold text-white text-base">Contact Info</h2>
        </div>
        <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 text-zinc-400 hover:text-white transition-colors">
          <X className="size-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
        {/* Profile Info */}
        <div className="flex flex-col items-center text-center">
          <div className="mb-4">
            <Avatar user={selectedUser} size="2xl" isOnline={isOnline} />
          </div>
          <h3 className="text-xl font-bold text-white">{selectedUser.username}</h3>
          <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{selectedUser.bio || "No bio available"}</p>
        </div>

        {/* Customization */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400/90 flex items-center gap-2">
            <Palette className="size-4" /> Chat Ambiance
          </h4>
          
          <div>
            <p className="text-xs font-medium text-zinc-400 mb-2.5">Accent Glow</p>
            <div className="flex flex-wrap gap-2">
              {colors.map((c, i) => (
                <button
                  key={i}
                  onClick={() => handleColorChange(c)}
                  className={`size-7 rounded-full border-2 transition-all ${selectedColor === c ? 'border-amber-400 scale-110' : 'border-transparent hover:scale-105'}`}
                  style={{ backgroundColor: c || '#18181b' }}
                  title={c || "Default"}
                />
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-zinc-400 mb-2 flex justify-between items-center">
              Background Overlay
              {bgImage && (
                <button onClick={clearBackgroundImage} className="text-red-400 text-xs hover:underline">Remove</button>
              )}
            </p>
            <div className="relative">
              {bgImage ? (
                <div className="relative h-24 rounded-xl overflow-hidden border border-white/10 group">
                  <img src={bgImage} className="w-full h-full object-cover opacity-80" alt="Background" />
                  <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                    <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-white">
                      <ImageIcon className="size-4" /> Change Image
                    </span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploading} />
                  </label>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-22 border border-dashed border-white/15 rounded-xl cursor-pointer hover:border-amber-500/40 hover:bg-white/[0.02] transition-all">
                  <ImageIcon className="size-5 text-zinc-500 mb-1" />
                  <span className="text-xs font-medium text-zinc-400">Upload Backdrop Image</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploading} />
                </label>
              )}
              {isUploading && (
                 <div className="absolute inset-0 bg-zinc-950/80 flex items-center justify-center rounded-xl z-10">
                   <div className="size-5 rounded-full border-2 border-amber-500 border-t-transparent animate-spin"></div>
                 </div>
              )}
            </div>
          </div>
        </div>

        {/* Mutual Friends */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
            <Users className="size-4 text-amber-400" /> Mutual Friends ({mutualFriends?.length || 0})
          </h4>
          
          <div className="space-y-2">
            {isMutualFriendsLoading ? (
               <p className="text-xs text-zinc-500 text-center py-4">Loading mutual friends...</p>
            ) : !mutualFriends || mutualFriends.length === 0 ? (
               <p className="text-xs text-zinc-500 text-center py-4">No mutual friends yet</p>
            ) : (
              mutualFriends.map(mf => (
                <div key={mf._id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors">
                  <Avatar user={mf} size="xs" />
                  <span className="text-sm font-medium text-white truncate">{mf.username}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="p-4 border-t border-white/5 bg-red-500/[0.03] mt-auto">
        <button 
          onClick={handleRemoveFriend}
          className="w-full py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500 hover:text-white text-red-400 text-xs font-semibold flex items-center justify-center gap-2 transition-colors border border-red-500/20"
        >
          <UserMinus className="size-4" /> Remove Friend
        </button>
      </div>
    </div>
  );
};

export default FriendProfileSidebar;

