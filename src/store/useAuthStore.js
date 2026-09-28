import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL = "http://localhost:5001";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,
  isUpdatingProfile: false,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");

      set({ authUser: res.data });

      get().connectSocket();
    } catch (error) {
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    try {
      const res = await axiosInstance.post("/auth/signup", data);

      set({ authUser: res.data });

      toast.success("Account created successfully");

      get().connectSocket();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Signup failed"
      );
    }
  },

  login: async (data) => {
    try {
      const res = await axiosInstance.post("/auth/login", data);

      set({ authUser: res.data });

      toast.success("Logged in successfully");

      get().connectSocket();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Login failed"
      );
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");

      get().disconnectSocket();

      set({
        authUser: null,
        onlineUsers: [],
      });

      toast.success("Logged out successfully");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Logout failed"
      );
    }
  },

  connectSocket: () => {
    const { authUser } = get();

    if (!authUser || get().socket?.connected) return;

    const socket = io(BASE_URL, {
      withCredentials: true,
    });

    set({ socket });

    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });
  },

  disconnectSocket: () => {
    const socket = get().socket;

    if (socket?.connected) {
      socket.disconnect();
    }

    set({
      socket: null,
      onlineUsers: [],
    });
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });

    try {
      const res = await axiosInstance.put(
        "/auth/update-profile",
        data
      );

      set({ authUser: res.data });

      toast.success("Profile updated successfully");
    } catch (error) {
      console.log("Error in update profile:", error);

      toast.error(
        error.response?.data?.message || "Profile update failed"
      );
    } finally {
      set({ isUpdatingProfile: false });
    }
  },
}));