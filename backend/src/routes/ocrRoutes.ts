import { Router } from 'express';
import multer from 'multer';
import { parseMenuImage, getOcrStatus } from '../controllers/ocrController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, JPG, and PNG images are allowed'));
    }
  },
});

// Protected routes
router.post('/parse', authenticate, upload.single('image'), parseMenuImage);
router.get('/status/:ocrId', authenticate, getOcrStatus);

export default router;

