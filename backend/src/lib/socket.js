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

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId) userSocketMap[userId] = socket.id;

  // io.emit() is used to send events to all the connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // --- Calling Events ---
  socket.on("callUser", ({ userToCall, signalData, from, name }) => {
    const receiverSocketId = getReceiverSocketId(userToCall);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("incomingCall", { signal: signalData, from, name });
    }
  });

  socket.on("answerCall", (data) => {
    const receiverSocketId = getReceiverSocketId(data.to);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("callAccepted", data.signal);
    }
  });

  socket.on("endCall", async ({ to, accepted }) => {
    const receiverSocketId = getReceiverSocketId(to);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("callEnded");
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
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };
