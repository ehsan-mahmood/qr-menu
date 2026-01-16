import { Router } from 'express';
import {
  createPayment,
  getPaymentById,
  getPaymentsByOrderId,
  updatePaymentStatus,
} from '../controllers/paymentController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Public route - payment can be created without auth (for customer-facing flow)
router.post('/', createPayment);

// Protected routes
router.get('/:paymentId', authenticate, getPaymentById);
router.get('/order/:orderId', authenticate, getPaymentsByOrderId);
router.patch('/:paymentId', authenticate, updatePaymentStatus);

export default router;
