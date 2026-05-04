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
    <div className="p-4 w-full bg-bg-dark border-t border-glass-border">
      {imagePreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-xl border border-glass-border"
            />
            <button
              onClick={removeImage}
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
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange}
          />
          <button
            type="button"
            className={`p-2 rounded-full cursor-pointer transition-colors ${imagePreview ? "text-primary" : "text-text-muted hover:text-white"}`}
            onClick={() => fileInputRef.current?.click()}
          >
            <Image size={22} />
          </button>
        </div>
        
        {text.trim() || imagePreview ? (
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
