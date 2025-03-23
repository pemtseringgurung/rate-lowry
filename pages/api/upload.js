import { createRouter } from 'next-connect';
import upload from '../../lib/multer';
import { uploadImage } from '../../lib/cloudinary';
import fs from 'fs';

const router = createRouter();

// Configure multer middleware for single file upload
router.use(upload.single('image'));

// Handle POST request for image upload
router.post(async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Upload file to Cloudinary
    const result = await uploadImage(req.file.path);
    
    // Delete the temporary file
    fs.unlinkSync(req.file.path);
    
    // Return the Cloudinary image URL
    res.status(200).json({
      success: true,
      imageUrl: result.secure_url,
      imagePublicId: result.public_id
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// Catch-all for other HTTP methods
router.all((req, res) => {
  res.status(405).json({ error: `Method '${req.method}' Not Allowed` });
});

export default router.handler({
  onError: (err, req, res) => {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  },
});

// Configure Next.js to handle file uploads
export const config = {
  api: {
    bodyParser: false, // Disable the default body parser
  },
}; 