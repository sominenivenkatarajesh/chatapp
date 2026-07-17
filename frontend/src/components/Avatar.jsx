import React from "react";

const getInitials = (name) => {
  if (!name) return "?";
  const parts = name.split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

const getGradient = (name) => {
  const gradients = [
    "from-indigo-500 to-purple-600",
    "from-pink-500 to-rose-500",
    "from-cyan-500 to-blue-600",
    "from-emerald-400 to-teal-500",
    "from-amber-400 to-orange-500",
    "from-violet-500 to-fuchsia-600",
  ];
  
  if (!name) return gradients[0];
  
  // Simple hash
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const index = Math.abs(hash) % gradients.length;
  return gradients[index];
};

export const Avatar = ({ user, size = "md", isOnline = false, className = "" }) => {
  const sizeClasses = {
    xs: "w-8 h-8 text-xs",
    sm: "w-10 h-10 text-sm",
    md: "w-12 h-12 text-base",
    lg: "w-16 h-16 text-lg",
    xl: "w-20 h-20 text-xl",
    "2xl": "w-28 h-28 text-2xl",
    "3xl": "w-32 h-32 md:w-40 md:h-40 text-4xl"
  };

  const currentSize = sizeClasses[size] || sizeClasses.md;
  const onlineGlow = isOnline ? "shadow-[0_0_15px_rgba(16,185,129,0.4)] border-emerald-500/50" : "border-white/10";
  
  const hasImage = Boolean(user?.profilePic && user.profilePic !== "/avatar.svg");
  const displayName = user?.username || user?.fullName || user?.name || "User";

  return (
    <div className={`relative inline-block ${className}`}>
      {hasImage ? (
        <img
          src={user.profilePic}
          alt={displayName}
          className={`${currentSize} rounded-2xl object-cover border-2 transition-all duration-300 ${onlineGlow}`}
        />
      ) : (
        <div className={`${currentSize} rounded-2xl border-2 transition-all duration-300 flex items-center justify-center font-bold text-white shadow-lg bg-gradient-to-br ${getGradient(displayName)} ${onlineGlow}`}>
          {getInitials(displayName)}
        </div>
      )}
      
      {isOnline && (
        <span className="absolute -bottom-1 -right-1 size-3.5 rounded-full bg-emerald-500 border-2 border-bg shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
      )}
    </div>
  );
};

export default Avatar;
