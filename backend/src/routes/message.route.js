import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { 
  getMessages, 
  getUsersForSidebar, 
  sendMessage, 
  markMessagesAsSeen,
  deleteConversation,
  deleteMessage,
  editMessage,
  reactToMessage,
  togglePinChat,
  toggleArchiveChat
} from "../controllers/message.controller.js";

const router = express.Router();

router.get("/users", protectRoute, getUsersForSidebar);
router.get("/:id", protectRoute, getMessages);

router.post("/send/:id", protectRoute, sendMessage);
router.post("/mark-seen/:id", protectRoute, markMessagesAsSeen);

router.delete("/conversation/:id", protectRoute, deleteConversation);
router.delete("/:id", protectRoute, deleteMessage);
router.put("/:id/edit", protectRoute, editMessage);
router.post("/:id/react", protectRoute, reactToMessage);

router.post("/pin-chat/:id", protectRoute, togglePinChat);
router.post("/archive-chat/:id", protectRoute, toggleArchiveChat);

export default router;
