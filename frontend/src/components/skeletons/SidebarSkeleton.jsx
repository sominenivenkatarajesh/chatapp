import { Search, User } from "lucide-react";

const SidebarSkeleton = () => {
  // Create 8 skeleton items
  const skeletonItems = Array(8).fill(null);

  return (
    <aside className="h-full w-full lg:w-[400px] flex flex-col transition-all duration-300 bg-wa-sidebar z-10 border-r border-wa-border animate-pulse">
      {/* Sidebar Header Skeleton */}
      <div className="h-[60px] bg-wa-panel px-4 flex items-center justify-between">
        <div className="h-6 w-16 bg-white/5 rounded-md" />
        <div className="size-8 rounded-full bg-white/5" />
      </div>

      {/* Search Bar Skeleton */}
      <div className="px-3 py-2 bg-wa-sidebar border-b border-wa-border/30">
        <div className="h-9 w-full bg-wa-panel rounded-lg" />
      </div>

      {/* Stats Skeleton */}
      <div className="px-4 py-3 bg-wa-sidebar border-b border-wa-border/10 flex justify-between items-center">
        <div className="h-3 w-16 bg-white/5 rounded-full" />
        <div className="h-3 w-16 bg-white/5 rounded-full" />
      </div>

      {/* User List Skeleton */}
      <div className="overflow-y-auto w-full flex-1 bg-wa-sidebar">
        {skeletonItems.map((_, idx) => (
          <div key={idx} className="w-full h-[72px] px-3 flex items-center gap-3 border-b border-wa-border/10">
            <div className="size-12 rounded-full bg-white/5" />
            <div className="flex flex-col flex-1 gap-2">
              <div className="h-4 w-1/3 bg-white/5 rounded" />
              <div className="h-3 w-1/2 bg-white/5 rounded" />
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default SidebarSkeleton;
