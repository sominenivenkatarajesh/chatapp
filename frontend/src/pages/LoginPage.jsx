import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Loader2, Lock, Mail, MessageSquare, User } from "lucide-react";
import { motion } from "framer-motion";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const { login, isLoggingIn } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    login(formData);
  };

  return (
    <div className="auth-page">
      {/* Dynamic Background Glows */}
      <div className="auth-glow-wrapper">
        <div className="auth-glow-1"></div>
        <div className="auth-glow-2"></div>
      </div>

      <div className="auth-container">
        {/* Left Side - Form */}
        <div className="login-section">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="auth-card glass-morphism shadow-2xl"
          >
          {/* Logo */}
          <div className="text-center">
            <div className="flex flex-col items-center gap-4 group">
              <div
                className="size-14 rounded-2xl bg-amber-500/15 flex items-center justify-center group-hover:bg-amber-500/25
              transition-all duration-500 group-hover:rotate-6 group-hover:scale-105 border border-amber-500/30 shadow-lg shadow-amber-500/10"
              >
                <MessageSquare className="size-7 text-amber-400" />
              </div>
              <div className="space-y-1 mt-1">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-500/90 block">Authentication</span>
                <h1 className="text-3xl font-extrabold tracking-tight text-white">Welcome Back</h1>
                <p className="text-zinc-400 text-sm">Sign in to resume your conversations</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="auth-form-wrapper">
            <div className="auth-input-wrapper">
              <label className="text-xs uppercase tracking-wider font-bold ml-1 text-zinc-400">Username, Email, or Phone</label>
              <div className="input-group">
                <User className="left-icon" />
                <input
                  type="text"
                  placeholder="johndoe or you@example.com"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="auth-input-wrapper">
              <label className="text-xs uppercase tracking-wider font-bold ml-1 text-zinc-400">Password</label>
              <div className="input-group has-right">
                <Lock className="left-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  className="right-icon"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </div>

            <div className="flex justify-end w-full mt-2 mb-4">
              <Link to="/forgot-password" className="text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors">
                Forgot Password?
              </Link>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary auth-submit-btn" 
              disabled={isLoggingIn}
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="size-5 animate-spin mr-2" />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-zinc-400">
            Don&apos;t have an account?{" "}
            <Link to="/signup" className="font-semibold text-amber-400 hover:text-amber-300 transition-colors">
              Create account
            </Link>
          </div>
        </motion.div>
        </div>

        {/* Right Side - Visual Interactive Chat Mockup */}
        <div className="preview-section">
          <div className="mockup-container">
          {/* Mock Chat Dashboard Window */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="chat-preview glass-morphism"
          >
            {/* Header */}
            <div className="px-6 py-4 bg-white/5 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="size-10 rounded-2xl bg-gradient-to-br from-zinc-800 to-amber-950/80 flex items-center justify-center font-bold font-mono text-amber-300 text-sm border border-amber-500/20">
                    SJ
                  </div>
                  <span className="absolute bottom-0.5 right-0.5 size-2.5 bg-emerald-500 rounded-full border-2 border-bg shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Sarah Jenkins</h3>
                  <p className="text-emerald-400 text-xs font-semibold flex items-center gap-1">
                    <span className="size-1.5 rounded-full bg-emerald-500 animate-ping inline-block" /> Active now
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
              </div>
            </div>

            {/* Chat Messages Panel */}
            <div className="p-6 space-y-4 bg-black/10">
              {/* Incoming Message */}
              <div className="flex gap-3 items-end">
                <div className="size-8 rounded-xl bg-zinc-800 flex items-center justify-center text-xs font-bold font-mono text-amber-200 border border-white/5">
                  SJ
                </div>
                <div className="bg-zinc-900/90 p-4 rounded-2xl rounded-bl-sm max-w-[80%] border border-white/10 shadow-md">
                  <p className="text-zinc-200 text-sm leading-relaxed">
                    Hey! Did you check out the new design update? It looks incredible! 🔥
                  </p>
                  <span className="text-xs text-zinc-500 font-semibold block text-right mt-1.5">09:41 AM</span>
                </div>
              </div>

              {/* Outgoing Message */}
              <div className="flex gap-3 items-end justify-end">
                <div className="bg-gradient-to-br from-amber-600 to-amber-700 p-4 rounded-2xl rounded-br-sm max-w-[80%] border border-white/10 shadow-md">
                  <p className="text-white text-sm leading-relaxed font-normal">
                    Oh wow! Just signing in. The warm amber palette and smooth micro-animations feel top-tier! 🚀
                  </p>
                  <span className="text-xs text-amber-200/80 font-semibold block text-right mt-1.5">09:42 AM</span>
                </div>
              </div>

              {/* Incoming Message 2 */}
              <div className="flex gap-3 items-end">
                <div className="size-8 rounded-xl bg-zinc-800 flex items-center justify-center text-xs font-bold font-mono text-amber-200 border border-white/5">
                  SJ
                </div>
                <div className="bg-zinc-900/90 p-4 rounded-2xl rounded-bl-sm max-w-[80%] border border-white/10 shadow-md">
                  <p className="text-zinc-200 text-sm leading-relaxed">
                    Exactly! Real-time messaging has never felt this refined. Welcome back!
                  </p>
                  <span className="text-xs text-zinc-500 font-semibold block text-right mt-1.5">09:42 AM</span>
                </div>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="preview-content"
          >
            <h2>Connect Seamlessly.</h2>
            <p>
              Experience the next generation of beautiful, secure, real-time messaging.
            </p>
          </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

