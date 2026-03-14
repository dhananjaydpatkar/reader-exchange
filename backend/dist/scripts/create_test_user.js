import { AppDataSource } from '../data-source.js';
import { User, UserRole } from '../entities/User.js';
import bcrypt from 'bcryptjs';
const createTestUser = async () => {
    try {
        await AppDataSource.initialize();
        const userRepo = AppDataSource.getRepository(User);
        const testEmail = 'debug_test@example.com';
        let user = await userRepo.findOneBy({ email: testEmail });
        if (!user) {
            const hashedPassword = await bcrypt.hash('password123', 10);
            user = userRepo.create({
                email: testEmail,
                passwordHash: hashedPassword,
                name: 'Debug User',
                role: UserRole.STUDENT,
                zipCode: '10001', // Ensure zipCode is set
                credits: 10
            });
            await userRepo.save(user);
            console.log('Test user created:', testEmail);
        }
        else {
            console.log('Test user already exists:', testEmail);
        }
        await AppDataSource.destroy();
    }
    catch (error) {
        console.error('Error creating test user:', error);
    }
};
createTestUser();
//# sourceMappingURL=create_test_user.js.map