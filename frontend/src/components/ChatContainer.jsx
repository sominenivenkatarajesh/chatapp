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
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-bg-main via-bg-main to-black/20 overflow-hidden relative">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar relative z-10">
        {messages.map((message, idx) => {
          const isSentByMe = message.senderId === authUser._id;
          const showAvatar = idx === messages.length - 1 || messages[idx + 1]?.senderId !== message.senderId;

          return (
            <div
              key={message._id}
              className={`flex ${isSentByMe ? "justify-end" : "justify-start"} items-end gap-2`}
              ref={messageEndRef}
            >
              {!isSentByMe && (
                <div className={`size-8 rounded-full overflow-hidden flex-shrink-0 border border-white/10 ${!showAvatar && 'opacity-0'}`}>
                  <img src={selectedUser.profilePic || "/avatar.png"} alt="avatar" className="w-full h-full object-cover" />
                </div>
              )}

              <div className={`flex flex-col gap-1.5 max-w-[75%] sm:max-w-[65%]`}>
                <div
                  className={`px-4 py-3 text-sm sm:text-base shadow-md backdrop-blur-sm ${
                    isSentByMe
                      ? "bg-gradient-to-br from-primary to-primary/80 text-white rounded-3xl rounded-br-sm border border-primary/50"
                      : "bg-white/10 text-white rounded-3xl rounded-bl-sm border border-white/10"
                  }`}
                >
                  {message.image && (
                    <img
                      src={message.image}
                      alt="Attachment"
                      className="max-w-full sm:max-w-[250px] rounded-xl mb-2 border border-white/10 shadow-sm object-cover"
                    />
                  )}
                  {message.text && (
                    <p className={`leading-relaxed tracking-wide ${message.text.includes('📞') ? 'font-medium italic text-center' : ''}`}>
                      {message.text}
                    </p>
                  )}
                </div>
                <div className={`text-[10px] sm:text-xs text-text-muted px-2 font-medium tracking-wider ${isSentByMe ? 'text-right' : 'text-left'}`}>
                  {formatMessageTime(message.createdAt)}
                </div>
              </div>

              {isSentByMe && (
                <div className={`size-8 rounded-full overflow-hidden flex-shrink-0 border border-white/10 ${!showAvatar && 'opacity-0'}`}>
                  <img src={authUser.profilePic || "/avatar.png"} alt="avatar" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <MessageInput />
    </div>
  );
};

export default ChatContainer;
