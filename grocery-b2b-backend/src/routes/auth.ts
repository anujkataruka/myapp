import { Router } from 'express';
import { register, login, refreshToken, logout, getProfile } from '../controllers/authController';
import { validateRequest, schemas } from '../utils/validation';
import { authenticate } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/register', validateRequest(schemas.register), register);
router.post('/login', validateRequest(schemas.login), login);
router.post('/refresh', refreshToken);
router.post('/logout', logout);

// Protected routes
router.get('/profile', authenticate, getProfile);

export default router;