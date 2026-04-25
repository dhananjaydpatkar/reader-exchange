import { Router } from 'express';
import { authenticateUser } from '../middleware/auth.middleware.js';
import { getUserProfile, getMe } from '../controllers/UserController.js';

const router = Router();

router.use(authenticateUser);

router.get('/me', getMe);
router.get('/:id/profile', getUserProfile);

export default router;
