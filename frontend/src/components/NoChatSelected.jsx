import { MessageSquare, Laptop, Lock } from "lucide-react";

const NoChatSelected = () => {
  return (
    <div className="w-full flex flex-1 flex-col items-center justify-center p-8 bg-transparent">
      <div className="max-w-md w-full text-center space-y-6 bg-white/5 backdrop-blur-2xl p-12 rounded-[2.5rem] border border-white/10 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] transition-all animate-in zoom-in duration-500">
        {/* Icon Display */}
        <div className="flex justify-center mb-6 relative group">
          <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full scale-150 group-hover:scale-175 transition-transform duration-500"></div>
          <div className="relative">
            <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-indigo-500/20 to-purple-600/20 flex items-center justify-center border border-white/10 backdrop-blur-md rotate-3 group-hover:rotate-6 transition-transform duration-500">
              <Laptop size={48} className="text-indigo-400" />
            </div>
            <div className="absolute -bottom-3 -right-3 w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center border-[4px] border-[#09090b] shadow-xl group-hover:scale-110 transition-transform duration-500">
              <MessageSquare size={20} className="text-white" />
            </div>
          </div>
        </div>

        {/* Welcome Text */}
        <h2 className="text-3xl font-extrabold text-white tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
          Welcome to Messages
        </h2>
        <div className="space-y-2 px-4">
          <p className="text-white/50 text-[15px] leading-relaxed font-light">
            Select a conversation from the sidebar to start messaging. Experience fast, secure, and beautiful real-time communication.
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

