import { MessageSquare } from "lucide-react";

const NoChatSelected = () => {
  return (
    <div className="w-full flex flex-1 flex-col items-center justify-center p-16 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-md text-center space-y-8 relative z-10">
        {/* Icon Display */}
        <div className="flex justify-center gap-4 mb-4">
          <div className="relative group">
            <div className="absolute inset-0 bg-primary/30 rounded-3xl blur-xl group-hover:bg-primary/50 transition-colors duration-500 animate-pulse" />
            <div
              className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/20 to-purple-500/20 border border-white/10 flex items-center
             justify-center animate-float backdrop-blur-md relative shadow-2xl"
            >
              <MessageSquare className="w-10 h-10 text-primary drop-shadow-md" />
            </div>
          </div>
        </div>

        {/* Welcome Text */}
        <div className="space-y-3">
          <h2 className="text-3xl font-black font-outfit tracking-tight text-white drop-shadow-lg">
            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">Chatly</span>
          </h2>
          <p className="text-text-muted text-lg font-medium">
            Select a conversation from the sidebar to start chatting
          </p>
        </div>
      </div>
    </div>
  );
};

export default NoChatSelected;
