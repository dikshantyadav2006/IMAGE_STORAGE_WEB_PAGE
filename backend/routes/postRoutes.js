import express from "express";
import { verifyUser } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";
import Post from "../models/Post.js";
import User from "../models/User.js";
import { uploadImage, deleteImage } from "../utils/cloudinaryUtils.js";
import fs from "fs";
import path from "path";

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Create a new post with image
router.post(
  "/create",
  verifyUser,
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Please upload an image" });
      }

      const { caption, tags, isPrivate } = req.body;
      const userId = req.user.id;

      // Upload image to Cloudinary
      const { url, cloudinaryId } = await uploadImage(req.file.path);

      // Create new post
      const newPost = new Post({
        user: userId,
        caption,
        imageUrl: url,
        cloudinaryId,
        tags: tags ? tags.split(",").map((tag) => tag.trim()) : [],
        isPrivate: isPrivate === "true",
      });
      console.log("New post created:", newPost);

      // Save post
      await newPost.save();

      // Update user's posts array and totalPosts count
      await User.findByIdAndUpdate(userId, {
        $push: { posts: newPost._id },
        $inc: { totalPosts: 1 },
      });

      // Notify followers if using Socket.io
      if (req.io) {
        req.io.emit("newPost", {
          postId: newPost._id,
          userId,
          imageUrl: url,
        });
      }

      res.status(201).json({
        message: "Post created successfully",
        post: newPost,
      });
    } catch (error) {
      console.error("Error creating post:", error);
      res.status(500).json({ message: "Failed to create post", error: error.message });
    }
  }
);

// Get all public posts (for feed/explore)
router.get("/explore", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const posts = await Post.find({ isPrivate: false })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "username profilePic")
      .lean();

    const totalPosts = await Post.countDocuments({ isPrivate: false });

    res.json({
      posts,
      totalPages: Math.ceil(totalPosts / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ message: "Failed to fetch posts", error: error.message });
  }
});

// Get a single post by ID
router.get("/:id", verifyUser, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("user", "username profilePic")
      .populate("comments.user", "username profilePic")
      .lean();

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if post is private and user is not the owner
    if (post.isPrivate && (!req.user || post.user._id.toString() !== req.user.id)) {
      return res.status(403).json({ message: "This post is private" });
    }

    res.json(post);
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).json({ message: "Failed to fetch post", error: error.message });
  }
});

// Get posts by user ID
router.get("/user/:userId",verifyUser, async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    // Check if requesting user's own posts or public posts
    const isOwnProfile = req.user && req.user.id === userId;

    const query = {
      user: userId,
      ...(isOwnProfile ? {} : { isPrivate: false })
    };

    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "username profilePic")
      .lean();

    const totalPosts = await Post.countDocuments(query);

    res.json({
      posts,
      totalPages: Math.ceil(totalPosts / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error("Error fetching user posts:", error);
    res.status(500).json({ message: "Failed to fetch posts", error: error.message });
  }
});

// Update a post
router.put("/:id", verifyUser, async (req, res) => {
  try {
    const { caption, tags, isPrivate } = req.body;
    const postId = req.params.id;

    // Find post and check ownership
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to update this post" });
    }

    // Update post
    post.caption = caption !== undefined ? caption : post.caption;

    // Handle tags - could be a string or an array
    if (tags !== undefined) {
      if (typeof tags === 'string') {
        post.tags = tags.split(",").map((tag) => tag.trim());
      } else if (Array.isArray(tags)) {
        post.tags = tags;
      }
    }

    // Handle isPrivate - could be a string or a boolean
    if (isPrivate !== undefined) {
      if (typeof isPrivate === 'string') {
        post.isPrivate = isPrivate === "true";
      } else if (typeof isPrivate === 'boolean') {
        post.isPrivate = isPrivate;
      }
    }

    await post.save();

    res.json({
      message: "Post updated successfully",
      post,
    });
  } catch (error) {
    console.error("Error updating post:", error);
    res.status(500).json({ message: "Failed to update post", error: error.message });
  }
});

// Delete a post
router.delete("/:id", verifyUser, async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;

    // Find post and check ownership
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.user.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized to delete this post" });
    }

    // Delete image from Cloudinary
    await deleteImage(post.cloudinaryId);

    // Delete post from database
    await Post.findByIdAndDelete(postId);

    // Update user's posts array and totalPosts count
    await User.findByIdAndUpdate(userId, {
      $pull: { posts: postId },
      $inc: { totalPosts: -1 },
    });

    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ message: "Failed to delete post", error: error.message });
  }
});

// Like/unlike a post
router.post("/:id/like", verifyUser, async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if user already liked the post
    const alreadyLiked = post.likes.includes(userId);

    if (alreadyLiked) {
      // Unlike the post
      post.likes = post.likes.filter(
        (id) => id.toString() !== userId
      );
    } else {
      // Like the post
      post.likes.push(userId);
    }

    await post.save();

    res.json({
      message: alreadyLiked ? "Post unliked" : "Post liked",
      likes: post.likes.length,
      liked: !alreadyLiked,
    });
  } catch (error) {
    console.error("Error liking/unliking post:", error);
    res.status(500).json({ message: "Failed to like/unlike post", error: error.message });
  }
});

// Add a comment to a post
router.post("/:id/comment", verifyUser, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    const postId = req.params.id;
    const userId = req.user.id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const newComment = {
      user: userId,
      text,
      createdAt: new Date(),
    };

    post.comments.push(newComment);
    await post.save();

    // Populate user info for the new comment
    const populatedPost = await Post.findById(postId)
      .populate("comments.user", "username profilePic");

    const addedComment = populatedPost.comments[populatedPost.comments.length - 1];

    res.json({
      message: "Comment added successfully",
      comment: addedComment,
    });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ message: "Failed to add comment", error: error.message });
  }
});

// Delete a comment
router.delete("/:postId/comment/:commentId", verifyUser, async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const userId = req.user.id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Find the comment
    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Check if user is the comment owner or post owner
    if (comment.user.toString() !== userId && post.user.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized to delete this comment" });
    }

    // Remove the comment
    comment.remove();
    await post.save();

    res.json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ message: "Failed to delete comment", error: error.message });
  }
});

// Search posts by tags or caption
router.get("/search", async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const posts = await Post.find({
      isPrivate: false,
      $or: [
        { tags: { $in: [query] } },
        { caption: { $regex: query, $options: "i" } },
      ],
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "username profilePic")
      .lean();

    const totalPosts = await Post.countDocuments({
      isPrivate: false,
      $or: [
        { tags: { $in: [query] } },
        { caption: { $regex: query, $options: "i" } },
      ],
    });

    res.json({
      posts,
      totalPages: Math.ceil(totalPosts / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error("Error searching posts:", error);
    res.status(500).json({ message: "Failed to search posts", error: error.message });
  }
});

export default router;
