import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Loader, MessageSquare } from "lucide-react";
import { Toaster } from "react-hot-toast";

import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import DashboardPage from "./pages/DashboardPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";

import { useAuthStore } from "./store/useAuthStore";
import CallManager from "./components/CallManager";
import MusicPlayer from "./components/MusicPlayer";
import { useMusicStore } from "./store/useMusicStore";
import { Music, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 10, scale: 0.98 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: -10, scale: 0.98 }}
    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    className="h-full w-full absolute inset-0"
  >
    {children}
  </motion.div>
);

const App = () => {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();
  const location = useLocation();

  const { inviteData, joinRoom, clearInvite } = useMusicStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Handle music setup independently
  useEffect(() => {
    if (authUser) {
      useMusicStore.getState().setupSocketListeners();
    }
  }, [authUser]);

  if (isCheckingAuth && !authUser)
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-bg-main relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[400px] bg-primary/20 rounded-full blur-[120px] animate-pulse"></div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 flex flex-col items-center gap-6"
        >
          <div className="size-20 rounded-[2rem] bg-primary/10 flex items-center justify-center border border-primary/20 shadow-2xl shadow-primary/5">
            <MessageSquare className="size-10 text-primary" />
          </div>
          <div className="flex flex-col items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-white">Chatly</h1>
            <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
              <div className="size-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500">Secure Session</span>
            </div>
          </div>
        </motion.div>

        <div className="absolute bottom-12 flex flex-col items-center gap-4">
           <Loader className="size-6 animate-spin text-primary/40" />
        </div>
      </div>
    );

  return (
    <div className="h-[100dvh] w-screen flex flex-col sm:flex-row bg-[#09090b] text-white overflow-hidden">
      {authUser && <Navbar />}
      <CallManager />
      <MusicPlayer />

      <AnimatePresence>
        {inviteData && (
          <motion.div 
            initial={{ y: -100, opacity: 0, x: "-50%" }}
            animate={{ y: 0, opacity: 1, x: "-50%" }}
            exit={{ y: -100, opacity: 0, x: "-50%" }}
            className="fixed top-6 left-1/2 z-[200] w-[90%] max-w-md glass-morphism p-4 border border-glass-border shadow-2xl flex items-center justify-between gap-4 rounded-2xl bg-zinc-900/90 backdrop-blur-xl"
          >
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                <Music className="text-primary size-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm truncate">{inviteData.name}</h4>
                <p className="text-[10px] text-zinc-400 uppercase tracking-widest animate-pulse">invited you to listen</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => joinRoom(inviteData.roomId)}
                className="size-10 rounded-full bg-green-500 hover:bg-green-600 text-white flex items-center justify-center transition-all shadow-lg shadow-green-500/20"
              >
                <Check size={18} />
              </button>
              <button
                onClick={clearInvite}
                className="size-10 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-all shadow-lg shadow-red-500/20"
              >
                <X size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 h-full min-w-0 relative overflow-hidden flex flex-col pb-16 sm:pb-0">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={authUser ? <PageWrapper><HomePage /></PageWrapper> : <Navigate to="/login" />} />
            <Route path="/signup" element={!authUser ? <PageWrapper><SignUpPage /></PageWrapper> : <Navigate to="/" />} />
            <Route path="/login" element={!authUser ? <PageWrapper><LoginPage /></PageWrapper> : <Navigate to="/" />} />
            <Route path="/forgot-password" element={!authUser ? <PageWrapper><ForgotPasswordPage /></PageWrapper> : <Navigate to="/" />} />
            <Route path="/profile" element={authUser ? <PageWrapper><ProfilePage /></PageWrapper> : <Navigate to="/login" />} />
            <Route path="/dashboard" element={authUser ? <PageWrapper><DashboardPage /></PageWrapper> : <Navigate to="/login" />} />
            {/* Fallback wildcard to redirect mistyped routes like /homepage */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </AnimatePresence>
      </main>
      <Toaster 
        toastOptions={{
          style: {
            background: '#262626',
            color: '#fff',
            borderRadius: '12px',
            border: '1px solid #333',
          },
          success: {
            iconTheme: {
              primary: '#25D366',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ed4956',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  );
};

export default App;
