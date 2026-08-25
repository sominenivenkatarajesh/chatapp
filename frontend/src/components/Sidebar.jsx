import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { Search, User, MoreVertical, Pin, Archive, Trash2, Users, Plus, X, Check } from "lucide-react";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import EmptyState from "./EmptyState";
import Avatar from "./Avatar";

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading, unreadCounts, pinChat, archiveChat, deleteConversation } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeMenu, setActiveMenu] = useState(null);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedFriends, setSelectedFriends] = useState([]);

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedFriends.length === 0) return;
    await useChatStore.getState().createGroup(groupName, selectedFriends);
    setShowGroupModal(false);
    setGroupName("");
    setSelectedFriends([]);
  };

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  // Filter users by search term
  const filteredUsers = users
    .filter((user) => (user?.username || "").toLowerCase().includes((searchTerm || "").toLowerCase()));

  const onlineCount = users.filter(u => onlineUsers?.includes(u._id)).length;

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-full flex flex-col z-10">
      {/* Sidebar Header */}
      <div className="h-[72px] px-6 flex items-center justify-between border-b border-white/5 bg-transparent">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-500/90 block mb-0.5">Inbox</span>
          <h2 className="text-white font-extrabold text-xl tracking-tight flex items-center gap-2">
            Messages
          </h2>
        </div>
        <div className="flex items-center gap-2 text-zinc-400">
          <button 
            onClick={() => setShowGroupModal(true)} 
            className="hover:text-amber-400 hover:bg-white/5 p-2 rounded-xl transition-all border border-transparent hover:border-white/10" 
            title="Create Group"
          >
            <Users size={19} />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-5 py-3.5 border-b border-white/5 bg-transparent">
        <div className="relative flex items-center glass-panel-light rounded-xl px-3.5 py-2 focus-within:bg-white/5 focus-within:border-amber-500/40 focus-within:shadow-[0_0_15px_rgba(245,158,11,0.15)] transition-all">
          <Search className="size-4 text-zinc-500 mr-2.5 shrink-0" />
          <input
            type="text"
            placeholder="Search conversations..."
            className="bg-transparent border-none outline-none text-white text-sm w-full placeholder-zinc-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Stats Summary */}
      <div className="px-6 py-2.5 flex justify-between items-center text-[11px] font-semibold tracking-wider uppercase text-zinc-500 bg-transparent">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></span>
          {onlineCount} Online
        </span>
        <span>
          {users.length} Total
        </span>
      </div>

      {/* User List */}
      <div className="overflow-y-auto w-full custom-scrollbar flex-1 px-3 space-y-1 pb-4">
        {filteredUsers.map((user) => {
          const isOnline = onlineUsers?.includes(user._id);
          const isSelected = selectedUser?._id === user._id;
          
          return (
            <div key={user._id} className="relative group/item">
              <button
                onClick={() => setSelectedUser(user)}
                className={`
                  w-full p-3 flex items-center gap-3 cursor-pointer rounded-2xl
                  hover-lift border text-left
                  ${isSelected 
                    ? "bg-amber-500/10 border-amber-500/30 shadow-lg backdrop-blur-md" 
                    : "border-transparent hover:glass-panel-light"}
                `}
              >
                <div className="relative shrink-0">
                  <Avatar user={user} size="md" isOnline={isOnline} className={isSelected ? "ring-2 ring-amber-500/40" : ""} />
                </div>

                <div className="flex flex-col text-left min-w-0 flex-1 justify-center pr-1">
                  <div className="flex justify-between items-center mb-0.5">
                    <span className={`font-semibold truncate text-sm flex items-center gap-1.5 ${isSelected ? "text-white font-bold" : "text-zinc-200"}`}>
                      {user.isGroup ? <Users size={14} className="text-amber-400 mr-0.5 shrink-0" /> : null}
                      {user.username || user.name}
                      {user.isPinned && <Pin size={12} className="text-amber-400 fill-amber-400 shrink-0" />}
                    </span>
                    {!user.isGroup && (
                      <span className={`text-[10px] font-bold tracking-wider uppercase ${isOnline ? "text-emerald-400" : "text-zinc-600"}`}>
                        {isOnline ? "ONLINE" : "OFFLINE"}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center gap-2">
                    <div className={`text-xs truncate flex-1 ${isSelected ? "text-amber-200/80" : "text-zinc-400"}`}>
                      {user.isGroup ? `${user.members?.length || 0} members` : (user.isArchived ? <span className="italic">Archived</span> : (isOnline ? "Active now" : "Last seen recently"))}
                    </div>
                    {(unreadCounts?.[user._id] || 0) > 0 && (
                      <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-black text-[11px] font-extrabold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1 shadow-[0_2px_10px_rgba(245,158,11,0.4)] animate-in">
                        {unreadCounts[user._id]}
                      </div>
                    )}
                  </div>
                </div>
              </button>

              <button 
                onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === user._id ? null : user._id); }} 
                className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-white/10 transition-opacity ${activeMenu === user._id ? 'opacity-100' : 'opacity-0 group-hover/item:opacity-100'}`}
              >
                <MoreVertical size={16}/>
              </button>
              
              {activeMenu === user._id && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setActiveMenu(null)}></div>
                  <div className="absolute right-10 top-1/2 -translate-y-1/2 bg-zinc-900 rounded-xl shadow-2xl border border-white/10 p-1 z-50 min-w-[140px] animate-in">
                    <button 
                      onClick={(e) => { e.stopPropagation(); pinChat(user._id); setActiveMenu(null); }} 
                      className="w-full text-left px-3 py-2 text-xs font-semibold text-zinc-200 hover:bg-white/10 rounded-lg flex items-center gap-2 transition-colors"
                    >
                      <Pin size={14} className={user.isPinned ? "text-amber-400" : ""} /> {user.isPinned ? "Unpin Chat" : "Pin Chat"}
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); archiveChat(user._id); setActiveMenu(null); }} 
                      className="w-full text-left px-3 py-2 text-xs font-semibold text-zinc-200 hover:bg-white/10 rounded-lg flex items-center gap-2 transition-colors"
                    >
                      <Archive size={14} className={user.isArchived ? "text-amber-400" : ""} /> {user.isArchived ? "Unarchive" : "Archive"}
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); deleteConversation(user._id); setActiveMenu(null); }} 
                      className="w-full text-left px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/20 rounded-lg flex items-center gap-2 transition-colors mt-1 border-t border-white/5 pt-2"
                    >
                      <Trash2 size={14}/> Delete Chat
                    </button>
                  </div>
                </>
              )}
            </div>
          );
        })}

        {filteredUsers.length === 0 && (
          <EmptyState 
            icon={Search} 
            title="No conversations found" 
            message="Try searching for a different name or create a group to start chatting." 
          />
        )}
      </div>

      {/* Create Group Modal (Rendered with React Portal to eliminate stacking context containment) */}
      {showGroupModal && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in">
          <div className="bg-zinc-950 w-full max-w-md rounded-2xl border border-white/10 p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-amber-600"></div>
            
            <button 
              onClick={() => setShowGroupModal(false)} 
              className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
            >
              <X size={18} />
            </button>
            
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/20">
                <Users size={20} />
              </span>
              Create Group
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5 block">Group Name</label>
                <input 
                  type="text" 
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="e.g. Project Apollo 🚀"
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-500 outline-none focus:border-amber-500 focus:bg-white/5 transition-all text-sm font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5 block">Select Friends</label>
                <div className="max-h-48 overflow-y-auto custom-scrollbar border border-white/10 rounded-xl bg-black/40 p-2 space-y-1">
                  {users.filter(u => !u.isGroup).map(friend => {
                    const isSelected = selectedFriends.includes(friend._id);
                    return (
                      <div 
                        key={friend._id}
                        onClick={() => {
                          setSelectedFriends(prev => 
                            prev.includes(friend._id) 
                              ? prev.filter(id => id !== friend._id)
                              : [...prev, friend._id]
                          )
                        }}
                        className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all border ${isSelected ? 'bg-amber-500/15 border-amber-500/30' : 'hover:bg-white/5 border-transparent'}`}
                      >
                        <Avatar user={friend} size="xs" />
                        <span className="text-sm font-medium text-white flex-1 truncate">{friend.username}</span>
                        {isSelected && <Check size={16} className="text-amber-400" />}
                      </div>
                    );
                  })}
                  {users.filter(u => !u.isGroup).length === 0 && (
                    <div className="p-4 text-center text-zinc-500 text-sm">No friends available</div>
                  )}
                </div>
              </div>

              <button 
                onClick={handleCreateGroup}
                disabled={!groupName.trim() || selectedFriends.length === 0}
                className="w-full btn-primary py-3.5 rounded-xl text-sm font-bold shadow-[0_0_20px_rgba(245,158,11,0.25)] disabled:opacity-40 mt-4"
              >
                Create Group ({selectedFriends.length} selected)
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </aside>
  );
};

export default Sidebar;





