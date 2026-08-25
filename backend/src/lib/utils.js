import jwt from "jsonwebtoken";

export const generateToken = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.cookie("jwt", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000, // MS
    httpOnly: true, // prevent XSS attacks cross-site scripting attacks
    sameSite: "none", // Required for cross-site cookies
    secure: true, // Required for sameSite: "none"
  });

  return token;
};

export const isGroupMember = (group, userId) => {
  if (!group || !group.members || !userId) return false;
  const targetId = userId.toString();
  return group.members.some((member) => {
    const memberId = member && member._id ? member._id.toString() : member.toString();
    return memberId === targetId;
  });
};

