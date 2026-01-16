import { Router } from 'express';
import multer from 'multer';
import { completeOnboarding, uploadMenuImage } from '../controllers/onboardingController';
import { getCustomDomain, updateCustomDomain, getMerchantByMenuId } from '../controllers/merchantController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, JPG, PNG, and WebP images are allowed'));
    }
  },
});

// Protected routes
router.post('/onboarding', authenticate, completeOnboarding);
router.post('/menu-images', authenticate, upload.single('image'), uploadMenuImage);

// Merchant settings routes
router.get('/custom-domain', authenticate, getCustomDomain);
router.put('/custom-domain', authenticate, updateCustomDomain);
router.get('/menu/:menuId/merchant', getMerchantByMenuId); // Public route for redirect logic

export default router;

