import { useState, useRef, useEffect } from "react";
import { useMusicStore } from "../store/useMusicStore";
import { useAuthStore } from "../store/useAuthStore";
import ReactPlayer from "react-player/youtube";
import { Search, Play, Pause, SkipForward, X, Music, Plus, Loader } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const MusicPlayer = () => {
  const { 
    roomId, 
    queue, 
    isPlaying, 
    currentTime, 
    currentVideo, 
    isPlayerOpen,
    searchResults,
    isSearching,
    searchSongs,
    addToQueue,
    playNext,
    syncState,
    togglePlayer,
    leaveRoom
  } = useMusicStore();

  const authUser = useAuthStore((state) => state.authUser);
  const isHost = roomId === authUser?._id;
  
  const [query, setQuery] = useState("");
  const playerRef = useRef(null);

  // Sync incoming state changes with the actual player if we are not the host
  // If we are the host, our local player drives the state
  const handleProgress = (state) => {
    if (isHost && isPlaying) {
      // Sync state to others every ~5 seconds to prevent spam, or just rely on play/pause
      // To keep it simple, we sync mostly on play/pause, but we can sync time here if needed
      if (Math.floor(state.playedSeconds) % 5 === 0) {
         syncState(true, state.playedSeconds);
      }
    }
  };

  const handlePlay = () => {
    if (isHost) syncState(true, playerRef.current?.getCurrentTime() || 0);
  };

  const handlePause = () => {
    if (isHost) syncState(false, playerRef.current?.getCurrentTime() || 0);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) searchSongs(query);
  };

  useEffect(() => {
    // If we are a guest and the time changed significantly, seek to it
    if (!isHost && playerRef.current && Math.abs(playerRef.current.getCurrentTime() - currentTime) > 2) {
      playerRef.current.seekTo(currentTime);
    }
  }, [currentTime, isHost]);

  if (!roomId) return null;

  return (
    <AnimatePresence>
      {isPlayerOpen && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-24 right-6 w-96 glass-morphism rounded-2xl border border-glass-border shadow-2xl overflow-hidden z-[150] flex flex-col bg-zinc-950/90 backdrop-blur-xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/5 bg-zinc-900/50">
            <div className="flex items-center gap-2">
              <Music className="size-5 text-primary" />
              <h3 className="font-bold text-sm">Music Room</h3>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={togglePlayer} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
                <X className="size-4" />
              </button>
            </div>
          </div>

          {/* Hidden Player */}
          <div className="hidden">
            {currentVideo && (
              <ReactPlayer
                ref={playerRef}
                url={`https://www.youtube.com/watch?v=${currentVideo.videoId}`}
                playing={isPlaying}
                onProgress={handleProgress}
                onPlay={handlePlay}
                onPause={handlePause}
                onEnded={playNext}
                controls={false}
              />
            )}
          </div>

          {/* Now Playing */}
          <div className="p-4 border-b border-white/5 flex gap-4 items-center bg-black/20">
            {currentVideo ? (
              <>
                <img src={currentVideo.thumbnail} className="size-16 object-cover rounded-lg shadow-md" />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate">{currentVideo.title}</p>
                  <p className="text-xs text-zinc-400 truncate">{currentVideo.author}</p>
                </div>
              </>
            ) : (
              <div className="flex-1 text-center py-4 text-zinc-500 text-sm">
                No song playing. Search to add one!
              </div>
            )}
          </div>

          {/* Controls */}
          {currentVideo && isHost && (
            <div className="flex items-center justify-center gap-4 p-3 bg-zinc-900/50">
              <button 
                onClick={() => syncState(!isPlaying, playerRef.current?.getCurrentTime() || 0)}
                className="p-3 bg-primary text-black rounded-full hover:bg-primary/90 transition-colors"
              >
                {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
              </button>
              <button 
                onClick={playNext}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <SkipForward size={20} />
              </button>
            </div>
          )}

          {/* Search */}
          <div className="p-4 flex flex-col gap-3 flex-1 min-h-0">
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search YouTube..."
                className="flex-1 bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
              />
              <button type="submit" className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20">
                {isSearching ? <Loader className="size-4 animate-spin" /> : <Search className="size-4" />}
              </button>
            </form>

            <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-2 max-h-48">
              {searchResults.length > 0 ? searchResults.map((video) => (
                <div key={video.videoId} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg group transition-colors">
                  <img src={video.thumbnail} className="w-12 h-8 object-cover rounded" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate">{video.title}</p>
                    <p className="text-[10px] text-zinc-400">{video.duration}</p>
                  </div>
                  <button 
                    onClick={() => addToQueue(video)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 bg-primary/20 text-primary rounded-md transition-all hover:bg-primary hover:text-black"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              )) : (
                <div className="flex flex-col gap-2">
                  <p className="text-xs font-semibold text-zinc-400 mb-1">Up Next ({queue.length})</p>
                  {queue.map((video, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 bg-black/20 rounded-lg">
                      <img src={video.thumbnail} className="w-10 h-7 object-cover rounded opacity-50" />
                      <p className="text-xs truncate flex-1 text-zinc-300">{video.title}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="p-3 border-t border-white/5">
            <button 
              onClick={leaveRoom}
              className="w-full py-2 text-xs font-bold text-red-500 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors"
            >
              {isHost ? "End Music Room" : "Leave Room"}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MusicPlayer;
