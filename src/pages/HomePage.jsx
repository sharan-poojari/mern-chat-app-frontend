import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

import { useChatStore } from "../store/useChatStore";
import Sidebar from "../components/Sidebar";
import ChatContainer from "../components/ChatContainer";
import NoChatSelected from "../components/NoChatSelected";

const HomePage = () => {
  const {
    users,
    selectedUser,
    setSelectedUser,
    getUsers,
  } = useChatStore();

  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (!users.length) {
      getUsers();
    }
  }, [users.length, getUsers]);

  // Restore selected chat after refresh
  useEffect(() => {
    const chatUserId = searchParams.get("chat");

    if (!chatUserId || !users.length) return;

    const user = users.find(
      (user) => user._id === chatUserId
    );

    if (user) {
      setSelectedUser(user);
    } else {
      // User is no longer an accepted contact
      setSelectedUser(null);
      setSearchParams({});
    }
  }, [
    searchParams,
    users,
    setSelectedUser,
    setSearchParams,
  ]);

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setSearchParams({
      chat: user._id,
    });
  };

  // Called when current contact is removed or blocked
  const handleContactRemoved = (userId) => {
    if (selectedUser?._id !== userId) {
      return;
    }

    setSelectedUser(null);
    setSearchParams({});
  };

  return (
    <div className="h-screen bg-base-200">
      <div className="flex items-center justify-center px-4 pt-20">
        <div className="h-[calc(100vh-8rem)] w-full max-w-6xl rounded-lg bg-base-100 shadow-lg">
          <div className="flex h-full overflow-hidden rounded-lg">
            <Sidebar
              onSelectUser={handleSelectUser}
              onContactRemoved={handleContactRemoved}
            />

            {!selectedUser ? (
              <NoChatSelected />
            ) : (
              <ChatContainer />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;