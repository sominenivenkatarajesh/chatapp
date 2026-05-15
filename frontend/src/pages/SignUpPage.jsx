import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Eye, EyeOff, Loader2, Lock, Mail, MessageSquare, User } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

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
    <div className="min-h-screen grid lg:grid-cols-2 bg-bg-main overflow-hidden">
      {/* Left side - Form */}
      <div className="flex flex-col justify-center items-center p-6 sm:p-12 relative z-10">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md space-y-8 glass-morphism p-10 rounded-[2rem] border-white/5"
        >
          {/* LOGO */}
          <div className="text-center mb-8">
            <div className="flex flex-col items-center gap-4 group">
              <div
                className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center 
              group-hover:bg-primary/20 transition-all duration-500 group-hover:rotate-12 group-hover:scale-110 border border-primary/20"
              >
                <MessageSquare className="size-8 text-primary" />
              </div>
              <div className="space-y-1">
                <h1 className="text-3xl font-bold tracking-tight">Create Account</h1>
                <p className="text-text-muted">Join our community today</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold ml-1 text-zinc-400">Full Name</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-primary">
                  <User className="size-5 text-zinc-500" />
                </div>
                <input
                  type="text"
                  className="input-field pl-12 bg-white/5 border-white/10 focus:border-primary/50"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold ml-1 text-zinc-400">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-primary">
                  <Mail className="size-5 text-zinc-500" />
                </div>
                <input
                  type="email"
                  className="input-field pl-12 bg-white/5 border-white/10 focus:border-primary/50"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold ml-1 text-zinc-400">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-primary">
                  <Lock className="size-5 text-zinc-500" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  className="input-field pl-12 bg-white/5 border-white/10 focus:border-primary/50"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
              className="btn btn-primary w-full h-12 rounded-xl shadow-lg shadow-primary/20 flex justify-center" 
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
            <p className="text-text-muted text-sm">
              Already have an account?{" "}
              <Link to="/login" className="text-primary font-semibold hover:underline transition-all">
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>

      {/* Right side - Visual */}
      <div className="hidden lg:flex items-center justify-center bg-[#080808] p-12 relative overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-0 right-0 size-[500px] bg-primary/10 rounded-full blur-[120px] -mr-64 -mt-64"></div>
        <div className="absolute bottom-0 left-0 size-[400px] bg-primary/5 rounded-full blur-[100px] -ml-48 -mb-48"></div>
        
        <div className="w-full max-w-lg relative z-10">
          {/* Animated Mock Chat UI */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-morphism p-8 rounded-[2.5rem] relative mb-12 shadow-2xl shadow-primary/5 border-white/5 backdrop-blur-2xl"
          >
            <div className="absolute -top-10 -left-10 size-32 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
            
            <div className="space-y-6">
              {/* Message 1 */}
              <div className="flex gap-4 items-end">
                <div className="size-10 rounded-2xl bg-gradient-to-tr from-zinc-800 to-zinc-700 flex-shrink-0 shadow-lg border border-white/5"></div>
                <div className="bg-zinc-900/80 p-5 rounded-2xl rounded-bl-sm w-[85%] border border-white/5 shadow-xl">
                  <div className="h-2.5 bg-zinc-700 rounded-full w-1/3 mb-3"></div>
                  <div className="h-2.5 bg-zinc-700/40 rounded-full w-full mb-3"></div>
                  <div className="h-2.5 bg-zinc-700/40 rounded-full w-4/5"></div>
                </div>
              </div>

              {/* Message 2 */}
              <div className="flex gap-4 items-end justify-end">
                <div className="bg-primary/20 p-5 rounded-2xl rounded-br-sm w-[75%] border border-primary/20 shadow-xl backdrop-blur-md">
                  <div className="h-2.5 bg-primary/40 rounded-full w-3/4 mb-3"></div>
                  <div className="h-2.5 bg-primary/30 rounded-full w-full"></div>
                </div>
              </div>
              
              {/* Message 3 */}
              <div className="flex gap-4 items-end">
                <div className="size-10 rounded-2xl bg-gradient-to-tr from-zinc-800 to-zinc-700 flex-shrink-0 shadow-lg border border-white/5"></div>
                <div className="bg-zinc-900/80 p-5 rounded-2xl rounded-bl-sm w-[60%] border border-white/5 shadow-xl">
                  <div className="h-2.5 bg-zinc-700 rounded-full w-2/3"></div>
                </div>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center space-y-4"
          >
            <h2 className="text-5xl font-bold leading-tight tracking-tight bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
              Start Chatting.
            </h2>
            <p className="text-text-secondary text-lg max-w-sm mx-auto font-medium">
              Experience the next generation of real-time communication with Chatly.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
