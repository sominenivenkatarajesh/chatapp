import { useChatStore } from "../store/useChatStore";

import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";

const HomePage = () => {
  const { selectedUser } = useChatStore();

  return (
    <div className="h-full bg-wa-bg overflow-hidden">
      <div className="flex items-center justify-center h-full">
        <div className="bg-wa-sidebar w-full h-full lg:shadow-2xl flex overflow-hidden relative">
          {/* Sidebar: Show on desktop always, on mobile only if NO user is selected */}
          <div className={`${selectedUser ? "hidden lg:block" : "w-full"} lg:w-[400px] h-full`}>
            <Sidebar />
          </div>
          
          {/* Chat Container: Show on desktop always, on mobile only if a user IS selected */}
          <div className={`flex-1 h-full ${!selectedUser ? "hidden lg:flex" : "flex"}`}>
            {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
          </div>
        </div>
      </div>
    </div>
  );
};


export default HomePage;
