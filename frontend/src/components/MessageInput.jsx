import { useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { Image, Send, X } from "lucide-react";
import toast from "react-hot-toast";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const { sendMessage } = useChatStore();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;

    try {
      await sendMessage({
        text: text.trim(),
        image: imagePreview,
      });

      // Clear form
      setText("");
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <div className="p-4 sm:p-6 w-full bg-white/5 backdrop-blur-md border-t border-glass-border">
      {imagePreview && (
        <div className="mb-4 flex items-center gap-2">
          <div className="relative group">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-24 h-24 object-cover rounded-2xl border-2 border-primary/50 shadow-lg"
            />
            <button
              onClick={removeImage}
              className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-red-500 text-white shadow-md
              flex items-center justify-center transition-transform hover:scale-110"
              type="button"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="flex items-center gap-3">
        <div className="flex-1 flex items-center gap-2 bg-black/20 p-2 rounded-full border border-white/5 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/50 transition-all shadow-inner">
          <button
            type="button"
            className={`p-2.5 rounded-full hover:bg-white/10 transition-colors ${imagePreview ? "text-primary" : "text-text-muted hover:text-white"}`}
            onClick={() => fileInputRef.current?.click()}
            title="Attach Image"
          >
            <Image size={22} />
          </button>
          
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange}
          />
          
          <input
            type="text"
            className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-text-muted px-2 py-2"
            placeholder="Type your message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>
        
        <button
          type="submit"
          className={`p-3.5 rounded-full flex items-center justify-center transition-all duration-300 shadow-md ${
            !text.trim() && !imagePreview 
              ? "bg-white/5 text-white/30 cursor-not-allowed" 
              : "bg-gradient-to-r from-primary to-purple-500 text-white hover:scale-105 hover:shadow-lg hover:shadow-primary/20"
          }`}
          disabled={!text.trim() && !imagePreview}
        >
          <Send size={22} className={(!text.trim() && !imagePreview) ? "" : "ml-1"} />
        </button>
      </form>
    </div>
  );
};
export default MessageInput;
