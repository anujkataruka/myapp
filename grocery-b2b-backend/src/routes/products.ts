import { Router } from 'express';
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getVendorProducts
} from '../controllers/productController';
import { authenticate, authorize } from '../middleware/auth';
import { validateRequest, schemas } from '../utils/validation';

const router = Router();

// Public routes
router.get('/', getProducts);
router.get('/:id', getProduct);

// Vendor routes
router.use(authenticate);
router.get('/vendor/my-products', authorize('VENDOR'), getVendorProducts);
router.post('/', authorize('VENDOR'), validateRequest(schemas.product), createProduct);
router.put('/:id', authorize('VENDOR'), updateProduct);
router.delete('/:id', authorize('VENDOR'), deleteProduct);

export default router;