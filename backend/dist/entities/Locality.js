var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { User } from './User.js';
let Locality = class Locality {
    id;
    name;
    pinCode;
    isLive;
    users;
    createdAt;
    updatedAt;
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], Locality.prototype, "id", void 0);
__decorate([
    Column({ type: 'text', unique: true }),
    __metadata("design:type", String)
], Locality.prototype, "name", void 0);
__decorate([
    Column({ type: 'text' }),
    __metadata("design:type", String)
], Locality.prototype, "pinCode", void 0);
__decorate([
    Column({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Locality.prototype, "isLive", void 0);
__decorate([
    OneToMany(() => User, (user) => user.locality),
    __metadata("design:type", Array)
], Locality.prototype, "users", void 0);
__decorate([
    CreateDateColumn(),
    __metadata("design:type", Date)
], Locality.prototype, "createdAt", void 0);
__decorate([
    UpdateDateColumn(),
    __metadata("design:type", Date)
], Locality.prototype, "updatedAt", void 0);
Locality = __decorate([
    Entity()
], Locality);
export { Locality };
//# sourceMappingURL=Locality.js.map