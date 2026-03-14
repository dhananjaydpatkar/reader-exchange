import { User } from './User.js';
import { Book } from './Book.js';
export declare enum RequestStatus {
    PENDING = "pending",
    APPROVED = "approved",
    REJECTED = "rejected",
    COLLECTION_PENDING = "collection_pending",
    COLLECTED = "collected",
    DISPATCHED = "dispatched",
    DELIVERED = "delivered",
    COMPLETED = "completed",
    CANCELLED = "cancelled",
    RETURN_PENDING = "return_pending",
    RETURN_COLLECTED = "return_collected",
    RETURN_DISPATCHED = "return_dispatched",
    RETURNED = "returned"
}
export declare enum RequestType {
    EXCHANGE = "exchange",
    RENT = "rent",
    BUY = "buy"
}
export declare class ExchangeRequest {
    id: string;
    requester: User;
    book: Book;
    originalOwner: User;
    type: RequestType;
    status: RequestStatus;
    rentStartDate: Date;
    rentEndDate: Date;
    totalAmount: number;
    isPaymentSettled: boolean;
    collectedAt: Date;
    dispatchedAt: Date;
    deliveredAt: Date;
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=ExchangeRequest.d.ts.map