// Cloudinary Service with JS SDK
// /services/cloudinary.ts

import { Cloudinary } from "@cloudinary/url-gen";
// import { upload } from 'cloudinary-core';

// Initialize Cloudinary instance
const cloudinary = new Cloudinary({
  cloud: {
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!,
  },
});

export interface CloudinaryUploadResult {
  success: boolean;
  url?: string;
  publicId?: string;
  error?: string;
}

// Upload profile picture to Cloudinary
export const uploadProfilePicture = async (
  file: File,
  userAddress: string
): Promise<CloudinaryUploadResult> => {
  try {
    console.log("📤 Starting Cloudinary upload for user:", userAddress);

    // Create form data
    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "upload_preset",
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
    );

    // Generate unique public ID
    const publicId = `creators/${userAddress}/profile_${Date.now()}`;
    formData.append("public_id", publicId);

    // Upload to Cloudinary
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(
        `Upload failed: ${response.status} ${response.statusText}`
      );
    }

    const result = await response.json();

    console.log("✅ Cloudinary upload successful:", result.secure_url);

    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error: any) {
    console.error("❌ Cloudinary upload failed:", error);
    return {
      success: false,
      error: error.message || "Upload failed",
    };
  }
};

// Delete image from Cloudinary (optional cleanup)
export const deleteProfilePicture = async (
  publicId: string
): Promise<boolean> => {
  try {
    // This requires server-side implementation for security
    // You would need an API route that uses Cloudinary admin API
    console.log("🗑️ Would delete image:", publicId);
    return true;
  } catch (error) {
    console.error("❌ Failed to delete image:", error);
    return false;
  }
};

// Generate optimized URL for display
export const getOptimizedImageUrl = (
  publicId: string,
  options?: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string;
  }
) => {
  const {
    width = 400,
    height = 400,
    crop = "fill",
    quality = "auto",
  } = options || {};

  return cloudinary.image(publicId).quality(quality).format("auto").toURL();
};

export default cloudinary;
