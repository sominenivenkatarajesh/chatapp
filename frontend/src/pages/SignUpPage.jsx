import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Eye, EyeOff, Loader2, Lock, Mail, MessageSquare, User, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

const SignUpPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    phoneNumber: "",
    gender: "",
    email: "",
    password: "",
  });

  const { signup, isSigningUp } = useAuthStore();

  const validateForm = () => {
    if (!formData.username.trim()) return toast.error("Username is required");
    if (!formData.phoneNumber.trim()) return toast.error("Phone number is required");
    if (!formData.gender) return toast.error("Gender is required");
    if (!formData.email.trim()) return toast.error("Email is required");
    if (!/\S+@\S+\.\S+/.test(formData.email)) return toast.error("Invalid email format");
    if (!formData.password) return toast.error("Password is required");
    if (formData.password.length < 6) return toast.error("Password must be at least 6 characters");

    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const success = validateForm();

    if (success === true) signup(formData);
  };

  return (
    <div className="auth-page">
      {/* Dynamic Background Glows */}
      <div className="auth-glow-wrapper">
        <div className="auth-glow-1"></div>
        <div className="auth-glow-2"></div>
      </div>

      <div className="auth-container">
        {/* Left side - Form */}
        <div className="login-section">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="auth-card glass-morphism shadow-2xl"
          >
          {/* LOGO */}
          <div className="text-center">
            <div className="flex flex-col items-center gap-4 group">
              <div
                className="size-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center 
              group-hover:bg-indigo-500/20 transition-all duration-500 group-hover:rotate-6 group-hover:scale-105 border border-indigo-500/20"
              >
                <MessageSquare className="size-7 text-indigo-400" />
              </div>
              <div className="space-y-1.5 mt-1">
                <h1 className="text-3xl font-extrabold tracking-tight text-white">Create Account</h1>
                <p className="text-text-secondary text-sm">Join our real-time chatting community</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="auth-form-wrapper">
            <div className="auth-input-wrapper">
              <label className="text-xs uppercase tracking-wider font-bold ml-1 text-zinc-400">Username</label>
              <div className="input-group">
                <User className="left-icon" />
                <input
                  type="text"
                  placeholder="johndoe"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="auth-input-wrapper">
              <label className="text-xs uppercase tracking-wider font-bold ml-1 text-zinc-400">Phone Number</label>
              <div className="input-group">
                <Phone className="left-icon" />
                <input
                  type="text"
                  placeholder="+1234567890"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="auth-input-wrapper">
              <label className="text-xs uppercase tracking-wider font-bold ml-1 text-zinc-400">Gender</label>
              <div className="input-group">
                <User className="left-icon" />
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  required
                >
                  <option value="" disabled className="text-zinc-500 bg-zinc-800">Select gender</option>
                  <option value="male" className="bg-zinc-800">Male</option>
                  <option value="female" className="bg-zinc-800">Female</option>
                  <option value="other" className="bg-zinc-800">Other</option>
                  <option value="prefer_not_to_say" className="bg-zinc-800">Prefer not to say</option>
                </select>
              </div>
            </div>

            <div className="auth-input-wrapper">
              <label className="text-xs uppercase tracking-wider font-bold ml-1 text-zinc-400">Email Address</label>
              <div className="input-group">
                <Mail className="left-icon" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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

            <button 
              type="submit" 
              className="btn btn-primary auth-submit-btn" 
              disabled={isSigningUp}
            >
              {isSigningUp ? (
                <>
                  <Loader2 className="size-5 animate-spin mr-2" />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-zinc-400">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
              Sign in
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
                  <div className="size-10 rounded-full bg-gradient-to-tr from-indigo-500/30 to-purple-500/30 flex items-center justify-center font-bold text-white text-sm border border-white/10">
                    SJ
                  </div>
                  <span className="absolute bottom-0.5 right-0.5 size-2.5 bg-green-500 rounded-full border-2 border-bg" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Sarah Jenkins</h3>
                  <p className="text-green-400 text-xs font-semibold flex items-center gap-1">
                    <span className="size-1.5 rounded-full bg-green-500 animate-ping inline-block" /> Active now
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
                <div className="size-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400 border border-white/5">
                  SJ
                </div>
                <div className="bg-chat-incoming p-4 rounded-2xl rounded-bl-sm max-w-[80%] border border-white/5 shadow-md">
                  <p className="text-zinc-200 text-sm leading-relaxed">
                    Hey! Did you check out the new design update? It looks incredible! 🔥
                  </p>
                  <span className="text-xs text-zinc-500 font-semibold block text-right mt-1.5">09:41 AM</span>
                </div>
              </div>

              {/* Outgoing Message */}
              <div className="flex gap-3 items-end justify-end">
                <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-4 rounded-2xl rounded-br-sm max-w-[80%] border border-white/5 shadow-md">
                  <p className="text-white text-sm leading-relaxed">
                    Oh wow! Just signing in. The smooth micro-animations and colors are absolutely top-tier! 🚀
                  </p>
                  <span className="text-xs text-indigo-200/60 font-semibold block text-right mt-1.5">09:42 AM</span>
                </div>
              </div>

              {/* Incoming Message 2 */}
              <div className="flex gap-3 items-end">
                <div className="size-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400 border border-white/5">
                  SJ
                </div>
                <div className="bg-chat-incoming p-4 rounded-2xl rounded-bl-sm max-w-[80%] border border-white/5 shadow-md">
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
            <h2>Start Chatting.</h2>
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

export default SignUpPage;
