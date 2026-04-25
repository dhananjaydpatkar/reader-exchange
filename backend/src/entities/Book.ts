import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, type Relation } from 'typeorm';
import { User } from './User.js';

export enum BookStatus {
    AVAILABLE = 'available',
    PENDING = 'pending',
    EXCHANGED = 'exchanged',
    SOLD = 'sold',
}

@Entity()
export class Book {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'text' })
    isbn!: string;

    @Column({ type: 'text' })
    title!: string;

    @Column({ type: 'text' })
    author!: string;

    @Column({ type: 'text', nullable: true })
    publisher!: string;

    @Column({ type: 'int', nullable: true })
    publishedYear!: number;

    @Column({ type: 'text', nullable: true })
    genre!: string;

    @Column({ type: 'text', nullable: true })
    coverImageUrl!: string;

    @Column({ type: 'text', nullable: true })
    condition!: string;

    @Column({ type: 'int', nullable: true })
    askingPrice!: number; // For sale

    @Column({ type: 'int', default: 0 })
    creditsRequired!: number; // For sale/rent via credits

    @Column({ type: 'boolean', default: true })
    isForExchange!: boolean;

    @Column({ type: 'boolean', default: false })
    isForSale!: boolean;

    @Column({ type: 'boolean', default: false })
    isForRent!: boolean; // New: Available for rent

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    rentPrice!: number; // New: Price per rental period

    @Column({ type: 'text', default: 'INR' })
    rentPriceCurrency!: string; // New: Currency

    @Column({ type: 'int', default: 14 })
    rentDuration!: number; // New: Default rental duration in days

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    lateFeePerDay!: number; // New: Optional late fee

    @Column({
        type: 'enum',
        enum: BookStatus,
        default: BookStatus.AVAILABLE,
    })
    status!: BookStatus;

    @Column({ type: 'jsonb', nullable: true })
    ownershipHistory!: Array<{
        userId: string;
        userName: string;
        toUserId: string;
        toUserName: string;
        timestamp: Date;
        transactionType: 'sale' | 'exchange' | 'initial';
        price?: number;
        requestId?: string;
    }>;

    @ManyToOne(() => User, (user) => user.books)
    owner!: Relation<User>;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
