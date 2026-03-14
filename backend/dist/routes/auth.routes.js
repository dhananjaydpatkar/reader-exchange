import { Router } from 'express';
import { body } from 'express-validator';
import { register, login } from '../controllers/AuthController.js';
const router = Router();
// Validation Rules
const registerValidation = [
    body('email').isEmail().withMessage('Please include a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('name').notEmpty().withMessage('Name is required'),
];
const loginValidation = [
    body('email').isEmail().withMessage('Please include a valid email'),
    body('password').exists().withMessage('Password is required'),
];
// Routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
export default router;
//# sourceMappingURL=auth.routes.js.map