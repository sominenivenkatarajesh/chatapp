import { useState, useRef, useEffect } from "react";
import { useMusicStore } from "../store/useMusicStore";
import { useAuthStore } from "../store/useAuthStore";
import ReactPlayer from "react-player";
import { Search, Play, Pause, SkipForward, SkipBack, X, Music, Plus, Loader, Heart, ListMusic, ChevronDown, ChevronRight, Trash2 } from "lucide-react";
import { motion, AnimatePresence, useDragControls } from "framer-motion";

const MusicPlayer = () => {
  const { 
    roomId, 
    hostId,
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
    leaveRoom,
    favorites,
    playlists,
    fetchFavorites,
    toggleFavorite,
    fetchPlaylists,
    createPlaylist,
    addToPlaylist
  } = useMusicStore();

  const authUser = useAuthStore((state) => state.authUser);
  const isHost = hostId === authUser?._id;
  
  const [query, setQuery] = useState("");
  const [duration, setDuration] = useState(0);
  const [activeTab, setActiveTab] = useState("search"); // 'search', 'favorites', 'playlists'
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [expandedPlaylist, setExpandedPlaylist] = useState(null);
  
  const playerRef = useRef(null);
  const dragControls = useDragControls();

  useEffect(() => {
    if (isPlayerOpen) {
      fetchFavorites();
      fetchPlaylists();
    }
  }, [isPlayerOpen, fetchFavorites, fetchPlaylists]);

  const handleProgress = (state) => {
    if (isHost && isPlaying) {
      if (Math.floor(state.playedSeconds) % 5 === 0) {
         syncState(true, state.playedSeconds);
      }
    }
  };

  const handleSeek = (e) => {
    if (!isHost) return;
    const time = parseFloat(e.target.value);
    playerRef.current?.seekTo(time);
    syncState(isPlaying, time);
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
    if (!isHost && playerRef.current && Math.abs(playerRef.current.getCurrentTime() - currentTime) > 2) {
      playerRef.current.seekTo(currentTime);
    }
  }, [currentTime, isHost]);

  if (!roomId) return null;

  return (
    <AnimatePresence>
      {isPlayerOpen && (
        <motion.div
          drag
          dragControls={dragControls}
          dragListener={false}
          dragMomentum={false}
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-24 right-6 w-96 glass-morphism rounded-3xl border border-white/10 shadow-2xl overflow-hidden z-[150] flex flex-col bg-zinc-950/95 backdrop-blur-xl"
        >
          {/* Header */}
          <div 
            className="flex items-center justify-between p-4 border-b border-white/5 bg-zinc-900/50 cursor-move"
            onPointerDown={(e) => dragControls.start(e)}
          >
            <div className="flex items-center gap-2">
              <div className="size-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Music className="size-4" />
              </div>
              <h3 className="font-bold text-sm text-white">Music Session</h3>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={togglePlayer} className="p-1.5 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors">
                <X className="size-4" />
              </button>
            </div>
          </div>

          {/* Hidden Player */}
          <div className="absolute opacity-0 pointer-events-none w-0 h-0 overflow-hidden -z-50">
            {currentVideo && (
              <ReactPlayer
                ref={playerRef}
                url={`https://www.youtube.com/watch?v=${currentVideo.videoId}`}
                playing={isPlaying}
                onProgress={handleProgress}
                onDuration={(d) => setDuration(d)}
                onPlay={handlePlay}
                onPause={handlePause}
                onEnded={playNext}
                controls={false}
              />
            )}
          </div>

          {/* Now Playing */}
          <div className="p-4 border-b border-white/5 flex gap-4 items-center bg-black/30">
            {currentVideo ? (
              <>
                <img src={currentVideo.thumbnail} className="size-16 object-cover rounded-xl shadow-md border border-white/10" alt="" />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate text-white">{currentVideo.title}</p>
                  <p className="text-xs text-zinc-400 truncate mt-0.5">{currentVideo.author}</p>
                </div>
              </>
            ) : (
              <div className="flex-1 text-center py-4 text-zinc-500 text-sm">
                No song currently playing. Search to add one!
              </div>
            )}
          </div>

          {/* Controls */}
          {currentVideo && isHost && (
            <div className="flex flex-col gap-2 p-3 bg-zinc-900/50">
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400 font-mono font-medium min-w-[30px] text-right">
                  {Math.floor(currentTime / 60)}:{(Math.floor(currentTime % 60)).toString().padStart(2, '0')}
                </span>
                <input 
                  type="range"
                  min={0}
                  max={duration || 0}
                  value={currentTime || 0}
                  onChange={handleSeek}
                  className="flex-1 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <span className="text-xs text-zinc-400 font-mono font-medium min-w-[30px]">
                  {Math.floor(duration / 60)}:{(Math.floor(duration % 60)).toString().padStart(2, '0')}
                </span>
              </div>
              <div className="flex items-center justify-center gap-4 mt-1">
                <button 
                  onClick={() => {
                    const newTime = Math.max(0, (playerRef.current?.getCurrentTime() || 0) - 10);
                    playerRef.current?.seekTo(newTime);
                    syncState(isPlaying, newTime);
                  }}
                  className="p-2 hover:bg-white/10 rounded-xl text-zinc-400 hover:text-white transition-colors"
                >
                  <SkipBack size={18} />
                </button>
                <button 
                  onClick={() => syncState(!isPlaying, playerRef.current?.getCurrentTime() || 0)}
                  className="p-3 bg-amber-500 text-black rounded-xl hover:bg-amber-400 transition-colors shadow-[0_0_15px_rgba(245,158,11,0.4)] font-bold"
                >
                  {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
                </button>
                <button 
                  onClick={playNext}
                  className="p-2 hover:bg-white/10 rounded-xl text-zinc-400 hover:text-white transition-colors"
                >
                  <SkipForward size={18} />
                </button>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex border-b border-white/5 bg-zinc-900/30">
            <button 
              onClick={() => setActiveTab("search")}
              className={`flex-1 py-2 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${activeTab === 'search' ? 'text-amber-400 border-b-2 border-amber-500 bg-amber-500/10' : 'text-zinc-400 hover:text-zinc-200'}`}
            >
              <Search size={13} /> Search
            </button>
            <button 
              onClick={() => setActiveTab("favorites")}
              className={`flex-1 py-2 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${activeTab === 'favorites' ? 'text-amber-400 border-b-2 border-amber-500 bg-amber-500/10' : 'text-zinc-400 hover:text-zinc-200'}`}
            >
              <Heart size={13} /> Favorites
            </button>
            <button 
              onClick={() => setActiveTab("playlists")}
              className={`flex-1 py-2 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${activeTab === 'playlists' ? 'text-amber-400 border-b-2 border-amber-500 bg-amber-500/10' : 'text-zinc-400 hover:text-zinc-200'}`}
            >
              <ListMusic size={13} /> Playlists
            </button>
          </div>

          {/* Content Area */}
          <div className="p-4 flex flex-col gap-3 flex-1 min-h-[220px] max-h-[300px] overflow-hidden">
            {activeTab === "search" && (
              <>
                <form onSubmit={handleSearch} className="flex gap-2">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search YouTube tracks..."
                    className="flex-1 bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-all"
                  />
                  <button type="submit" className="p-2 bg-amber-500/15 text-amber-400 rounded-xl hover:bg-amber-500 hover:text-black transition-colors">
                    {isSearching ? <Loader className="size-4 animate-spin" /> : <Search className="size-4" />}
                  </button>
                </form>

                <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-2">
                  {searchResults.length > 0 ? searchResults.map((video) => {
                    const isFavorited = favorites.some(f => f.videoId === video.videoId);
                    return (
                      <div key={video.videoId} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-xl group transition-colors border border-transparent hover:border-white/5">
                        <img src={video.thumbnail} className="w-12 h-8 object-cover rounded-lg shadow-sm" alt="" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold truncate text-zinc-200">{video.title}</p>
                          <p className="text-[10px] text-zinc-500">{video.duration}</p>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => toggleFavorite(video)}
                            className={`p-1.5 rounded-lg transition-colors ${isFavorited ? 'text-red-500 bg-red-500/10' : 'text-zinc-400 hover:text-red-500 hover:bg-red-500/10'}`}
                            title={isFavorited ? "Remove from Favorites" : "Add to Favorites"}
                          >
                            <Heart size={14} fill={isFavorited ? "currentColor" : "none"} />
                          </button>
                          
                          <div className="relative group/menu">
                            <button className="p-1.5 text-zinc-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors" title="Add to Playlist">
                              <ListMusic size={14} />
                            </button>
                            {playlists.length > 0 && (
                              <div className="absolute bottom-full right-0 mb-2 hidden group-hover/menu:flex flex-col bg-zinc-900 rounded-xl shadow-xl overflow-hidden border border-white/10 z-[200] w-36 pb-1">
                                <div className="px-2.5 py-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-wider bg-zinc-950/80 border-b border-white/5">Playlists</div>
                                {playlists.map(p => (
                                  <button 
                                    key={p._id}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      addToPlaylist(p._id, video);
                                    }}
                                    className="px-3 py-1.5 text-xs text-left text-zinc-300 hover:bg-amber-500/20 hover:text-amber-300 transition-colors truncate"
                                  >
                                    {p.name}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>

                          <button 
                            onClick={() => addToQueue(video)}
                            className="p-1.5 bg-amber-500/20 text-amber-400 rounded-lg transition-colors hover:bg-amber-500 hover:text-black shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                            title="Add to Queue"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  }) : (
                    <div className="flex flex-col gap-2">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Up Next ({queue.length})</p>
                      {queue.map((video, i) => (
                        <div key={i} className="flex items-center gap-3 p-2 bg-black/20 rounded-xl">
                          <img src={video.thumbnail} className="w-10 h-7 object-cover rounded opacity-60" alt="" />
                          <p className="text-xs truncate flex-1 text-zinc-300">{video.title}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {activeTab === "favorites" && (
              <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-2">
                {favorites.length > 0 ? favorites.map((video) => (
                  <div key={video.videoId} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-xl group transition-colors">
                    <img src={video.thumbnail} className="w-12 h-8 object-cover rounded-lg" alt="" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate text-zinc-200">{video.title}</p>
                      <p className="text-[10px] text-zinc-500">{video.duration}</p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => toggleFavorite(video)}
                        className="p-1.5 text-red-500 bg-red-500/10 rounded-lg hover:bg-red-500/20 transition-colors"
                        title="Remove from Favorites"
                      >
                        <Heart size={14} fill="currentColor" />
                      </button>
                      <button 
                        onClick={() => addToQueue(video)}
                        className="p-1.5 bg-amber-500/20 text-amber-400 rounded-lg transition-colors hover:bg-amber-500 hover:text-black"
                        title="Add to Queue"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                )) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 text-xs gap-2">
                    <Heart size={28} className="opacity-20" />
                    <p>No favorites saved yet.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "playlists" && (
              <div className="flex-1 flex flex-col min-h-0">
                <form 
                  onSubmit={(e) => { 
                    e.preventDefault(); 
                    if (newPlaylistName.trim()) {
                      createPlaylist(newPlaylistName);
                      setNewPlaylistName("");
                    }
                  }} 
                  className="flex gap-2 mb-3"
                >
                  <input
                    type="text"
                    value={newPlaylistName}
                    onChange={(e) => setNewPlaylistName(e.target.value)}
                    placeholder="New playlist title..."
                    className="flex-1 bg-white/[0.04] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-all"
                  />
                  <button type="submit" className="px-3 bg-amber-500/15 text-amber-400 rounded-xl hover:bg-amber-500 hover:text-black transition-colors text-xs font-bold">
                    Create
                  </button>
                </form>

                <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-2">
                  {playlists.length > 0 ? playlists.map((playlist) => (
                    <div key={playlist._id} className="flex flex-col bg-black/30 rounded-xl border border-white/5 overflow-hidden">
                      <button 
                        onClick={() => setExpandedPlaylist(expandedPlaylist === playlist._id ? null : playlist._id)}
                        className="flex items-center justify-between p-2.5 hover:bg-white/5 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <ListMusic size={14} className="text-amber-400" />
                          <span className="text-xs font-semibold text-white">{playlist.name}</span>
                          <span className="text-[10px] text-zinc-500">({playlist.songs.length})</span>
                        </div>
                        {expandedPlaylist === playlist._id ? <ChevronDown size={14} className="text-zinc-400" /> : <ChevronRight size={14} className="text-zinc-400" />}
                      </button>
                      
                      <AnimatePresence>
                        {expandedPlaylist === playlist._id && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: "auto" }}
                            exit={{ height: 0 }}
                            className="overflow-hidden bg-black/40"
                          >
                            <div className="p-2 flex flex-col gap-1">
                              {playlist.songs.length > 0 ? playlist.songs.map(video => (
                                <div key={video.videoId} className="flex items-center gap-2 p-1.5 hover:bg-white/5 rounded-lg group">
                                  <img src={video.thumbnail} className="w-8 h-6 object-cover rounded opacity-80" alt="" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs truncate text-zinc-300">{video.title}</p>
                                  </div>
                                  <button 
                                    onClick={() => addToQueue(video)}
                                    className="opacity-0 group-hover:opacity-100 p-1 text-amber-400 hover:bg-amber-500/20 rounded transition-all"
                                    title="Add to Queue"
                                  >
                                    <Plus size={12} />
                                  </button>
                                </div>
                              )) : (
                                <p className="text-xs text-zinc-500 text-center py-2">Playlist is empty</p>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 text-xs gap-2 mt-4">
                      <ListMusic size={28} className="opacity-20" />
                      <p>No playlists created yet.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="p-3 border-t border-white/5">
            <button 
              onClick={leaveRoom}
              className="w-full py-2 text-xs font-semibold text-red-400 bg-red-500/10 hover:bg-red-500 hover:text-white rounded-xl transition-colors border border-red-500/20"
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

