const MessageSkeleton = () => {
  // Create an array of 6 items for skeleton messages
  const skeletonMessages = Array(6).fill(null);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {skeletonMessages.map((_, idx) => (
        <div key={idx} className={`flex ${idx % 2 === 0 ? "justify-start" : "justify-end"}`}>
          <div className="max-w-[70%] space-y-2">
            <div className={`h-10 w-48 rounded-2xl animate-pulse bg-white/5`} />
            <div className="h-3 w-16 bg-white/5 animate-pulse rounded mx-1" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default MessageSkeleton;
