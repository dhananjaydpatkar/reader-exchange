import { AppDataSource } from '../data-source.js';
import { User } from '../entities/User.js';
import { Book, BookStatus } from '../entities/Book.js';
const userRepository = AppDataSource.getRepository(User);
const bookRepository = AppDataSource.getRepository(Book);
export const getUserProfile = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await userRepository.findOne({
            where: { id: id },
            select: ['id', 'name', 'createdAt', 'credits'] // Select only public info
        });
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        const books = await bookRepository.find({
            where: {
                owner: { id: id },
                status: BookStatus.AVAILABLE
            },
            order: { createdAt: 'DESC' }
        });
        res.json({
            user,
            books
        });
    }
    catch (error) {
        console.error('Get User Profile Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
//# sourceMappingURL=UserController.js.map