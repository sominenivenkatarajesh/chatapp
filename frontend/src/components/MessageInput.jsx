import { useRef, useState, useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { Send, X, Smile, Plus, FileText, Mic } from "lucide-react";
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

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
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
    
    if (!typingTimeoutRef.current) {
      emitTyping();
    } else {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      emitStopTyping();
      typingTimeoutRef.current = null;
    }, 2000);
  };

  return (
    <div className="w-full p-4 relative z-40 flex flex-col bg-transparent">
      
      {/* Action Banner (Reply/Edit) */}
      {(replyingToMessage || editingMessage) && (
        <div className="absolute bottom-full left-0 right-0 p-4 bg-transparent border-t border-white/5 animate-in">
          <div className="flex items-center justify-between bg-zinc-900/90 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-white/10 border-l-4 border-l-amber-500 mx-auto w-full">
            <div className="flex flex-col min-w-0 flex-1 pl-2">
              <span className="text-amber-400 font-bold text-xs mb-0.5 tracking-wide">
                {editingMessage ? "Edit message" : `Replying to ${replyingToMessage.senderId === authUser._id ? "yourself" : "message"}`}
              </span>
              <span className="text-zinc-300 text-sm truncate font-medium">
                {editingMessage?.text || replyingToMessage?.text || (replyingToMessage?.image ? "📸 Image Attachment" : "📎 File Document")}
              </span>
            </div>
            <button
              onClick={() => {
                setReplyingToMessage(null);
                setEditingMessage(null);
                setText("");
              }}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white ml-3 transition-colors shadow-sm"
            >
              <X size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Attachment Preview */}
      {(imagePreview || filePreview) && (
        <div className="absolute bottom-full left-0 right-0 p-4 bg-transparent animate-in">
          <div className="flex items-center gap-4 bg-zinc-900/95 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 shadow-2xl max-w-md">
            <div className="relative shrink-0">
              {imagePreview ? (
                <div className="size-20 rounded-xl overflow-hidden bg-black/40 border border-white/10">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="size-20 bg-black/40 rounded-xl border border-white/10 flex flex-col items-center justify-center text-white p-2">
                  <FileText size={24} className="text-amber-400 mb-1" />
                  <span className="text-[10px] text-zinc-400 truncate w-full text-center">{filePreview.name}</span>
                </div>
              )}
              <button
                onClick={removeAttachment}
                className="absolute -top-2 -right-2 size-6 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
              >
                <X size={13} />
              </button>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-bold uppercase tracking-wider">Attachment Ready</p>
              <p className="text-zinc-400 text-xs mt-0.5 truncate">Type a message caption or hit send</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 bg-zinc-900/80 backdrop-blur-md border border-white/10 p-2 rounded-2xl shadow-xl focus-within:border-amber-500/40 focus-within:shadow-[0_0_20px_rgba(245,158,11,0.15)] transition-all">
        <div className="flex items-center gap-1 pl-1.5 shrink-0">
          <button
            type="button"
            className={`p-2 rounded-xl transition-colors ${showEmojiPicker ? "bg-amber-500/20 text-amber-400" : "text-zinc-400 hover:bg-white/10 hover:text-white"}`}
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            title="Add emoji"
          >
            <Smile size={20} />
          </button>
          
          <button
            type="button"
            className="p-2 rounded-xl text-zinc-400 hover:bg-white/10 hover:text-white transition-colors"
            onClick={() => fileInputRef.current?.click()}
            title="Attach file or photo"
          >
            <Plus size={20} />
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
            className="w-full bg-transparent text-white px-2 py-2 outline-none resize-none max-h-32 text-sm placeholder-zinc-500"
            placeholder="Type a message..."
            rows="1"
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
          />
        </div>

        <div className="flex items-center justify-center pr-1 shrink-0">
          {text.trim() || imagePreview || filePreview ? (
            <button
              onClick={handleSendMessage}
              className="p-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black transition-all shadow-lg hover:shadow-amber-500/25 hover:scale-105 active:scale-95 font-bold"
            >
              <Send size={16} className="translate-x-[1px]" />
            </button>
          ) : (
            <button className="p-2 rounded-xl text-zinc-500 hover:bg-white/5 hover:text-zinc-300 transition-colors">
              <Mic size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageInput;



