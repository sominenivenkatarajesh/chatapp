import User from "../models/user.model.js";

export const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    const myId = req.user._id;

    const users = await User.find({
      $and: [
        { _id: { $ne: myId } },
        {
          $or: [
            { fullName: { $regex: query, $options: "i" } },
            { email: { $regex: query, $options: "i" } },
          ],
        },
      ],
    }).select("-password");

    res.status(200).json(users);
  } catch (error) {
    console.error("Error in searchUsers:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const sendFriendRequest = async (req, res) => {
  try {
    const { userId } = req.params;
    const myId = req.user._id;

    const targetUser = await User.findById(userId);
    if (!targetUser) return res.status(404).json({ message: "User not found" });

    const alreadySent = targetUser.friendRequests.some(
      (req) => req.from.toString() === myId.toString()
    );
    if (alreadySent) return res.status(400).json({ message: "Request already sent" });

    targetUser.friendRequests.push({ from: myId });
    await targetUser.save();

    // Notify target user via socket
    const { getReceiverSocketId, io } = await import("../lib/socket.js");
    const receiverSocketId = getReceiverSocketId(userId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newFriendRequest", { 
        from: { _id: req.user._id, fullName: req.user.fullName, profilePic: req.user.profilePic } 
      });
    }

    res.status(200).json({ message: "Friend request sent" });
  } catch (error) {
    console.error("Error in sendFriendRequest:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const handleFriendRequest = async (req, res) => {
  try {
    const { requestId, action } = req.body; // action: 'accepted' or 'rejected'
    const myId = req.user._id;

    const me = await User.findById(myId);
    const requestIndex = me.friendRequests.findIndex(
      (req) => req._id.toString() === requestId
    );

    if (requestIndex === -1) return res.status(404).json({ message: "Request not found" });

    const request = me.friendRequests[requestIndex];
    
    if (action === "accepted") {
      // Check if already friends
      if (!me.friends.includes(request.from)) {
        me.friends.push(request.from);
      }
      
      const sender = await User.findById(request.from);
      if (sender && !sender.friends.includes(myId)) {
        sender.friends.push(myId);
        await sender.save();
      }
    }

    // Remove the request
    me.friendRequests.splice(requestIndex, 1);
    await me.save();

    // Notify sender via socket
    const { getReceiverSocketId, io } = await import("../lib/socket.js");
    const senderSocketId = getReceiverSocketId(request.from);
    if (senderSocketId) {
      if (action === "accepted") {
        io.to(senderSocketId).emit("friendRequestAccepted", { 
          friendId: myId,
          fullName: me.fullName 
        });
      } else if (action === "rejected") {
        io.to(senderSocketId).emit("friendRequestRejected", { 
          friendId: myId,
          fullName: me.fullName 
        });
      }
    }

    res.status(200).json({ message: `Friend request ${action}` });
  } catch (error) {
    console.error("Error in handleFriendRequest:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const removeFriend = async (req, res) => {
  try {
    const { userId } = req.params;
    const myId = req.user._id;

    await User.findByIdAndUpdate(myId, { $pull: { friends: userId } });
    await User.findByIdAndUpdate(userId, { $pull: { friends: myId } });

    res.status(200).json({ message: "Friend removed successfully" });
  } catch (error) {
    console.error("Error in removeFriend:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
