import type { Request, Response, NextFunction } from 'express';

declare global {
    namespace Express {
        interface Request {
            user?: any; // Replace 'any' with a meaningful User payload interface later
        }
    }
}
import { validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../data-source.js';
import { User, UserRole } from '../entities/User.js';

const userRepository = AppDataSource.getRepository(User);

// Helper to sign JWT
const generateToken = (user: User) => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('CRITICAL: JWT_SECRET environment variable is not set!');
    }
    return jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        secret,
        { expiresIn: '7d' }
    );
};

export const register = async (req: Request, res: Response): Promise<void> => {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }

    const { email: rawEmail, password, name, role, addressLine1, addressLine2, city, state, zipCode, localityId, dateOfBirth, schoolName, grade, university, majors, securityQuestion, securityAnswer } = req.body;
    const email = rawEmail?.toLowerCase();

    try {
        // Check if user exists
        const existingUser = await userRepository.findOneBy({ email });
        if (existingUser) {
            res.status(400).json({ message: 'User already exists' });
            return;
        }

        // Role validation (optional, can relay on enum check by database but nice to have)
        const userRole = Object.values(UserRole).includes(role) ? role : UserRole.STUDENT;

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        let securityAnswerHash;
        if (securityAnswer) {
            securityAnswerHash = await bcrypt.hash(securityAnswer.trim().toLowerCase(), salt);
        }

        // Create user
        const userData: any = {
            email,
            passwordHash,
            name,
            role: userRole,
            addressLine1,
            addressLine2,
            city,
            state,
            zipCode,
            securityQuestion,
            securityAnswerHash,
        };

        if (localityId) {
            userData.locality = { id: localityId };
        }

        if (dateOfBirth) {
            const dob = new Date(dateOfBirth);
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Reset time to start of day for fair comparison

            if (dob > today) {
                res.status(400).json({ message: 'Date of birth cannot be in the future' });
                return;
            }
            userData.dateOfBirth = dob;
        }

        if (schoolName) userData.schoolName = schoolName;
        if (grade) userData.grade = grade;
        if (university) userData.university = university;
        if (majors) userData.majors = majors;

        const user = userRepository.create(userData as any) as unknown as User;

        await userRepository.save(user);

        // Generate token
        const token = generateToken(user);

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const login = async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }

    const { email: rawEmail, password } = req.body;
    const email = rawEmail?.toLowerCase();

    try {
        console.log(`Login attempt for ${email}`);
        const user = await userRepository.findOne({
            where: { email },
            relations: ['locality']
        });
        console.log(`User found: ${user ? 'yes' : 'no'}`);
        if (!user) {
            res.status(400).json({ message: 'Invalid credentials' });
            return;
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        console.log(`Password match: ${isMatch}`);
        if (!isMatch) {
            res.status(400).json({ message: 'Invalid credentials' });
            return;
        }

        const token = generateToken(user);

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                credits: user.credits,
                isLocalAdminRequested: user.isLocalAdminRequested,
                locality: user.locality,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const initForgotPassword = async (req: Request, res: Response): Promise<void> => {
    const { email: rawEmail } = req.body;
    const email = rawEmail?.toLowerCase();

    if (!email) {
        res.status(400).json({ message: 'Email is required' });
        return;
    }

    try {
        const user = await userRepository.findOneBy({ email });
        if (!user) {
            // Generic message so we don't leak who is registered
            res.status(400).json({ message: 'If an account exists, a security question is required to reset it.', noQuestionSet: true });
            return;
        }

        if (!user.securityQuestion || !user.securityAnswerHash) {
            res.status(400).json({ message: 'No security question set for this account. Please contact an admin.', noQuestionSet: true });
            return;
        }

        res.json({ securityQuestion: user.securityQuestion });
    } catch (error) {
        console.error('initForgotPassword error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const verifySecurityAnswer = async (req: Request, res: Response): Promise<void> => {
    const { email: rawEmail, answer } = req.body;
    const email = rawEmail?.toLowerCase();

    if (!email || !answer) {
        res.status(400).json({ message: 'Email and answer are required' });
        return;
    }

    try {
        const user = await userRepository.findOneBy({ email });
        if (!user || !user.securityAnswerHash) {
            res.status(400).json({ message: 'Invalid request' });
            return;
        }

        const isMatch = await bcrypt.compare(answer.trim().toLowerCase(), user.securityAnswerHash);
        if (!isMatch) {
            res.status(400).json({ message: 'Incorrect answer' });
            return;
        }

        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error('CRITICAL: JWT_SECRET environment variable is not set!');
        }

        // Generate a reset token valid for 15 minutes
        const resetToken = jwt.sign(
            { id: user.id, email: user.email, purpose: 'password_reset' },
            secret,
            { expiresIn: '15m' }
        );

        res.json({ message: 'Answer verified', resetToken });
    } catch (error) {
        console.error('verifySecurityAnswer error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }

    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
        res.status(400).json({ message: 'Token and new password are required' });
        return;
    }

    try {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error('CRITICAL: JWT_SECRET environment variable is not set!');
        }

        const decoded: any = jwt.verify(token, secret);

        if (decoded.purpose !== 'password_reset') {
            res.status(400).json({ message: 'Invalid token purpose' });
            return;
        }

        const user = await userRepository.findOneBy({ id: decoded.id });
        if (!user) {
            res.status(400).json({ message: 'User not found' });
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(newPassword, salt);

        user.passwordHash = passwordHash;
        await userRepository.save(user);

        res.json({ message: 'Password reset successful' });
    } catch (error) {
        console.error('resetPassword error:', error);
        res.status(400).json({ message: 'Invalid or expired token' });
    }
};
