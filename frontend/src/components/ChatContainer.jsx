import { useChatStore } from "../store/useChatStore";
import { useCallStore } from "../store/useCallStore";
import { useEffect, useRef, useState } from "react";
import { PhoneMissed, PhoneCall, Check, CheckCheck, Reply, Edit2, Trash2 } from "lucide-react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import FriendProfileSidebar from "./FriendProfileSidebar";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import Avatar from "./Avatar";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
    typingUsers,
    setReplyingToMessage,
    setEditingMessage,
    deleteMessage,
    reactToMessage
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    getMessages(selectedUser._id);
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [selectedUser._id, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto bg-wa-bg">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  const settings = authUser?.chatSettings?.[selectedUser?._id];
  const customBgImage = settings?.backgroundImage;
  const customThemeColor = settings?.themeColor;

  return (
    <div 
      className="flex-1 flex flex-col overflow-hidden relative border-l border-white/5 bg-bg transition-colors duration-500"
    >
      {/* Background Soft Glow Overlay */}
      {customThemeColor && customThemeColor !== "transparent" && (
        <div 
          className="absolute inset-0 z-0 opacity-15 pointer-events-none transition-all duration-500 mix-blend-screen"
          style={{ 
            background: `radial-gradient(circle at 50% 50%, ${customThemeColor} 0%, transparent 70%)` 
          }}
        />
      )}

      {/* Background Image Overlay */}
      {customBgImage && (
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-[0.03] pointer-events-none transition-all duration-500 mix-blend-luminosity"
          style={{ backgroundImage: `url(${customBgImage})` }}
        />
      )}

      <ChatHeader onProfileClick={() => setIsSidebarOpen(true)} />

      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:px-16 space-y-2 custom-scrollbar relative z-10">
        
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-70 mt-10">
            <div className="mb-4">
              <Avatar user={selectedUser} size="lg" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Say hi to {selectedUser?.fullName}!</h3>
            <p className="text-zinc-400 max-w-sm text-sm">No conversations yet — start chatting with someone.</p>
          </div>
        )}

        {messages.map((message, index) => {
          const isSentByMe = message.senderId === authUser._id;
          const nextMessage = messages[index + 1];
          const isLastInGroup = !nextMessage || nextMessage.senderId !== message.senderId;
          
          return (
            <div
              key={message._id}
              className={`flex ${isSentByMe ? "justify-end" : "justify-start"} ${isLastInGroup ? "mb-2" : "mb-0.5"} animate-msg`}
            >
              <div className={`relative flex flex-col max-w-[85%] sm:max-w-[70%] group`}>
                
                {/* Quick Actions (Hover outside bubble) */}
                <div className={`absolute -top-10 ${isSentByMe ? "right-0" : "left-0"} opacity-0 group-hover:opacity-100 flex items-center gap-1 p-1 bg-zinc-800/90 backdrop-blur-md rounded-xl border border-white/10 shadow-xl z-30 transition-all duration-200`}>
                  <button onClick={() => setReplyingToMessage(message)} className="p-2 hover:bg-indigo-500/20 rounded-lg text-white/70 hover:text-indigo-300 transition-colors" title="Reply"><Reply size={16}/></button>
                  {!message.isDeleted && (
                    <button onClick={() => reactToMessage(message._id, '❤️')} className="p-2 hover:bg-pink-500/20 rounded-lg text-white/70 hover:text-pink-400 transition-colors" title="Love">❤️</button>
                  )}
                  {isSentByMe && !message.isDeleted && <button onClick={() => setEditingMessage(message)} className="p-2 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors" title="Edit"><Edit2 size={16}/></button>}
                  {isSentByMe && !message.isDeleted && <button onClick={() => deleteMessage(message._id)} className="p-2 hover:bg-red-500/20 rounded-lg text-red-400 hover:text-red-300 transition-colors" title="Delete"><Trash2 size={16}/></button>}
                </div>

                {message.text === "Missed Video Call 📞" ? (
                  <div className={`relative overflow-hidden transition-all duration-300 p-5 flex flex-col items-center justify-center gap-3 min-w-[220px] rounded-2xl border shadow-2xl ${isSentByMe ? 'bg-zinc-900/90 border-red-500/30' : 'bg-red-500/10 border-red-500/20 backdrop-blur-md'}`}>
                    <div className="size-14 rounded-full bg-red-500/20 flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                      <PhoneMissed className="text-red-500" size={26} />
                    </div>
                    <div className="text-center">
                      <p className="text-white font-bold text-base tracking-wide">Missed Call</p>
                      <p className="text-xs text-zinc-400 font-semibold mt-1 uppercase tracking-widest">{formatMessageTime(message.createdAt)}</p>
                    </div>
                    <button 
                      onClick={() => useCallStore.getState().callUser(isSentByMe ? message.receiverId : message.senderId)}
                      className="w-full mt-2 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold uppercase tracking-wider transition-all border border-white/10 flex items-center justify-center gap-2 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] group"
                    >
                      <PhoneCall size={16} className="text-zinc-400 group-hover:text-white transition-colors" /> Call Again
                    </button>
                  </div>
                ) : (
                  <div
                    className={`relative overflow-hidden transition-all duration-300 text-white shadow-sm ${
                      isSentByMe
                        ? "bg-indigo-600 text-white"
                        : "bg-zinc-800/80 border border-white/5 backdrop-blur-sm"
                    } ${
                      isLastInGroup 
                        ? (isSentByMe ? "rounded-2xl rounded-br-sm" : "rounded-2xl rounded-bl-sm") 
                        : "rounded-2xl"
                    }`}
                  >
                    {message.isDeleted ? (
                      <div className="px-4 py-3 opacity-60 italic text-sm flex items-center gap-2">
                        🚫 This message was deleted
                      </div>
                    ) : (
                      <>
                        {/* Reply Preview */}
                        {message.replyTo && (
                          <div className="mx-2 mt-2 p-2 bg-black/20 rounded-lg border-l-4 border-white/30 mb-1 opacity-90 cursor-pointer">
                            <p className="text-xs text-white/70 font-semibold mb-0.5">Replying to message</p>
                            <p className="text-sm truncate text-white/90">{message.replyTo.isDeleted ? "🚫 This message was deleted" : (message.replyTo.text || "Attachment")}</p>
                          </div>
                        )}

                        {/* Image Content - WhatsApp Style */}
                        {message.image && message.image.trim() !== "" && (
                          <div className="p-[3.5px]">
                            <div className="rounded-[6px] overflow-hidden bg-black/10 relative">
                              <img
                                src={message.image}
                                alt="Attachment"
                                className="max-w-full max-h-[450px] w-auto h-auto object-contain cursor-pointer hover:opacity-95 transition-opacity block"
                                onClick={() => window.open(message.image, '_blank')}
                              />
                              
                              {/* Overlay Timestamp for Images */}
                              {!message.text && (
                                <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded-[4px] bg-black/30 backdrop-blur-sm flex items-center gap-1">
                                  <span className="text-xs text-white/90 font-medium">
                                    {formatMessageTime(message.createdAt)}
                                  </span>
                                  {isSentByMe && (
                                    <span className="text-indigo-200">
                                      <svg viewBox="0 0 16 15" width="15" height="14" fill="currentColor"><path d="M15.01 3.316l-.478-.372a.365.365 0 00-.51.063L8.666 9.879c-.566.733-.705 1.019-1.493 1.019-.3 0-.601-.02-.747-.034l-.177-.015c-.631-.047-1.114-.116-1.574-.633l-.113-.131L2.09 7.427a.364.364 0 00-.511-.044l-.507.412a.364.364 0 00-.044.51l3.52 4.314c.489.6 1.066 1.016 1.936 1.016.892 0 1.488-.349 2.038-1.06l6.044-7.76c.144-.185.109-.451-.056-.558zm-4.321.391l-.478-.372a.365.365 0 00-.51.063L4.345 10.27c-.121.156-.241.312-.34.453l.113.131c.46.517.943.586 1.574.633l.177.015c.146.014.447.034.747.034.788 0 .927-.286 1.493-1.019l5.141-6.59a.365.365 0 00-.06-.523z"></path></svg>
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* File Content */}
                        {message.fileUrl && (
                          <div className="p-2">
                            <a
                              href={message.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-3 p-3 bg-black/10 rounded-md hover:bg-black/20 transition-colors"
                            >
                              <div className="p-2 bg-wa-accent/20 rounded-full text-wa-accent">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="text-sm font-medium truncate">{message.fileName || "File"}</span>
                                <span className="text-xs text-wa-secondary">Open</span>
                              </div>
                            </a>
                          </div>
                        )}

                        {/* Text Content */}
                        {message.text && (
                          <div className={`px-3 ${message.image || message.fileUrl ? 'pb-2 pt-1' : 'py-2'} flex items-end justify-between gap-3 min-w-[80px]`}>
                            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words font-normal">
                              {message.text}
                              {message.isEdited && <span className="text-xs italic opacity-60 ml-1.5 align-baseline">(edited)</span>}
                            </p>
                            <div className="flex items-center gap-1 shrink-0 opacity-70 pb-0.5 mt-2 float-right">
                              <span className="text-xs font-medium tracking-wide">
                                {formatMessageTime(message.createdAt)}
                              </span>
                              {isSentByMe && (
                                <span className={`${message.isSeen ? "text-accent" : "text-white/60"}`}>
                                  {message.isSeen ? (
                                    <CheckCheck size={14} strokeWidth={2.5} />
                                  ) : (
                                    <Check size={14} strokeWidth={2.5} />
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* Reactions rendering */}
                {message.reactions && message.reactions.length > 0 && (
                  <div className={`absolute -bottom-2.5 ${isSentByMe ? "right-2" : "left-2"} bg-zinc-800 border border-white/10 rounded-full px-1.5 py-0.5 flex gap-1 shadow-lg z-30 text-xs animate-in zoom-in duration-200`}>
                    {Array.from(new Set(message.reactions.map(r => r.emoji))).map((emoji, i) => (
                      <span key={i} onClick={() => reactToMessage(message._id, emoji)} className="cursor-pointer hover:scale-110 flex items-center">
                        {emoji} 
                        {message.reactions.filter(r => r.emoji === emoji).length > 1 && (
                          <span className="text-xs font-bold text-white/80 ml-0.5">{message.reactions.filter(r => r.emoji === emoji).length}</span>
                        )}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        
        {typingUsers.includes(selectedUser?._id) && (
          <div className="flex justify-start mb-2 animate-msg">
            <div className="bg-zinc-800/80 border border-white/5 backdrop-blur-sm rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5 w-fit">
              <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce"></span>
            </div>
          </div>
        )}

        <div ref={messageEndRef} />
      </div>

      <MessageInput />
      
      <FriendProfileSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
    </div>
  );
};

export default ChatContainer;


