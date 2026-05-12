import { useChatStore } from "../store/useChatStore";

import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";

const HomePage = () => {
  const { selectedUser } = useChatStore();

  return (
    <div className="h-screen bg-[#111b21] flex items-center justify-center overflow-hidden">
      <div className="w-full h-full lg:h-[95vh] lg:w-[98%] lg:max-w-[1600px] flex shadow-2xl overflow-hidden bg-[#222e35]">
        <Sidebar />

        {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
      </div>
    </div>
  );
};

export default HomePage;

