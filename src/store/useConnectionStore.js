import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios.js";
import { useChatStore } from "./useChatStore.js";

export const useConnectionStore = create((set, get) => ({
  contacts: [],
  discoveredUsers: [],
  requests: [],

  isContactsLoading: false,
  isDiscoverLoading: false,
  isRequestsLoading: false,
  isUpdatingConnection: false,

  // ---------------------------------------------------------
  // Get accepted contacts
  // ---------------------------------------------------------
  getContacts: async () => {
    set({ isContactsLoading: true });

    try {
      const res = await axiosInstance.get("/connections/contacts");

      set({
        contacts: res.data,
      });
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to load contacts"
      );
    } finally {
      set({ isContactsLoading: false });
    }
  },

  // ---------------------------------------------------------
  // Discover users
  // ---------------------------------------------------------
  discoverUsers: async () => {
    set({ isDiscoverLoading: true });

    try {
      const res = await axiosInstance.get("/connections/discover");

      set({
        discoveredUsers: res.data,
      });
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to discover users"
      );
    } finally {
      set({ isDiscoverLoading: false });
    }
  },

  // ---------------------------------------------------------
  // Get received connection requests
  // ---------------------------------------------------------
  getRequests: async () => {
    set({ isRequestsLoading: true });

    try {
      const res = await axiosInstance.get("/connections/requests");

      set({
        requests: res.data,
      });
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to load requests"
      );
    } finally {
      set({ isRequestsLoading: false });
    }
  },

  // ---------------------------------------------------------
  // Send connection request
  // ---------------------------------------------------------
  sendRequest: async (userId) => {
    if (!userId) return false;

    try {
      await axiosInstance.post("/connections/request", {
        userId,
      });

      set((state) => ({
        discoveredUsers: state.discoveredUsers.filter(
          (user) => user._id !== userId
        ),
      }));

      toast.success("Connection request sent");

      return true;
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to send connection request"
      );

      return false;
    }
  },

  // ---------------------------------------------------------
  // Accept connection request
  // ---------------------------------------------------------
  acceptRequest: async (connectionId) => {
    if (!connectionId) return false;

    set({ isUpdatingConnection: true });

    try {
      await axiosInstance.put(
        `/connections/accept/${connectionId}`
      );

      set((state) => ({
        requests: state.requests.filter(
          (request) => request._id !== connectionId
        ),
      }));

      await get().getContacts();

      // Refresh chat contacts
      const { getUsers } = useChatStore.getState();
      await getUsers();

      toast.success("Connection request accepted");

      return true;
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to accept connection request"
      );

      return false;
    } finally {
      set({ isUpdatingConnection: false });
    }
  },

  // ---------------------------------------------------------
  // Reject connection request
  // ---------------------------------------------------------
  rejectRequest: async (connectionId) => {
    if (!connectionId) return false;

    set({ isUpdatingConnection: true });

    try {
      await axiosInstance.delete(
        `/connections/reject/${connectionId}`
      );

      set((state) => ({
        requests: state.requests.filter(
          (request) => request._id !== connectionId
        ),
      }));

      toast.success("Connection request rejected");

      return true;
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to reject connection request"
      );

      return false;
    } finally {
      set({ isUpdatingConnection: false });
    }
  },

  // ---------------------------------------------------------
  // Remove accepted contact
  // ---------------------------------------------------------
  removeContact: async (userId) => {
    if (!userId) return false;

    set({ isUpdatingConnection: true });

    try {
      await axiosInstance.delete(
        `/connections/contact/${userId}`
      );

      set((state) => ({
        contacts: state.contacts.filter(
          (user) => user._id !== userId
        ),
      }));

      // Refresh sidebar/chat users
      const { getUsers, selectedUser, setSelectedUser } =
        useChatStore.getState();

      if (selectedUser?._id === userId) {
        setSelectedUser(null);
      }

      await getUsers();

      toast.success("Contact removed");

      return true;
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to remove contact"
      );

      return false;
    } finally {
      set({ isUpdatingConnection: false });
    }
  },

  // ---------------------------------------------------------
  // Block user
  // ---------------------------------------------------------
  blockUser: async (userId) => {
    if (!userId) return false;

    set({ isUpdatingConnection: true });

    try {
      await axiosInstance.put(
        `/connections/block/${userId}`
      );

      const {
        getUsers,
        selectedUser,
      } = useChatStore.getState();

      await getUsers();

      // Keep currently selected user blocked in UI
      if (selectedUser?._id === userId) {
        useChatStore.setState((state) => ({
          selectedUser: state.selectedUser
            ? {
                ...state.selectedUser,
                isBlocked: true,
              }
            : null,
          isTyping: false,
        }));
      }

      toast.success("User blocked");

      return true;
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to block user"
      );

      return false;
    } finally {
      set({ isUpdatingConnection: false });
    }
  },

  // ---------------------------------------------------------
  // Unblock user
  // ---------------------------------------------------------
  unblockUser: async (userId) => {
    if (!userId) return false;

    set({ isUpdatingConnection: true });

    try {
      await axiosInstance.put(
        `/connections/unblock/${userId}`
      );

      await get().getContacts();

      const {
        getUsers,
        selectedUser,
      } = useChatStore.getState();

      await getUsers();

      // Keep currently selected user unblocked in UI
      if (selectedUser?._id === userId) {
        useChatStore.setState((state) => ({
          selectedUser: state.selectedUser
            ? {
                ...state.selectedUser,
                isBlocked: false,
              }
            : null,
        }));
      }

      toast.success("User unblocked");

      return true;
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to unblock user"
      );

      return false;
    } finally {
      set({ isUpdatingConnection: false });
    }
  },
}));