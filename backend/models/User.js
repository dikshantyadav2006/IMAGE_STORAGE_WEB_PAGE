import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String },
    username: { type: String, unique: true, required: true },
    mobile: { type: String, unique: true, required: true }, // edit only by admin
    password: { type: String, required: true },

    // ===================================================>> posts
    //
    totalPosts: { type: Number, default: 0 },
    posts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
    //
    // ====================================================>>
    private: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    showProfilePicture: { type: Boolean, default: false },

    // ====================================================>>
    loginDetails: [
      {
        loginTime: { type: Date, default: Date.now },
        logoutTime: { type: Date, default: null },
        isLoggedIn: { type: Boolean, default: false },
        sessionToken: { type: String, default: null },
        lastloginTime: { type: Date, default: null },
        lastAttemptedLoginTime: { type: Date, default: null },
        loginAttempts: { type: Number, default: 0 },
      },
    ],
    profilePic: {
      type: String,
      default: "https://res.cloudinary.com/dqj0qj0qj/image/upload/v1688000000/placeholder-image.png",
    },
    cloudinaryProfileId: {
      type: String,
      default: null,
    },

    gender: {
      type: String,
      enum: ["male", "female", "other", "not available"], // Add "not available" as a valid option
      default: "not available",
    },
    Email: { type: String, default: null },
    blocked: { type: Boolean, default: false },
    joiningDate: { type: Date, default: Date.now, immutable: true },
    leavingDate: { type: Date, default: null },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt
);

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
