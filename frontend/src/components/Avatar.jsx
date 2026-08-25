import React from "react";
import { Users } from "lucide-react";

const getInitials = (name) => {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

const getDuotoneStyle = (name) => {
  const duotonePalettes = [
    { bg: "from-zinc-850 to-amber-950/70", text: "text-amber-300", border: "border-amber-500/30" },
    { bg: "from-stone-900 to-amber-900/50", text: "text-amber-200", border: "border-amber-500/20" },
    { bg: "from-zinc-900 to-zinc-800", text: "text-amber-100", border: "border-amber-400/20" },
    { bg: "from-amber-950/80 to-zinc-900", text: "text-amber-400", border: "border-amber-500/30" },
    { bg: "from-stone-900 to-zinc-850", text: "text-amber-200", border: "border-amber-600/25" },
    { bg: "from-zinc-900 to-stone-900", text: "text-stone-200", border: "border-white/10" },
  ];
  
  if (!name) return duotonePalettes[0];
  
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const index = Math.abs(hash) % duotonePalettes.length;
  return duotonePalettes[index];
};

export const Avatar = ({ user, size = "md", isOnline = false, className = "" }) => {
  const sizeClasses = {
    xs: "size-8 text-[11px]",
    sm: "size-10 text-xs",
    md: "size-12 text-sm",
    lg: "size-16 text-base",
    xl: "size-20 text-lg",
    "2xl": "size-28 text-2xl",
    "3xl": "size-32 md:size-40 text-3xl"
  };

  const currentSize = sizeClasses[size] || sizeClasses.md;
  const isGroup = Boolean(user?.isGroup);
  const onlineGlow = isOnline ? "shadow-[0_0_12px_rgba(16,185,129,0.4)] border-emerald-500/50" : "border-white/10";
  
  const hasImage = Boolean(user?.profilePic && user.profilePic !== "/avatar.svg" && user.profilePic !== "/group-avatar.png");
  const displayName = user?.username || user?.fullName || user?.name || (isGroup ? "Group" : "User");
  const palette = getDuotoneStyle(displayName);

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${currentSize} rounded-2xl ${className}`}>
      <div className="w-full h-full rounded-2xl overflow-hidden relative flex items-center justify-center">
        {hasImage ? (
          <img
            src={user.profilePic}
            alt={displayName}
            className={`w-full h-full object-cover rounded-2xl border ${onlineGlow} transition-all duration-300`}
            loading="lazy"
          />
        ) : isGroup ? (
          <div className={`w-full h-full rounded-2xl border ${palette.border} bg-gradient-to-br ${palette.bg} flex items-center justify-center shadow-md`}>
            <Users className={`${size === "xs" ? "size-3.5" : size === "sm" ? "size-4" : "size-5"} ${palette.text}`} />
          </div>
        ) : (
          <div className={`w-full h-full rounded-2xl border ${palette.border} transition-all duration-300 flex items-center justify-center font-bold font-mono tracking-wider ${palette.text} shadow-md bg-gradient-to-br ${palette.bg} ${onlineGlow}`}>
            {getInitials(displayName)}
          </div>
        )}
      </div>
      
      {isOnline && !isGroup && (
        <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full bg-emerald-500 border-2 border-[#09090b] shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse z-10" />
      )}
    </div>
  );
};

export default Avatar;

