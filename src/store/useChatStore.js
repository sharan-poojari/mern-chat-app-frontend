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

  // ---------------------------------------------------------
  // Fetch contacts/users and synchronize selected contact
  // ---------------------------------------------------------
  getUsers: async () => {
    set({ isUsersLoading: true });

    try {
      const res = await axiosInstance.get("/messages/users");
      const users = res.data;

      set((state) => {
        const selectedUser = state.selectedUser;

        if (!selectedUser) {
          return { users };
        }

        const updatedSelectedUser = users.find(
          (user) => user._id === selectedUser._id
        );

        if (!updatedSelectedUser) {
          return {
            users,
            selectedUser: null,
            messages: [],
            unreadCount: 0,
            newMessagesStartIndex: -1,
            showNewMessagesSeparator: false,
            hasMoreMessages: false,
            isTyping: false,
          };
        }

        return {
          users,
          selectedUser: updatedSelectedUser,
          isTyping: updatedSelectedUser.isBlocked
            ? false
            : state.isTyping,
        };
      });
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to load users"
      );
    } finally {
      set({ isUsersLoading: false });
    }
  },

  // ---------------------------------------------------------
  // Fetch messages for selected contact
  // ---------------------------------------------------------
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

  // ---------------------------------------------------------
  // Load older messages
  // ---------------------------------------------------------
  loadOlderMessages: async () => {
    const {
      selectedUser,
      messages,
      hasMoreMessages,
      isLoadingOlderMessages,
    } = get();

    if (
      !selectedUser ||
      selectedUser.isBlocked ||
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

  // ---------------------------------------------------------
  // Mark messages as read
  // ---------------------------------------------------------
  markMessagesAsRead: async (userId) => {
    if (!userId) return;

    const { selectedUser } = get();

    if (
      !selectedUser ||
      selectedUser._id !== userId ||
      selectedUser.isBlocked
    ) {
      return;
    }

    try {
      await axiosInstance.put(`/messages/read/${userId}`);

      set((state) => ({
        messages: state.messages.map((message) =>
          message.senderId === userId
            ? { ...message, status: "read" }
            : message
        ),
        unreadCount: 0,
      }));
    } catch (error) {
      console.log(
        "Error in markMessagesAsRead:",
        error.response?.data?.message || error.message
      );
    }
  },

  // ---------------------------------------------------------
  // Hide new messages separator
  // ---------------------------------------------------------
  clearNewMessagesSeparator: () => {
    set({
      showNewMessagesSeparator: false,
      newMessagesStartIndex: -1,
    });
  },

  // ---------------------------------------------------------
  // Edit a message
  // ---------------------------------------------------------
  editMessage: async (messageId, text) => {
    const { selectedUser } = get();

    if (!selectedUser || selectedUser.isBlocked) {
      toast.error("Messaging is disabled for this contact");
      return false;
    }

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

  // ---------------------------------------------------------
  // Delete a message
  // ---------------------------------------------------------
  deleteMessage: async (messageId) => {
    const { selectedUser } = get();

    if (!selectedUser || selectedUser.isBlocked) {
      toast.error("Messaging is disabled for this contact");
      return false;
    }

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

  // ---------------------------------------------------------
  // Send a message
  // ---------------------------------------------------------
  sendMessage: async (messageData) => {
    const { selectedUser } = get();

    if (!selectedUser || selectedUser.isBlocked) {
      toast.error("Messaging is disabled for this contact");
      return false;
    }

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

  // ---------------------------------------------------------
  // Subscribe to real-time messages and events
  // ---------------------------------------------------------
  subscribeToMessages: () => {
    const { selectedUser } = get();

    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    if (!socket) return;

    // New message
    socket.on("newMessage", async (newMessage) => {
      const currentSelectedUser = get().selectedUser;

      if (
        !currentSelectedUser ||
        currentSelectedUser._id !== selectedUser._id ||
        currentSelectedUser.isBlocked
      ) {
        return;
      }

      const isMessageFromSelectedUser =
        newMessage.senderId === selectedUser._id;

      if (!isMessageFromSelectedUser) return;

      set((state) => ({
        messages: [...state.messages, newMessage],
      }));

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

    // Message edit
    socket.on("messageEdited", ({ messageId, text }) => {
      set((state) => ({
        messages: state.messages.map((message) =>
          message._id === messageId
            ? { ...message, text }
            : message
        ),
      }));
    });

    // Message delete
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

    // Typing indicator
    socket.on("userTyping", (userId) => {
      const currentSelectedUser = get().selectedUser;

      if (
        currentSelectedUser?._id === selectedUser._id &&
        userId === selectedUser._id &&
        !currentSelectedUser.isBlocked
      ) {
        set({ isTyping: true });
      }
    });

    // Stop typing
    socket.on("userStoppedTyping", (userId) => {
      if (userId === selectedUser._id) {
        set({ isTyping: false });
      }
    });
  },

  // ---------------------------------------------------------
  // Unsubscribe from real-time events
  // ---------------------------------------------------------
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

  // ---------------------------------------------------------
  // Select a contact and reset chat state
  // ---------------------------------------------------------
  setSelectedUser: (selectedUser) => {
    set({
      selectedUser,
      messages: [],
      unreadCount: 0,
      newMessagesStartIndex: -1,
      showNewMessagesSeparator: false,
      hasMoreMessages: false,
      isTyping: false,
      isLoadingOlderMessages: false,
    });
  },
}));