import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, type Relation } from 'typeorm';
import { User } from './User.js';

export enum WithdrawalStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED'
}

@Entity('withdrawal_request')
export class WithdrawalRequest {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => User, undefined, { nullable: false })
    user!: Relation<User>;

    @Column({ type: 'int' })
    amount!: number;

    @Column({ type: 'text' })
    upiVpa!: string;

    @Column({ type: 'enum', enum: WithdrawalStatus, default: WithdrawalStatus.PENDING })
    status!: WithdrawalStatus;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
