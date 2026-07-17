import React from "react";

const UserCardSkeleton = () => {
  return (
    <div className="glass-morphism p-5 rounded-2xl flex flex-col items-center gap-4 relative overflow-hidden w-full min-h-[220px]">
      <div className="absolute top-0 w-full h-16 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
      
      {/* Avatar skeleton */}
      <div className="size-20 rounded-2xl bg-white/5 animate-pulse shadow-lg border border-white/5" />
      
      <div className="text-center w-full flex flex-col items-center gap-2 mt-1">
        {/* Username skeleton */}
        <div className="h-4 w-24 bg-white/10 rounded animate-pulse" />
        {/* Email skeleton */}
        <div className="h-3 w-32 bg-white/5 rounded animate-pulse mt-1" />
      </div>

      <div className="w-full pt-3">
        {/* Button skeleton */}
        <div className="w-full h-10 bg-white/10 rounded-xl animate-pulse" />
      </div>
    </div>
  );
};

export default UserCardSkeleton;
