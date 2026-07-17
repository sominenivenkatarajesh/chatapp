import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { createGroup, getGroups, addMembers, leaveGroup } from "../controllers/group.controller.js";

const router = express.Router();

router.post("/", protectRoute, createGroup);
router.get("/", protectRoute, getGroups);
router.put("/:id/members", protectRoute, addMembers);
router.post("/:id/leave", protectRoute, leaveGroup);

export default router;
