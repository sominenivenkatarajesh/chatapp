import { Navigate, Route, Routes } from "react-router-dom";
import { useEffect } from "react";
import { Loader, MessageSquare } from "lucide-react";
import { Toaster } from "react-hot-toast";

import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import DashboardPage from "./pages/DashboardPage";

import { useAuthStore } from "./store/useAuthStore";
import CallManager from "./components/CallManager";

import { motion, AnimatePresence } from "framer-motion";

const App = () => {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

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
    <div className="h-screen flex flex-col bg-bg-main text-[#d1d7db] overflow-hidden">
      <Navbar />
      <CallManager />

      <main className="flex-1 min-h-0 relative">
        <Routes>
          <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" />} />
          <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />
          <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
          <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
          <Route path="/dashboard" element={authUser ? <DashboardPage /> : <Navigate to="/login" />} />
          {/* Fallback wildcard to redirect mistyped routes like /homepage */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
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
