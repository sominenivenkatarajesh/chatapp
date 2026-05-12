import { Navigate, Route, Routes } from "react-router-dom";
import { useEffect } from "react";
import { Loader } from "lucide-react";
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
      <div className="flex items-center justify-center h-screen bg-bg-main">
        <Loader className="size-10 animate-spin text-primary" />
      </div>
    );

  return (
    <div className="min-h-screen bg-bg-main text-text-main">
      <Navbar />
      <CallManager />

      <main className="pt-20">
        <Routes>
          <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" />} />
          <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />
          <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
          <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
          <Route path="/dashboard" element={authUser ? <DashboardPage /> : <Navigate to="/login" />} />
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
