import { useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { Image, Send, X, Smile, Paperclip, FileText, Mic, Plus } from "lucide-react";
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

  return (
    <div className="w-full bg-wa-panel px-4 py-2 relative z-40 flex flex-col">
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

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <button
            type="button"
            className={`wa-icon-btn ${showEmojiPicker ? "active" : ""}`}
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            <Smile size={26} />
          </button>
          
          <button
            type="button"
            className="wa-icon-btn"
            onClick={() => fileInputRef.current?.click()}
          >
            <Plus size={26} />
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
            className="w-full bg-wa-input text-wa-primary rounded-lg px-4 py-2.5 outline-none resize-none max-h-32 text-[15px] placeholder-wa-muted"
            placeholder="Type a message"
            rows="1"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

        <div className="flex items-center justify-center w-12 h-12">
          {text.trim() || imagePreview || filePreview ? (
            <button
              onClick={handleSendMessage}
              className="wa-icon-btn active"
            >
              <Send size={24} />
            </button>
          ) : (
            <button className="wa-icon-btn">
              <Mic size={24} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageInput;


