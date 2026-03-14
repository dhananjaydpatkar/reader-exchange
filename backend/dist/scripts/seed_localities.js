import { AppDataSource } from '../data-source.js';
import { Locality } from '../entities/Locality.js';
const seedLocalities = async () => {
    try {
        await AppDataSource.initialize();
        console.log('Database connected');
        const localityRepository = AppDataSource.getRepository(Locality);
        const localities = [
            { name: 'Lodha Amara', pinCode: '400607', isLive: true },
            { name: 'Kalpataru Immensia', pinCode: '400607', isLive: false },
            { name: 'Brahmand', pinCode: '400607', isLive: false },
        ];
        for (const locData of localities) {
            const existing = await localityRepository.findOneBy({ name: locData.name });
            if (!existing) {
                const locality = localityRepository.create(locData);
                await localityRepository.save(locality);
                console.log(`Seeded: ${locData.name} (Live: ${locData.isLive})`);
            }
            else {
                console.log(`Skipped: ${locData.name} (Already exists)`);
            }
        }
        console.log('Locality seeding complete.');
        process.exit(0);
    }
    catch (error) {
        console.error('Error validation seeding:', error);
        process.exit(1);
    }
};
seedLocalities();
//# sourceMappingURL=seed_localities.js.map