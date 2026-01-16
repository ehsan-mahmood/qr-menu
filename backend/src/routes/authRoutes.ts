import { Router } from 'express';
import { login, signup, verify } from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/login', authLimiter, login);
router.post('/signup', authLimiter, signup);
router.get('/verify', authenticate, verify);

export default router;

