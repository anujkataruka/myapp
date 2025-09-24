import { Router } from 'express';
import {
  createOrder,
  getOrders,
  getOrder,
  updateOrderStatus,
  cancelOrder
} from '../controllers/orderController';
import { authenticate, authorize } from '../middleware/auth';
import { validateRequest, schemas } from '../utils/validation';

const router = Router();

// All order routes require authentication
router.use(authenticate);

// Customer and vendor routes
router.get('/', getOrders);
router.get('/:id', getOrder);
router.post('/:id/cancel', cancelOrder);

// Customer only routes
router.post('/', authorize('CUSTOMER'), validateRequest(schemas.order), createOrder);

// Vendor only routes
router.put('/:id/status', authorize('VENDOR'), updateOrderStatus);

export default router;