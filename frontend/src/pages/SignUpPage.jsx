import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Eye, EyeOff, Loader2, Lock, Mail, MessageSquare, User } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

const SignUpPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const { signup, isSigningUp } = useAuthStore();

  const validateForm = () => {
    if (!formData.fullName.trim()) return toast.error("Full name is required");
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
    <div className="h-full grid lg:grid-cols-2 bg-[#060b0d] overflow-hidden relative">
      {/* Dynamic Background Glows */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[150px]"></div>
      </div>

      {/* Left side - Form */}
      <div className="flex flex-col justify-center items-center p-6 sm:p-12 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md space-y-8 glass-morphism p-10 rounded-[2.5rem]"
        >
          {/* LOGO */}
          <div className="text-center">
            <div className="flex flex-col items-center gap-4 group">
              <div
                className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center 
              group-hover:bg-primary/20 transition-all duration-500 group-hover:rotate-6 group-hover:scale-105 border border-primary/20"
              >
                <MessageSquare className="size-7 text-primary" />
              </div>
              <div className="space-y-1.5 mt-2">
                <h1 className="text-3xl font-extrabold tracking-tight text-white">Create Account</h1>
                <p className="text-text-secondary text-sm">Join our real-time chatting community</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider font-bold ml-1 text-zinc-400">Full Name</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-500 transition-colors group-focus-within:text-primary">
                  <User className="size-5" />
                </div>
                <input
                  type="text"
                  className="input-field pl-12"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider font-bold ml-1 text-zinc-400">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-500 transition-colors group-focus-within:text-primary">
                  <Mail className="size-5" />
                </div>
                <input
                  type="email"
                  className="input-field pl-12"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider font-bold ml-1 text-zinc-400">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-500 transition-colors group-focus-within:text-primary">
                  <Lock className="size-5" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  className="input-field pl-12"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-500 hover:text-white transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="size-5" />
                  ) : (
                    <Eye className="size-5" />
                  )}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary w-full h-12 flex justify-center items-center mt-4" 
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

          <div className="text-center pt-2">
            <p className="text-text-secondary text-sm">
              Already have an account?{" "}
              <Link to="/login" className="text-primary font-bold hover:underline transition-all">
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>

      {/* Right Side - Visual Interactive Chat Mockup */}
      <div className="hidden lg:flex items-center justify-center bg-gradient-to-br from-[#0c161a] via-[#090f12] to-[#12232a] p-12 relative overflow-hidden">
        {/* Abstract Glowing Orbs */}
        <div className="absolute top-1/4 right-0 w-80 h-80 bg-primary/10 rounded-full blur-[120px] -mr-40"></div>
        <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-purple-500/5 rounded-full blur-[140px] -ml-48"></div>
        
        <div className="w-full max-w-md relative z-10">
          {/* Mock Chat Dashboard Window */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="glass-morphism rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/5"
          >
            {/* Header */}
            <div className="px-6 py-4 bg-white/5 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="size-10 rounded-full bg-gradient-to-tr from-primary/30 to-purple-500/30 flex items-center justify-center font-bold text-white text-sm border border-white/10">
                    SJ
                  </div>
                  <span className="absolute bottom-0.5 right-0.5 size-2.5 bg-green-500 rounded-full border-2 border-[#162129]" />
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
                <div className="bg-[#202c33] p-4.5 rounded-[1.25rem] rounded-bl-sm max-w-[80%] border border-white/5 shadow-md">
                  <p className="text-zinc-200 text-sm leading-relaxed">
                    Hey! Did you check out the new design update? It looks incredible! 🔥
                  </p>
                  <span className="text-[10px] text-zinc-500 font-semibold block text-right mt-1.5">09:41 AM</span>
                </div>
              </div>

              {/* Outgoing Message */}
              <div className="flex gap-3 items-end justify-end">
                <div className="bg-[#005c4b] p-4.5 rounded-[1.25rem] rounded-br-sm max-w-[80%] border border-white/5 shadow-md">
                  <p className="text-white text-sm leading-relaxed">
                    Oh wow! Just signing in. The smooth micro-animations and colors are absolutely top-tier! 🚀
                  </p>
                  <span className="text-[10px] text-emerald-300/60 font-semibold block text-right mt-1.5">09:42 AM</span>
                </div>
              </div>

              {/* Incoming Message 2 */}
              <div className="flex gap-3 items-end">
                <div className="size-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400 border border-white/5">
                  SJ
                </div>
                <div className="bg-[#202c33] p-4.5 rounded-[1.25rem] rounded-bl-sm max-w-[80%] border border-white/5 shadow-md">
                  <p className="text-zinc-200 text-sm leading-relaxed">
                    Exactly! Real-time messaging has never felt this refined. Welcome back!
                  </p>
                  <span className="text-[10px] text-zinc-500 font-semibold block text-right mt-1.5">09:42 AM</span>
                </div>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-center mt-10 space-y-3"
          >
            <h2 className="text-4xl font-extrabold leading-tight tracking-tight bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent">
              Start Chatting.
            </h2>
            <p className="text-text-secondary text-[15px] max-w-xs mx-auto leading-relaxed">
              Experience the next generation of beautiful, secure, real-time messaging.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
