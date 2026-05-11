import { useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { Image, Send, X, Smile, Paperclip, FileText } from "lucide-react";
import toast from "react-hot-toast";
import EmojiPicker from "emoji-picker-react";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef(null);
  const { sendMessage } = useChatStore();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check size limit (e.g. 10MB)
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
    e.preventDefault();
    if (!text.trim() && !imagePreview && !filePreview) return;

    try {
      const messageData = { text: text.trim() };
      if (imagePreview) messageData.image = imagePreview;
      if (filePreview) {
        messageData.file = filePreview.data;
        messageData.fileName = filePreview.name;
      }

      await sendMessage(messageData);

      // Clear form
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

  return (
    <div className="p-3 w-full bg-[#111b21] border-t border-white/5 relative z-40">
      {(imagePreview || filePreview) && (
        <div className="mb-4 flex items-center gap-3 p-3 bg-black/40 backdrop-blur-md rounded-2xl border border-white/5 shadow-lg w-fit animate-in slide-in-from-bottom-2 fade-in">
          <div className="relative group">
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Preview"
                className="w-20 h-20 object-cover rounded-xl border border-white/10 shadow-md transition-transform group-hover:scale-105"
              />
            ) : (
              <div className="w-auto h-20 px-5 bg-zinc-800/80 rounded-xl border border-white/10 shadow-md flex flex-col items-center justify-center text-white transition-transform group-hover:scale-105">
                 <FileText size={28} className="mb-2 text-primary" />
                 <span className="text-xs font-medium max-w-[120px] truncate">{filePreview.name}</span>
              </div>
            )}
            <button
              onClick={removeAttachment}
              className="absolute -top-2.5 -right-2.5 w-7 h-7 rounded-full bg-red-500 hover:bg-red-600 text-white
              flex items-center justify-center transition-all shadow-xl hover:scale-110 cursor-pointer border-2 border-bg-dark z-10"
              type="button"
              title="Remove attachment"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="flex items-center gap-3">
        <div className="flex-1 flex items-center bg-black/20 backdrop-blur-sm rounded-full pl-5 pr-2 py-2 border border-white/5 focus-within:border-primary/50 focus-within:bg-black/40 focus-within:shadow-[0_0_15px_rgba(0,119,197,0.1)] transition-all duration-300">
          <input
            type="text"
            className="flex-1 bg-transparent border-none outline-none text-white placeholder-text-muted text-[15px] min-w-0"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          
          <div className="flex items-center gap-1 ml-2">
            <div className="relative">
              <button
                type="button"
                className={`p-2 rounded-full cursor-pointer transition-all duration-200 hover:bg-white/10 ${showEmojiPicker ? "text-primary bg-primary/10" : "text-text-muted hover:text-white"}`}
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                title="Add emoji"
              >
                <Smile size={20} />
              </button>
              
              {showEmojiPicker && (
                <div className="absolute bottom-full right-0 mb-4 z-50 animate-in slide-in-from-bottom-2 fade-in shadow-2xl rounded-2xl border border-white/10 overflow-hidden">
                  <EmojiPicker 
                    onEmojiClick={onEmojiClick} 
                    theme="dark"
                    searchDisabled={false}
                    skinTonesDisabled
                    previewConfig={{ showPreview: false }}
                    width={320}
                    height={400}
                  />
                </div>
              )}
            </div>

            <input
              type="file"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            <button
              type="button"
              className={`p-2 rounded-full cursor-pointer transition-all duration-200 hover:bg-white/10 ${(imagePreview || filePreview) ? "text-primary bg-primary/10" : "text-text-muted hover:text-white"}`}
              onClick={() => fileInputRef.current?.click()}
              title="Attach file"
            >
              <Paperclip size={20} />
            </button>
          </div>
        </div>
        
        <button
          type="submit"
          disabled={!text.trim() && !imagePreview && !filePreview}
          className={`w-12 h-12 flex-shrink-0 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
            text.trim() || imagePreview || filePreview
              ? "bg-[#00a884] text-white hover:scale-105 cursor-pointer shadow-md"
              : "bg-white/5 text-white/30 cursor-not-allowed"
          }`}
        >
          <Send size={20} className={`${text.trim() || imagePreview || filePreview ? 'ml-1' : ''}`} />
        </button>
      </form>
    </div>
  );
};
export default MessageInput;
