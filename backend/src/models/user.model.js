import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
    },
    gender: {
      type: String,
      required: true,
      enum: ["male", "female", "other", "prefer_not_to_say"],
    },
    bio: {
      type: String,
      default: "",
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    resetOtp: {
      type: String,
    },
    resetOtpExpire: {
      type: Date,
    },
    profilePic: {
      type: String,
      default: "",
    },
    bannerPic: {
      type: String,
      default: "",
    },
    friends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    pinnedChats: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    archivedChats: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    friendRequests: [
      {
        from: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        status: {
          type: String,
          enum: ["pending", "accepted", "rejected"],
          default: "pending",
        },
      },
    ],
    chatSettings: {
      type: Map,
      of: {
        themeColor: { type: String, default: "" },
        backgroundImage: { type: String, default: "" }
      },
      default: {}
    },
    favoriteSongs: [
      {
        videoId: String,
        title: String,
        thumbnail: String,
        author: String,
        duration: String,
      }
    ],
    playlists: [
      {
        name: { type: String, required: true },
        songs: [
          {
            videoId: String,
            title: String,
            thumbnail: String,
            author: String,
            duration: String,
          }
        ]
      }
    ]
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
