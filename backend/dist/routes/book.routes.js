import { Router } from 'express';
import { body } from 'express-validator';
import { authenticateUser } from '../middleware/auth.middleware.js';
import { addBook, listBooks, getMyBooks, getBook, relistBook } from '../controllers/BookController.js';
const router = Router();
const addBookValidation = [
    body('isbn').notEmpty().withMessage('ISBN is required'),
    body('condition').notEmpty().withMessage('Condition is required'),
];
router.post('/', authenticateUser, addBookValidation, addBook);
router.get('/my-books', authenticateUser, getMyBooks);
router.post('/:id/relist', authenticateUser, relistBook); // Relist sold book
router.get('/:id', authenticateUser, getBook);
router.get('/', authenticateUser, listBooks);
export default router;
//# sourceMappingURL=book.routes.js.map