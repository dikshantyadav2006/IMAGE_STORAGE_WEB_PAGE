import cloudinary from "../config/cloudinary.js";
import fs from "fs";

// Upload image to Cloudinary
export const uploadImage = async (filePath, folder = "posts") => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,
    });
    
    // Delete the file from local storage after upload
    fs.unlinkSync(filePath);
    
    return {
      url: result.secure_url,
      cloudinaryId: result.public_id,
    };
  } catch (error) {
    // Delete the file from local storage if upload fails
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    throw new Error(`Error uploading to Cloudinary: ${error.message}`);
  }
};

// Delete image from Cloudinary
export const deleteImage = async (cloudinaryId) => {
  try {
    await cloudinary.uploader.destroy(cloudinaryId);
    return { success: true };
  } catch (error) {
    throw new Error(`Error deleting from Cloudinary: ${error.message}`);
  }
};
