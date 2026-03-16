import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, type Relation } from 'typeorm';
import { User } from './User.js';
import { Book } from './Book.js';

export enum RequestStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected',
    COLLECTION_PENDING = 'collection_pending',
    COLLECTED = 'collected',
    DISPATCHED = 'dispatched',
    DELIVERED = 'delivered',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
    // Return Flow
    RETURN_PENDING = 'return_pending',
    RETURN_COLLECTED = 'return_collected',
    RETURN_DISPATCHED = 'return_dispatched',
    RETURNED = 'returned',
}

export enum RequestType {
    EXCHANGE = 'exchange',
    RENT = 'rent',
    BUY = 'buy',
}

@Entity()
export class ExchangeRequest {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => User, (user) => user.requests)
    requester!: Relation<User>;

    @ManyToOne(() => Book)
    book!: Relation<Book>;

    @ManyToOne(() => User, { nullable: true })
    originalOwner!: Relation<User>;

    @Column({
        type: 'enum',
        enum: RequestType,
        default: RequestType.EXCHANGE,
    })
    type!: RequestType; // New: RENT, BUY, or EXCHANGE

    @Column({
        type: 'enum',
        enum: RequestStatus,
        default: RequestStatus.PENDING,
    })
    status!: RequestStatus;

    // Rental Specific Fields
    @Column({ type: 'timestamp', nullable: true })
    rentStartDate!: Date;

    @Column({ type: 'timestamp', nullable: true })
    rentEndDate!: Date;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    totalAmount!: number;

    @Column({ type: 'boolean', default: false })
    isPaymentSettled!: boolean;


    @Column({ type: 'timestamp', nullable: true })
    collectedAt!: Date;

    @Column({ type: 'timestamp', nullable: true })
    dispatchedAt!: Date;

    @Column({ type: 'timestamp', nullable: true })
    deliveredAt!: Date;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
