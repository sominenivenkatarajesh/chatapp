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
    <div className="h-screen grid lg:grid-cols-2">
      {/* left side */}
      <div className="flex flex-col justify-center items-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8 glass-morphism p-8">
          {/* LOGO */}
          <div className="text-center mb-8">
            <div className="flex flex-col items-center gap-2 group">
              <div
                className="size-12 rounded-xl bg-primary/10 flex items-center justify-center 
              group-hover:bg-primary/20 transition-colors"
              >
                <MessageSquare className="size-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold mt-2">Create Account</h1>
              <p className="text-text-muted">Get started with your free account</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="size-5 text-text-muted" />
                </div>
                <input
                  type="text"
                  className="input-field pl-10"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="size-5 text-text-muted" />
                </div>
                <input
                  type="email"
                  className="input-field pl-10"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="size-5 text-text-muted" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  className="input-field pl-10"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
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

            <button type="submit" className="btn btn-primary w-full" disabled={isSigningUp}>
              {isSigningUp ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  Loading...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="text-center">
            <p className="text-text-muted">
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Visual */}
      <div className="hidden lg:flex items-center justify-center bg-black p-12 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-black to-black opacity-50"></div>
        
        <div className="w-full max-w-lg relative z-10">
          {/* Mock Chat UI */}
          <div className="glass-morphism p-6 rounded-3xl relative mb-10 shadow-2xl shadow-primary/10">
            <div className="absolute -top-6 -left-6 size-24 bg-primary/30 rounded-full blur-2xl animate-pulse"></div>
            <div className="absolute -bottom-6 -right-6 size-24 bg-primary/20 rounded-full blur-2xl animate-pulse" style={{animationDelay: '1s'}}></div>
            
            <div className="space-y-5">
              {/* Message 1 */}
              <div className="flex gap-3 items-end">
                <div className="size-8 rounded-full bg-zinc-800 flex-shrink-0"></div>
                <div className="bg-[#1a1a1a] p-4 rounded-2xl rounded-bl-sm w-3/4 border border-glass-border">
                  <div className="h-2.5 bg-zinc-700 rounded w-1/2 mb-2"></div>
                  <div className="h-2.5 bg-zinc-700/50 rounded w-full mb-2"></div>
                  <div className="h-2.5 bg-zinc-700/50 rounded w-4/5"></div>
                </div>
              </div>

              {/* Message 2 */}
              <div className="flex gap-3 items-end justify-end">
                <div className="bg-primary/10 p-4 rounded-2xl rounded-br-sm w-2/3 border border-primary/20">
                  <div className="h-2.5 bg-primary/40 rounded w-3/4 mb-2"></div>
                  <div className="h-2.5 bg-primary/30 rounded w-full"></div>
                </div>
              </div>
              
              {/* Message 3 */}
              <div className="flex gap-3 items-end">
                <div className="size-8 rounded-full bg-zinc-800 flex-shrink-0"></div>
                <div className="bg-[#1a1a1a] p-4 rounded-2xl rounded-bl-sm w-1/2 border border-glass-border">
                  <div className="h-2.5 bg-zinc-700 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold font-outfit leading-tight">Connect with the <br/><span className="text-primary">Future of Chat</span></h2>
            <p className="text-text-secondary text-lg">
              Experience real-time communication wrapped in a seamless, glassmorphic interface designed for the modern web.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
