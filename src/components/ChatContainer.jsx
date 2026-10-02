import { useEffect, useRef, useState } from "react";
import {
  Loader2,
  Pencil,
  Trash2,
  Check,
  X,
  Circle,
  MessageCircle,
  Maximize2,
} from "lucide-react";

import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import MessageInput from "./MessageInput";

const ChatContainer = () => {
  const {
    messages,
    newMessagesStartIndex,
    showNewMessagesSeparator,
    getMessages,
    markMessagesAsRead,
    clearNewMessagesSeparator,
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
  const [selectedImage, setSelectedImage] = useState(null);

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

  // Mark messages as read after messages are loaded
  useEffect(() => {
    if (!selectedUser?._id) return;
    if (isMessagesLoading) return;
    if (!messages.length) return;

    markMessagesAsRead(selectedUser._id);
  }, [
    selectedUser?._id,
    isMessagesLoading,
    messages.length,
    markMessagesAsRead,
  ]);

  // Keep "New messages" separator independent from read receipts
  useEffect(() => {
    if (!showNewMessagesSeparator) return;

    const timer = setTimeout(() => {
      clearNewMessagesSeparator();
    }, 5000);

    return () => clearTimeout(timer);
  }, [showNewMessagesSeparator, clearNewMessagesSeparator]);

  // Close image preview with Escape key
  useEffect(() => {
    if (!selectedImage) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setSelectedImage(null);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedImage]);

  // Prevent body scrolling while image preview is open
  useEffect(() => {
    if (!selectedImage) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [selectedImage]);

  useEffect(() => {
    const container = messagesContainerRef.current;

    if (!container) return;

    const previousCount = previousMessageCountRef.current;
    const currentCount = messages.length;

    if (previousCount === 0 && currentCount > 0) {
      messageEndRef.current?.scrollIntoView({
        behavior: "auto",
      });
    }

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

  const isSelectedUserOnline = onlineUsers.includes(
    selectedUser?._id
  );

  // Empty state when no conversation is selected
  if (!selectedUser) {
    return (
      <div className="flex h-full min-h-0 flex-1 items-center justify-center bg-base-100 px-6">
        <div className="flex max-w-sm flex-col items-center text-center">
          <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-base-200">
            <MessageCircle className="size-8 text-primary" />
          </div>

          <h2 className="text-lg font-semibold sm:text-xl">
            Select a conversation
          </h2>

          <p className="mt-2 text-sm leading-6 text-zinc-400">
            Choose a contact from the sidebar to start chatting.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-base-100">
        {/* Chat Header */}
        <div className="flex shrink-0 items-center gap-3 border-b border-base-300 bg-base-100 px-4 py-3 sm:gap-4 sm:px-5 sm:py-3.5">
          {/* Avatar */}
          <div className="relative shrink-0">
            <img
              src={selectedUser.profilePic || "/avatar.svg"}
              alt={selectedUser.fullName}
              className="size-10 rounded-full object-cover ring-1 ring-base-300 sm:size-11"
            />

            <span
              className={`absolute bottom-0 right-0 size-3 rounded-full ring-2 ring-base-100 transition-colors ${
                isSelectedUserOnline
                  ? "bg-green-500"
                  : "bg-zinc-400"
              }`}
            />
          </div>

          {/* User Info */}
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-semibold sm:text-base">
              {selectedUser.fullName}
            </h3>

            <div className="mt-0.5 flex items-center gap-1.5">
              <Circle
                className={`size-2 fill-current ${
                  isSelectedUserOnline
                    ? "text-green-500"
                    : "text-zinc-400"
                }`}
              />

              <p
                className={`text-xs font-medium sm:text-sm ${
                  isSelectedUserOnline
                    ? "text-green-500"
                    : "text-zinc-400"
                }`}
              >
                {isSelectedUserOnline ? "Online" : "Offline"}
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div
          ref={messagesContainerRef}
          className="min-h-0 flex-1 overflow-y-auto px-3 py-4 sm:px-5 sm:py-5"
        >
          {isMessagesLoading ? (
            <div className="flex h-full flex-col items-center justify-center">
              <div className="flex size-14 items-center justify-center rounded-full bg-base-200">
                <Loader2 className="size-7 animate-spin text-primary" />
              </div>

              <p className="mt-3 text-sm text-zinc-400">
                Loading conversation...
              </p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center px-4 text-center">
              <div className="flex size-14 items-center justify-center rounded-full bg-base-200">
                <MessageCircle className="size-7 text-primary" />
              </div>

              <h3 className="mt-4 text-base font-semibold sm:text-lg">
                No messages yet
              </h3>

              <p className="mt-1.5 max-w-xs text-sm leading-6 text-zinc-400">
                Start a conversation with {selectedUser.fullName}.
              </p>
            </div>
          ) : (
            <>
              {hasMoreMessages && (
                <div className="mb-5 flex justify-center">
                  <button
                    type="button"
                    onClick={handleLoadOlderMessages}
                    disabled={isLoadingOlderMessages}
                    className="btn btn-sm btn-ghost rounded-full px-4 text-xs"
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

              <div className="flex flex-col gap-3 sm:gap-4">
                {messages.map((message, index) => {
                  const isOwnMessage =
                    message.senderId === authUser._id;

                  const isEditing =
                    editingMessageId === message._id;

                  const shouldShowNewMessagesSeparator =
                    showNewMessagesSeparator &&
                    index === newMessagesStartIndex;

                  return (
                    <div key={message._id}>
                      {/* New Messages Separator */}
                      {shouldShowNewMessagesSeparator && (
                        <div className="my-5 flex items-center gap-3">
                          <div className="h-px flex-1 bg-base-300" />

                          <span className="whitespace-nowrap rounded-full bg-base-200 px-3 py-1 text-[11px] font-medium text-primary sm:text-xs">
                            New messages
                          </span>

                          <div className="h-px flex-1 bg-base-300" />
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
                          className={`w-fit max-w-[88%] overflow-hidden rounded-2xl shadow-sm sm:max-w-[70%] ${
                            isOwnMessage
                              ? "rounded-br-md bg-primary text-primary-content"
                              : "rounded-bl-md bg-base-300"
                          }`}
                        >
                          {/* Image */}
                          {message.image && (
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedImage(message.image)
                              }
                              className="group relative block w-full overflow-hidden bg-black/5 text-left"
                              aria-label="View image"
                            >
                              <img
                                src={message.image}
                                alt="Message attachment"
                                className="block max-h-[360px] w-full max-w-[280px] object-cover transition-transform duration-200 group-hover:scale-[1.02] sm:max-w-[340px]"
                              />

                              <span className="absolute bottom-2 right-2 flex size-8 items-center justify-center rounded-full bg-black/50 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                                <Maximize2 className="size-4" />
                              </span>
                            </button>
                          )}

                          <div
                            className={`${
                              message.image
                                ? "px-3.5 pb-2.5 pt-2.5 sm:px-4 sm:pb-3"
                                : "px-3.5 py-2.5 sm:px-4 sm:py-3"
                            }`}
                          >
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
                                  className="w-full min-w-[180px] resize-none rounded-lg bg-base-100 p-2.5 text-sm text-base-content outline-none sm:min-w-[240px]"
                                />

                                <div className="flex justify-end gap-1.5">
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
                                {message.text && (
                                  <p className="whitespace-pre-wrap break-words text-sm leading-6 sm:text-[15px]">
                                    {message.text}
                                  </p>
                                )}

                                {isOwnMessage && (
                                  <div
                                    className={`flex items-center justify-end gap-2 ${
                                      message.text || message.image
                                        ? "mt-1.5"
                                        : ""
                                    }`}
                                  >
                                    {message.text && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleEditStart(message)
                                        }
                                        className="flex size-6 items-center justify-center rounded-full opacity-50 transition hover:bg-black/10 hover:opacity-100"
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
                                      className="flex size-6 items-center justify-center rounded-full opacity-50 transition hover:bg-black/10 hover:opacity-100"
                                      title="Delete message"
                                    >
                                      <Trash2 className="size-3.5" />
                                    </button>
                                  </div>
                                )}
                              </>
                            )}

                            {!isEditing && (
                              <div className="mt-1.5 flex items-center justify-end gap-1.5">
                                <span className="text-[10px] leading-none opacity-60 sm:text-[11px]">
                                  {formatMessageTime(
                                    message.createdAt
                                  )}
                                </span>

                                {isOwnMessage && (
                                  <span
                                    className={`text-[11px] leading-none ${
                                      message.status === "read"
                                        ? "font-medium text-blue-400"
                                        : "opacity-60"
                                    }`}
                                    aria-label={`Message ${
                                      message.status || "sent"
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
                    </div>
                  );
                })}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="flex items-center gap-2 rounded-2xl rounded-bl-md bg-base-300 px-4 py-2.5 shadow-sm">
                      <div className="flex items-center gap-1">
                        <span className="size-1.5 animate-bounce rounded-full bg-zinc-400" />
                        <span className="size-1.5 animate-bounce rounded-full bg-zinc-400 [animation-delay:0.15s]" />
                        <span className="size-1.5 animate-bounce rounded-full bg-zinc-400 [animation-delay:0.3s]" />
                      </div>

                      <span className="text-xs font-medium text-zinc-400 sm:text-sm">
                        {selectedUser.fullName} is typing...
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          <div ref={messageEndRef} />
        </div>

        {/* Message Input */}
        <div className="shrink-0 border-t border-base-300 bg-base-100 p-3 sm:p-4">
          <MessageInput />
        </div>
      </div>

      {/* Image Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setSelectedImage(null)}
        >
          <button
            type="button"
            onClick={() => setSelectedImage(null)}
            className="absolute right-4 top-4 flex size-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            title="Close image"
            aria-label="Close image"
          >
            <X className="size-5" />
          </button>

          <img
            src={selectedImage}
            alt="Full size message attachment"
            className="max-h-[90vh] max-w-[95vw] rounded-lg object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
};

export default ChatContainer;