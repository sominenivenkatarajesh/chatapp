import { useMusicStore } from "../store/useMusicStore";
import { Music, Play } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const MusicPage = () => {
  const { activeMusicRooms, joinRoom } = useMusicStore();

  return (
    <div className="h-full bg-[#09090b] overflow-y-auto custom-scrollbar">
      <div className="max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <Music className="size-10 text-primary" /> Listening Parties
            </h1>
            <p className="text-zinc-400 mt-2 text-sm font-medium">
              Join your friends and listen to music or watch videos together in real-time.
            </p>
          </div>
        </div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            <div className="space-y-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Music size={20} className="text-primary" /> 
                Active Listening Parties
              </h2>
              
              {activeMusicRooms.length === 0 ? (
                <div className="glass-morphism p-12 rounded-3xl flex items-center justify-center text-zinc-400 flex-col gap-4 max-w-2xl mx-auto mt-12 text-center">
                  <div className="p-6 bg-white/5 rounded-full border border-white/10 shadow-2xl">
                    <Music size={48} className="opacity-40" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">It's quiet here...</h3>
                    <p>None of your friends are hosting a listening party right now. Why not start one?</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {activeMusicRooms.map((room) => (
                    <motion.div 
                      key={room.roomId}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="glass-morphism p-5 rounded-2xl flex flex-col items-center gap-4 shadow-xl border border-white/10 group overflow-hidden relative"
                    >
                      {room.currentVideo && (
                        <div className="absolute inset-0 z-0 opacity-20">
                          <img src={room.currentVideo.thumbnail} className="w-full h-full object-cover blur-xl" alt="" />
                        </div>
                      )}
                      <div className="relative z-10 w-full flex flex-col items-center text-center">
                        <div className="size-20 rounded-2xl bg-zinc-800 flex items-center justify-center mb-2 overflow-hidden border border-white/10 shadow-lg">
                           {room.currentVideo ? (
                             <img src={room.currentVideo.thumbnail} className="w-full h-full object-cover" alt="" />
                           ) : (
                             <Music className="size-8 text-zinc-500" />
                           )}
                        </div>
                        <h3 className="font-bold text-lg truncate px-2 w-full">{room.hostName}'s Room</h3>
                        <p className="text-xs text-primary font-medium mt-1">{room.membersCount} listening</p>
                        {room.currentVideo && (
                          <p className="text-[10px] text-zinc-400 mt-2 truncate w-full px-4">
                            Now playing: {room.currentVideo.title}
                          </p>
                        )}
                        <button 
                          onClick={() => joinRoom(room.roomId)}
                          className="mt-4 w-full btn bg-primary/20 text-primary hover:bg-primary hover:text-black justify-center py-2 transition-colors shadow-lg"
                        >
                          <Play size={16} className="mr-2" /> Join Party
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MusicPage;
