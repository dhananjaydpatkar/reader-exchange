import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, type Relation } from 'typeorm';
import { Book } from './Book.js';
import { ExchangeRequest } from './ExchangeRequest.js';
import { Locality } from './Locality.js';

export enum UserRole {
    STUDENT = 'student',
    ACADEMICIAN = 'academician',
    PROFESSIONAL = 'professional',
    ADMIN = 'admin',
    EXCHANGE_ADMIN = 'exchange_admin',
    LOCAL_ADMIN = 'local_admin',
}

@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ unique: true, type: 'text' })
    email!: string;

    @Column({ type: 'text' })
    passwordHash!: string;

    @Column({ type: 'text' })
    name!: string;

    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.STUDENT,
    })
    role!: UserRole;

    @Column({ type: 'boolean', default: false })
    isLocalAdminRequested!: boolean;

    @Column({ type: 'text', nullable: true })
    addressLine1!: string;

    @Column({ type: 'text', nullable: true })
    addressLine2!: string;

    @Column({ type: 'text', nullable: true })
    city!: string;

    @Column({ type: 'text', nullable: true })
    state!: string;

    @Column({ type: 'text', nullable: true })
    zipCode!: string;

    @ManyToOne(() => Locality, (locality) => locality.users, { nullable: true })
    locality!: Relation<Locality>;

    @Column({ type: 'int', default: 0 })
    credits!: number;

    @Column({ type: 'date', nullable: true })
    dateOfBirth!: Date;

    // Student-specific fields
    @Column({ type: 'text', nullable: true })
    schoolName!: string;

    @Column({ type: 'text', nullable: true })
    grade!: string;

    // Academician-specific fields
    @Column({ type: 'text', nullable: true })
    university!: string;

    @Column({ type: 'text', nullable: true })
    majors!: string;

    @Column({ type: 'text', nullable: true })
    securityQuestion!: string;

    @Column({ type: 'text', nullable: true })
    securityAnswerHash!: string;

    @OneToMany(() => Book, (book) => book.owner)
    books!: Book[];

    @OneToMany(() => ExchangeRequest, (request) => request.requester)
    requests!: ExchangeRequest[];

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
