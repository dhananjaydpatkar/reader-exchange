-- ============================================================
-- Reader Exchange - DDL Script for Neon PostgreSQL
-- Generated from TypeORM entities
-- ============================================================

-- 1. Create ENUM types
-- ============================================================

CREATE TYPE "user_role_enum" AS ENUM (
    'student',
    'academician',
    'professional',
    'admin',
    'exchange_admin',
    'local_admin'
);

CREATE TYPE "book_status_enum" AS ENUM (
    'available',
    'pending',
    'exchanged',
    'sold'
);

CREATE TYPE "exchange_request_status_enum" AS ENUM (
    'pending',
    'approved',
    'rejected',
    'collection_pending',
    'collected',
    'dispatched',
    'delivered',
    'completed',
    'cancelled',
    'return_pending',
    'return_collected',
    'return_dispatched',
    'returned'
);

CREATE TYPE "exchange_request_type_enum" AS ENUM (
    'exchange',
    'rent',
    'buy'
);

-- 2. Create Tables
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- LOCALITY
CREATE TABLE "locality" (
    "id"         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "name"       TEXT NOT NULL UNIQUE,
    "pinCode"    TEXT NOT NULL,
    "isLive"     BOOLEAN NOT NULL DEFAULT false,
    "createdAt"  TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt"  TIMESTAMP NOT NULL DEFAULT now()
);

-- USER
CREATE TABLE "user" (
    "id"                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "email"                 TEXT NOT NULL UNIQUE,
    "passwordHash"          TEXT NOT NULL,
    "name"                  TEXT NOT NULL,
    "role"                  "user_role_enum" NOT NULL DEFAULT 'student',
    "isLocalAdminRequested" BOOLEAN NOT NULL DEFAULT false,
    "addressLine1"          TEXT,
    "addressLine2"          TEXT,
    "city"                  TEXT,
    "state"                 TEXT,
    "zipCode"               TEXT,
    "credits"               INTEGER NOT NULL DEFAULT 0,
    "dateOfBirth"           DATE,
    "schoolName"            TEXT,
    "grade"                 TEXT,
    "university"            TEXT,
    "majors"                TEXT,
    "localityId"            UUID,
    "createdAt"             TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt"             TIMESTAMP NOT NULL DEFAULT now(),

    CONSTRAINT "FK_user_locality"
        FOREIGN KEY ("localityId") REFERENCES "locality"("id")
        ON DELETE SET NULL ON UPDATE CASCADE
);

-- BOOK
CREATE TABLE "book" (
    "id"                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "isbn"              TEXT NOT NULL,
    "title"             TEXT NOT NULL,
    "author"            TEXT NOT NULL,
    "publisher"         TEXT,
    "publishedYear"     INTEGER,
    "genre"             TEXT,
    "coverImageUrl"     TEXT,
    "condition"         TEXT,
    "askingPrice"       INTEGER,
    "isForExchange"     BOOLEAN NOT NULL DEFAULT true,
    "isForSale"         BOOLEAN NOT NULL DEFAULT false,
    "isForRent"         BOOLEAN NOT NULL DEFAULT false,
    "rentPrice"         DECIMAL(10,2),
    "rentPriceCurrency" TEXT NOT NULL DEFAULT 'INR',
    "rentDuration"      INTEGER NOT NULL DEFAULT 14,
    "lateFeePerDay"     DECIMAL(10,2),
    "status"            "book_status_enum" NOT NULL DEFAULT 'available',
    "ownershipHistory"  JSONB,
    "ownerId"           UUID,
    "createdAt"         TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt"         TIMESTAMP NOT NULL DEFAULT now(),

    CONSTRAINT "FK_book_owner"
        FOREIGN KEY ("ownerId") REFERENCES "user"("id")
        ON DELETE SET NULL ON UPDATE CASCADE
);

-- EXCHANGE REQUEST
CREATE TABLE "exchange_request" (
    "id"                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "type"              "exchange_request_type_enum" NOT NULL DEFAULT 'exchange',
    "status"            "exchange_request_status_enum" NOT NULL DEFAULT 'pending',
    "rentStartDate"     TIMESTAMP,
    "rentEndDate"       TIMESTAMP,
    "totalAmount"       DECIMAL(10,2),
    "isPaymentSettled"  BOOLEAN NOT NULL DEFAULT false,
    "collectedAt"       TIMESTAMP,
    "dispatchedAt"      TIMESTAMP,
    "deliveredAt"       TIMESTAMP,
    "requesterId"       UUID,
    "bookId"            UUID,
    "originalOwnerId"   UUID,
    "createdAt"         TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt"         TIMESTAMP NOT NULL DEFAULT now(),

    CONSTRAINT "FK_exchange_request_requester"
        FOREIGN KEY ("requesterId") REFERENCES "user"("id")
        ON DELETE SET NULL ON UPDATE CASCADE,

    CONSTRAINT "FK_exchange_request_book"
        FOREIGN KEY ("bookId") REFERENCES "book"("id")
        ON DELETE SET NULL ON UPDATE CASCADE,

    CONSTRAINT "FK_exchange_request_original_owner"
        FOREIGN KEY ("originalOwnerId") REFERENCES "user"("id")
        ON DELETE SET NULL ON UPDATE CASCADE
);

-- 3. Indexes (optional but recommended)
-- ============================================================

CREATE INDEX "IDX_user_email"       ON "user"("email");
CREATE INDEX "IDX_user_zipCode"     ON "user"("zipCode");
CREATE INDEX "IDX_user_locality"    ON "user"("localityId");
CREATE INDEX "IDX_book_owner"       ON "book"("ownerId");
CREATE INDEX "IDX_book_status"      ON "book"("status");
CREATE INDEX "IDX_exchange_req"     ON "exchange_request"("requesterId");
CREATE INDEX "IDX_exchange_book"    ON "exchange_request"("bookId");
CREATE INDEX "IDX_exchange_status"  ON "exchange_request"("status");
CREATE INDEX "IDX_exchange_origown" ON "exchange_request"("originalOwnerId");
