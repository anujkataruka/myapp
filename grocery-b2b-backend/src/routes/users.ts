import { Router } from 'express';
import { updateProfile, getVendors, getVendor } from '../controllers/userController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/vendors', getVendors);
router.get('/vendors/:id', getVendor);

// Protected routes
router.use(authenticate);
router.put('/profile', updateProfile);

export default router;