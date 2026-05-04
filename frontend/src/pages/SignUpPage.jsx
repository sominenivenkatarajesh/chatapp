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
    <div className="min-h-screen grid lg:grid-cols-2 bg-bg-main relative overflow-hidden">
      {/* Background glowing orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-500/20 rounded-full blur-[120px] pointer-events-none" />

      {/* left side */}
      <div className="flex flex-col justify-center items-center p-6 sm:p-12 relative z-10">
        <div className="w-full max-w-md space-y-8 p-10 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
          
          {/* LOGO */}
          <div className="text-center mb-8 relative z-10">
            <div className="flex flex-col items-center gap-3 group">
              <div
                className="size-14 rounded-2xl bg-gradient-to-br from-primary to-purple-600 p-[2px] shadow-lg shadow-primary/30 group-hover:shadow-primary/50 transition-all duration-300"
              >
                <div className="w-full h-full bg-bg-main rounded-2xl flex items-center justify-center">
                  <MessageSquare className="size-7 text-primary" />
                </div>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white drop-shadow-md">Create Account</h1>
              <p className="text-text-muted text-sm font-medium">Get started with your free account</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-muted uppercase tracking-widest ml-1">Full Name</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="size-5 text-text-muted group-focus-within:text-primary transition-colors" />
                </div>
                <input
                  type="text"
                  className="w-full pl-12 pr-4 py-3.5 bg-black/20 border border-white/10 rounded-xl text-white placeholder-text-muted/50 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all outline-none"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-text-muted uppercase tracking-widest ml-1">Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="size-5 text-text-muted group-focus-within:text-primary transition-colors" />
                </div>
                <input
                  type="email"
                  className="w-full pl-12 pr-4 py-3.5 bg-black/20 border border-white/10 rounded-xl text-white placeholder-text-muted/50 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all outline-none"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-text-muted uppercase tracking-widest ml-1">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="size-5 text-text-muted group-focus-within:text-primary transition-colors" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full pl-12 pr-12 py-3.5 bg-black/20 border border-white/10 rounded-xl text-white placeholder-text-muted/50 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all outline-none"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center hover:text-white transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="size-5 text-text-muted" />
                  ) : (
                    <Eye className="size-5 text-text-muted" />
                  )}
                </button>
              </div>
            </div>

            <button type="submit" className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary to-purple-600 text-white font-bold tracking-wide shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2" disabled={isSigningUp}>
              {isSigningUp ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="text-center relative z-10 pt-2">
            <p className="text-text-muted font-medium">
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:text-white hover:underline transition-colors font-bold">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Visual */}
      <div className="hidden lg:flex items-center justify-center relative p-12 overflow-hidden border-l border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-bg-main to-bg-main pointer-events-none" />
        <div className="max-w-md text-center space-y-8 relative z-10">
          <div className="grid grid-cols-3 gap-6 mb-12 p-8 glass-morphism rounded-[2.5rem] border border-white/10 shadow-2xl">
            {[...Array(9)].map((_, i) => (
              <div
                key={i}
                className={`aspect-square rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center transition-all duration-500 hover:scale-110 hover:bg-white/10
                ${i % 2 === 0 ? "animate-pulse shadow-[0_0_15px_rgba(99,102,241,0.2)]" : "animate-float"}`}
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                <div className="size-3 rounded-full bg-gradient-to-tr from-primary to-purple-400 opacity-60" />
              </div>
            ))}
          </div>
          <h2 className="text-4xl font-black font-outfit leading-tight tracking-tight text-white drop-shadow-lg">
            Connect with the <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">Future of Chat</span>
          </h2>
          <p className="text-text-muted text-lg font-medium leading-relaxed">
            Experience real-time communication wrapped in a seamless, premium glassmorphic interface designed for the modern web.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
