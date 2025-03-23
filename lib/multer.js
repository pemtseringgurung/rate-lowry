import multer from 'multer';
import { join } from 'path';
import { tmpdir } from 'os';

// Configure multer to store files in the temporary directory
const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, tmpdir());
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, file.fieldname + '-' + uniqueSuffix + getExtension(file.originalname));
    }
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

function getExtension(filename) {
  return filename.substring(filename.lastIndexOf('.'));
}

export default upload; 