
import { AppDataSource } from '../data-source.js';
import { User } from '../entities/User.js';
import { Book } from '../entities/Book.js';
import { ExchangeRequest } from '../entities/ExchangeRequest.js';
import { In, Not } from 'typeorm';

const cleanupData = async () => {
    try {
        await AppDataSource.initialize();
        console.log('Database connected for cleanup...');

        const requestRepo = AppDataSource.getRepository(ExchangeRequest);
        const bookRepo = AppDataSource.getRepository(Book);
        const userRepo = AppDataSource.getRepository(User);

        // 1. Delete all Exchange Requests
        // await requestRepo.delete({}); // TypeORM blocks empty delete
        await requestRepo.query('DELETE FROM "exchange_request"');
        console.log('✅ All Exchange Requests deleted.');

        // 2. Delete all Books
        await bookRepo.query('DELETE FROM "book"');
        console.log('✅ All Books deleted.');

        // 3. Delete Test Users
        // Keep specific real users
        const realUserEmails = [
            'dhananjay.patkar@gmail.com',
            'dhruvee.patkar@gmail.com'
        ];

        const usersToDelete = await userRepo.find({
            where: {
                email: Not(In(realUserEmails))
            }
        });

        if (usersToDelete.length > 0) {
            console.log(`Found ${usersToDelete.length} users to delete.`);
            // Extract IDs to delete
            const idsToDelete = usersToDelete.map((u: any) => u.id);
            await userRepo.delete(idsToDelete);
            console.log('✅ Test Users deleted.');
        } else {
            console.log('No test users found to delete.');
        }

        console.log('--- Cleanup Complete ---');

        // Verification Log
        const userCount = await userRepo.count();
        const bookCount = await bookRepo.count();
        const reqCount = await requestRepo.count();

        console.log(`Remaining Users: ${userCount}`);
        console.log(`Remaining Books: ${bookCount}`);
        console.log(`Remaining Requests: ${reqCount}`);

        await AppDataSource.destroy();
    } catch (error) {
        console.error('Cleanup Error:', error);
    }
};

cleanupData();
