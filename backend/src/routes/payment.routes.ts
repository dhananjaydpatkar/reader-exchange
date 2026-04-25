import { Router } from 'express';
import { createOrder, verifyPayment, requestWithdrawal, getLedger } from '../controllers/PaymentController.js';
import { authenticateUser } from '../middleware/auth.middleware.js';

const router = Router();

// Endpoints requiring user authentication
router.use(authenticateUser);

router.post('/create-order', createOrder);
router.post('/verify-payment', verifyPayment);
router.post('/withdraw', requestWithdrawal);
router.get('/ledger', getLedger);

export default router;
