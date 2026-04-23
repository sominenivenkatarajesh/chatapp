import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { handleFriendRequest, searchUsers, sendFriendRequest } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/search", protectRoute, searchUsers);
router.post("/request/:userId", protectRoute, sendFriendRequest);
router.post("/request-handle", protectRoute, handleFriendRequest);

export default router;
