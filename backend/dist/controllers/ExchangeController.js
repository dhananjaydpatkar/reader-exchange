import { AppDataSource } from '../data-source.js';
import { ExchangeRequest, RequestStatus, RequestType } from '../entities/ExchangeRequest.js';
import { Book, BookStatus } from '../entities/Book.js';
import { User } from '../entities/User.js';
import { validationResult } from 'express-validator';
const requestRepository = AppDataSource.getRepository(ExchangeRequest);
const bookRepository = AppDataSource.getRepository(Book);
const userRepository = AppDataSource.getRepository(User);
export const createRequest = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    const { bookId, type } = req.body; // type: RENT, BUY, EXCHANGE
    const userId = req.user.id;
    try {
        const book = await bookRepository.findOne({
            where: { id: bookId },
            relations: ['owner', 'owner.locality'],
        });
        if (!book) {
            res.status(404).json({ message: 'Book not found' });
            return;
        }
        // --- NEW: Locality Check ---
        const requester = await userRepository.findOne({
            where: { id: userId },
            relations: ['locality']
        });
        if (!requester) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        // Check Owner's Locality
        if (book.owner.locality && !book.owner.locality.isLive) {
            res.status(400).json({
                message: `Exchange not possible. Owner's locality (${book.owner.locality.name}) is not yet live on the platform.`
            });
            return;
        }
        // Check Requester's Locality
        if (requester.locality && !requester.locality.isLive) {
            res.status(400).json({
                message: `Exchange not possible. Your locality (${requester.locality.name}) is not yet live on the platform.`
            });
            return;
        }
        // ---------------------------
        if (book.owner.id === userId) {
            res.status(400).json({ message: 'Cannot request your own book' });
            return;
        }
        if (book.status !== BookStatus.AVAILABLE) {
            res.status(400).json({ message: 'Book is not available' });
            return;
        }
        const validTypes = Object.values(RequestType);
        const normalizedType = (type || 'exchange').toLowerCase();
        if (!validTypes.includes(normalizedType)) {
            res.status(400).json({ message: 'Invalid request type' });
            return;
        }
        // Validate Type availability
        if (normalizedType === RequestType.RENT && !book.isForRent) {
            res.status(400).json({ message: 'Book is not available for rent' });
            return;
        }
        if (normalizedType === RequestType.BUY && !book.isForSale) {
            res.status(400).json({ message: 'Book is not available for sale' });
            return;
        }
        if (normalizedType === RequestType.EXCHANGE && !book.isForExchange) {
            res.status(400).json({ message: 'Book is not available for exchange' });
            return;
        }
        // Check existing pending request
        const existingRequest = await requestRepository.findOne({
            where: {
                book: { id: bookId },
                requester: { id: userId },
                status: RequestStatus.PENDING,
            },
        });
        if (existingRequest) {
            res.status(400).json({ message: 'You already requested this book' });
            return;
        }
        const requestData = {
            book,
            requester: { id: userId },
            originalOwner: book.owner,
            status: RequestStatus.PENDING,
            type: normalizedType,
        };
        if (normalizedType === RequestType.RENT) {
            requestData.totalAmount = book.rentPrice;
            requestData.rentStartDate = new Date();
        }
        else if (normalizedType === RequestType.BUY) {
            requestData.totalAmount = book.askingPrice;
        }
        const request = requestRepository.create(requestData);
        await requestRepository.save(request);
        // Lock book for ANY request type (First come first serve)
        // Set book status to PENDING
        book.status = BookStatus.PENDING;
        await bookRepository.save(book);
        res.status(201).json(request);
    }
    catch (error) {
        console.error('Create Request Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
export const getMyRequests = async (req, res) => {
    const userId = req.user.id;
    try {
        // Requests I made
        const sent = await requestRepository.find({
            where: { requester: { id: userId } },
            relations: ['book', 'book.owner', 'originalOwner'],
        });
        // Requests for my books (current or past if originalOwner)
        const received = await requestRepository.find({
            where: [
                { book: { owner: { id: userId } } },
                { originalOwner: { id: userId } }
            ],
            relations: ['book', 'requester', 'originalOwner'],
        });
        res.json({ sent, received });
    }
    catch (error) {
        console.error('Get Requests Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
export const updateRequestStatus = async (req, res) => {
    const { requestId } = req.params;
    const { status } = req.body; // APPROVED, REJECTED
    const userId = req.user.id;
    const normalizedStatus = status.toLowerCase();
    const validStatuses = Object.values(RequestStatus);
    if (!validStatuses.includes(normalizedStatus)) {
        res.status(400).json({ message: 'Invalid status' });
        return;
    }
    try {
        const request = await requestRepository.findOne({
            where: { id: requestId },
            relations: ['book', 'book.owner', 'requester'],
        });
        if (!request) {
            res.status(404).json({ message: 'Request not found' });
            return;
        }
        const user = await userRepository.findOneBy({ id: userId });
        // Verify permissions
        const isOwner = request.book.owner.id === userId;
        const isLocalAdmin = user?.role === 'local_admin' && user?.zipCode === request.book.owner.zipCode;
        const isRenter = request.requester.id === userId;
        // Owner can approve/reject
        // Renter can cancel or return
        // Local Admin can handle logistics (collected, dispatched, delivered, etc.)
        // Simplified check for now (refine as needed)
        if (!isOwner && !isLocalAdmin && !isRenter) {
            res.status(403).json({ message: 'Not authorized' });
            return;
        }
        if (request.status !== RequestStatus.PENDING && !isLocalAdmin && !isRenter) {
            // Owner can only act on PENDING (approve/reject)
            // But if status is RETURN_PENDING etc, owner might need to act? 
            // Actually currently owner doesn't do logistics. 
        }
        request.status = normalizedStatus;
        await requestRepository.save(request);
        // await requestRepository.save(request); // Save moved to the end after all status-specific logic
        if (normalizedStatus === RequestStatus.APPROVED) {
            // Check if it's a BUY request, maybe mark sold immediately or wait for payment?
            // tailored for Exchange flow mostly for now
        }
        // Unlock book if request is REJECTED or CANCELLED
        if (normalizedStatus === RequestStatus.REJECTED || normalizedStatus === RequestStatus.CANCELLED) {
            if (request.book.status === BookStatus.PENDING) {
                request.book.status = BookStatus.AVAILABLE;
                await bookRepository.save(request.book);
            }
        }
        // Handle Return Flow
        if (normalizedStatus === RequestStatus.RETURN_PENDING) {
            // Only Renter can initiate return?
            // Ideally check req.user.id === request.requester.id
        }
        if (normalizedStatus === RequestStatus.RETURNED) {
            request.book.status = BookStatus.AVAILABLE;
            await bookRepository.save(request.book);
            // request.rentEndDate = new Date(); // Actual return date?
        }
        // Existing Logistics override
        if (normalizedStatus === RequestStatus.COLLECTED && request.type === RequestType.RENT) {
            request.rentStartDate = new Date();
            const duration = request.book.rentDuration || 14;
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + duration);
            request.rentEndDate = endDate;
        }
        // Update timestamps for return logistics
        if (normalizedStatus === RequestStatus.RETURN_COLLECTED)
            request.collectedAt = new Date(); // Reusing collectedAt? Or need returnCollectedAt? 
        // Let's reuse or just rely on status history if we had it. For now, just status update is fine for MVP.
        if (normalizedStatus === RequestStatus.DELIVERED) {
            // Logic for delivery completion
            if (request.type === RequestType.BUY) {
                // Transfer ownership and add to history
                const previousOwner = request.book.owner;
                // Initialize ownership history if not exists
                if (!request.book.ownershipHistory) {
                    request.book.ownershipHistory = [];
                }
                // Add previous owner to history
                request.book.ownershipHistory.push({
                    userId: previousOwner.id,
                    userName: previousOwner.name,
                    toUserId: request.requester.id,
                    toUserName: request.requester.name,
                    timestamp: new Date(),
                    transactionType: 'sale',
                    price: request.totalAmount ? Number(request.totalAmount) : (request.book.askingPrice ? Number(request.book.askingPrice) : 0),
                    requestId: request.id
                });
                // Transfer ownership to buyer
                request.book.owner = request.requester;
                request.book.status = BookStatus.SOLD;
                // Reset listing preferences
                request.book.isForSale = false;
                request.book.isForRent = false;
                request.book.isForExchange = false;
                request.book.askingPrice = null;
                request.book.rentPrice = null;
            }
            else if (request.type === RequestType.EXCHANGE) {
                // Initialize ownership history if not exists
                if (!request.book.ownershipHistory) {
                    request.book.ownershipHistory = [];
                }
                // Add previous owner to history
                const previousOwner = request.book.owner;
                request.book.ownershipHistory.push({
                    userId: previousOwner.id,
                    userName: previousOwner.name,
                    toUserId: request.requester.id,
                    toUserName: request.requester.name,
                    timestamp: new Date(),
                    transactionType: 'exchange',
                    price: 0,
                    requestId: request.id
                });
                // Transfer ownership to requester
                request.book.owner = request.requester;
                request.book.status = BookStatus.SOLD; // Treat Give Away as Sold (0 price)
                // Reset listing preferences
                request.book.isForSale = false;
                request.book.isForRent = false;
                request.book.isForExchange = false;
                request.book.askingPrice = null;
                request.book.rentPrice = null;
            }
            else if (request.type === RequestType.RENT) {
                request.book.status = BookStatus.EXCHANGED; // Temporarily unavailable
            }
            await bookRepository.save(request.book);
        }
        res.json(request);
    }
    catch (error) {
        console.error('Update Request Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
export const getExchangeHistory = async (req, res) => {
    // ... existing implementation ...
    const userId = req.user.id;
    const { range } = req.query; // 1m, 1w, 1q, all
    try {
        let dateFilter = new Date();
        // Default to all if not specified or unrecognized
        let useDateFilter = true;
        switch (range) {
            case '1w':
                dateFilter.setDate(dateFilter.getDate() - 7);
                break;
            case '1m':
                dateFilter.setMonth(dateFilter.getMonth() - 1);
                break;
            case '1q':
                dateFilter.setMonth(dateFilter.getMonth() - 3);
                break;
            default:
                useDateFilter = false;
        }
        const queryBuilder = requestRepository.createQueryBuilder('request')
            .leftJoinAndSelect('request.book', 'book')
            .leftJoinAndSelect('book.owner', 'owner')
            .leftJoinAndSelect('request.originalOwner', 'originalOwner')
            .leftJoinAndSelect('request.requester', 'requester')
            .where('(request.requesterId = :userId OR request.originalOwnerId = :userId OR book.ownerId = :userId)', { userId });
        if (useDateFilter) {
            queryBuilder.andWhere('request.createdAt >= :dateFilter', { dateFilter });
        }
        queryBuilder.orderBy('request.createdAt', 'DESC');
        const history = await queryBuilder.getMany();
        res.json(history);
    }
    catch (error) {
        console.error('Get History Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
export const extendRental = async (req, res) => {
    // ... existing implementation ...
    const { requestId } = req.params;
    const { days } = req.body;
    const userId = req.user.id;
    if (!days || days <= 0) {
        res.status(400).json({ message: 'Invalid days for extension' });
        return;
    }
    try {
        const request = await requestRepository.findOne({
            where: { id: requestId },
            relations: ['book', 'requester'],
        });
        if (!request) {
            res.status(404).json({ message: 'Request not found' });
            return;
        }
        if (request.requester.id !== userId) {
            res.status(403).json({ message: 'Not authorized' });
            return;
        }
        if (request.type !== RequestType.RENT || request.status === RequestStatus.COMPLETED) {
            res.status(400).json({ message: 'Cannot extend this request' });
            return;
        }
        // Calculate new end date
        const currentEndDate = request.rentEndDate ? new Date(request.rentEndDate) : new Date();
        const newEndDate = new Date(currentEndDate);
        newEndDate.setDate(newEndDate.getDate() + days);
        // Calculate cost
        // Assuming late fee or standard pro-rated rate? 
        // Let's use lateFeePerDay or a fraction of rentPrice for now. 
        // For simplicity, let's say extension is pro-rated based on (rentPrice / rentDuration) * days
        const dailyRate = (Number(request.book.rentPrice) || 0) / (request.book.rentDuration || 14);
        const extensionCost = dailyRate * days;
        request.rentEndDate = newEndDate;
        request.totalAmount = (Number(request.totalAmount) || 0) + extensionCost;
        await requestRepository.save(request);
        res.json(request);
    }
    catch (error) {
        console.error('Extend Rental Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
export const getLogisticsRequests = async (req, res) => {
    const userId = req.user.id;
    try {
        const user = await userRepository.findOneBy({ id: userId });
        if (!user || user.role !== 'local_admin') {
            res.status(403).json({ message: 'Access denied' });
            return;
        }
        // Fetch requests where book owner is in the same zipCode (Simplified Logistics)
        // OR requests that need logistics in this area.
        // For MVP: requests where owner.zipCode == admin.zipCode
        const requests = await requestRepository.find({
            where: {
                book: {
                    owner: {
                        zipCode: user.zipCode
                    }
                },
                // status: Any active status? PENDING/APPROVED handled by owner. 
                // Logistics handles COLLECTION_PENDING -> DELIVERED, and RETURN statuses.
                // But let's return all active ones for visibility.
            },
            relations: ['book', 'book.owner', 'requester', 'originalOwner'],
            order: { updatedAt: 'DESC' }
        });
        res.json(requests);
    }
    catch (error) {
        console.error('Get Logistics Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
//# sourceMappingURL=ExchangeController.js.map