import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, type Relation } from 'typeorm';
import { User } from './User.js';

export enum TransactionType {
    PURCHASE_CREDITS = 'PURCHASE_CREDITS',
    EXCHANGE_HOLD = 'EXCHANGE_HOLD',
    EXCHANGE_REFUND = 'EXCHANGE_REFUND',
    EXCHANGE_EARN = 'EXCHANGE_EARN',
    PLATFORM_FEE = 'PLATFORM_FEE',
    WITHDRAWAL = 'WITHDRAWAL',
}

export enum TransactionStatus {
    PENDING = 'PENDING',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
    CANCELLED = 'CANCELLED'
}

@Entity('ledger_transaction')
export class LedgerTransaction {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => User, undefined, { nullable: false })
    user!: Relation<User>;

    @Column({ type: 'int' })
    amount!: number;

    @Column({ type: 'enum', enum: TransactionType })
    type!: TransactionType;

    @Column({ type: 'enum', enum: TransactionStatus, default: TransactionStatus.PENDING })
    status!: TransactionStatus;

    @Column({ type: 'text', nullable: true })
    referenceId!: string;

    @Column({ type: 'int', default: 0 })
    balanceSnapshot!: number;

    @CreateDateColumn()
    createdAt!: Date;
}
