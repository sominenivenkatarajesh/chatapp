import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { handleFriendRequest, searchUsers, sendFriendRequest, removeFriend, getMutualFriends, updateChatSettings, cancelFriendRequest } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/search", protectRoute, searchUsers);
router.post("/request/:userId", protectRoute, sendFriendRequest);
router.post("/request-handle", protectRoute, handleFriendRequest);
router.delete("/request/cancel/:userId", protectRoute, cancelFriendRequest);
router.delete("/remove/:userId", protectRoute, removeFriend);
router.get("/mutual-friends/:userId", protectRoute, getMutualFriends);
router.post("/chat-settings/:friendId", protectRoute, updateChatSettings);

export default router;
