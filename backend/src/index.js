import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import { connectDB } from "./lib/db.js";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import userRoutes from "./routes/user.route.js";
import { app, server } from "./lib/socket.js";

dotenv.config();

const PORT = process.env.PORT || 5001;

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://chatapp-j2i7cbzyd-sominenivenkatarajeshs-projects.vercel.app"
  ],
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);

server.listen(PORT, () => {
  console.log("Server is running on port: " + PORT);
  connectDB();
});
