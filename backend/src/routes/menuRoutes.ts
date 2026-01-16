import { Router } from 'express';
import {
  getMenuByQrToken,
  getMenuById,
  getMenuBySlug,
  getMenuItems,
  getMenuConfig,
  createOrUpdateMenu,
} from '../controllers/menuController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/qr/:qrToken', getMenuByQrToken);
router.get('/:merchantSlug/:menuName', getMenuBySlug); // Must be before /:menuId to avoid conflicts
router.get('/:menuId', getMenuById);
router.get('/:menuId/items', getMenuItems);
router.get('/:menuId/config', getMenuConfig);

// Protected routes
router.post('/', authenticate, createOrUpdateMenu);

export default router;

