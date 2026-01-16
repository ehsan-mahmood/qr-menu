import { Router } from 'express';
import authRoutes from './authRoutes';
import menuRoutes from './menuRoutes';
import orderRoutes from './orderRoutes';
import qrRoutes from './qrRoutes';
import analyticsRoutes from './analyticsRoutes';
import ocrRoutes from './ocrRoutes';
import onboardingRoutes from './onboardingRoutes';
import paymentRoutes from './paymentRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/menu', menuRoutes);
router.use('/orders', orderRoutes);
router.use('/qr', qrRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/ocr', ocrRoutes);
router.use('/merchants', onboardingRoutes);
router.use('/payments', paymentRoutes);

export default router;

