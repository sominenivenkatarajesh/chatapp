import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { LogOut, MessageSquare, User, Settings, Users } from "lucide-react";

const Navbar = () => {
  const { logout, authUser } = useAuthStore();
  const currentPath = window.location.pathname;

  return (
    <header className="fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-6xl z-50">
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/50 rounded-full px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-3 group hover:opacity-100 transition-all">
            <div className="size-10 rounded-xl bg-gradient-to-br from-primary to-purple-600 p-[1.5px] shadow-lg shadow-primary/30 group-hover:shadow-primary/50 transition-all duration-300">
              <div className="w-full h-full bg-bg-main rounded-xl flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-primary group-hover:scale-110 transition-transform duration-300" />
              </div>
            </div>
            <h1 className="text-xl font-bold font-outfit tracking-tight text-white drop-shadow-md">Chatly</h1>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          {authUser && (
            <>
              <Link to={"/dashboard"} className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${currentPath === '/dashboard' ? 'bg-primary/20 text-primary border border-primary/30 shadow-inner' : 'hover:bg-white/10 text-text-muted hover:text-white'}`}>
                <Users className="size-4" />
                <span className="hidden sm:inline font-medium text-sm">Social</span>
              </Link>

              <Link to={"/profile"} className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${currentPath === '/profile' ? 'bg-primary/20 text-primary border border-primary/30 shadow-inner' : 'hover:bg-white/10 text-text-muted hover:text-white'}`}>
                <User className="size-4" />
                <span className="hidden sm:inline font-medium text-sm">Profile</span>
              </Link>

              <div className="w-px h-6 bg-white/10 mx-2 hidden sm:block"></div>

              <button className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-red-500/10 text-text-muted hover:text-red-500 transition-all duration-300" onClick={logout}>
                <LogOut className="size-4" />
                <span className="hidden sm:inline font-medium text-sm">Logout</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
