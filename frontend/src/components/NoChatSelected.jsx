import { MessageSquare, Laptop, Lock } from "lucide-react";

const NoChatSelected = () => {
  return (
    <div className="w-full flex flex-1 flex-col items-center justify-center p-16 bg-transparent border-b-4 border-indigo-500">
      <div className="max-w-md text-center space-y-6">
        {/* Icon Display */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-indigo-500/10 flex items-center justify-center">
              <Laptop size={64} className="text-indigo-400" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center border-4 border-[#09090b]">
              <MessageSquare size={20} className="text-white" />
            </div>
          </div>
        </div>

        {/* Welcome Text */}
        <h2 className="text-[32px] font-bold text-white tracking-tight">Welcome to Chat</h2>
        <div className="space-y-2">
          <p className="text-indigo-200/60 text-[14px] leading-relaxed">
            Select a conversation from the sidebar to start messaging.<br />
            Experience fast, secure, and beautiful real-time communication.
          </p>
        </div>

        <div className="pt-20 flex items-center justify-center gap-2 text-indigo-200/40 text-[12px]">
          <Lock size={12} />
          <span>End-to-end encrypted</span>
        </div>
      </div>
    </div>
  );
};

export default NoChatSelected;

