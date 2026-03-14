import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { User } from './User.js';

@Entity()
export class Locality {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'text', unique: true })
    name!: string;

    @Column({ type: 'text' })
    pinCode!: string;

    @Column({ type: 'boolean', default: false })
    isLive!: boolean;

    @OneToMany(() => User, (user) => user.locality)
    users!: User[];

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
