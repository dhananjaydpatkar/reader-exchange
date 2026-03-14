import { Router } from 'express';
import { authenticateUser } from '../middleware/auth.middleware.js';
import { getUserProfile } from '../controllers/UserController.js';
const router = Router();
router.use(authenticateUser);
router.get('/:id/profile', getUserProfile);
export default router;
//# sourceMappingURL=user.routes.js.map