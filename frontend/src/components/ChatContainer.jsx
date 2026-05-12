import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef } from "react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
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
      <div className="flex-1 flex flex-col overflow-auto bg-[#0b141a]">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#0b141a] relative">
      {/* WhatsApp Background Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.06] pointer-events-none" 
        style={{ 
          backgroundImage: `url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')`,
          backgroundSize: '400px'
        }}
      ></div>
      
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 md:px-10 space-y-4 custom-scrollbar relative z-10">
        {messages.map((message) => {
          const isSentByMe = message.senderId === authUser._id;
          
          return (
            <div
              key={message._id}
              className={`flex ${isSentByMe ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}
            >
              <div className={`flex flex-col gap-1 max-w-[85%] sm:max-w-[70%] lg:max-w-[60%]`}>
                <div
                  className={`relative p-2 rounded-xl shadow-md min-w-[80px] ${
                    isSentByMe
                      ? "bg-[#005c4b] text-white rounded-tr-none"
                      : "bg-[#202c33] text-white rounded-tl-none"
                  }`}
                >
                  {/* Message Tail Overlay (Simplified) */}
                  <div className={`absolute top-0 size-3 ${isSentByMe ? "-right-2 bg-[#005c4b]" : "-left-2 bg-[#202c33]"} clip-path-tail ${isSentByMe ? "hidden" : "hidden"}`}></div>

                  {/* Image Content */}
                  {message.image && message.image.trim() !== "" && (
                    <div className="relative mb-1 rounded-lg overflow-hidden bg-black/20">
                      <img
                        src={message.image}
                        alt="Attachment"
                        className="max-w-full sm:max-w-[400px] max-h-[400px] object-cover cursor-pointer hover:opacity-95 transition-opacity block"
                        onClick={() => window.open(message.image, '_blank')}
                      />
                    </div>
                  )}

                  {/* File Content */}
                  {message.fileUrl && (
                    <a
                      href={message.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-black/20 rounded-lg mb-1 hover:bg-black/30 transition-colors border border-white/5"
                    >
                      <div className="p-2 bg-primary/20 rounded-lg text-primary">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-medium underline underline-offset-2 break-all line-clamp-1">{message.fileName || "File"}</span>
                        <span className="text-[10px] opacity-60">Click to download</span>
                      </div>
                    </a>
                  )}

                  {/* Text Content */}
                  {message.text && (
                    <p className="px-1.5 py-1 text-[14.5px] leading-relaxed whitespace-pre-wrap break-words">
                      {message.text}
                      <span className="inline-block w-16 h-1"></span> {/* Spacer for timestamp */}
                    </p>
                  )}
                  
                  {/* Metadata (Time + Status) */}
                  <div className={`absolute bottom-1 right-2 text-[10px] opacity-60 flex items-center gap-1 bg-gradient-to-l ${isSentByMe ? 'from-[#005c4b]' : 'from-[#202c33]'} pl-4`}>
                    {formatMessageTime(message.createdAt)}
                    {isSentByMe && (
                      <span className="text-[#53bdeb]">
                        <svg viewBox="0 0 16 15" width="16" height="15" fill="currentColor"><path d="M15.01 3.316l-.478-.372a.365.365 0 00-.51.063L8.666 9.879c-.566.733-.705 1.019-1.493 1.019-.3 0-.601-.02-.747-.034l-.177-.015c-.631-.047-1.114-.116-1.574-.633l-.113-.131L2.09 7.427a.364.364 0 00-.511-.044l-.507.412a.364.364 0 00-.044.51l3.52 4.314c.489.6 1.066 1.016 1.936 1.016.892 0 1.488-.349 2.038-1.06l6.044-7.76c.144-.185.109-.451-.056-.558zm-4.321.391l-.478-.372a.365.365 0 00-.51.063L4.345 10.27c-.121.156-.241.312-.34.453l.113.131c.46.517.943.586 1.574.633l.177.015c.146.014.447.034.747.034.788 0 .927-.286 1.493-1.019l5.141-6.59a.365.365 0 00-.06-.523z"></path></svg>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messageEndRef} />
      </div>

      <MessageInput />
    </div>
  );
};

export default ChatContainer;

