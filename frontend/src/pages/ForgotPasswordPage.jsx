import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, Mail, MessageSquare, User, Phone, KeyRound, Lock, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/useAuthStore";

const ForgotPasswordPage = () => {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    identifier: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { forgotPassword, resetPassword } = useAuthStore();
  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!formData.identifier.trim()) return toast.error("Please enter your username, email or phone");
    
    setIsSubmitting(true);
    const success = await forgotPassword({
      identifier: formData.identifier,
    });
    
    if (success) {
      setStep(2);
    }
    setIsSubmitting(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      return toast.error("Passwords do not match");
    }

    setIsSubmitting(true);
    const success = await resetPassword({
      identifier: formData.identifier,
      otp: formData.otp,
      newPassword: formData.newPassword
    });

    if (success) {
      navigate("/login");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-glow-wrapper">
        <div className="auth-glow-1"></div>
        <div className="auth-glow-2"></div>
      </div>

      <div className="auth-container">
        <div className="login-section mx-auto max-w-md w-full">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="auth-card glass-morphism shadow-2xl"
          >
          <div className="text-center mb-8">
            <div className="flex flex-col items-center gap-4 group">
              <div
                className="size-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center group-hover:bg-indigo-500/20
              transition-all duration-500 group-hover:rotate-6 group-hover:scale-105 border border-indigo-500/20"
              >
                <MessageSquare className="size-7 text-indigo-400" />
              </div>
              <div className="space-y-1.5 mt-1">
                <h1 className="text-3xl font-extrabold tracking-tight text-white">Reset Password</h1>
                <p className="text-text-secondary text-sm">
                  {step === 1 ? "Enter your details to receive an OTP" : "Enter the OTP sent to your email and your new password"}
                </p>
              </div>
            </div>
          </div>

            <form onSubmit={step === 1 ? handleSendOtp : handleResetPassword} className="auth-form-wrapper" autoComplete="off">
              {step === 1 ? (
                <div className="auth-input-wrapper">
                  <label className="text-xs uppercase tracking-wider font-bold ml-1 text-zinc-400">Email, Username or Phone</label>
                  <div className="input-group">
                    <User className="left-icon" />
                    <input
                      type="text"
                      placeholder="Enter email, username or phone"
                      value={formData.identifier}
                      onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                      required
                      autoComplete="username"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div className="auth-input-wrapper">
                    <label className="text-xs uppercase tracking-wider font-bold ml-1 text-zinc-400">OTP</label>
                    <div className="input-group">
                      <KeyRound className="left-icon" />
                      <input
                        type="text"
                        placeholder="123456"
                        value={formData.otp}
                        onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                        required
                        autoComplete="one-time-code"
                      />
                    </div>
                  </div>

                  <div className="auth-input-wrapper">
                    <label className="text-xs uppercase tracking-wider font-bold ml-1 text-zinc-400">New Password</label>
                    <div className="input-group has-right">
                      <Lock className="left-icon" />
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={formData.newPassword}
                        onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                        required
                        autoComplete="new-password"
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

                  <div className="auth-input-wrapper">
                    <label className="text-xs uppercase tracking-wider font-bold ml-1 text-zinc-400">Confirm Password</label>
                    <div className="input-group has-right">
                      <Lock className="left-icon" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        required
                        autoComplete="new-password"
                      />
                    <button
                      type="button"
                      className="right-icon"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff /> : <Eye />}
                    </button>
                  </div>
                </div>
              </>
            )}

            <button 
              type="submit" 
              className="btn btn-primary auth-submit-btn w-full mt-4" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-5 animate-spin mr-2 inline" />
                  {step === 1 ? "Sending..." : "Resetting..."}
                </>
              ) : (
                step === 1 ? "Send Reset Link" : "Reset Password"
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-zinc-400">
            Remember your password?{" "}
            <Link to="/login" className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
              Back to Login
            </Link>
          </div>
        </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
