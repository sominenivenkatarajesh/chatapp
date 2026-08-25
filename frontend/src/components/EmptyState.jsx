import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";

const EmptyIllustration = ({ variant = "default" }) => {
  if (variant === "search") {
    return (
      <svg viewBox="0 0 120 120" fill="none" className="size-24 text-amber-500">
        <circle cx="60" cy="60" r="48" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" opacity="0.2" />
        <circle cx="54" cy="54" r="26" stroke="#18181b" strokeWidth="12" fill="#18181b" />
        <circle cx="54" cy="54" r="26" stroke="rgba(245, 158, 11, 0.4)" strokeWidth="2" fill="#141417" />
        <line x1="72" y1="72" x2="96" y2="96" stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity="0.8" />
        <circle cx="54" cy="54" r="8" fill="currentColor" opacity="0.3" className="animate-pulse" />
      </svg>
    );
  }

  if (variant === "users") {
    return (
      <svg viewBox="0 0 120 120" fill="none" className="size-24 text-amber-500">
        <circle cx="60" cy="60" r="48" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" opacity="0.2" />
        <circle cx="44" cy="50" r="16" fill="#18181b" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="1.5" />
        <circle cx="76" cy="50" r="16" fill="#18181b" stroke="rgba(245, 158, 11, 0.4)" strokeWidth="1.5" />
        <path d="M26 88c0-10 8-16 18-16h4c6 0 11 3 14 7" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="2" strokeLinecap="round" />
        <path d="M58 88c0-10 8-16 18-16h4c10 0 18 6 18 16" stroke="rgba(245, 158, 11, 0.6)" strokeWidth="2" strokeLinecap="round" />
        <circle cx="76" cy="50" r="4" fill="currentColor" opacity="0.8" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 120 120" fill="none" className="size-24 text-amber-500">
      <circle cx="60" cy="60" r="48" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" opacity="0.2" />
      <rect x="36" y="36" width="48" height="48" rx="16" fill="#141417" stroke="rgba(245, 158, 11, 0.3)" strokeWidth="1.5" />
      <circle cx="60" cy="60" r="12" fill="currentColor" opacity="0.2" className="animate-ping" />
      <circle cx="60" cy="60" r="6" fill="currentColor" />
      <path d="M48 52h24M48 68h16" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
};

const EmptyState = ({ 
  icon: Icon, 
  title = "Nothing to display", 
  message = "There are no items matching this view.", 
  actionText,
  actionLink,
  onAction,
  variant
}) => {
  // Infer illustration variant
  const illustrationVariant = variant || (title.toLowerCase().includes("search") ? "search" : title.toLowerCase().includes("user") || title.toLowerCase().includes("friend") ? "users" : "default");

  return (
    <motion.div 
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center p-8 text-center h-full min-h-[260px] w-full"
    >
      <div className="relative mb-5 flex items-center justify-center">
        <div className="absolute inset-0 bg-amber-500/10 blur-2xl rounded-full scale-125 pointer-events-none" />
        <EmptyIllustration variant={illustrationVariant} />
      </div>

      <h3 className="text-lg font-bold text-white mb-1.5 tracking-tight">{title}</h3>
      <p className="text-zinc-400 text-sm max-w-sm mb-6 leading-relaxed">
        {message}
      </p>
      
      {actionLink && (
        <Link to={actionLink} className="btn-primary px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-amber-500/20 inline-flex items-center gap-2">
          {actionText} <ArrowRight size={14} />
        </Link>
      )}
      
      {onAction && !actionLink && (
        <button onClick={onAction} className="btn-primary px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-amber-500/20 inline-flex items-center gap-2">
          {actionText} <ArrowRight size={14} />
        </button>
      )}
    </motion.div>
  );
};

export default EmptyState;

