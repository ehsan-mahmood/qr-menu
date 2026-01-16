import { Router } from 'express';
import {
  createQrCode,
  getQrCodeData,
  getMerchantQrCodes,
  updateQrCodeStatus,
  registerPrePrintedQrCode,
} from '../controllers/qrController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Public route
router.get('/codes/:qrToken', getQrCodeData);

// Protected routes
router.post('/codes', authenticate, createQrCode);
router.post('/codes/register', authenticate, registerPrePrintedQrCode);
router.patch('/codes/:qrId/status', authenticate, updateQrCodeStatus);
router.get('/merchant/:merchantId', authenticate, getMerchantQrCodes);

export default router;

