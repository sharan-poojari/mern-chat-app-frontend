import { useEffect, useRef, useState } from "react";
import { Loader2, Pencil, Trash2, Check, X } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import MessageInput from "./MessageInput";

const ChatContainer = () => {
  const {
    messages,
    unreadCount,
    getMessages,
    markMessagesAsRead,
    editMessage,
    deleteMessage,
    loadOlderMessages,
    hasMoreMessages,
    isLoadingOlderMessages,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
    isTyping,
    isMessagesLoading,
  } = useChatStore();

  const { authUser, onlineUsers } = useAuthStore();

  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingText, setEditingText] = useState("");

  const messageEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const previousMessageCountRef = useRef(0);
  const loadingOlderMessagesRef = useRef(false);

  useEffect(() => {
    if (!selectedUser?._id) return;

    getMessages(selectedUser._id);
    subscribeToMessages();

    return () => unsubscribeFromMessages();
  }, [
    selectedUser?._id,
    getMessages,
    subscribeToMessages,
    unsubscribeFromMessages,
  ]);

  // Mark messages as read when chat is opened
  useEffect(() => {
    if (!selectedUser?._id) return;

    const timer = setTimeout(() => {
      markMessagesAsRead(selectedUser._id);
    }, 5000);

    return () => clearTimeout(timer);
  }, [selectedUser?._id, markMessagesAsRead]);

  useEffect(() => {
    const container = messagesContainerRef.current;

    if (!container) return;

    const previousCount = previousMessageCountRef.current;
    const currentCount = messages.length;

    // Initial messages load → scroll to bottom
    if (previousCount === 0 && currentCount > 0) {
      messageEndRef.current?.scrollIntoView({
        behavior: "auto",
      });
    }

    // New message received/sent → scroll to bottom
    if (
      currentCount > previousCount &&
      !loadingOlderMessagesRef.current
    ) {
      messageEndRef.current?.scrollIntoView({
        behavior: "smooth",
      });
    }

    previousMessageCountRef.current = currentCount;
  }, [messages]);

  const handleEditStart = (message) => {
    setEditingMessageId(message._id);
    setEditingText(message.text || "");
  };

  const handleEditCancel = () => {
    setEditingMessageId(null);
    setEditingText("");
  };

  const handleEditSave = async (messageId) => {
    const trimmedText = editingText.trim();

    if (!trimmedText) return;

    const success = await editMessage(messageId, trimmedText);

    if (success) {
      setEditingMessageId(null);
      setEditingText("");
    }
  };

  const handleDelete = async (messageId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this message?"
    );

    if (!confirmed) return;

    await deleteMessage(messageId);
  };

  // Format message time
  const formatMessageTime = (createdAt) => {
    if (!createdAt) return "";

    return new Date(createdAt).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleLoadOlderMessages = async () => {
    const container = messagesContainerRef.current;

    if (!container) return;

    const previousScrollHeight = container.scrollHeight;
    const previousScrollTop = container.scrollTop;

    loadingOlderMessagesRef.current = true;

    await loadOlderMessages();

    requestAnimationFrame(() => {
      const newScrollHeight = container.scrollHeight;

      container.scrollTop =
        newScrollHeight - previousScrollHeight + previousScrollTop;

      loadingOlderMessagesRef.current = false;
    });
  };

  // Calculate where unread messages begin
  const unreadStartIndex =
    unreadCount > 0
      ? Math.max(0, messages.length - unreadCount)
      : -1;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Chat Header */}
      <div className="p-4 border-b border-base-300 flex items-center gap-3">
        <div className="relative">
          <img
            src={selectedUser.profilePic || "/avatar.png"}
            alt={selectedUser.fullName}
            className="size-10 rounded-full object-cover"
          />

          {onlineUsers.includes(selectedUser._id) && (
            <span className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full ring-2 ring-base-100" />
          )}
        </div>

        <div>
          <h3 className="font-semibold">
            {selectedUser.fullName}
          </h3>

          <p className="text-sm text-zinc-400">
            {onlineUsers.includes(selectedUser._id)
              ? "Online"
              : "Offline"}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-3"
      >
        {hasMoreMessages && (
          <div className="flex justify-center mb-4">
            <button
              type="button"
              onClick={handleLoadOlderMessages}
              disabled={isLoadingOlderMessages}
              className="btn btn-sm btn-ghost"
            >
              {isLoadingOlderMessages ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Loading...
                </>
              ) : (
                "Load older messages"
              )}
            </button>
          </div>
        )}

        {isMessagesLoading ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 className="size-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {messages.map((message, index) => {
              const isOwnMessage =
                message.senderId === authUser._id;

              const isEditing =
                editingMessageId === message._id;

              return (
                <div key={message._id}>
                  {/* New Messages Separator */}
                  {index === unreadStartIndex &&
                    unreadCount > 0 && (
                      <div className="flex items-center gap-3 my-4">
                        <div className="flex-1 h-px bg-base-300" />

                        <span className="text-xs font-medium text-primary whitespace-nowrap">
                          New messages
                        </span>

                        <div className="flex-1 h-px bg-base-300" />
                      </div>
                    )}

                  <div
                    className={`flex ${
                      isOwnMessage
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-[65%] rounded-2xl px-4 py-2 break-words overflow-hidden ${
                        isOwnMessage
                          ? "bg-primary text-primary-content rounded-br-sm"
                          : "bg-base-300 rounded-bl-sm"
                      }`}
                    >
                      {/* Image */}
                      {message.image && (
                        <img
                          src={message.image}
                          alt="attachment"
                          className="w-full max-w-[280px] max-h-[300px] object-cover rounded-lg mb-2 cursor-pointer transition-transform hover:scale-[1.02]"
                        />
                      )}

                      {/* Edit Mode */}
                      {isEditing ? (
                        <div className="space-y-2">
                          <textarea
                            value={editingText}
                            onChange={(e) =>
                              setEditingText(e.target.value)
                            }
                            maxLength={1000}
                            rows={3}
                            autoFocus
                            className="w-full min-w-[220px] rounded-lg p-2 text-sm bg-base-100 text-base-content outline-none resize-none"
                          />

                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={handleEditCancel}
                              className="btn btn-xs btn-ghost"
                              title="Cancel"
                            >
                              <X className="size-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleEditSave(message._id)
                              }
                              className="btn btn-xs btn-success"
                              title="Save"
                              disabled={!editingText.trim()}
                            >
                              <Check className="size-4" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          {/* Message Text */}
                          {message.text && (
                            <p className="whitespace-pre-wrap break-words leading-relaxed">
                              {message.text}
                            </p>
                          )}

                          {/* Edit / Delete */}
                          {isOwnMessage && (
                            <div className="flex justify-end gap-2 mt-1">
                              {message.text && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleEditStart(message)
                                  }
                                  className="opacity-60 hover:opacity-100 transition-opacity"
                                  title="Edit message"
                                >
                                  <Pencil className="size-3.5" />
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() =>
                                  handleDelete(message._id)
                                }
                                className="opacity-60 hover:opacity-100 transition-opacity"
                                title="Delete message"
                              >
                                <Trash2 className="size-3.5" />
                              </button>
                            </div>
                          )}
                        </>
                      )}

                      {/* Message Time & Status */}
                      {!isEditing && (
                        <div className="flex justify-end items-center gap-1 mt-1">
                          <span className="text-[10px] opacity-60">
                            {formatMessageTime(message.createdAt)}
                          </span>

                          {isOwnMessage && (
                            <span
                              className={`text-xs ${
                                message.status === "read"
                                  ? "text-blue-400"
                                  : "opacity-70"
                              }`}
                            >
                              {message.status === "sent" && "✓"}

                              {(message.status === "delivered" ||
                                message.status === "read") &&
                                "✓✓"}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-base-300 rounded-2xl rounded-bl-sm px-4 py-2">
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-zinc-400">
                      {selectedUser.fullName} is typing
                    </span>

                    <span className="flex gap-1">
                      <span className="size-1.5 bg-zinc-400 rounded-full animate-bounce" />
                      <span className="size-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:0.15s]" />
                      <span className="size-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:0.3s]" />
                    </span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Auto-scroll target */}
        <div ref={messageEndRef} />
      </div>

      {/* Message Input */}
      <MessageInput />
    </div>
  );
};

export default ChatContainer;