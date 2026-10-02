import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

import { useChatStore } from "../store/useChatStore";
import Sidebar from "../components/Sidebar";
import ChatContainer from "../components/ChatContainer";
import NoChatSelected from "../components/NoChatSelected";

const HomePage = () => {
  const { users, selectedUser, setSelectedUser, getUsers } = useChatStore();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (!users.length) {
      getUsers();
    }
  }, [users.length, getUsers]);

  useEffect(() => {
    const chatUserId = searchParams.get("chat");

    if (!chatUserId || !users.length) return;

    const user = users.find((user) => user._id === chatUserId);

    if (user) {
      setSelectedUser(user);
    }
  }, [searchParams, users, setSelectedUser]);

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setSearchParams({ chat: user._id });
  };

  return (
    <div className="h-screen bg-base-200">
      <div className="flex items-center justify-center pt-20 px-4">
        <div className="bg-base-100 rounded-lg shadow-lg w-full max-w-6xl h-[calc(100vh-8rem)]">
          <div className="flex h-full rounded-lg overflow-hidden">
            <Sidebar onSelectUser={handleSelectUser} />

            {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;