import { Router } from 'express';
import { getAllLocalities, toggleLocalityLive, createLocality } from '../controllers/LocalityController.js';
// import { protect, admin } from '../middleware/auth.js'; 
const router = Router();
// Public: Get all localities for signup
router.get('/', getAllLocalities);
// Admin: Create new locality (Unprotected for MVP speed/testing, add auth later)
router.post('/', createLocality);
// Admin: Toggle live status (Unprotected for MVP speed/testing, add auth later)
router.patch('/:id/toggle-live', toggleLocalityLive);
export default router;
//# sourceMappingURL=locality.routes.js.map