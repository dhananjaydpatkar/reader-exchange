import type { Request, Response } from 'express';
import { AppDataSource } from '../data-source.js';
import { User } from '../entities/User.js';
import { Book, BookStatus } from '../entities/Book.js';

const userRepository = AppDataSource.getRepository(User);
const bookRepository = AppDataSource.getRepository(Book);

export const getMe = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await userRepository.findOne({
            where: { id: req.user.id },
            select: ['id', 'name', 'email', 'role', 'credits', 'isLocalAdminRequested'],
            relations: ['locality']
        });

        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        res.json(user);
    } catch (error) {
        console.error('Get Me Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
        const user = await userRepository.findOne({
            where: { id: id as string },
            select: ['id', 'name', 'createdAt', 'credits'] // Select only public info
        });

        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        const books = await bookRepository.find({
            where: {
                owner: { id: id as string },
                status: BookStatus.AVAILABLE
            },
            order: { createdAt: 'DESC' }
        });

        res.json({
            user,
            books
        });
    } catch (error) {
        console.error('Get User Profile Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
