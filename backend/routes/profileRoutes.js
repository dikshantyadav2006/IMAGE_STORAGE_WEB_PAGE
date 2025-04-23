import express from "express";
import { verifyUser } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";
import User from "../models/User.js";
import { uploadImage, deleteImage } from "../utils/cloudinaryUtils.js";

const router = express.Router();

// Upload/update profile picture
router.post(
  "/upload-profile-pic",
  verifyUser,
  upload.single("profilePic"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Please upload an image" });
      }

      const userId = req.user.id;
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Delete old profile picture from Cloudinary if it exists and is not the default
      if (
        user.profilePic &&
        !user.profilePic.includes("placeholder-image.png") &&
        user.cloudinaryProfileId
      ) {
        await deleteImage(user.cloudinaryProfileId);
      }

      // Upload new profile picture to Cloudinary
      const { url, cloudinaryId } = await uploadImage(req.file.path, "profile-pictures");

      // Update user profile
      user.profilePic = url;
      user.cloudinaryProfileId = cloudinaryId;
      user.showProfilePicture = true;
      await user.save();

      res.json({
        message: "Profile picture updated successfully",
        profilePic: url,
      });
    } catch (error) {
      console.error("Error updating profile picture:", error);
      res.status(500).json({
        message: "Failed to update profile picture",
        error: error.message,
      });
    }
  }
);

// Get user profile
router.get("/:username", async (req, res) => {
  try {
    const { username } = req.params;
    
    const user = await User.findOne({ username })
      .select("-password -loginDetails -__v")
      .lean();
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if profile is private and user is not the owner
    if (user.private && (!req.user || user._id.toString() !== req.user.id)) {
      // Return limited info for private profiles
      return res.json({
        _id: user._id,
        username: user.username,
        profilePic: user.showProfilePicture ? user.profilePic : null,
        private: true,
      });
    }

    res.json(user);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Failed to fetch profile", error: error.message });
  }
});

export default router;
