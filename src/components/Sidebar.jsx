import { useEffect, useState } from "react";
import {
  Check,
  Loader2,
  UserPlus,
  UsersRound,
  X,
  Trash2,
  ShieldBan,
  Unlock,
} from "lucide-react";

import { useChatStore } from "../store/useChatStore";
import { useConnectionStore } from "../store/useConnectionStore";
import { useAuthStore } from "../store/useAuthStore";

const Sidebar = ({ onSelectUser, onContactRemoved }) => {
  const [activeTab, setActiveTab] = useState("contacts");

  const {
    getUsers,
    users,
    selectedUser,
    isUsersLoading,
  } = useChatStore();

  const { onlineUsers } = useAuthStore();

  const {
    discoveredUsers,
    requests,
    isDiscoverLoading,
    isRequestsLoading,
    getRequests,
    discoverUsers: loadDiscoverUsers,
    sendRequest,
    acceptRequest,
    rejectRequest,
    removeContact,
    blockUser,
    unblockUser,
  } = useConnectionStore();

  useEffect(() => {
    getUsers();
    getRequests();
  }, [getUsers, getRequests]);

  const handleDiscover = async () => {
    setActiveTab("discover");
    await loadDiscoverUsers();
  };

  const handleRequests = async () => {
    setActiveTab("requests");
    await getRequests();
  };

  const handleRemoveContact = async (user) => {
    const confirmed = window.confirm(
      `Remove ${user.fullName} from your contacts?`
    );

    if (!confirmed) return;

    const success = await removeContact(user._id);

    if (success) {
      onContactRemoved?.(user._id);
    }
  };

  const handleBlockUser = async (user) => {
    const confirmed = window.confirm(
      `Block ${user.fullName}? You will not be able to chat with this user until you unblock them.`
    );

    if (!confirmed) return;

    await blockUser(user._id);
  };

  const handleUnblockUser = async (user) => {
    const confirmed = window.confirm(
      `Unblock ${user.fullName}? Chat will be enabled again.`
    );

    if (!confirmed) return;

    await unblockUser(user._id);
  };

  return (
    <aside className="flex h-full w-16 shrink-0 flex-col border-r border-base-300 bg-base-100 sm:w-20 lg:w-72">
      {/* Sidebar Header */}
      <div className="w-full shrink-0 border-b border-base-300 px-2 py-3 sm:px-3 lg:px-4 lg:py-4">
        {/* Tabs */}
        <div className="flex items-center justify-center gap-1 lg:justify-start">
          {/* Contacts */}
          <button
            type="button"
            onClick={() => setActiveTab("contacts")}
            className={`flex items-center justify-center gap-2 rounded-lg px-2 py-2 transition-colors lg:flex-1 ${
              activeTab === "contacts"
                ? "bg-primary text-primary-content"
                : "hover:bg-base-200"
            }`}
            title="Contacts"
          >
            <UsersRound className="size-4 lg:size-5" />

            <span className="hidden text-sm font-semibold lg:block">
              Contacts
            </span>
          </button>

          {/* Add People */}
          <button
            type="button"
            onClick={handleDiscover}
            className={`flex items-center justify-center gap-2 rounded-lg px-2 py-2 transition-colors lg:flex-1 ${
              activeTab === "discover"
                ? "bg-primary text-primary-content"
                : "hover:bg-base-200"
            }`}
            title="Add People"
          >
            <UserPlus className="size-4 lg:size-5" />

            <span className="hidden text-sm font-semibold lg:block">
              Add
            </span>
          </button>

          {/* Requests */}
          <button
            type="button"
            onClick={handleRequests}
            className={`relative flex items-center justify-center gap-2 rounded-lg px-2 py-2 transition-colors lg:flex-1 ${
              activeTab === "requests"
                ? "bg-primary text-primary-content"
                : "hover:bg-base-200"
            }`}
            title="Requests"
          >
            <UserPlus className="size-4 lg:size-5" />

            <span className="hidden text-sm font-semibold lg:block">
              Requests
            </span>

            {requests.length > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-error text-[10px] font-bold text-error-content">
                {requests.length > 9 ? "9+" : requests.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Sidebar Content */}
      <div className="w-full flex-1 overflow-y-auto py-2 sm:py-3">
        {/* ==================== CONTACTS ==================== */}
        {activeTab === "contacts" && (
          <>
            {isUsersLoading ? (
              <div className="flex h-full items-center justify-center">
                <Loader2 className="size-6 animate-spin text-primary" />
              </div>
            ) : users.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center px-4 text-center">
                <UsersRound className="mb-2 size-8 text-base-content/40" />

                <p className="hidden text-sm text-base-content/60 lg:block">
                  No contacts yet
                </p>

                <button
                  type="button"
                  onClick={handleDiscover}
                  className="mt-2 hidden text-xs font-medium text-primary hover:underline lg:block"
                >
                  Find people
                </button>
              </div>
            ) : (
              users.map((user) => {
                const isSelected =
                  selectedUser?._id === user._id;

                const isOnline = onlineUsers.includes(user._id);

                const isBlocked = user.isBlocked;

                return (
                  <div
                    key={user._id}
                    className={`group flex w-full items-center gap-2 border-l-2 px-2 py-2.5 transition-all sm:px-3 sm:py-3 ${
                      isSelected
                        ? "border-primary bg-base-200"
                        : "border-transparent hover:bg-base-200"
                    }`}
                  >
                    {/* User Select Area */}
                    <button
                      type="button"
                      onClick={() => onSelectUser(user)}
                      className="flex min-w-0 flex-1 items-center justify-center gap-3 text-left lg:justify-start"
                    >
                      {/* Avatar */}
                      <div className="relative shrink-0">
                        <img
                          src={
                            user.profilePic || "/avatar.svg"
                          }
                          alt={user.fullName}
                          className={`size-10 rounded-full object-cover ring-1 transition-all sm:size-11 lg:size-12 ${
                            isSelected
                              ? "ring-primary/40"
                              : "ring-base-300 group-hover:ring-base-content/20"
                          } ${
                            isBlocked ? "opacity-60" : ""
                          }`}
                        />

                        {/* Online Indicator */}
                        {!isBlocked && (
                          <span
                            className={`absolute bottom-0 right-0 rounded-full ring-2 ring-base-100 ${
                              isOnline
                                ? "size-2.5 bg-green-500 sm:size-3"
                                : "size-2.5 bg-zinc-400 opacity-0 sm:size-3 lg:opacity-40"
                            }`}
                          />
                        )}
                      </div>

                      {/* User Details */}
                      <div className="hidden min-w-0 flex-1 lg:block">
                        <div
                          className={`truncate text-sm ${
                            isSelected
                              ? "font-semibold"
                              : "font-medium"
                          }`}
                        >
                          {user.fullName}
                        </div>

                        <div
                          className={`mt-0.5 text-xs ${
                            isBlocked
                              ? "font-medium text-error"
                              : isOnline
                                ? "font-medium text-green-500"
                                : "text-zinc-400"
                          }`}
                        >
                          {isBlocked
                            ? "Blocked"
                            : isOnline
                              ? "Online"
                              : "Offline"}
                        </div>
                      </div>
                    </button>

                    {/* Contact Actions */}
                    <div className="flex shrink-0 items-center gap-1">
                      {isBlocked ? (
                        <button
                          type="button"
                          onClick={() =>
                            handleUnblockUser(user)
                          }
                          className="btn btn-ghost btn-circle btn-xs text-success"
                          title="Unblock user"
                        >
                          <Unlock className="size-4" />
                        </button>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              handleBlockUser(user)
                            }
                            className="btn btn-ghost btn-circle btn-xs text-warning"
                            title="Block user"
                          >
                            <ShieldBan className="size-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleRemoveContact(user)
                            }
                            className="btn btn-ghost btn-circle btn-xs text-error"
                            title="Remove contact"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </>
        )}

        {/* ==================== DISCOVER ==================== */}
        {activeTab === "discover" && (
          <>
            {isDiscoverLoading ? (
              <div className="flex h-full items-center justify-center">
                <Loader2 className="size-6 animate-spin text-primary" />
              </div>
            ) : discoveredUsers.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center px-4 text-center">
                <UserPlus className="mb-2 size-8 text-base-content/40" />

                <p className="hidden text-sm text-base-content/60 lg:block">
                  No new people found
                </p>
              </div>
            ) : (
              discoveredUsers.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center gap-3 px-2 py-2.5 sm:px-3 sm:py-3"
                >
                  {/* Avatar */}
                  <img
                    src={user.profilePic || "/avatar.svg"}
                    alt={user.fullName}
                    className="size-10 shrink-0 rounded-full object-cover ring-1 ring-base-300 sm:size-11 lg:size-12"
                  />

                  {/* User Details */}
                  <div className="hidden min-w-0 flex-1 lg:block">
                    <p className="truncate text-sm font-medium">
                      {user.fullName}
                    </p>

                    <p className="truncate text-xs text-base-content/50">
                      {user.email}
                    </p>
                  </div>

                  {/* Send Request */}
                  <button
                    type="button"
                    onClick={() => sendRequest(user._id)}
                    className="btn btn-primary btn-circle btn-sm"
                    title="Send connection request"
                  >
                    <UserPlus className="size-4" />
                  </button>
                </div>
              ))
            )}
          </>
        )}

        {/* ==================== REQUESTS ==================== */}
        {activeTab === "requests" && (
          <>
            {isRequestsLoading ? (
              <div className="flex h-full items-center justify-center">
                <Loader2 className="size-6 animate-spin text-primary" />
              </div>
            ) : requests.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center px-4 text-center">
                <UserPlus className="mb-2 size-8 text-base-content/40" />

                <p className="hidden text-sm text-base-content/60 lg:block">
                  No pending requests
                </p>
              </div>
            ) : (
              requests.map((request) => {
                const requester = request.requesterId;

                return (
                  <div
                    key={request._id}
                    className="flex items-center gap-3 px-2 py-2.5 sm:px-3 sm:py-3"
                  >
                    {/* Avatar */}
                    <img
                      src={
                        requester.profilePic ||
                        "/avatar.svg"
                      }
                      alt={requester.fullName}
                      className="size-10 shrink-0 rounded-full object-cover ring-1 ring-base-300 sm:size-11 lg:size-12"
                    />

                    {/* User Details */}
                    <div className="hidden min-w-0 flex-1 lg:block">
                      <p className="truncate text-sm font-medium">
                        {requester.fullName}
                      </p>

                      <p className="text-xs text-base-content/50">
                        Wants to connect
                      </p>
                    </div>

                    {/* Accept / Reject */}
                    <div className="flex shrink-0 gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          acceptRequest(request._id)
                        }
                        className="btn btn-success btn-circle btn-sm"
                        title="Accept request"
                      >
                        <Check className="size-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          rejectRequest(request._id)
                        }
                        className="btn btn-error btn-circle btn-sm"
                        title="Reject request"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;