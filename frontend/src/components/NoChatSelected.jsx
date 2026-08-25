import { Lock, ShieldCheck } from "lucide-react";

const NoChatSelected = () => {
  return (
    <div className="w-full flex flex-1 flex-col items-center justify-center p-6 sm:p-12 bg-transparent">
      <div className="max-w-md w-full text-center space-y-6 bg-zinc-950/80 backdrop-blur-2xl p-8 sm:p-12 rounded-3xl border border-white/10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] transition-all animate-in">
        
        {/* Custom Handcrafted SVG Illustration: Connected Conversation Grid */}
        <div className="flex justify-center mb-6 relative group">
          <div className="absolute inset-0 bg-amber-500/10 blur-3xl rounded-full scale-125 group-hover:scale-150 transition-transform duration-700 pointer-events-none"></div>
          
          <div className="relative size-32 sm:size-36 flex items-center justify-center">
            <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              {/* Subtle grid background */}
              <circle cx="80" cy="80" r="70" stroke="rgba(245, 158, 11, 0.1)" strokeWidth="1" strokeDasharray="3 3" />
              <circle cx="80" cy="80" r="45" stroke="rgba(255, 255, 255, 0.06)" strokeWidth="1" />
              
              {/* Connecting glowing conduits */}
              <path d="M40 80 Q80 40 120 80" stroke="url(#amber-conduit-1)" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
              <path d="M40 80 Q80 120 120 80" stroke="url(#amber-conduit-2)" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
              <line x1="80" y1="35" x2="80" y2="125" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1.5" strokeDasharray="4 4" />
              
              {/* Central hub node */}
              <rect x="58" y="58" width="44" height="44" rx="14" fill="#18181b" stroke="rgba(245, 158, 11, 0.5)" strokeWidth="1.5" />
              <circle cx="80" cy="80" r="8" fill="#f59e0b" className="animate-pulse" />
              <path d="M72 76h16M72 84h10" stroke="#09090b" strokeWidth="2" strokeLinecap="round" />
              
              {/* Orbiting message nodes */}
              <g className="transition-transform duration-500 group-hover:translate-x-1">
                <rect x="24" y="66" width="28" height="28" rx="8" fill="#1f1f23" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="1" />
                <circle cx="38" cy="80" r="3" fill="#10b981" />
              </g>
              
              <g className="transition-transform duration-500 group-hover:-translate-x-1">
                <rect x="108" y="66" width="28" height="28" rx="8" fill="#1f1f23" stroke="rgba(245, 158, 11, 0.3)" strokeWidth="1" />
                <path d="M116 78l4 4 8-8" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </g>

              <g className="transition-transform duration-500 group-hover:-translate-y-1">
                <rect x="68" y="22" width="24" height="24" rx="7" fill="#18181b" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="1" />
                <circle cx="80" cy="34" r="2.5" fill="#f59e0b" opacity="0.8" />
              </g>

              {/* Gradients */}
              <defs>
                <linearGradient id="amber-conduit-1" x1="40" y1="60" x2="120" y2="60" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#f59e0b" stopOpacity="0.2" />
                  <stop offset="0.5" stopColor="#f59e0b" />
                  <stop offset="1" stopColor="#d97706" stopOpacity="0.2" />
                </linearGradient>
                <linearGradient id="amber-conduit-2" x1="40" y1="100" x2="120" y2="100" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#d97706" stopOpacity="0.2" />
                  <stop offset="0.5" stopColor="#fbbf24" />
                  <stop offset="1" stopColor="#f59e0b" stopOpacity="0.2" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Welcome Text */}
        <div>
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-500/90 block mb-1.5">Connected & Ready</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Your Inbox, Undisturbed
          </h2>
        </div>
        
        <p className="text-zinc-400 text-sm leading-relaxed max-w-sm mx-auto font-normal">
          Select a conversation from the sidebar to resume chatting, or jump over to Discover to expand your network.
        </p>

        <div className="pt-8 flex items-center justify-center gap-2 text-zinc-500 text-xs">
          <ShieldCheck size={14} className="text-amber-500/70" />
          <span>Real-time encrypted connection</span>
        </div>
      </div>
    </div>
  );
};

export default NoChatSelected;


