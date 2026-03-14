import { validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../data-source.js';
import { User, UserRole } from '../entities/User.js';
const userRepository = AppDataSource.getRepository(User);
// Helper to sign JWT
const generateToken = (user) => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('CRITICAL: JWT_SECRET environment variable is not set!');
    }
    return jwt.sign({ id: user.id, email: user.email, role: user.role }, secret, { expiresIn: '7d' });
};
export const register = async (req, res) => {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    const { email: rawEmail, password, name, role, addressLine1, addressLine2, city, state, zipCode, localityId, dateOfBirth, schoolName, grade, university, majors } = req.body;
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
        // Create user
        const userData = {
            email,
            passwordHash,
            name,
            role: userRole,
            addressLine1,
            addressLine2,
            city,
            state,
            zipCode,
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
        if (schoolName)
            userData.schoolName = schoolName;
        if (grade)
            userData.grade = grade;
        if (university)
            userData.university = university;
        if (majors)
            userData.majors = majors;
        const user = userRepository.create(userData);
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
    }
    catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
export const login = async (req, res) => {
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
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
//# sourceMappingURL=AuthController.js.map