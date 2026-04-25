import type { Request, Response } from 'express';
import { AppDataSource } from '../data-source.js';
import { Book, BookStatus } from '../entities/Book.js';
import { User } from '../entities/User.js';
import { fetchBookDetails } from '../services/BookService.js';
import { validationResult } from 'express-validator';

const bookRepository = AppDataSource.getRepository(Book);
const userRepository = AppDataSource.getRepository(User);

export const addBook = async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }

    const { isbn, condition, askingPrice, creditsRequired, isForExchange, isForSale, isForRent, rentPrice, rentDuration } = req.body;
    const userId = req.user.id;

    // Mutually Exclusive Validation
    if (isForExchange && (isForSale || isForRent)) {
        res.status(400).json({ message: 'A book cannot be listed for "Give Away" if it is also listed for Sale or Rent.' });
        return;
    }

    try {
        // Check if user exists (sanity check)
        const user = await userRepository.findOneBy({ id: userId });
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        // Fetch details
        const bookDetails = await fetchBookDetails(isbn);
        if (!bookDetails) {
            res.status(404).json({ message: 'Book not found in external API' });
            return;
        }

        const book = bookRepository.create({
            isbn,
            title: bookDetails.title,
            author: bookDetails.author,
            publisher: bookDetails.publisher,
            publishedYear: bookDetails.publishedYear || 0,
            genre: bookDetails.genre || 'General',
            coverImageUrl: bookDetails.coverImageUrl || '',
            condition,
            askingPrice: isForSale ? (askingPrice || creditsRequired || null) : null,
            creditsRequired: (isForSale || isForRent) ? (creditsRequired || askingPrice || 0) : 0,
            rentPrice: isForRent ? rentPrice : null,
            rentDuration: isForRent ? (rentDuration || 14) : 14,
            isForExchange: isForExchange ?? true,
            isForSale: isForSale ?? false,
            isForRent: isForRent ?? false,
            status: BookStatus.AVAILABLE,
            owner: user,
        });

        await bookRepository.save(book);

        res.status(201).json(book);
    } catch (error) {
        console.error('Add Book Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const listBooks = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user.id;
        const user = await userRepository.findOne({
            where: { id: userId },
            relations: ['locality']
        });
        const search = req.query.search as string;

        if (!user) {
            res.status(401).json({ message: 'User not found' });
            return;
        }

        if (!user.locality) {
            res.json([]);
            return;
        }

        const queryBuilder = bookRepository.createQueryBuilder('book')
            .leftJoinAndSelect('book.owner', 'owner')
            .leftJoinAndSelect('owner.locality', 'locality')
            .where('locality.id = :localityId', { localityId: user.locality.id })
            .andWhere('owner.id != :userId', { userId: user.id }); // Exclude user's own books

        if (search) {
            queryBuilder.andWhere(
                '(book.title ILIKE :search OR book.author ILIKE :search OR book.genre ILIKE :search OR owner.name ILIKE :search)',
                { search: `%${search}%` }
            );
        }

        const allBooks = await queryBuilder.getMany();

        // Filter out SOLD books entirely. They shouldn't appear in the Explore list.
        const books = allBooks.filter(book => book.status !== BookStatus.SOLD);

        // Mask sensitive owner info if needed
        const response = books.map(book => ({
            ...book,
            owner: book.owner ? {
                id: book.owner.id,
                name: book.owner.name,
            } : { id: 'unknown', name: 'Unknown' }
        }));

        res.json(response);
    } catch (error: any) {
        console.error('List Books Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const getMyBooks = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user.id;
        const books = await bookRepository.find({
            where: { owner: { id: userId } },
            order: { createdAt: 'DESC' }
        });
        res.json(books);
    } catch (error) {
        console.error('Get My Books Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getBook = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const book = await bookRepository.findOne({
            where: { id: id as string },
            relations: ['owner']
        });

        if (!book) {
            res.status(404).json({ message: 'Book not found' });
            return;
        }

        // Mask owner details (optional, but good practice)
        const response = {
            ...book,
            owner: {
                id: book.owner.id,
                name: book.owner.name,
                city: book.owner.city,
            }
        };

        res.json(response);
    } catch (error) {
        console.error('Get Book Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Endpoint to relist a sold book
export const relistBook = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const userId = req.user.id;
    const { isForExchange, isForSale, isForRent, askingPrice, creditsRequired, rentPrice, rentDuration } = req.body;

    // Mutually Exclusive Validation
    if (isForExchange && (isForSale || isForRent)) {
        res.status(400).json({ message: 'A book cannot be listed for "Give Away" if it is also listed for Sale or Rent.' });
        return;
    }

    try {
        const book = await bookRepository.findOne({
            where: { id: id as string },
            relations: ['owner']
        });

        if (!book) {
            res.status(404).json({ message: 'Book not found' });
            return;
        }

        // Only current owner can relist
        if (book.owner.id !== userId) {
            res.status(403).json({ message: 'Only the current owner can relist this book' });
            return;
        }

        // Only SOLD books can be relisted
        if (book.status !== BookStatus.SOLD) {
            res.status(400).json({ message: 'Only sold books can be relisted' });
            return;
        }

        // Change status back to AVAILABLE and update listing settings
        book.status = BookStatus.AVAILABLE;
        book.isForExchange = isForExchange ?? false;
        book.isForSale = isForSale ?? false;
        book.isForRent = isForRent ?? false;
        book.creditsRequired = (isForSale || isForRent) ? (creditsRequired || askingPrice || 0) : 0;
        if (isForSale) book.askingPrice = askingPrice || creditsRequired || null;
        if (isForRent) {
            book.rentPrice = rentPrice;
            book.rentDuration = rentDuration || 14;
        }

        await bookRepository.save(book);

        res.json({ message: 'Book relisted successfully', book });
    } catch (error) {
        console.error('Relist Book Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
