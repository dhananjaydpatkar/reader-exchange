import 'reflect-metadata';
import dotenv from 'dotenv';
import app from './app.js';
import { AppDataSource } from './data-source.js';

dotenv.config();

const PORT = process.env.PORT || 3001;

const startServer = async () => {
    try {
        await AppDataSource.initialize();
        console.log('Database connected');

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Error starting server:', error);
        process.exit(1);
    }
};

startServer();
