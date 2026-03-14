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
export var BookStatus;
(function (BookStatus) {
    BookStatus["AVAILABLE"] = "available";
    BookStatus["PENDING"] = "pending";
    BookStatus["EXCHANGED"] = "exchanged";
    BookStatus["SOLD"] = "sold";
})(BookStatus || (BookStatus = {}));
let Book = class Book {
    id;
    isbn;
    title;
    author;
    publisher;
    publishedYear;
    genre;
    coverImageUrl;
    condition;
    askingPrice; // For sale
    isForExchange;
    isForSale;
    isForRent; // New: Available for rent
    rentPrice; // New: Price per rental period
    rentPriceCurrency; // New: Currency
    rentDuration; // New: Default rental duration in days
    lateFeePerDay; // New: Optional late fee
    status;
    ownershipHistory;
    owner;
    createdAt;
    updatedAt;
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], Book.prototype, "id", void 0);
__decorate([
    Column({ type: 'text' }),
    __metadata("design:type", String)
], Book.prototype, "isbn", void 0);
__decorate([
    Column({ type: 'text' }),
    __metadata("design:type", String)
], Book.prototype, "title", void 0);
__decorate([
    Column({ type: 'text' }),
    __metadata("design:type", String)
], Book.prototype, "author", void 0);
__decorate([
    Column({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Book.prototype, "publisher", void 0);
__decorate([
    Column({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Book.prototype, "publishedYear", void 0);
__decorate([
    Column({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Book.prototype, "genre", void 0);
__decorate([
    Column({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Book.prototype, "coverImageUrl", void 0);
__decorate([
    Column({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Book.prototype, "condition", void 0);
__decorate([
    Column({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Book.prototype, "askingPrice", void 0);
__decorate([
    Column({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], Book.prototype, "isForExchange", void 0);
__decorate([
    Column({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Book.prototype, "isForSale", void 0);
__decorate([
    Column({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Book.prototype, "isForRent", void 0);
__decorate([
    Column({ type: 'decimal', precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Book.prototype, "rentPrice", void 0);
__decorate([
    Column({ type: 'text', default: 'INR' }),
    __metadata("design:type", String)
], Book.prototype, "rentPriceCurrency", void 0);
__decorate([
    Column({ type: 'int', default: 14 }),
    __metadata("design:type", Number)
], Book.prototype, "rentDuration", void 0);
__decorate([
    Column({ type: 'decimal', precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Book.prototype, "lateFeePerDay", void 0);
__decorate([
    Column({
        type: 'enum',
        enum: BookStatus,
        default: BookStatus.AVAILABLE,
    }),
    __metadata("design:type", String)
], Book.prototype, "status", void 0);
__decorate([
    Column({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Array)
], Book.prototype, "ownershipHistory", void 0);
__decorate([
    ManyToOne(() => User, (user) => user.books),
    __metadata("design:type", User)
], Book.prototype, "owner", void 0);
__decorate([
    CreateDateColumn(),
    __metadata("design:type", Date)
], Book.prototype, "createdAt", void 0);
__decorate([
    UpdateDateColumn(),
    __metadata("design:type", Date)
], Book.prototype, "updatedAt", void 0);
Book = __decorate([
    Entity()
], Book);
export { Book };
//# sourceMappingURL=Book.js.map