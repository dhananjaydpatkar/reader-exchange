import { User } from './User.js';
export declare enum BookStatus {
    AVAILABLE = "available",
    PENDING = "pending",
    EXCHANGED = "exchanged",
    SOLD = "sold"
}
export declare class Book {
    id: string;
    isbn: string;
    title: string;
    author: string;
    publisher: string;
    publishedYear: number;
    genre: string;
    coverImageUrl: string;
    condition: string;
    askingPrice: number;
    isForExchange: boolean;
    isForSale: boolean;
    isForRent: boolean;
    rentPrice: number;
    rentPriceCurrency: string;
    rentDuration: number;
    lateFeePerDay: number;
    status: BookStatus;
    ownershipHistory: Array<{
        userId: string;
        userName: string;
        toUserId: string;
        toUserName: string;
        timestamp: Date;
        transactionType: 'sale' | 'exchange' | 'initial';
        price?: number;
        requestId?: string;
    }>;
    owner: User;
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=Book.d.ts.map