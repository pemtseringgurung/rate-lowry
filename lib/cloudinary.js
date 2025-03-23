import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export default cloudinary;

export const uploadImage = async (imagePath) => {
  try {
    // Upload the image with fixed settings for better display
    const result = await cloudinary.uploader.upload(imagePath, {
      folder: "rate-lowry",
      format: "jpg",
      quality: 90,
      width: 800,
      height: 600,
      crop: "limit",
      background: "white",
    });
    
    // Return the public_id and secure_url
    return {
      public_id: result.public_id,
      secure_url: result.secure_url
    };
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw new Error('Failed to upload image');
  }
}; 