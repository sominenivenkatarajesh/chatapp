import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import ytSearch from "yt-search";

const router = express.Router();

router.get("/search", protectRoute, async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }

    const searchResults = await ytSearch(query);
    // Return top 10 video results
    const videos = searchResults.videos.slice(0, 10).map((v) => ({
      videoId: v.videoId,
      title: v.title,
      thumbnail: v.thumbnail,
      author: v.author.name,
      duration: v.timestamp
    }));

    res.status(200).json(videos);
  } catch (error) {
    console.error("Error in music search controller:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
