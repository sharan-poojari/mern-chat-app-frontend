import { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import MessageInput from "./MessageInput";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
    isTyping,
    isMessagesLoading,
  } = useChatStore();

  const { authUser, onlineUsers } = useAuthStore();

  const messageEndRef = useRef(null);

  useEffect(() => {
    getMessages(selectedUser._id);
    subscribeToMessages();

    return () => unsubscribeFromMessages();
  }, [
    selectedUser._id,
    getMessages,
    subscribeToMessages,
    unsubscribeFromMessages,
  ]);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({
        behavior: "smooth",
      });
    }
  }, [messages]);

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
          <h3 className="font-semibold">{selectedUser.fullName}</h3>

          <p className="text-sm text-zinc-400">
            {onlineUsers.includes(selectedUser._id)
              ? "Online"
              : "Offline"}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isMessagesLoading ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 className="size-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {messages.map((message) => {
              const isOwnMessage = message.senderId === authUser._id;

              return (
                <div
                  key={message._id}
                  className={`flex ${
                    isOwnMessage ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[65%] rounded-2xl px-4 py-2 break-words overflow-hidden ${
                      isOwnMessage
                        ? "bg-primary text-primary-content rounded-br-sm"
                        : "bg-base-300 rounded-bl-sm"
                    }`}
                  >
                    {message.image && (
                      <img
                        src={message.image}
                        alt="attachment"
                        className="w-full max-w-[280px] max-h-[300px] object-cover rounded-lg mb-2 cursor-pointer transition-transform hover:scale-[1.02]"
                      />
                    )}

                    {message.text && (
                      <p className="whitespace-pre-wrap break-words leading-relaxed">
                        {message.text}
                      </p>
                    )}
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