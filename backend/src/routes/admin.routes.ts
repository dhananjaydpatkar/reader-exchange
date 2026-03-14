import { Router } from 'express';
import { authenticateUser } from '../middleware/auth.middleware.js';
import {
    requestLocalAdmin,
    approveLocalAdmin,
    getLocalAdminRequests,
    updateExchangeStatus,
    getLocalExchanges,
    getAllExchanges
} from '../controllers/AdminController.js';

const router = Router();

// Routes
router.post('/request-local-admin', authenticateUser, requestLocalAdmin);
router.post('/approve-local-admin', authenticateUser, approveLocalAdmin);
router.get('/requests', authenticateUser, getLocalAdminRequests);

router.get('/local-exchanges', authenticateUser, getLocalExchanges);
router.get('/all-exchanges', authenticateUser, getAllExchanges);
router.put('/exchange/:requestId/status', authenticateUser, updateExchangeStatus);

export default router;
