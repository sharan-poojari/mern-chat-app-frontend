import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios.js";
import { useAuthStore } from "./useAuthStore.js";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,

  unreadCount: 0,
  newMessagesStartIndex: -1,
  showNewMessagesSeparator: false,

  hasMoreMessages: false,
  isLoadingOlderMessages: false,
  isUsersLoading: false,
  isMessagesLoading: false,
  isTyping: false,

  getUsers: async () => {
    set({ isUsersLoading: true });

    try {
      const res = await axiosInstance.get("/messages/users");

      set({
        users: res.data,
      });
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to load users"
      );
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    if (!userId) return;

    set({
      isMessagesLoading: true,
      messages: [],
      unreadCount: 0,
      newMessagesStartIndex: -1,
      showNewMessagesSeparator: false,
      hasMoreMessages: false,
    });

    try {
      const res = await axiosInstance.get(
        `/messages/${userId}?limit=100`
      );

      const unreadCount = res.data.unreadCount || 0;

      const newMessagesStartIndex =
        unreadCount > 0
          ? Math.max(0, res.data.messages.length - unreadCount)
          : -1;

      set({
        messages: res.data.messages,
        unreadCount,
        newMessagesStartIndex,
        showNewMessagesSeparator: unreadCount > 0,
        hasMoreMessages: res.data.hasMore,
      });
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to load messages"
      );
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  loadOlderMessages: async () => {
    const {
      selectedUser,
      messages,
      hasMoreMessages,
      isLoadingOlderMessages,
    } = get();

    if (
      !selectedUser ||
      !messages.length ||
      !hasMoreMessages ||
      isLoadingOlderMessages
    ) {
      return;
    }

    const oldestMessage = messages[0];

    set({ isLoadingOlderMessages: true });

    try {
      const res = await axiosInstance.get(
        `/messages/${selectedUser._id}?limit=100&before=${oldestMessage._id}`
      );

      set((state) => ({
        messages: [...res.data.messages, ...state.messages],
        hasMoreMessages: res.data.hasMore,
      }));
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to load older messages"
      );
    } finally {
      set({ isLoadingOlderMessages: false });
    }
  },

  // Mark messages as read
  markMessagesAsRead: async (userId) => {
    if (!userId) return;

    try {
      await axiosInstance.put(`/messages/read/${userId}`);

      set((state) => ({
        messages: state.messages.map((message) =>
          message.senderId === userId
            ? { ...message, status: "read" }
            : message
        ),

        // Read status is independent from the new messages separator.
        unreadCount: 0,
      }));
    } catch (error) {
      console.log(
        "Error in markMessagesAsRead:",
        error.response?.data?.message || error.message
      );
    }
  },

  // Hide the "New messages" separator independently
  clearNewMessagesSeparator: () => {
    set({
      showNewMessagesSeparator: false,
      newMessagesStartIndex: -1,
    });
  },

  editMessage: async (messageId, text) => {
    try {
      const res = await axiosInstance.put(
        `/messages/edit/${messageId}`,
        { text }
      );

      set((state) => ({
        messages: state.messages.map((message) =>
          message._id === messageId
            ? { ...message, text: res.data.text }
            : message
        ),
      }));

      return true;
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to edit message"
      );

      return false;
    }
  },

  deleteMessage: async (messageId) => {
    try {
      const res = await axiosInstance.delete(
        `/messages/${messageId}`
      );

      set((state) => ({
        messages: state.messages.filter(
          (message) => message._id !== messageId
        ),
      }));

      return res.data;
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to delete message"
      );

      return false;
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser } = get();

    if (!selectedUser) return false;

    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        messageData
      );

      set((state) => ({
        messages: [...state.messages, res.data],
      }));

      return true;
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to send message"
      );

      return false;
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();

    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    if (!socket) return;

    socket.on("newMessage", async (newMessage) => {
      const isMessageFromSelectedUser =
        newMessage.senderId === selectedUser._id;

      if (!isMessageFromSelectedUser) return;

      set((state) => ({
        messages: [...state.messages, newMessage],
      }));

      // Chat is already open, so the new message is
      // immediately marked as read.
      await get().markMessagesAsRead(newMessage.senderId);
    });

    // Message delivered status
    socket.on("messageDelivered", ({ messageId }) => {
      set((state) => ({
        messages: state.messages.map((message) =>
          message._id === messageId
            ? { ...message, status: "delivered" }
            : message
        ),
      }));
    });

    // Message Edit
    socket.on("messageEdited", ({ messageId, text }) => {
      set((state) => ({
        messages: state.messages.map((message) =>
          message._id === messageId
            ? { ...message, text }
            : message
        ),
      }));
    });

    // Message Delete
    socket.on("messageDeleted", ({ messageId }) => {
      set((state) => ({
        messages: state.messages.filter(
          (message) => message._id !== messageId
        ),
      }));
    });

    // Message read status
    socket.on("messagesRead", ({ senderId }) => {
      set((state) => ({
        messages: state.messages.map((message) =>
          message.receiverId === senderId
            ? { ...message, status: "read" }
            : message
        ),
      }));
    });

    socket.on("userTyping", (userId) => {
      if (userId === selectedUser._id) {
        set({ isTyping: true });
      }
    });

    socket.on("userStoppedTyping", (userId) => {
      if (userId === selectedUser._id) {
        set({ isTyping: false });
      }
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;

    if (!socket) return;

    socket.off("newMessage");
    socket.off("messageDelivered");
    socket.off("messagesRead");
    socket.off("messageEdited");
    socket.off("userTyping");
    socket.off("userStoppedTyping");
    socket.off("messageDeleted");

    set({ isTyping: false });
  },

  setSelectedUser: (selectedUser) => {
    set({
      selectedUser,
      isTyping: false,
      messages: [],
      unreadCount: 0,
      newMessagesStartIndex: -1,
      showNewMessagesSeparator: false,
    });
  },
}));