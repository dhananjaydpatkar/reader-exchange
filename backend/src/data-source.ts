import 'reflect-metadata';
import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (!process.env.DATABASE_URL) {
    console.warn('DATABASE_URL is not set. Database connection will fail.');
}

export const AppDataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL as string,
    synchronize: process.env.NODE_ENV === 'development',
    logging: process.env.NODE_ENV === 'development',
    entities: [path.join(__dirname, 'entities', '*.{ts,js}')],
    migrations: [path.join(__dirname, 'migrations', '*.{ts,js}')],
    subscribers: [],
});
