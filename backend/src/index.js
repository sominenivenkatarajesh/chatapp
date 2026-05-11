import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import cors from "cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

import { connectDB } from "./lib/db.js";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import userRoutes from "./routes/user.route.js";
import { app, server } from "./lib/socket.js";

const PORT = process.env.PORT || 5001;

app.set("trust proxy", 1);

app.use(cors({
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
  credentials: true
}));

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);

server.listen(PORT, () => {
  console.log("Server is running on port: " + PORT);
  connectDB();
});
