import { Router } from 'express';
import { body } from 'express-validator';
import { authenticateUser } from '../middleware/auth.middleware.js';
import { createRequest, getMyRequests, updateRequestStatus, getExchangeHistory, extendRental, getLogisticsRequests } from '../controllers/ExchangeController.js';
const router = Router();
const requestValidation = [
    body('bookId').notEmpty().withMessage('Book ID is required'),
];
router.use(authenticateUser);
router.post('/', requestValidation, createRequest);
router.get('/', getMyRequests);
router.get('/history', getExchangeHistory);
router.put('/:requestId', updateRequestStatus);
router.post('/:requestId/extend', extendRental); // New route for extending rentals
router.get('/logistics', getLogisticsRequests); // Admin onlyer;
export default router;
//# sourceMappingURL=exchange.routes.js.map