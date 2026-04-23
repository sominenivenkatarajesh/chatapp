import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { LogOut, MessageSquare, User, Settings, Users } from "lucide-react";

const Navbar = () => {
  const { logout, authUser } = useAuthStore();

  return (
    <header className="glass-morphism h-16 w-[95%] mx-auto mt-4 px-6 flex items-center justify-between sticky top-4 z-50">
      <div className="flex items-center gap-8">
        <Link to="/" className="flex items-center gap-2.5 hover:opacity-80 transition-all">
          <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-lg font-bold">Chatly</h1>
        </Link>
      </div>

      <div className="flex items-center gap-2">
        {authUser && (
          <>
            <Link to={"/dashboard"} className="btn hover:bg-white/10 transition-colors">
              <Users className="size-5" />
              <span className="hidden sm:inline">Social</span>
            </Link>

            <Link to={"/profile"} className="btn hover:bg-white/10 transition-colors">
              <User className="size-5" />
              <span className="hidden sm:inline">Profile</span>
            </Link>

            <button className="btn hover:bg-white/10 transition-colors" onClick={logout}>
              <LogOut className="size-5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </>
        )}
      </div>
    </header>
  );
};

export default Navbar;
