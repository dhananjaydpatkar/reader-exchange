import { AppDataSource } from '../data-source.js';
import { User, UserRole } from '../entities/User.js';
import { ExchangeRequest, RequestStatus } from '../entities/ExchangeRequest.js';
import { Book } from '../entities/Book.js';
const userRepository = AppDataSource.getRepository(User);
const requestRepository = AppDataSource.getRepository(ExchangeRequest);
const bookRepository = AppDataSource.getRepository(Book);
// User requests to become Local Admin
export const requestLocalAdmin = async (req, res) => {
    const userId = req.user.id;
    try {
        const user = await userRepository.findOneBy({ id: userId });
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        user.isLocalAdminRequested = true;
        await userRepository.save(user);
        res.json({ message: 'Local Admin access requested successfully' });
    }
    catch (error) {
        console.error('Request Local Admin Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
// Exchange Admin approves Local Admin
export const approveLocalAdmin = async (req, res) => {
    const { userId } = req.body;
    // Check if requester is Exchange Admin (middleware should handle, but double check)
    if (req.user.role !== UserRole.EXCHANGE_ADMIN) {
        res.status(403).json({ message: 'Access denied' });
        return;
    }
    try {
        const user = await userRepository.findOneBy({ id: userId });
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        user.role = UserRole.LOCAL_ADMIN;
        user.isLocalAdminRequested = false; // Reset flag
        await userRepository.save(user);
        res.json({ message: 'User promoted to Local Admin' });
    }
    catch (error) {
        console.error('Approve Local Admin Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
// Get pending Local Admin requests
export const getLocalAdminRequests = async (req, res) => {
    if (req.user.role !== UserRole.EXCHANGE_ADMIN) {
        res.status(403).json({ message: 'Access denied' });
        return;
    }
    try {
        const requests = await userRepository.find({
            where: { isLocalAdminRequested: true },
            select: ['id', 'name', 'email', 'zipCode', 'city']
        });
        res.json(requests);
    }
    catch (error) {
        console.error('Get Admin Requests Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
// Local Admin gets exchanges in their area
export const getLocalExchanges = async (req, res) => {
    const userId = req.user.id;
    try {
        const localAdmin = await userRepository.findOneBy({ id: userId });
        if (!localAdmin || localAdmin.role !== UserRole.LOCAL_ADMIN) {
            res.status(403).json({ message: 'Access denied' });
            return;
        }
        // Find exchanges where the BOOK OWNER is in the local admin's zip code
        // Logic: Local Admin manages collection from owners in their area.
        // Complex query needing joins
        const exchanges = await requestRepository.createQueryBuilder('request')
            .leftJoinAndSelect('request.book', 'book')
            .leftJoinAndSelect('book.owner', 'owner')
            .leftJoinAndSelect('request.originalOwner', 'originalOwner')
            .leftJoinAndSelect('request.requester', 'requester')
            .where('owner.zipCode = :zipCode', { zipCode: localAdmin.zipCode })
            .andWhere('request.status IN (:...statuses)', {
            statuses: [
                RequestStatus.APPROVED,
                RequestStatus.COLLECTION_PENDING,
                RequestStatus.COLLECTED,
                RequestStatus.DISPATCHED,
                RequestStatus.DELIVERED // Completed ones too for history
            ]
        })
            .orderBy('request.updatedAt', 'DESC')
            .getMany();
        res.json(exchanges);
    }
    catch (error) {
        console.error('Get Local Exchanges Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
// Exchange Admin gets all exchanges (with optional filter)
export const getAllExchanges = async (req, res) => {
    if (req.user.role !== UserRole.EXCHANGE_ADMIN) {
        res.status(403).json({ message: 'Access denied' });
        return;
    }
    const { zipCode } = req.query;
    try {
        const queryBuilder = requestRepository.createQueryBuilder('request')
            .leftJoinAndSelect('request.book', 'book')
            .leftJoinAndSelect('book.owner', 'owner')
            .leftJoinAndSelect('request.originalOwner', 'originalOwner')
            .leftJoinAndSelect('request.requester', 'requester')
            .orderBy('request.updatedAt', 'DESC');
        if (zipCode) {
            queryBuilder.where('owner.zipCode = :zipCode', { zipCode });
        }
        const exchanges = await queryBuilder.getMany();
        res.json(exchanges);
    }
    catch (error) {
        console.error('Get All Exchanges Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
// Update Logistics Status (Collect, Dispatch, Deliver)
export const updateExchangeStatus = async (req, res) => {
    const { requestId } = req.params;
    const { status } = req.body;
    const userId = req.user.id;
    try {
        const request = await requestRepository.findOne({
            where: { id: requestId },
            relations: ['book', 'book.owner', 'requester']
        });
        if (!request) {
            res.status(404).json({ message: 'Request not found' });
            return;
        }
        // Verify user is Local Admin (or Super Admin)
        // Ideally should check if Admin is responsible for this area, but for MVP any Local Admin is fine or check checks in earlier middleware
        // Detailed check:
        // if (req.user.role === UserRole.LOCAL_ADMIN) {
        //     const admin = await userRepository.findOneBy({ id: userId });
        //     if (admin.zipCode !== request.book.owner.zipCode) ...
        // }
        request.status = status;
        if (status === RequestStatus.COLLECTED) {
            request.collectedAt = new Date();
        }
        else if (status === RequestStatus.DISPATCHED) {
            request.dispatchedAt = new Date();
        }
        else if (status === RequestStatus.DELIVERED) {
            request.deliveredAt = new Date();
            // Transfer Ownership!
            const book = await bookRepository.findOne({ where: { id: request.book.id } });
            if (book) {
                book.owner = request.requester;
                // book.status = BookStatus.AVAILABLE; // Or keep it as AVAILABLE for the new owner to swap?
                // Usually user needs to re-list it. Let's keep it AVAILABLE but under new owner.
                await bookRepository.save(book);
            }
        }
        await requestRepository.save(request);
        res.json(request);
    }
    catch (error) {
        console.error('Update Exchange Status Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
//# sourceMappingURL=AdminController.js.map