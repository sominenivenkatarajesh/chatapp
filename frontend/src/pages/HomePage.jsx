import { useChatStore } from "../store/useChatStore";

import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";

const HomePage = () => {
  const { selectedUser } = useChatStore();

  return (
    <div className="h-full w-full flex bg-bg">
      {/* Sidebar: Show on desktop always, on mobile only if NO user is selected */}
      <div className={`${selectedUser ? "hidden lg:flex" : "flex w-full"} lg:w-[350px] xl:w-[400px] h-full flex-col border-r border-white/5 bg-bg`}>
        <Sidebar />
      </div>
      
      {/* Chat Container: Show on desktop always, on mobile only if a user IS selected */}
      <div className={`flex-1 h-full flex-col relative bg-bg ${!selectedUser ? "hidden lg:flex" : "flex"}`}>
        {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
      </div>
    </div>
  );
};


export default HomePage;
