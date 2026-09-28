import { useRef, useState } from "react";
import { Image, Send, X } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import toast from "react-hot-toast";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);

  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const { sendMessage, selectedUser } = useChatStore();
  const { socket } = useAuthStore();

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
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

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleTextChange = (e) => {
    const value = e.target.value;

    setText(value);

    if (!socket || !selectedUser) return;

    socket.emit("typing", selectedUser._id);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stopTyping", selectedUser._id);
    }, 1000);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!text.trim() && !imagePreview) return;

    if (socket && selectedUser) {
      socket.emit("stopTyping", selectedUser._id);
    }

    await sendMessage({
      text: text.trim(),
      image: imagePreview,
    });

    setText("");
    setImagePreview(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  return (
    <div className="p-4 w-full border-t border-base-300">
      {imagePreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="size-20 object-cover rounded-lg border border-base-300"
            />

            <button
              type="button"
              onClick={removeImage}
              className="absolute -top-2 -right-2 size-6 rounded-full bg-base-300 flex items-center justify-center hover:bg-base-content hover:text-base-100 transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSendMessage}
        className="flex items-center gap-2"
      >
        <input
          type="text"
          className="w-full input input-bordered rounded-lg input-sm sm:input-md"
          placeholder="Type a message..."
          value={text}
          onChange={handleTextChange}
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
          onClick={() => fileInputRef.current?.click()}
          className="btn btn-circle btn-sm"
          title="Attach image"
        >
          <Image className="size-5" />
        </button>

        <button
          type="submit"
          className="btn btn-circle btn-sm"
          disabled={!text.trim() && !imagePreview}
          title="Send message"
        >
          <Send className="size-5" />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;