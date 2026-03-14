import { AppDataSource } from '../data-source.js';
import { Book } from '../entities/Book.js';
const debugBooks = async () => {
    try {
        await AppDataSource.initialize();
        console.log('Database connected...');
        const bookRepo = AppDataSource.getRepository(Book);
        const books = await bookRepo.find({ relations: ['owner'] });
        console.log(`Found ${books.length} books.`);
        books.forEach(b => {
            console.log(`ID: ${b.id}`);
            console.log(`Title: ${b.title}`);
            console.log(`Owner: ${b.owner?.email}`);
            console.log(`isForExchange: ${b.isForExchange}`);
            console.log(`isForSale: ${b.isForSale}`);
            console.log(`isForRent: ${b.isForRent}`);
            console.log('---');
        });
        await AppDataSource.destroy();
    }
    catch (error) {
        console.error('Error:', error);
    }
};
debugBooks();
//# sourceMappingURL=debug_book_status.js.map