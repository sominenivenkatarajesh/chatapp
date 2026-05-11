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
    <div className="p-4 w-full bg-bg-dark border-t border-glass-border">
      {(imagePreview || filePreview) && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Preview"
                className="w-20 h-20 object-cover rounded-xl border border-glass-border"
              />
            ) : (
              <div className="w-auto h-20 px-4 bg-zinc-800 rounded-xl border border-glass-border flex flex-col items-center justify-center text-white">
                 <FileText size={24} className="mb-1 text-primary" />
                 <span className="text-xs max-w-[120px] truncate">{filePreview.name}</span>
              </div>
            )}
            <button
              onClick={removeAttachment}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white
              flex items-center justify-center transition-colors shadow-md hover:bg-red-600 cursor-pointer"
              type="button"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="flex items-center gap-3">
        <div className="flex-1 flex items-center bg-[#262626] rounded-full px-4 py-2 border border-transparent focus-within:border-[#363636] focus-within:bg-[#1a1a1a] transition-all">
          <input
            type="text"
            className="flex-1 bg-transparent border-none outline-none text-white placeholder-text-muted text-[15px]"
            placeholder="Message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="relative">
            <button
              type="button"
              className={`p-2 rounded-full cursor-pointer transition-colors ${showEmojiPicker ? "text-primary" : "text-text-muted hover:text-white"}`}
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              <Smile size={22} />
            </button>
            {showEmojiPicker && (
              <div className="absolute bottom-12 left-0 z-50">
                <EmojiPicker onEmojiClick={onEmojiClick} theme="dark" />
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
            className={`p-2 rounded-full cursor-pointer transition-colors ${(imagePreview || filePreview) ? "text-primary" : "text-text-muted hover:text-white"}`}
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip size={22} />
          </button>
        </div>
        
        {text.trim() || imagePreview || filePreview ? (
          <button
            type="submit"
            className="w-12 h-12 flex-shrink-0 rounded-full bg-primary text-white flex items-center justify-center hover:bg-[#0077c5] transition-colors cursor-pointer"
          >
            <Send size={20} className="ml-1" />
          </button>
        ) : null}
      </form>
    </div>
  );
};
export default MessageInput;
