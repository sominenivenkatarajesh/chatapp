import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { LogOut, MessageSquare, User, Users, Music } from "lucide-react";
import { motion } from "framer-motion";

const Navbar = () => {
  const { logout, authUser } = useAuthStore();
  const location = useLocation();

  const navItems = [
    { path: "/", icon: MessageSquare, label: "Chat" },
    { path: "/dashboard", icon: Users, label: "Social" },
    { path: "/music", icon: Music, label: "Music" },
    { path: "/profile", icon: User, label: "Profile" }
  ];

  if (!authUser) return null;

  return (
    <header className="z-50 bg-bg sm:bg-surface border-t sm:border-t-0 sm:border-r border-white/5 shrink-0
      fixed sm:static bottom-0 left-0 w-full sm:w-20 lg:w-64 h-16 sm:h-full flex sm:flex-col justify-between"
    >
      {/* Brand Header */}
      <div className="hidden sm:flex items-center gap-3 p-6 group h-[72px] border-b border-white/5">
        <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-all w-full">
          <div className="size-9 lg:size-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0 text-black">
            <MessageSquare className="size-5 lg:size-5 text-black fill-black" />
          </div>
          <div className="hidden lg:flex flex-col">
            <h1 className="text-lg font-black tracking-tight text-white leading-none">Chatly</h1>
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mt-0.5">Workspace</span>
          </div>
        </Link>
      </div>

      {/* Nav Links */}
      <nav className="flex sm:flex-col justify-around sm:justify-start w-full sm:w-auto h-full sm:h-auto flex-1 sm:p-3 gap-1.5">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={item.path}
              to={item.path} 
              className={`relative flex items-center justify-center lg:justify-start gap-3 p-3 lg:px-4 lg:py-3 rounded-xl transition-all text-sm font-semibold overflow-hidden ${
                isActive ? "text-white font-bold" : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              {isActive && (
                <motion.div 
                  layoutId="navbar-active"
                  className="absolute inset-0 bg-amber-500/15 border border-amber-500/30 rounded-xl hidden sm:block shadow-sm"
                  initial={false}
                  transition={{ type: "spring", stiffness: 350, damping: 35 }}
                />
              )}
              <item.icon className={`size-5 relative z-10 ${isActive ? 'text-amber-400' : 'text-zinc-400'}`} />
              <span className={`hidden lg:inline relative z-10 ${isActive ? 'text-amber-200 font-bold' : ''}`}>{item.label}</span>
              {/* Mobile Active Indicator */}
              {isActive && (
                <div className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-amber-400 sm:hidden shadow-[0_0_6px_rgba(245,158,11,0.8)]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout Footer */}
      <div className="hidden sm:flex p-3 border-t border-white/5">
        <button 
          className="w-full flex items-center justify-center lg:justify-start gap-3 p-3 lg:px-4 lg:py-2.5 rounded-xl hover:bg-red-500/10 transition-all text-xs font-semibold text-zinc-400 hover:text-red-400 group border border-transparent hover:border-red-500/20" 
          onClick={logout}
        >
          <LogOut className="size-4.5 group-hover:scale-110 transition-transform" />
          <span className="hidden lg:inline">Sign Out</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;

