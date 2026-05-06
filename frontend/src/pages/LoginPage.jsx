import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Loader2, Lock, Mail, MessageSquare } from "lucide-react";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const { login, isLoggingIn } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    login(formData);
  };

  return (
    <div className="h-screen grid lg:grid-cols-2">
      {/* Left Side - Form */}
      <div className="flex flex-col justify-center items-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8 glass-morphism p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex flex-col items-center gap-2 group">
              <div
                className="size-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20
              transition-colors"
              >
                <MessageSquare className="size-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold mt-2">Welcome Back</h1>
              <p className="text-text-muted">Sign in to your account</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
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

            <button type="submit" className="btn btn-primary w-full" disabled={isLoggingIn}>
              {isLoggingIn ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  Loading...
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <div className="text-center">
            <p className="text-text-muted">
              Don&apos;t have an account?{" "}
              <Link to="/signup" className="text-primary hover:underline">
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Visual */}
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
            <h2 className="text-4xl font-bold font-outfit leading-tight">Welcome back!</h2>
            <p className="text-text-secondary text-lg">
              Sign in to continue your conversations and catch up with your messages.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
