
import { AppDataSource } from '../data-source.js';
import { Book } from '../entities/Book.js';
import { User } from '../entities/User.js';

const verifyData = async () => {
    try {
        await AppDataSource.initialize();
        console.log('Database connected for verification');

        const bookRepo = AppDataSource.getRepository(Book);
        const userRepo = AppDataSource.getRepository(User);

        const totalBooks = await bookRepo.count();
        console.log(`Total Books: ${totalBooks}`);

        // Check for books with missing relations using QueryBuilder to control join
        const problematicBooks = await bookRepo.createQueryBuilder('book')
            .leftJoinAndSelect('book.owner', 'owner')
            .where('owner.id IS NULL')
            .getMany();

        if (problematicBooks.length > 0) {
            console.log('⚠️ Found books with missing owners (ORPHANED):', problematicBooks.length);
            problematicBooks.forEach((b: any) => {
                console.log(` - ID: ${b.id}, Title: ${b.title}, OwnerID (col): ${b.ownerId}`);
            });
        } else {
            console.log('✅ No orphaned books found (All books have valid owners).');
        }

        const users = await userRepo.find();
        console.log(`Total Users: ${users.length}`);

        await AppDataSource.destroy();
    } catch (error) {
        console.error('Verification Error:', error);
    }
};

verifyData();
