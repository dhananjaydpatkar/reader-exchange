import { Router } from 'express';
import { authenticateUser } from '../middleware/auth.middleware.js';
import {
    requestLocalAdmin,
    approveLocalAdmin,
    getLocalAdminRequests,
    updateExchangeStatus,
    getLocalExchanges,
    getAllExchanges,
    getWithdrawalRequests,
    approveWithdrawal,
    rejectWithdrawal
} from '../controllers/AdminController.js';

const router = Router();

// Routes
router.post('/request-local-admin', authenticateUser, requestLocalAdmin);
router.post('/approve-local-admin', authenticateUser, approveLocalAdmin);
router.get('/requests', authenticateUser, getLocalAdminRequests);

router.get('/local-exchanges', authenticateUser, getLocalExchanges);
router.get('/all-exchanges', authenticateUser, getAllExchanges);
router.put('/exchange/:requestId/status', authenticateUser, updateExchangeStatus);

router.get('/withdrawals', authenticateUser, getWithdrawalRequests);
router.post('/withdrawals/:id/approve', authenticateUser, approveWithdrawal);
router.post('/withdrawals/:id/reject', authenticateUser, rejectWithdrawal);

export default router;
