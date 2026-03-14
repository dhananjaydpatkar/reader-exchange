var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne } from 'typeorm';
import { Book } from './Book.js';
import { ExchangeRequest } from './ExchangeRequest.js';
import { Locality } from './Locality.js';
export var UserRole;
(function (UserRole) {
    UserRole["STUDENT"] = "student";
    UserRole["ACADEMICIAN"] = "academician";
    UserRole["PROFESSIONAL"] = "professional";
    UserRole["ADMIN"] = "admin";
    UserRole["EXCHANGE_ADMIN"] = "exchange_admin";
    UserRole["LOCAL_ADMIN"] = "local_admin";
})(UserRole || (UserRole = {}));
let User = class User {
    id;
    email;
    passwordHash;
    name;
    role;
    isLocalAdminRequested;
    addressLine1;
    addressLine2;
    city;
    state;
    zipCode;
    locality;
    credits;
    dateOfBirth;
    // Student-specific fields
    schoolName;
    grade;
    // Academician-specific fields
    university;
    majors;
    books;
    requests;
    createdAt;
    updatedAt;
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], User.prototype, "id", void 0);
__decorate([
    Column({ unique: true, type: 'text' }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    Column({ type: 'text' }),
    __metadata("design:type", String)
], User.prototype, "passwordHash", void 0);
__decorate([
    Column({ type: 'text' }),
    __metadata("design:type", String)
], User.prototype, "name", void 0);
__decorate([
    Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.STUDENT,
    }),
    __metadata("design:type", String)
], User.prototype, "role", void 0);
__decorate([
    Column({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], User.prototype, "isLocalAdminRequested", void 0);
__decorate([
    Column({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], User.prototype, "addressLine1", void 0);
__decorate([
    Column({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], User.prototype, "addressLine2", void 0);
__decorate([
    Column({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], User.prototype, "city", void 0);
__decorate([
    Column({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], User.prototype, "state", void 0);
__decorate([
    Column({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], User.prototype, "zipCode", void 0);
__decorate([
    ManyToOne(() => Locality, (locality) => locality.users, { nullable: true }),
    __metadata("design:type", Locality)
], User.prototype, "locality", void 0);
__decorate([
    Column({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], User.prototype, "credits", void 0);
__decorate([
    Column({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], User.prototype, "dateOfBirth", void 0);
__decorate([
    Column({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], User.prototype, "schoolName", void 0);
__decorate([
    Column({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], User.prototype, "grade", void 0);
__decorate([
    Column({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], User.prototype, "university", void 0);
__decorate([
    Column({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], User.prototype, "majors", void 0);
__decorate([
    OneToMany(() => Book, (book) => book.owner),
    __metadata("design:type", Array)
], User.prototype, "books", void 0);
__decorate([
    OneToMany(() => ExchangeRequest, (request) => request.requester),
    __metadata("design:type", Array)
], User.prototype, "requests", void 0);
__decorate([
    CreateDateColumn(),
    __metadata("design:type", Date)
], User.prototype, "createdAt", void 0);
__decorate([
    UpdateDateColumn(),
    __metadata("design:type", Date)
], User.prototype, "updatedAt", void 0);
User = __decorate([
    Entity()
], User);
export { User };
//# sourceMappingURL=User.js.map