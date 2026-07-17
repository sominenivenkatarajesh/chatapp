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
    <header className="z-50 bg-bg sm:bg-surface border-t sm:border-t-0 sm:border-r border-white/10 flex-shrink-0
      fixed sm:static bottom-0 left-0 w-full sm:w-20 lg:w-64 h-16 sm:h-full flex sm:flex-col justify-between"
    >
      <div className="hidden sm:flex items-center gap-3 p-6 group h-[72px] border-b border-white/5">
        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-all w-full">
          <div className="size-8 lg:size-10 rounded-xl bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-all flex-shrink-0">
            <MessageSquare className="size-5 lg:size-6 text-primary" />
          </div>
          <h1 className="text-xl font-bold tracking-tight hidden lg:block text-white">Chatly</h1>
        </Link>
      </div>

      <nav className="flex sm:flex-col justify-around sm:justify-start w-full sm:w-auto h-full sm:h-auto flex-1 sm:p-4 gap-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={item.path}
              to={item.path} 
              className={`relative flex items-center justify-center lg:justify-start gap-3 p-3 lg:px-4 lg:py-3 rounded-xl transition-all font-medium overflow-hidden ${
                isActive ? "text-white" : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {isActive && (
                <motion.div 
                  layoutId="navbar-active"
                  className="absolute inset-0 bg-primary/10 border border-primary/20 rounded-xl hidden sm:block"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <item.icon className={`size-6 relative z-10 ${isActive ? 'text-primary' : ''}`} />
              <span className="hidden lg:inline relative z-10">{item.label}</span>
              {/* Mobile Active Indicator */}
              {isActive && (
                <div className="absolute bottom-1 w-1 h-1 rounded-full bg-primary sm:hidden" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="hidden sm:flex p-4 border-t border-white/5">
        <button 
          className="w-full flex items-center justify-center lg:justify-start gap-3 p-3 lg:px-4 lg:py-3 rounded-xl hover:bg-red-500/10 transition-all text-sm font-medium text-red-500 hover:text-red-400 group" 
          onClick={logout}
        >
          <LogOut className="size-6 group-hover:scale-110 transition-transform" />
          <span className="hidden lg:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
