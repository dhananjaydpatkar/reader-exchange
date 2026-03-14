
import { AppDataSource } from '../data-source.js';
import { User } from '../entities/User.js';

const listUsers = async () => {
    try {
        await AppDataSource.initialize();
        const userRepo = AppDataSource.getRepository(User);
        const users = await userRepo.find();

        console.log('--- Users List ---');
        users.forEach(u => {
            console.log(`ID: ${u.id}, Name: ${u.name}, Email: ${u.email}, Role: ${u.role}`);
        });
        console.log('------------------');

        await AppDataSource.destroy();
    } catch (error) {
        console.error('Error listing users:', error);
    }
};

listUsers();
