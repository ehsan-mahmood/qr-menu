import { Router } from 'express';
import {
  createOrder,
  getOrderById,
  updateOrderStatus,
  getAllOrders,
} from '../controllers/orderController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Public route
router.post('/', createOrder);

// Protected routes
router.get('/:orderId', getOrderById);
router.patch('/:orderId', authenticate, updateOrderStatus);
router.get('/', authenticate, getAllOrders);

export default router;

