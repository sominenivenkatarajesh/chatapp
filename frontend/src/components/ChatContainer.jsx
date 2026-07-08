import { useChatStore } from "../store/useChatStore";
import { useCallStore } from "../store/useCallStore";
import { useEffect, useRef, useState } from "react";
import { PhoneMissed, PhoneCall } from "lucide-react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import FriendProfileSidebar from "./FriendProfileSidebar";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
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
      className="flex-1 flex flex-col overflow-hidden relative border-l border-white/5 transition-colors duration-500"
      style={{ backgroundColor: customThemeColor || "transparent" }}
    >
      {/* Background Image Overlay */}
      {customBgImage && (
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-20 pointer-events-none transition-all duration-500"
          style={{ backgroundImage: `url(${customBgImage})` }}
        />
      )}

      <ChatHeader onProfileClick={() => setIsSidebarOpen(true)} />

      <div className="flex-1 overflow-y-auto p-4 md:px-16 space-y-2 custom-scrollbar relative z-10">
        {messages.map((message, index) => {
          const isSentByMe = message.senderId === authUser._id;
          const nextMessage = messages[index + 1];
          const isLastInGroup = !nextMessage || nextMessage.senderId !== message.senderId;
          
          return (
            <div
              key={message._id}
              className={`flex ${isSentByMe ? "justify-end" : "justify-start"} ${isLastInGroup ? "mb-2" : "mb-0.5"} animate-msg`}
            >
              <div className={`relative flex flex-col max-w-[85%] sm:max-w-[70%] hover-lift`}>
                
                {message.text === "Missed Video Call 📞" ? (
                  <div className={`relative overflow-hidden transition-all duration-300 p-5 flex flex-col items-center justify-center gap-3 min-w-[220px] rounded-3xl border shadow-2xl ${isSentByMe ? 'bg-zinc-900/90 border-red-500/30' : 'bg-red-500/10 border-red-500/20 backdrop-blur-md'}`}>
                    <div className="size-14 rounded-full bg-red-500/20 flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                      <PhoneMissed className="text-red-500" size={26} />
                    </div>
                    <div className="text-center">
                      <p className="text-white font-bold text-base tracking-wide">Missed Call</p>
                      <p className="text-[10px] text-zinc-400 font-semibold mt-1 uppercase tracking-widest">{formatMessageTime(message.createdAt)}</p>
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
                    className={`relative overflow-hidden transition-all duration-300 text-white ${
                      isSentByMe
                        ? "msg-bubble-out"
                        : "msg-bubble-in"
                    } ${
                      isLastInGroup 
                        ? (isSentByMe ? "rounded-[1.5rem] rounded-br-[0.5rem]" : "rounded-[1.5rem] rounded-bl-[0.5rem]") 
                        : "rounded-[1.5rem]"
                    }`}
                  >
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
                              <span className="text-[10px] text-white/90 font-medium">
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
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm font-medium truncate">{message.fileName || "File"}</span>
                            <span className="text-[10px] text-wa-secondary">Open</span>
                          </div>
                        </a>
                      </div>
                    )}

                    {/* Text Content */}
                    {message.text && (
                      <div className={`px-4 ${message.image || message.fileUrl ? 'pb-3 pt-2' : 'py-3'} flex flex-wrap items-end gap-3`}>
                        <p className="text-[15px] tracking-wide leading-relaxed whitespace-pre-wrap break-words flex-1 min-w-[60px] font-light">
                          {message.text}
                        </p>
                        <div className="flex items-center gap-1.5 ml-auto pt-1 opacity-70">
                          <span className="text-[10px] font-semibold uppercase tracking-wider">
                            {formatMessageTime(message.createdAt)}
                          </span>
                          {isSentByMe && (
                            <span className={`${message.isSeen ? "text-white" : "text-white/50"}`}>
                              {message.isSeen ? (
                                <svg viewBox="0 0 16 15" width="16" height="15" fill="currentColor"><path d="M15.01 3.316l-.478-.372a.365.365 0 00-.51.063L8.666 9.879c-.566.733-.705 1.019-1.493 1.019-.3 0-.601-.02-.747-.034l-.177-.015c-.631-.047-1.114-.116-1.574-.633l-.113-.131L2.09 7.427a.364.364 0 00-.511-.044l-.507.412a.364.364 0 00-.044.51l3.52 4.314c.489.6 1.066 1.016 1.936 1.016.892 0 1.488-.349 2.038-1.06l6.044-7.76c.144-.185.109-.451-.056-.558zm-4.321.391l-.478-.372a.365.365 0 00-.51.063L4.345 10.27c-.121.156-.241.312-.34.453l.113.131c.46.517.943.586 1.574.633l.177.015c.146.014.447.034.747.034.788 0 .927-.286 1.493-1.019l5.141-6.59a.365.365 0 00-.06-.523z"></path></svg>
                              ) : (
                                <svg viewBox="0 0 16 15" width="16" height="15" fill="currentColor"><path d="M10.91 3.316l-.478-.372a.365.365 0 00-.51.063L4.566 9.879c-.566.733-.705 1.019-1.493 1.019-.3 0-.601-.02-.747-.034l-.177-.015c-.631-.047-1.114-.116-1.574-.633l-.113-.131L.421 8.271a.364.364 0 00-.511-.044l-.507.412a.364.364 0 00-.044.51l3.52 4.314c.489.6 1.066 1.016 1.936 1.016.892 0 1.488-.349 2.038-1.06l4.044-5.26c.144-.185.109-.451-.056-.558z"></path></svg>
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
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


