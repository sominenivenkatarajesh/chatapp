import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { Search, User, MoreVertical, Pin, Archive, Trash2, Users, Plus, X } from "lucide-react";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";

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
    <aside className="h-full w-full flex flex-col z-10 transition-all duration-300">
      {/* Sidebar Header */}
      <div className="h-[72px] px-6 flex items-center justify-between border-b border-white/5 bg-transparent">
        <h2 className="text-white font-extrabold text-xl tracking-tight flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 text-white"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
          </span>
          Messages
        </h2>
        <div className="flex items-center gap-3 text-white/50">
          <button onClick={() => setShowGroupModal(true)} className="hover:text-white hover:bg-white/10 p-2 rounded-full transition-all" title="Create Group">
            <Users size={20} />
          </button>
          <button className="hover:text-white hover:bg-white/10 p-2 rounded-full transition-all">
            <User size={20} />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-5 py-4 border-b border-white/5 bg-transparent">
        <div className="relative flex items-center glass-panel-light rounded-2xl px-4 py-2.5 focus-within:bg-white/10 focus-within:border-indigo-500/50 focus-within:shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-all">
          <Search className="size-4.5 text-white/40 mr-3" />
          <input
            type="text"
            placeholder="Search conversations..."
            className="bg-transparent border-none outline-none text-white text-[14px] w-full placeholder-white/30"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Stats Summary */}
      <div className="px-6 py-3 flex justify-between items-center text-xs font-semibold tracking-wider uppercase text-white/40 bg-transparent">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
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
                  hover-lift border
                  ${isSelected 
                    ? "bg-white/10 border-white/20 shadow-lg backdrop-blur-md" 
                    : "border-transparent hover:glass-panel-light"}
                `}
              >
                <div className="relative flex-shrink-0">
                  <img
                    src={user.profilePic || "/avatar.svg"}
                    alt={user.username}
                    className={`size-12 object-cover rounded-2xl transition-transform duration-300 ${isSelected ? "scale-105 shadow-md" : ""}`}
                  />
                  {isOnline && (
                    <span className="absolute -bottom-1 -right-1 size-3.5 rounded-full bg-emerald-500 border-2 border-[#0f0f13] shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  )}
                </div>

                <div className="flex flex-col text-left min-w-0 flex-1 justify-center pr-1">
                  <div className="flex justify-between items-center mb-0.5">
                    <span className={`font-semibold truncate text-[15px] flex items-center gap-1 ${isSelected ? "text-white" : "text-white/90"}`}>
                      {user.isGroup ? <Users size={14} className="text-indigo-400 mr-1" /> : null}
                      {user.username || user.name}
                      {user.isPinned && <Pin size={12} className="text-indigo-400 fill-indigo-400" />}
                    </span>
                    {!user.isGroup && (
                      <span className={`text-[11px] font-medium tracking-wide ${isOnline ? "text-emerald-400" : "text-white/30"}`}>
                        {isOnline ? "ONLINE" : "OFFLINE"}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className={`text-[13px] truncate flex-1 ${isSelected ? "text-indigo-200" : "text-white/50"}`}>
                      {user.isGroup ? `${user.members?.length || 0} members` : (user.isArchived ? <span className="italic">Archived</span> : (isOnline ? "Active now" : "Last seen recently"))}
                    </div>
                    {(unreadCounts?.[user._id] || 0) > 0 && (
                      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-[11px] font-bold min-w-[20px] h-[20px] rounded-full flex items-center justify-center px-1.5 shadow-[0_2px_8px_rgba(99,102,241,0.5)] animate-in zoom-in duration-300">
                        {unreadCounts[user._id]}
                      </div>
                    )}
                  </div>
                </div>
              </button>

              <button 
                onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === user._id ? null : user._id); }} 
                className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-opacity ${activeMenu === user._id ? 'opacity-100' : 'opacity-0 group-hover/item:opacity-100'}`}
              >
                <MoreVertical size={18}/>
              </button>
              
              {activeMenu === user._id && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setActiveMenu(null)}></div>
                  <div className="absolute right-10 top-1/2 -translate-y-1/2 bg-zinc-800 rounded-xl shadow-2xl border border-white/10 p-1 z-50 min-w-[140px] animate-in zoom-in duration-200">
                    <button 
                      onClick={(e) => { e.stopPropagation(); pinChat(user._id); setActiveMenu(null); }} 
                      className="w-full text-left px-3 py-2 text-sm text-white/90 hover:bg-white/10 rounded-lg flex items-center gap-2 transition-colors"
                    >
                      <Pin size={15} className={user.isPinned ? "text-indigo-400" : ""} /> {user.isPinned ? "Unpin Chat" : "Pin Chat"}
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); archiveChat(user._id); setActiveMenu(null); }} 
                      className="w-full text-left px-3 py-2 text-sm text-white/90 hover:bg-white/10 rounded-lg flex items-center gap-2 transition-colors"
                    >
                      <Archive size={15} className={user.isArchived ? "text-amber-400" : ""} /> {user.isArchived ? "Unarchive" : "Archive"}
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); deleteConversation(user._id); setActiveMenu(null); }} 
                      className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-500/20 rounded-lg flex items-center gap-2 transition-colors mt-1 border-t border-white/5 pt-2"
                    >
                      <Trash2 size={15}/> Delete Chat
                    </button>
                  </div>
                </>
              )}
            </div>
          );
        })}


        {filteredUsers.length === 0 && (
          <div className="text-center text-white/40 py-16 px-6 flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <Search size={24} className="opacity-50" />
            </div>
            <p className="text-sm font-semibold text-white/70">No conversations found</p>
            <p className="text-xs mt-1.5 opacity-70">Try searching for a different name</p>
          </div>
        )}
      </div>

      {/* Create Group Modal */}
      {showGroupModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#0f0f13] w-full max-w-md rounded-3xl border border-white/10 p-6 shadow-2xl relative">
            <button onClick={() => setShowGroupModal(false)} className="absolute top-4 right-4 p-2 text-white/50 hover:text-white transition-colors">
              <X size={20} />
            </button>
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
                <Users size={24} />
              </span>
              Create Group
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-white/70 mb-1.5 block">Group Name</label>
                <input 
                  type="text" 
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="e.g. Weekend Vibes 🎉"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 outline-none focus:border-indigo-500/50 focus:bg-white/5 transition-all"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-white/70 mb-1.5 block">Select Friends</label>
                <div className="max-h-48 overflow-y-auto custom-scrollbar border border-white/5 rounded-xl bg-black/20 p-2 space-y-1">
                  {users.filter(u => !u.isGroup).map(friend => (
                    <div 
                      key={friend._id}
                      onClick={() => {
                        setSelectedFriends(prev => 
                          prev.includes(friend._id) 
                            ? prev.filter(id => id !== friend._id)
                            : [...prev, friend._id]
                        )
                      }}
                      className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${selectedFriends.includes(friend._id) ? 'bg-indigo-500/20 border border-indigo-500/30' : 'hover:bg-white/5 border border-transparent'}`}
                    >
                      <img src={friend.profilePic || "/avatar.svg"} className="w-8 h-8 rounded-full object-cover" />
                      <span className="text-white flex-1">{friend.username}</span>
                      {selectedFriends.includes(friend._id) && <Check size={16} className="text-indigo-400" />}
                    </div>
                  ))}
                  {users.filter(u => !u.isGroup).length === 0 && (
                    <div className="p-4 text-center text-white/40 text-sm">No friends available</div>
                  )}
                </div>
              </div>

              <button 
                onClick={handleCreateGroup}
                disabled={!groupName.trim() || selectedFriends.length === 0}
                className="w-full btn-primary py-3.5 rounded-xl text-[15px] shadow-[0_0_20px_rgba(99,102,241,0.2)] disabled:opacity-50 mt-4"
              >
                Create Group
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;




