import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios.js";
import { useAuthStore } from "./useAuthStore.js";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,

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
    });

    try {
      const res = await axiosInstance.get(`/messages/${userId}`);

      set({
        messages: res.data,
      });
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to load messages"
      );
    } finally {
      set({ isMessagesLoading: false });
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

    socket.on("newMessage", (newMessage) => {
      const isMessageFromSelectedUser =
        newMessage.senderId === selectedUser._id;

      if (!isMessageFromSelectedUser) return;

      set((state) => ({
        messages: [...state.messages, newMessage],
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
    socket.off("userTyping");
    socket.off("userStoppedTyping");

    set({ isTyping: false });
  },

  setSelectedUser: (selectedUser) => {
    set({
      selectedUser,
      isTyping: false,
      messages: [],
    });
  },
}));