import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { LogOut, MessageSquare, User, Settings, Users } from "lucide-react";

const Navbar = () => {
  const { logout, authUser } = useAuthStore();

  return (
    <header className="w-full z-50 px-4 pt-4 pb-2">
      <nav className="glass-morphism max-w-7xl mx-auto h-16 px-6 flex items-center justify-between rounded-2xl border-white/5 shadow-2xl shadow-black/20">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-all group">
            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-all duration-300">
              <MessageSquare className="size-6 text-primary" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">Chatly</h1>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {authUser && (
            <>
              <Link 
                to={"/dashboard"} 
                className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-white/5 transition-all text-sm font-medium text-zinc-400 hover:text-white"
              >
                <Users className="size-5" />
                <span className="hidden sm:inline">Social</span>
              </Link>

              <Link 
                to={"/profile"} 
                className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-white/5 transition-all text-sm font-medium text-zinc-400 hover:text-white"
              >
                <User className="size-5" />
                <span className="hidden sm:inline">Profile</span>
              </Link>

              <div className="w-px h-6 bg-white/5 mx-1" />

              <button 
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 transition-all text-sm font-medium text-red-500 border border-red-500/10" 
                onClick={logout}
              >
                <LogOut className="size-5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
