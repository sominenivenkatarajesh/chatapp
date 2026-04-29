import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { handleFriendRequest, searchUsers, sendFriendRequest, removeFriend } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/search", protectRoute, searchUsers);
router.post("/request/:userId", protectRoute, sendFriendRequest);
router.post("/request-handle", protectRoute, handleFriendRequest);
router.delete("/remove/:userId", protectRoute, removeFriend);

export default router;
