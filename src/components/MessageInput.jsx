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

  const isChatBlocked = Boolean(selectedUser?.isBlocked);

  const handleImageChange = (e) => {
    if (isChatBlocked) {
      toast.error("You cannot send messages to a blocked user");
      return;
    }

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
    if (isChatBlocked) return;

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

    if (isChatBlocked) {
      toast.error("You cannot send messages to a blocked user");
      return;
    }

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
      typingTimeoutRef.current = null;
    }
  };

  const hasMessageContent = Boolean(text.trim() || imagePreview);

  return (
    <div className="w-full px-1 py-2 sm:px-0 sm:py-0">
      {/* Image Preview */}
      {imagePreview && !isChatBlocked && (
        <div className="mb-3 px-1">
          <div className="relative inline-block rounded-xl border border-base-300 bg-base-200 p-1.5 shadow-sm">
            <img
              src={imagePreview}
              alt="Selected image preview"
              className="size-20 rounded-lg object-cover sm:size-24"
            />

            <button
              type="button"
              onClick={removeImage}
              className="absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full border border-base-300 bg-base-100 text-base-content shadow-sm transition-all hover:scale-105 hover:bg-error hover:text-error-content"
              title="Remove image"
              aria-label="Remove selected image"
            >
              <X className="size-3.5" />
            </button>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSendMessage}
        className="flex w-full items-center gap-1.5 sm:gap-2"
      >
        {/* Message Input */}
        <input
          type="text"
          className="input input-bordered input-sm min-w-0 flex-1 rounded-full px-4 transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 sm:input-md"
          placeholder={
            isChatBlocked
              ? "Chat is blocked"
              : imagePreview
                ? "Add a message (optional)..."
                : "Type a message..."
          }
          value={text}
          onChange={handleTextChange}
          maxLength={1000}
          disabled={isChatBlocked}
        />

        {/* Hidden File Input */}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={handleImageChange}
          disabled={isChatBlocked}
        />

        {/* Image Button */}
        <button
          type="button"
          onClick={() => {
            if (isChatBlocked) {
              toast.error("You cannot send messages to a blocked user");
              return;
            }

            fileInputRef.current?.click();
          }}
          className={`btn btn-circle btn-sm shrink-0 transition-all sm:btn-md ${
            isChatBlocked
              ? "btn-ghost border border-base-300 opacity-40"
              : imagePreview
                ? "btn-primary"
                : "btn-ghost border border-base-300"
          }`}
          title={isChatBlocked ? "Chat is blocked" : "Attach image"}
          aria-label={isChatBlocked ? "Chat is blocked" : "Attach image"}
          disabled={isChatBlocked}
        >
          <Image className="size-4 sm:size-5" />
        </button>

        {/* Send Button */}
        <button
          type="submit"
          className={`btn btn-circle btn-sm shrink-0 transition-all sm:btn-md ${
            isChatBlocked
              ? "btn-ghost border border-base-300 opacity-40"
              : hasMessageContent
                ? "btn-primary"
                : "btn-ghost border border-base-300 opacity-50"
          }`}
          disabled={isChatBlocked || !hasMessageContent}
          title={isChatBlocked ? "Chat is blocked" : "Send message"}
          aria-label={isChatBlocked ? "Chat is blocked" : "Send message"}
        >
          <Send className="size-4 sm:size-5" />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;