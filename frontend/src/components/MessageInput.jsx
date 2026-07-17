import { useRef, useState, useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { Image, Send, X, Smile, Paperclip, FileText, Mic, Plus } from "lucide-react";
import toast from "react-hot-toast";
import EmojiPicker from "emoji-picker-react";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const { sendMessage, emitTyping, emitStopTyping, replyingToMessage, editingMessage, setReplyingToMessage, setEditingMessage } = useChatStore();
  const { authUser } = useAuthStore();

  useEffect(() => {
    if (editingMessage) {
      setText(editingMessage.text);
    }
  }, [editingMessage]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (file.type.startsWith("image/")) {
        setImagePreview(reader.result);
        setFilePreview(null);
      } else {
        setFilePreview({ data: reader.result, name: file.name });
        setImagePreview(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const removeAttachment = () => {
    setImagePreview(null);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!text.trim() && !imagePreview && !filePreview) return;

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    emitStopTyping();

    try {
      const messageData = { text: text.trim() };
      if (imagePreview) messageData.image = imagePreview;
      if (filePreview) {
        messageData.file = filePreview.data;
        messageData.fileName = filePreview.name;
      }

      await sendMessage(messageData);

      setText("");
      setImagePreview(null);
      setFilePreview(null);
      setShowEmojiPicker(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const onEmojiClick = (emojiObject) => {
    setText((prev) => prev + emojiObject.emoji);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTextChange = (e) => {
    setText(e.target.value);
    
    emitTyping();
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    
    typingTimeoutRef.current = setTimeout(() => {
      emitStopTyping();
    }, 2000);
  };

  return (
    <div className="w-full p-4 relative z-40 flex flex-col bg-transparent">
      
      {/* Action Banner (Reply/Edit) */}
      {(replyingToMessage || editingMessage) && (
        <div className="absolute bottom-full left-0 right-0 p-4 bg-transparent border-t border-white/5 animate-in">
          <div className="flex items-center justify-between glass-panel-light p-3 rounded-xl shadow-lg border-l-4 border-indigo-500 mx-auto w-full">
            <div className="flex flex-col min-w-0 flex-1 pl-2">
              <span className="text-indigo-400 font-bold text-xs mb-1 tracking-wide">
                {editingMessage ? "Edit message" : `Replying to ${replyingToMessage.senderId === authUser._id ? "yourself" : "message"}`}
              </span>
              <span className="text-white/70 text-sm truncate font-medium">
                {editingMessage?.text || replyingToMessage?.text || (replyingToMessage?.image ? "📸 Image" : "📎 File")}
              </span>
            </div>
            <button
              onClick={() => {
                setReplyingToMessage(null);
                setEditingMessage(null);
                setText("");
              }}
              className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white ml-3 transition-colors shadow-sm"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Attachment Preview */}
      {(imagePreview || filePreview) && (
        <div className="absolute bottom-full left-0 right-0 p-4 bg-wa-bg border-t border-wa-border animate-in">
          <div className="flex items-center gap-4 bg-wa-panel p-4 rounded-xl shadow-2xl max-w-md">
            <div className="relative">
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="w-24 h-24 object-cover rounded-lg border border-wa-border" />
              ) : (
                <div className="w-24 h-24 bg-wa-bg rounded-lg flex flex-col items-center justify-center text-wa-primary p-2">
                  <FileText size={32} className="text-wa-accent mb-2" />
                  <span className="text-[10px] truncate w-full text-center">{filePreview.name}</span>
                </div>
              )}
              <button
                onClick={removeAttachment}
                className="absolute -top-3 -right-3 w-7 h-7 rounded-full bg-[#ed4956] text-white flex items-center justify-center shadow-lg"
              >
                <X size={14} />
              </button>
            </div>
            <div className="flex-1">
              <p className="text-wa-primary text-sm font-medium">Ready to send</p>
              <p className="text-wa-secondary text-xs mt-1">Add a caption or press send</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 glass-panel-light p-2 rounded-[2rem] shadow-lg">
        <div className="flex items-center gap-1 pl-2 shrink-0">
          <button
            type="button"
            className={`p-2 rounded-full transition-colors ${showEmojiPicker ? "bg-indigo-500/20 text-indigo-400" : "text-white/50 hover:bg-white/10 hover:text-white"}`}
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            <Smile size={22} />
          </button>
          
          <button
            type="button"
            className="p-2 rounded-full text-white/50 hover:bg-white/10 hover:text-white transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <Plus size={22} />
          </button>
          <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
        </div>

        <div className="flex-1 relative">
          {showEmojiPicker && (
            <div className="absolute bottom-full left-0 mb-4 z-50 shadow-2xl">
              <EmojiPicker 
                onEmojiClick={onEmojiClick} 
                theme="dark"
                width={320}
                height={400}
                skinTonesDisabled
                previewConfig={{ showPreview: false }}
              />
            </div>
          )}
          
          <textarea
            className="w-full bg-transparent text-white px-2 py-2.5 outline-none resize-none max-h-32 text-[15px] placeholder-white/40"
            placeholder="Type a message..."
            rows="1"
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
          />
        </div>

        <div className="flex items-center justify-center pr-2 shrink-0">
          {text.trim() || imagePreview || filePreview ? (
            <button
              onClick={handleSendMessage}
              className="p-2.5 rounded-full bg-indigo-500 hover:bg-indigo-600 text-white transition-all shadow-lg hover:shadow-indigo-500/25 hover:scale-105 active:scale-95"
            >
              <Send size={18} className="translate-x-[1px]" />
            </button>
          ) : (
            <button className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors">
              <Mic size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageInput;


