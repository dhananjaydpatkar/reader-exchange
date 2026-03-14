var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { User } from './User.js';
import { Book } from './Book.js';
export var RequestStatus;
(function (RequestStatus) {
    RequestStatus["PENDING"] = "pending";
    RequestStatus["APPROVED"] = "approved";
    RequestStatus["REJECTED"] = "rejected";
    RequestStatus["COLLECTION_PENDING"] = "collection_pending";
    RequestStatus["COLLECTED"] = "collected";
    RequestStatus["DISPATCHED"] = "dispatched";
    RequestStatus["DELIVERED"] = "delivered";
    RequestStatus["COMPLETED"] = "completed";
    RequestStatus["CANCELLED"] = "cancelled";
    // Return Flow
    RequestStatus["RETURN_PENDING"] = "return_pending";
    RequestStatus["RETURN_COLLECTED"] = "return_collected";
    RequestStatus["RETURN_DISPATCHED"] = "return_dispatched";
    RequestStatus["RETURNED"] = "returned";
})(RequestStatus || (RequestStatus = {}));
export var RequestType;
(function (RequestType) {
    RequestType["EXCHANGE"] = "exchange";
    RequestType["RENT"] = "rent";
    RequestType["BUY"] = "buy";
})(RequestType || (RequestType = {}));
let ExchangeRequest = class ExchangeRequest {
    id;
    requester;
    book;
    originalOwner;
    type; // New: RENT, BUY, or EXCHANGE
    status;
    // Rental Specific Fields
    rentStartDate;
    rentEndDate;
    totalAmount;
    isPaymentSettled;
    collectedAt;
    dispatchedAt;
    deliveredAt;
    createdAt;
    updatedAt;
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], ExchangeRequest.prototype, "id", void 0);
__decorate([
    ManyToOne(() => User, (user) => user.requests),
    __metadata("design:type", User)
], ExchangeRequest.prototype, "requester", void 0);
__decorate([
    ManyToOne(() => Book),
    __metadata("design:type", Book)
], ExchangeRequest.prototype, "book", void 0);
__decorate([
    ManyToOne(() => User, { nullable: true }),
    __metadata("design:type", User)
], ExchangeRequest.prototype, "originalOwner", void 0);
__decorate([
    Column({
        type: 'enum',
        enum: RequestType,
        default: RequestType.EXCHANGE,
    }),
    __metadata("design:type", String)
], ExchangeRequest.prototype, "type", void 0);
__decorate([
    Column({
        type: 'enum',
        enum: RequestStatus,
        default: RequestStatus.PENDING,
    }),
    __metadata("design:type", String)
], ExchangeRequest.prototype, "status", void 0);
__decorate([
    Column({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], ExchangeRequest.prototype, "rentStartDate", void 0);
__decorate([
    Column({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], ExchangeRequest.prototype, "rentEndDate", void 0);
__decorate([
    Column({ type: 'decimal', precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], ExchangeRequest.prototype, "totalAmount", void 0);
__decorate([
    Column({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], ExchangeRequest.prototype, "isPaymentSettled", void 0);
__decorate([
    Column({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], ExchangeRequest.prototype, "collectedAt", void 0);
__decorate([
    Column({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], ExchangeRequest.prototype, "dispatchedAt", void 0);
__decorate([
    Column({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], ExchangeRequest.prototype, "deliveredAt", void 0);
__decorate([
    CreateDateColumn(),
    __metadata("design:type", Date)
], ExchangeRequest.prototype, "createdAt", void 0);
__decorate([
    UpdateDateColumn(),
    __metadata("design:type", Date)
], ExchangeRequest.prototype, "updatedAt", void 0);
ExchangeRequest = __decorate([
    Entity()
], ExchangeRequest);
export { ExchangeRequest };
//# sourceMappingURL=ExchangeRequest.js.map