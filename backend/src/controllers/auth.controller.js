import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";
import { sendPasswordResetEmail } from "../lib/email.js";

export const signup = async (req, res) => {
  const { username, phoneNumber, email, gender, password } = req.body;
  try {
    if (!username || !phoneNumber || !email || !gender || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) return res.status(400).json({ message: "Email already exists" });

    const existingUsername = await User.findOne({ username });
    if (existingUsername) return res.status(400).json({ message: "Username already exists" });

    const existingPhone = await User.findOne({ phoneNumber });
    if (existingPhone) return res.status(400).json({ message: "Phone number already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      phoneNumber,
      email,
      gender,
      password: hashedPassword,
    });

    if (newUser) {
      // generate jwt token here
      const token = generateToken(newUser._id, res);
      await newUser.save();

      res.status(201).json({
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        profilePic: newUser.profilePic,
        token,
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.log("Error in signup controller", error.message);
    res.status(500).json({ message: "Internal Server Error: " + error.message });
  }
};

export const login = async (req, res) => {
  const { username, password } = req.body;
  try {
    // Treat the incoming 'username' field as a generic identifier
    const identifier = username.trim();
    
    // Escape special regex characters in the identifier
    const escapedIdentifier = identifier.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    
    const user = await User.findOne({
      $or: [
        { username: { $regex: `^${escapedIdentifier}$`, $options: 'i' } },
        { email: { $regex: `^${escapedIdentifier}$`, $options: 'i' } },
        { phoneNumber: identifier }
      ]
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials (user not found)" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user._id, res);

    res.status(200).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      profilePic: user.profilePic,
      token,
    });
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ message: "Internal Server Error: " + error.message });
  }
};

export const forgotPassword = async (req, res) => {
  const { identifier } = req.body;
  try {
    if (!identifier) {
      return res.status(400).json({ message: "Username, email or phone number is required" });
    }
    
    const user = await User.findOne({
      $or: [
        { username: identifier },
        { email: identifier },
        { phoneNumber: identifier }
      ]
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetOtp = otp;
    user.resetOtpExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    await sendPasswordResetEmail(user.email, otp);

    res.status(200).json({ message: "OTP sent to your email!" });
  } catch (error) {
    console.log("Error in forgotPassword controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


export const resetPassword = async (req, res) => {
  const { identifier, otp, newPassword } = req.body;
  try {
    if (!identifier || !otp || !newPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ 
      $or: [
        { username: identifier },
        { email: identifier },
        { phoneNumber: identifier }
      ],
      resetOtp: otp,
      resetOtpExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    user.resetOtp = undefined;
    user.resetOtpExpire = undefined;
    await user.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.log("Error in resetPassword controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { 
      maxAge: 0,
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { 
      profilePic, 
      bannerPic,
      username, 
      email, 
      phoneNumber, 
      gender, 
      bio, 
      currentPassword, 
      newPassword 
    } = req.body;

    const updateData = {};

    if (profilePic && profilePic !== req.user.profilePic) {
      const uploadResponse = await cloudinary.uploader.upload(profilePic);
      updateData.profilePic = uploadResponse.secure_url;
    }

    if (bannerPic && bannerPic !== req.user.bannerPic) {
      const uploadResponse = await cloudinary.uploader.upload(bannerPic);
      updateData.bannerPic = uploadResponse.secure_url;
    }

    if (email && email !== req.user.email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) return res.status(400).json({ message: "Email already exists" });
      updateData.email = email;
    }
    
    if (username && username !== req.user.username) {
      const existingUsername = await User.findOne({ username });
      if (existingUsername) return res.status(400).json({ message: "Username already exists" });
      updateData.username = username;
    }
    
    if (phoneNumber && phoneNumber !== req.user.phoneNumber) {
      const existingPhone = await User.findOne({ phoneNumber });
      if (existingPhone) return res.status(400).json({ message: "Phone number already exists" });
      updateData.phoneNumber = phoneNumber;
    }
    
    if (gender) updateData.gender = gender;
    if (bio !== undefined) updateData.bio = bio;

    if (currentPassword && newPassword) {
      const user = await User.findById(userId);
      const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordCorrect) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ message: "New password must be at least 6 characters" });
      }
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(newPassword, salt);
    } else if (newPassword || currentPassword) {
      return res.status(400).json({ message: "Both current and new password are required to change password" });
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    console.log("error in update profile:", error);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};

import Message from "../models/message.model.js";

export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id;

    // Delete all messages where user is sender or receiver
    await Message.deleteMany({
      $or: [{ senderId: userId }, { receiverId: userId }],
    });

    // Delete user
    await User.findByIdAndDelete(userId);

    // Clear cookie
    res.cookie("jwt", "", { 
      maxAge: 0,
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });

    res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    console.log("Error in deleteAccount controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in checkAuth controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

