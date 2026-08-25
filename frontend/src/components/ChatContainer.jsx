import { useChatStore } from "../store/useChatStore";
import { useCallStore } from "../store/useCallStore";
import { useEffect, useRef, useState } from "react";
import { PhoneMissed, PhoneCall, Check, CheckCheck, Reply, Edit2, Trash2 } from "lucide-react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import FriendProfileSidebar from "./FriendProfileSidebar";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime, formatDateDivider, isSameDay } from "../lib/utils";
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
      <div className="flex-1 flex flex-col overflow-auto bg-bg">
        <ChatHeader onProfileClick={() => setIsSidebarOpen(true)} />
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
          className="absolute inset-0 z-0 opacity-15 pointer-events-none transition-all duration-500 mix-blend-screen overflow-hidden"
          style={{ 
            background: `radial-gradient(circle at 50% 50%, ${customThemeColor} 0%, transparent 70%)` 
          }}
        />
      )}

      {/* Background Image Overlay */}
      {customBgImage && (
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-[0.04] pointer-events-none transition-all duration-500 mix-blend-luminosity overflow-hidden"
          style={{ backgroundImage: `url(${customBgImage})` }}
        />
      )}

      <ChatHeader onProfileClick={() => setIsSidebarOpen(true)} />

      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:px-12 custom-scrollbar relative z-10">
        
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-80 my-16">
            <div className="mb-4">
              <Avatar user={selectedUser} size="xl" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Say hello to {selectedUser?.fullName || selectedUser?.username}!</h3>
            <p className="text-zinc-400 max-w-sm text-sm">No messages here yet — send a greeting or start the conversation.</p>
          </div>
        )}

        {messages.map((message, index) => {
          const isSentByMe = message.senderId === authUser._id;
          const prevMessage = messages[index - 1];
          const nextMessage = messages[index + 1];
          
          // Date separator calculation: check if day changed from previous message
          const showDateDivider = !prevMessage || !isSameDay(prevMessage.createdAt, message.createdAt);
          
          // Consecutive message grouping calculation
          const isPrevFromSameSender = prevMessage && prevMessage.senderId === message.senderId && isSameDay(prevMessage.createdAt, message.createdAt);
          const timeDiffFromPrev = prevMessage ? Math.abs(new Date(message.createdAt) - new Date(prevMessage.createdAt)) : Infinity;
          const isTightGroupWithPrev = isPrevFromSameSender && timeDiffFromPrev < 5 * 60 * 1000; // < 5 minutes
          
          const isNextFromSameSender = nextMessage && nextMessage.senderId === message.senderId && isSameDay(nextMessage.createdAt, message.createdAt);
          const timeDiffToNext = nextMessage ? Math.abs(new Date(nextMessage.createdAt) - new Date(message.createdAt)) : Infinity;
          const isLastInGroup = !isNextFromSameSender || timeDiffToNext >= 5 * 60 * 1000;
          
          return (
            <div key={message._id}>
              {/* Date Separator Pill */}
              {showDateDivider && (
                <div className="flex items-center justify-center my-6 select-none">
                  <span className="px-3.5 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-white/5 border border-white/10 text-zinc-400 backdrop-blur-md shadow-sm">
                    {formatDateDivider(message.createdAt)}
                  </span>
                </div>
              )}

              {/* Message Bubble Container with Standardized Spacing */}
              <div
                className={`flex ${isSentByMe ? "justify-end" : "justify-start"} ${isTightGroupWithPrev ? "mt-1.5" : "mt-4 sm:mt-5"} animate-msg`}
              >
                <div className="relative flex flex-col max-w-[85%] sm:max-w-[70%] group">
                  
                  {/* Quick Actions (Hover outside bubble) */}
                  <div className={`absolute -top-9 ${isSentByMe ? "right-0" : "left-0"} opacity-0 group-hover:opacity-100 flex items-center gap-0.5 p-1 bg-zinc-900/95 backdrop-blur-md rounded-xl border border-white/10 shadow-xl z-30 transition-all duration-200`}>
                    <button onClick={() => setReplyingToMessage(message)} className="p-1.5 hover:bg-amber-500/15 rounded-lg text-zinc-400 hover:text-amber-300 transition-colors" title="Reply"><Reply size={15}/></button>
                    {!message.isDeleted && (
                      <button onClick={() => reactToMessage(message._id, '❤️')} className="p-1.5 hover:bg-pink-500/20 rounded-lg text-zinc-400 hover:text-pink-400 transition-colors" title="Love">❤️</button>
                    )}
                    {isSentByMe && !message.isDeleted && <button onClick={() => setEditingMessage(message)} className="p-1.5 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors" title="Edit"><Edit2 size={15}/></button>}
                    {isSentByMe && !message.isDeleted && <button onClick={() => deleteMessage(message._id)} className="p-1.5 hover:bg-red-500/20 rounded-lg text-red-400 hover:text-red-300 transition-colors" title="Delete"><Trash2 size={15}/></button>}
                  </div>

                  {message.text === "Missed Video Call 📞" ? (
                    <div className={`relative overflow-hidden transition-all duration-300 p-5 flex flex-col items-center justify-center gap-3 min-w-[220px] rounded-2xl border shadow-2xl ${isSentByMe ? 'bg-zinc-900/90 border-red-500/30' : 'bg-red-500/10 border-red-500/20 backdrop-blur-md'}`}>
                      <div className="size-12 rounded-full bg-red-500/20 flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                        <PhoneMissed className="text-red-500" size={22} />
                      </div>
                      <div className="text-center">
                        <p className="text-white font-bold text-sm tracking-wide">Missed Call</p>
                        <p className="text-[11px] text-zinc-400 font-semibold mt-0.5 uppercase tracking-wider">{formatMessageTime(message.createdAt)}</p>
                      </div>
                      <button 
                        onClick={() => useCallStore.getState().callUser(isSentByMe ? message.receiverId : message.senderId)}
                        className="w-full mt-2 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold uppercase tracking-wider transition-all border border-white/10 flex items-center justify-center gap-2 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] group"
                      >
                        <PhoneCall size={15} className="text-zinc-400 group-hover:text-white transition-colors" /> Call Again
                      </button>
                    </div>
                  ) : (
                    <div
                      className={`relative overflow-hidden transition-all duration-200 text-white shadow-sm ${
                        isSentByMe
                          ? "bg-gradient-to-br from-amber-600 to-amber-700 text-white shadow-amber-950/20"
                          : "bg-zinc-900/90 border border-white/10 backdrop-blur-sm"
                      } ${
                        isLastInGroup 
                          ? (isSentByMe ? "rounded-2xl rounded-br-sm" : "rounded-2xl rounded-bl-sm") 
                          : "rounded-2xl"
                      }`}
                    >
                      {message.isDeleted ? (
                        <div className="px-4 py-2.5 opacity-60 italic text-xs flex items-center gap-2 text-zinc-400">
                          🚫 This message was deleted
                        </div>
                      ) : (
                        <>
                          {/* Reply Preview */}
                          {message.replyTo && (
                            <div className="mx-2 mt-2 p-2 bg-black/25 rounded-lg border-l-4 border-amber-400/80 mb-1 opacity-90 cursor-pointer">
                              <p className="text-[11px] text-amber-300 font-semibold mb-0.5">Replying to message</p>
                              <p className="text-xs truncate text-white/90">{message.replyTo.isDeleted ? "🚫 This message was deleted" : (message.replyTo.text || "Attachment")}</p>
                            </div>
                          )}

                          {/* Image Content - Strict Container Bounds */}
                          {message.image && message.image.trim() !== "" && (
                            <div className="p-1">
                              <div className="rounded-xl overflow-hidden bg-black/30 max-w-[280px] sm:max-w-[340px] max-h-[360px] relative">
                                <img
                                  src={message.image}
                                  alt="Attachment"
                                  className="w-full h-full max-h-[360px] object-cover cursor-pointer hover:opacity-95 transition-opacity block"
                                  onClick={() => window.open(message.image, '_blank')}
                                  loading="lazy"
                                />
                                
                                {/* Overlay Timestamp for image-only messages */}
                                {!message.text && (
                                  <div className="absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md flex items-center gap-1.5">
                                    <span className="text-[11px] text-white/90 font-medium">
                                      {formatMessageTime(message.createdAt)}
                                    </span>
                                    {isSentByMe && (
                                      <span className="text-amber-300">
                                        {message.isSeen ? <CheckCheck size={13} /> : <Check size={13} />}
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
                                className="flex items-center gap-3 p-3 bg-black/20 rounded-xl hover:bg-black/30 transition-colors border border-white/5"
                              >
                                <div className="p-2 bg-amber-500/20 rounded-lg text-amber-400">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                                </div>
                                <div className="flex flex-col min-w-0">
                                  <span className="text-xs font-semibold truncate">{message.fileName || "Document"}</span>
                                  <span className="text-[10px] text-zinc-400">Download</span>
                                </div>
                              </a>
                            </div>
                          )}

                          {/* Text Content */}
                          {message.text && (
                            <div className={`px-3.5 ${message.image || message.fileUrl ? 'pb-2 pt-1' : 'py-2'} flex items-end justify-between gap-3 min-w-[90px]`}>
                              <p className="text-sm leading-relaxed whitespace-pre-wrap break-words font-normal">
                                {message.text}
                                {message.isEdited && <span className="text-[11px] italic opacity-60 ml-1.5 align-baseline">(edited)</span>}
                              </p>
                              <div className="flex items-center gap-1 shrink-0 opacity-80 pb-0.5 mt-1">
                                <span className="text-[11px] font-medium tracking-wide">
                                  {formatMessageTime(message.createdAt)}
                                </span>
                                {isSentByMe && (
                                  <span className={message.isSeen ? "text-amber-200" : "text-white/60"}>
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
                    <div className={`absolute -bottom-2.5 ${isSentByMe ? "right-2" : "left-2"} bg-zinc-900 border border-white/10 rounded-full px-2 py-0.5 flex gap-1 shadow-lg z-30 text-xs animate-in`}>
                      {Array.from(new Set(message.reactions.map(r => r.emoji))).map((emoji, i) => (
                        <span key={i} onClick={() => reactToMessage(message._id, emoji)} className="cursor-pointer hover:scale-110 flex items-center">
                          {emoji} 
                          {message.reactions.filter(r => r.emoji === emoji).length > 1 && (
                            <span className="text-[10px] font-bold text-amber-300 ml-0.5">{message.reactions.filter(r => r.emoji === emoji).length}</span>
                          )}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        
        {typingUsers.includes(selectedUser?._id) && (
          <div className="flex justify-start mt-2 animate-msg">
            <div className="bg-zinc-900/90 border border-white/10 backdrop-blur-sm rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5 w-fit">
              <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce"></span>
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



