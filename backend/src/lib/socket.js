import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      
      // Allow any vercel.app subdomain that contains 'chatapp' and 'sominenivenkatarajesh'
      const isVercel = origin.includes("chatapp") && origin.includes("vercel.app");
      const isLocal = origin === "http://localhost:5173";
      
      if (isVercel || isLocal) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  },
});

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

// used to store online users
const userSocketMap = {}; // {userId: socketId}
const callRooms = {}; // { roomId: Set<userId> }
const musicRooms = {}; // { roomId: { host: userId, hostName: string, queue: Array, isPlaying: boolean, currentTime: number, currentVideo: Object|null, members: Set<userId> } }

const broadcastMusicRooms = () => {
  const roomsData = Object.entries(musicRooms).map(([roomId, room]) => ({
    roomId,
    host: room.host,
    hostName: room.hostName,
    membersCount: room.members.size,
    currentVideo: room.currentVideo,
  }));
  io.emit("updateMusicRooms", roomsData);
};

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId;
  const username = socket.handshake.query.username; // Need to pass username in frontend connection!

  if (userId) userSocketMap[userId] = socket.id;

  io.emit("getOnlineUsers", Object.keys(userSocketMap));
  broadcastMusicRooms(); // Send current rooms to newly connected user

  // --- Typing Events ---
  socket.on("typing", ({ to }) => {
    const receiverSocketId = getReceiverSocketId(to);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("userTyping", { userId });
    }
  });

  socket.on("stopTyping", ({ to }) => {
    const receiverSocketId = getReceiverSocketId(to);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("userStoppedTyping", { userId });
    }
  });

  // --- Music Events ---
  socket.on("createMusicRoom", ({ name }) => {
    if (!musicRooms[userId]) {
      musicRooms[userId] = {
        host: userId,
        hostName: name || "User",
        queue: [],
        isPlaying: false,
        currentTime: 0,
        currentVideo: null,
        members: new Set([userId])
      };
      broadcastMusicRooms();
    }
  });

  socket.on("joinMusicRoom", ({ roomId }) => {
    if (musicRooms[roomId]) {
      musicRooms[roomId].members.add(userId);
      const sId = getReceiverSocketId(userId);
      if (sId) {
        // Send current state to the joining user
        io.to(sId).emit("musicRoomState", {
          roomId,
          queue: musicRooms[roomId].queue,
          isPlaying: musicRooms[roomId].isPlaying,
          currentTime: musicRooms[roomId].currentTime,
          currentVideo: musicRooms[roomId].currentVideo
        });
      }
      broadcastMusicRooms();
    }
  });

  socket.on("leaveMusicRoom", ({ roomId }) => {
    if (musicRooms[roomId]) {
      musicRooms[roomId].members.delete(userId);
      
      // If host leaves, destroy the room
      if (userId === musicRooms[roomId].host) {
        // Notify others
        Array.from(musicRooms[roomId].members).forEach(memberId => {
          const sId = getReceiverSocketId(memberId);
          if (sId) io.to(sId).emit("musicRoomClosed");
        });
        delete musicRooms[roomId];
      }
      broadcastMusicRooms();
    }
  });

  socket.on("syncMusicState", ({ roomId, isPlaying, currentTime, currentVideo }) => {
    if (musicRooms[roomId]) {
      musicRooms[roomId].isPlaying = isPlaying;
      musicRooms[roomId].currentTime = currentTime;
      if (currentVideo !== undefined) {
        musicRooms[roomId].currentVideo = currentVideo;
      }
      
      // Broadcast state to all members EXCEPT sender
      Array.from(musicRooms[roomId].members).forEach(memberId => {
        if (memberId !== userId) {
          const sId = getReceiverSocketId(memberId);
          if (sId) {
            io.to(sId).emit("musicRoomState", {
              roomId,
              queue: musicRooms[roomId].queue,
              isPlaying,
              currentTime,
              currentVideo: musicRooms[roomId].currentVideo
            });
          }
        }
      });
      broadcastMusicRooms(); // To update the dashboard if current video changed
    }
  });

  socket.on("addSongToQueue", ({ roomId, video }) => {
    if (musicRooms[roomId]) {
      musicRooms[roomId].queue.push(video);
      
      if (!musicRooms[roomId].currentVideo) {
         musicRooms[roomId].currentVideo = musicRooms[roomId].queue.shift();
      }

      Array.from(musicRooms[roomId].members).forEach(memberId => {
        const sId = getReceiverSocketId(memberId);
        if (sId) {
          io.to(sId).emit("musicRoomState", {
            roomId,
            queue: musicRooms[roomId].queue,
            isPlaying: musicRooms[roomId].isPlaying,
            currentTime: musicRooms[roomId].currentTime,
            currentVideo: musicRooms[roomId].currentVideo
          });
        }
      });
      broadcastMusicRooms();
    }
  });

  socket.on("playNextSong", ({ roomId }) => {
     if (musicRooms[roomId]) {
        if (musicRooms[roomId].queue.length > 0) {
           musicRooms[roomId].currentVideo = musicRooms[roomId].queue.shift();
           musicRooms[roomId].currentTime = 0;
           musicRooms[roomId].isPlaying = true;
        } else {
           musicRooms[roomId].currentVideo = null;
           musicRooms[roomId].currentTime = 0;
           musicRooms[roomId].isPlaying = false;
        }

        Array.from(musicRooms[roomId].members).forEach(memberId => {
          const sId = getReceiverSocketId(memberId);
          if (sId) {
            io.to(sId).emit("musicRoomState", {
              roomId,
              queue: musicRooms[roomId].queue,
              isPlaying: musicRooms[roomId].isPlaying,
              currentTime: musicRooms[roomId].currentTime,
              currentVideo: musicRooms[roomId].currentVideo
            });
          }
        });
        broadcastMusicRooms();
     }
  });

  socket.on("inviteToMusicRoom", ({ userToInvite, roomId, from, name }) => {
     const receiverSocketId = getReceiverSocketId(userToInvite);
     if (receiverSocketId) {
       io.to(receiverSocketId).emit("musicRoomInvite", { roomId, from, name });
     }
  });

  // --- Calling Events ---
  socket.on("callUser", ({ userToCall, signalData, from, name }) => {
    // Initiator starts a call. Room ID is initiator's ID.
    const roomId = from;
    if (!callRooms[roomId]) {
      callRooms[roomId] = new Set([from]);
    }
    
    const receiverSocketId = getReceiverSocketId(userToCall);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("incomingCall", { signal: signalData, from, name, roomId, isGroup: false });
    }
  });

  socket.on("answerCall", (data) => {
    // Initial 1-on-1 answer
    const receiverSocketId = getReceiverSocketId(data.to);
    const roomId = data.to; // The host's ID
    if (callRooms[roomId]) {
      callRooms[roomId].add(userId);
    }
    
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("callAccepted", { signal: data.signal, from: userId });
    }
  });

  // Group Call specific events
  socket.on("inviteToRoom", ({ userToInvite, roomId, from, name }) => {
    const receiverSocketId = getReceiverSocketId(userToInvite);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("incomingCall", { signal: null, from, name, roomId, isGroup: true });
    }
  });

  socket.on("joinRoom", ({ roomId }) => {
    if (callRooms[roomId]) {
      // Notify all existing users in the room to initiate a connection with the newcomer
      Array.from(callRooms[roomId]).forEach(existingUserId => {
        if (existingUserId !== userId) {
          const sId = getReceiverSocketId(existingUserId);
          if (sId) {
            io.to(sId).emit("userJoinedMesh", { newUserId: userId });
          }
        }
      });
      // Add the newcomer to the room
      callRooms[roomId].add(userId);
    }
  });

  socket.on("meshSignal", ({ userToSignal, signalData, from }) => {
    const receiverSocketId = getReceiverSocketId(userToSignal);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("meshSignal", { signal: signalData, from });
    }
  });

  socket.on("endCall", async ({ to, roomId, accepted }) => {
    // Leave room logic
    let hostRoomId = roomId;
    if (!hostRoomId) hostRoomId = to; // Fallback for 1-on-1

    if (callRooms[hostRoomId]) {
      callRooms[hostRoomId].delete(userId);
      if (callRooms[hostRoomId].size <= 1) {
        delete callRooms[hostRoomId]; // Cleanup if empty or only 1 person left
      }
    }

    const receiverSocketId = getReceiverSocketId(to);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("callEnded", { from: userId });
    }

    try {
      if (!userId || !to) return;
      const Message = (await import("../models/message.model.js")).default;
      const text = accepted ? "📞 Video Call Ended" : "Missed Video Call 📞";
      const newMessage = new Message({
        senderId: userId,
        receiverId: to,
        text,
      });
      await newMessage.save();

      io.to(socket.id).emit("newMessage", newMessage);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("newMessage", newMessage);
      }
    } catch (error) {
      console.log("Error saving call log:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    // Remove from any call rooms
    for (const [roomId, members] of Object.entries(callRooms)) {
      if (members.has(userId)) {
        members.delete(userId);
        if (members.size <= 1) {
          delete callRooms[roomId];
        }
        // Notify others that user left
        members.forEach(memberId => {
          const sId = getReceiverSocketId(memberId);
          if (sId) io.to(sId).emit("callEnded", { from: userId });
        });
      }
    }

    // Remove from music rooms
    let musicRoomsChanged = false;
    for (const [roomId, room] of Object.entries(musicRooms)) {
      if (room.members.has(userId)) {
        room.members.delete(userId);
        
        // If host disconnects, destroy the room
        if (userId === room.host) {
          Array.from(room.members).forEach(memberId => {
            const sId = getReceiverSocketId(memberId);
            if (sId) io.to(sId).emit("musicRoomClosed");
          });
          delete musicRooms[roomId];
        }
        musicRoomsChanged = true;
      }
    }
    if (musicRoomsChanged) {
      broadcastMusicRooms();
    }

    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };
