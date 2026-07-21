import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import User from "../models/user.model.js";

const router = express.Router();

function parseDuration(pt) {
  const match = pt.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return "0:00";
  const h = match[1] ? parseInt(match[1]) : 0;
  const m = match[2] ? parseInt(match[2]) : 0;
  const s = match[3] ? parseInt(match[3]) : 0;
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

router.get("/search", protectRoute, async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }

    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "YouTube API key is missing" });
    }

    // 1. Search for videos
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=10&key=${apiKey}`;
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();

    if (searchData.error) {
      console.error("YouTube API Error:", searchData.error);
      return res.status(500).json({ error: "YouTube API error" });
    }

    const videoIds = searchData.items.map(item => item.id.videoId).join(',');
    
    if (!videoIds) {
      return res.status(200).json([]);
    }

    // 2. Get video details (for duration)
    const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoIds}&key=${apiKey}`;
    const detailsResponse = await fetch(detailsUrl);
    const detailsData = await detailsResponse.json();

    // 3. Map details by ID for easy lookup
    const detailsMap = {};
    if (detailsData.items) {
      detailsData.items.forEach(item => {
        detailsMap[item.id] = parseDuration(item.contentDetails.duration);
      });
    }

    // 4. Format the final response to match the existing frontend expectations
    const videos = searchData.items.map((item) => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
      author: item.snippet.channelTitle,
      duration: detailsMap[item.id.videoId] || "0:00"
    }));

    res.status(200).json(videos);
  } catch (error) {
    console.error("Error in music search controller:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET /favorites
router.get("/favorites", protectRoute, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json(user.favoriteSongs || []);
  } catch (error) {
    console.error("Error fetching favorites:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// POST /favorites
router.post("/favorites", protectRoute, async (req, res) => {
  try {
    const { video } = req.body;
    const user = await User.findById(req.user._id);
    
    const existingIndex = user.favoriteSongs.findIndex(s => s.videoId === video.videoId);
    if (existingIndex >= 0) {
      // Remove if already favorited
      user.favoriteSongs.splice(existingIndex, 1);
    } else {
      // Add to favorites
      user.favoriteSongs.push(video);
    }
    
    await user.save();
    res.status(200).json(user.favoriteSongs);
  } catch (error) {
    console.error("Error updating favorites:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET /playlists
router.get("/playlists", protectRoute, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json(user.playlists || []);
  } catch (error) {
    console.error("Error fetching playlists:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// POST /playlists
router.post("/playlists", protectRoute, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Playlist name is required" });

    const user = await User.findById(req.user._id);
    user.playlists.push({ name, songs: [] });
    await user.save();
    
    res.status(201).json(user.playlists);
  } catch (error) {
    console.error("Error creating playlist:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// POST /playlists/:playlistId/songs
router.post("/playlists/:playlistId/songs", protectRoute, async (req, res) => {
  try {
    const { playlistId } = req.params;
    const { video } = req.body;
    const user = await User.findById(req.user._id);
    
    const playlist = user.playlists.id(playlistId);
    if (!playlist) return res.status(404).json({ error: "Playlist not found" });

    if (!playlist.songs.find(s => s.videoId === video.videoId)) {
      playlist.songs.push(video);
      await user.save();
    }
    
    res.status(200).json(user.playlists);
  } catch (error) {
    console.error("Error adding to playlist:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// DELETE /playlists/:playlistId/songs/:videoId
router.delete("/playlists/:playlistId/songs/:videoId", protectRoute, async (req, res) => {
  try {
    const { playlistId, videoId } = req.params;
    const user = await User.findById(req.user._id);
    
    const playlist = user.playlists.id(playlistId);
    if (!playlist) return res.status(404).json({ error: "Playlist not found" });

    playlist.songs = playlist.songs.filter(s => s.videoId !== videoId);
    await user.save();
    
    res.status(200).json(user.playlists);
  } catch (error) {
    console.error("Error removing from playlist:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
