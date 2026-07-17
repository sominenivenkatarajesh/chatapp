import User from "../models/user.model.js";
import Message from "../models/message.model.js";

import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import { sendOfflineEmailNotification } from "../lib/email.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const user = await User.findById(loggedInUserId).populate("friends", "-password");

    const usersWithUnreadCounts = await Promise.all(
      user.friends.map(async (friend) => {
        const unreadCount = await Message.countDocuments({
          senderId: friend._id,
          receiverId: loggedInUserId,
          isSeen: false,
        const latestMessage = await Message.findOne({
          $or: [
            { senderId: loggedInUserId, receiverId: friend._id },
            { senderId: friend._id, receiverId: loggedInUserId },
          ],
        }).sort({ createdAt: -1 });

        return { 
          ...friend.toObject(), 
          unreadCount,
          lastMessageTime: latestMessage ? latestMessage.createdAt : new Date(0),
          isPinned: user.pinnedChats.includes(friend._id),
          isArchived: user.archivedChats.includes(friend._id)
        };
      })
    );

    // Sort users: Pinned chats first, then sort by recent message
    usersWithUnreadCounts.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.lastMessageTime) - new Date(a.lastMessageTime);
    });

    res.status(200).json(usersWithUnreadCounts);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
      deletedBy: { $ne: myId }
    }).populate("replyTo", "text image fileUrl isDeleted");

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image, file, fileName, replyTo } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      // Upload base64 image to cloudinary
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    let fileUrl;
    if (file) {
      const uploadResponse = await cloudinary.uploader.upload(file, { resource_type: "auto" });
      fileUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
      fileUrl,
      fileName,
      replyTo: replyTo || null,
    });

    await newMessage.save();
    
    // Populate replyTo before emitting so client can render it
    if (newMessage.replyTo) {
      await newMessage.populate("replyTo", "text image fileUrl isDeleted");
    }

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    } else {
      // Receiver is offline. Send an email notification.
      const receiver = await User.findById(receiverId);
      if (receiver && receiver.email) {
        sendOfflineEmailNotification(req.user.fullName, receiver.email, text);
      }
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const markMessagesAsSeen = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    await Message.updateMany(
      { senderId: userToChatId, receiverId: myId, isSeen: false },
      { $set: { isSeen: true } }
    );

    const senderSocketId = getReceiverSocketId(userToChatId);
    if (senderSocketId) {
      io.to(senderSocketId).emit("messagesSeen", { seenBy: myId });
    }

    res.status(200).json({ message: "Messages marked as seen" });
  } catch (error) {
    console.log("Error in markMessagesAsSeen controller: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteConversation = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    await Message.updateMany(
      {
        $or: [
          { senderId: myId, receiverId: userToChatId },
          { senderId: userToChatId, receiverId: myId },
        ]
      },
      { $addToSet: { deletedBy: myId } }
    );

    res.status(200).json({ message: "Conversation deleted successfully" });
  } catch (error) {
    console.log("Error in deleteConversation controller: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const message = await Message.findById(id);

    if (!message) return res.status(404).json({ message: "Message not found" });
    if (message.senderId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this message" });
    }

    message.isDeleted = true;
    message.text = "";
    message.image = "";
    message.fileUrl = "";
    message.fileName = "";
    await message.save();

    const receiverSocketId = getReceiverSocketId(message.receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("messageDeleted", { messageId: id });
    }

    res.status(200).json({ message: "Message deleted for everyone" });
  } catch (error) {
    console.log("Error in deleteMessage controller: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const editMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const message = await Message.findById(id);

    if (!message) return res.status(404).json({ message: "Message not found" });
    if (message.senderId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to edit this message" });
    }
    if (message.isDeleted) return res.status(400).json({ message: "Cannot edit deleted message" });

    message.text = text;
    message.isEdited = true;
    await message.save();

    const receiverSocketId = getReceiverSocketId(message.receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("messageEdited", { messageId: id, text });
    }

    res.status(200).json(message);
  } catch (error) {
    console.log("Error in editMessage controller: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const reactToMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { emoji } = req.body;
    const userId = req.user._id;

    const message = await Message.findById(id);
    if (!message) return res.status(404).json({ message: "Message not found" });

    // Check if user already reacted with the same emoji, if so remove it
    const existingReactionIndex = message.reactions.findIndex(
      (r) => r.userId.toString() === userId.toString() && r.emoji === emoji
    );

    if (existingReactionIndex > -1) {
      message.reactions.splice(existingReactionIndex, 1);
    } else {
      // Otherwise add/replace user's reaction
      // Optionally restrict to 1 reaction per user:
      // message.reactions = message.reactions.filter(r => r.userId.toString() !== userId.toString());
      message.reactions.push({ userId, emoji });
    }

    await message.save();

    // Determine who to notify
    const notifyId = message.senderId.toString() === userId.toString() 
      ? message.receiverId 
      : message.senderId;
      
    const receiverSocketId = getReceiverSocketId(notifyId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("messageReacted", { messageId: id, reactions: message.reactions });
    }

    res.status(200).json(message.reactions);
  } catch (error) {
    console.log("Error in reactToMessage controller: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const togglePinChat = async (req, res) => {
  try {
    const { id: userToPinId } = req.params;
    const user = await User.findById(req.user._id);

    if (user.pinnedChats.includes(userToPinId)) {
      user.pinnedChats = user.pinnedChats.filter(id => id.toString() !== userToPinId);
    } else {
      user.pinnedChats.push(userToPinId);
    }
    await user.save();
    res.status(200).json({ pinnedChats: user.pinnedChats });
  } catch (error) {
    console.log("Error in togglePinChat controller: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const toggleArchiveChat = async (req, res) => {
  try {
    const { id: userToArchiveId } = req.params;
    const user = await User.findById(req.user._id);

    if (user.archivedChats.includes(userToArchiveId)) {
      user.archivedChats = user.archivedChats.filter(id => id.toString() !== userToArchiveId);
    } else {
      user.archivedChats.push(userToArchiveId);
    }
    await user.save();
    res.status(200).json({ archivedChats: user.archivedChats });
  } catch (error) {
    console.log("Error in toggleArchiveChat controller: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

