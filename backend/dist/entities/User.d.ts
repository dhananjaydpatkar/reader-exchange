import { Book } from './Book.js';
import { ExchangeRequest } from './ExchangeRequest.js';
import { Locality } from './Locality.js';
export declare enum UserRole {
    STUDENT = "student",
    ACADEMICIAN = "academician",
    PROFESSIONAL = "professional",
    ADMIN = "admin",
    EXCHANGE_ADMIN = "exchange_admin",
    LOCAL_ADMIN = "local_admin"
}
export declare class User {
    id: string;
    email: string;
    passwordHash: string;
    name: string;
    role: UserRole;
    isLocalAdminRequested: boolean;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    zipCode: string;
    locality: Locality;
    credits: number;
    dateOfBirth: Date;
    schoolName: string;
    grade: string;
    university: string;
    majors: string;
    books: Book[];
    requests: ExchangeRequest[];
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=User.d.ts.map