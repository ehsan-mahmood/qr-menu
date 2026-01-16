import { Router } from 'express';
import {
  postEvent,
  getDashboardAnalytics,
  getTopItems,
} from '../controllers/analyticsController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Public route
router.post('/events', postEvent);

// Protected routes
router.get('/dashboard/:merchantId', authenticate, getDashboardAnalytics);
router.get('/top-items/:merchantId', authenticate, getTopItems);

export default router;

