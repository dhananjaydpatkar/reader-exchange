import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, initForgotPassword, verifySecurityAnswer, resetPassword } from '../controllers/AuthController.js';

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

const resetPasswordValidation = [
    body('token').notEmpty().withMessage('Token is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
];

// Routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/forgot-password/init', initForgotPassword);
router.post('/forgot-password/verify', verifySecurityAnswer);
router.post('/reset-password', resetPasswordValidation, resetPassword);

export default router;
