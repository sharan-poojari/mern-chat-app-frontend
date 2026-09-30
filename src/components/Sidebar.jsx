import { useEffect } from "react";
import { Loader2, UsersRound } from "lucide-react";

import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";

const Sidebar = () => {
  const {
    getUsers,
    users,
    selectedUser,
    setSelectedUser,
    isUsersLoading,
  } = useChatStore();

  const { onlineUsers } = useAuthStore();

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  if (isUsersLoading) {
    return (
      <aside className="flex h-full w-16 shrink-0 items-center justify-center border-r border-base-300 bg-base-100 sm:w-20 lg:w-72">
        <Loader2 className="size-6 animate-spin text-primary sm:size-7" />
      </aside>
    );
  }

  return (
    <aside className="flex h-full w-16 shrink-0 flex-col border-r border-base-300 bg-base-100 sm:w-20 lg:w-72">
      {/* Sidebar Header */}
      <div className="flex w-full shrink-0 items-center justify-center border-b border-base-300 px-2 py-4 sm:px-3 lg:justify-start lg:px-5 lg:py-4">
        <div className="flex items-center gap-2">
          <UsersRound className="size-4 text-primary lg:size-5" />

          <span className="hidden text-sm font-semibold lg:block">
            Contacts
          </span>
        </div>
      </div>

      {/* Users */}
      <div className="w-full flex-1 overflow-y-auto py-2 sm:py-3">
        {users.map((user) => {
          const isSelected =
            selectedUser?._id === user._id;

          const isOnline = onlineUsers.includes(user._id);

          return (
            <button
              key={user._id}
              type="button"
              onClick={() => setSelectedUser(user)}
              className={`group flex w-full items-center justify-center gap-3 border-l-2 px-2 py-2.5 transition-all sm:px-3 sm:py-3 lg:justify-start ${
                isSelected
                  ? "border-primary bg-base-200"
                  : "border-transparent hover:bg-base-200"
              }`}
            >
              {/* Avatar */}
              <div className="relative shrink-0">
                <img
                  src={user.profilePic || "/avatar.png"}
                  alt={user.fullName}
                  className={`size-10 rounded-full object-cover ring-1 transition-all sm:size-11 lg:size-12 ${
                    isSelected
                      ? "ring-primary/40"
                      : "ring-base-300 group-hover:ring-base-content/20"
                  }`}
                />

                {/* Online Indicator */}
                <span
                  className={`absolute bottom-0 right-0 rounded-full ring-2 ring-base-100 transition-all ${
                    isOnline
                      ? "size-2.5 bg-green-500 sm:size-3"
                      : "size-2.5 bg-zinc-400 opacity-0 sm:size-3 lg:opacity-40"
                  }`}
                />
              </div>

              {/* User Details */}
              <div className="hidden min-w-0 flex-1 text-left lg:block">
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
                    isOnline
                      ? "font-medium text-green-500"
                      : "text-zinc-400"
                  }`}
                >
                  {isOnline ? "Online" : "Offline"}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
};

export default Sidebar;