import { useChatStore } from "../store/useChatStore";

import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";

const HomePage = () => {
  const { selectedUser } = useChatStore();

  return (
    <div className="h-full overflow-hidden p-0 sm:p-4 md:p-6 lg:p-8 flex items-center justify-center">
      <div className="w-full max-w-7xl h-full glass-panel rounded-none sm:rounded-[2rem] flex overflow-hidden shadow-2xl relative">
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
