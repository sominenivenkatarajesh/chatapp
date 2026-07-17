import Group from "../models/group.model.js";
import User from "../models/user.model.js";

export const createGroup = async (req, res) => {
  try {
    const { name, members } = req.body;
    const adminId = req.user._id;

    if (!name || !members || members.length === 0) {
      return res.status(400).json({ message: "Group name and members are required" });
    }

    // Add admin to members if not already there
    if (!members.includes(adminId.toString())) {
      members.push(adminId.toString());
    }

    const newGroup = new Group({
      name,
      adminId,
      members,
    });

    await newGroup.save();

    const populatedGroup = await Group.findById(newGroup._id).populate("members", "-password");

    res.status(201).json(populatedGroup);
  } catch (error) {
    console.error("Error in createGroup controller: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getGroups = async (req, res) => {
  try {
    const userId = req.user._id;

    const groups = await Group.find({ members: userId }).populate("members", "-password");

    res.status(200).json(groups);
  } catch (error) {
    console.error("Error in getGroups controller: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const addMembers = async (req, res) => {
  try {
    const { id } = req.params;
    const { newMembers } = req.body; // array of user IDs
    const userId = req.user._id;

    const group = await Group.findById(id);
    if (!group) return res.status(404).json({ message: "Group not found" });

    if (group.adminId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Only admin can add members" });
    }

    const updatedMembers = [...new Set([...group.members.map(m => m.toString()), ...newMembers])];
    group.members = updatedMembers;
    await group.save();

    const populatedGroup = await Group.findById(group._id).populate("members", "-password");
    res.status(200).json(populatedGroup);
  } catch (error) {
    console.error("Error in addMembers controller: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const leaveGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const group = await Group.findById(id);
    if (!group) return res.status(404).json({ message: "Group not found" });

    group.members = group.members.filter((m) => m.toString() !== userId.toString());

    if (group.members.length === 0) {
      await Group.findByIdAndDelete(id);
      return res.status(200).json({ message: "Group deleted as all members left", groupId: id });
    } else if (group.adminId.toString() === userId.toString()) {
      // Reassign admin
      group.adminId = group.members[0];
    }

    await group.save();

    res.status(200).json({ message: "Left group successfully", groupId: id });
  } catch (error) {
    console.error("Error in leaveGroup controller: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
