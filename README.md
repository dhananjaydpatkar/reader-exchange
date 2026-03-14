# Reader Exchange Platform

A platform for students and academicians to exchange and trade books.

## Tech Stack

*   **Frontend**: Next.js 15, Tailwind CSS, TypeScript.
*   **Backend**: Node.js, Express, TypeScript, TypeORM.
*   **Database**: PostgreSQL (via Docker).
*   **Infrastructure**: Docker Compose (Local), Google Cloud Run (Target).

## Prerequisites

*   Node.js (v18+)
*   Docker & Docker Compose

## Quick Start (Local Development)

### 1. Database Setup
Start the PostgreSQL database using Docker:
```bash
docker-compose up -d postgres
```

### 2. Backend Setup
Navigate to the backend directory, install dependencies, and start the server:
```bash
cd backend
npm install
```

Ensure you have a `.env` file (created automatically or copy manually):
```properties
PORT=3001
DATABASE_URL=postgres://reader_user:reader_password@localhost:5432/reader_cms
NODE_ENV=development
JWT_SECRET=your_jwt_secret
```

Start the backend server:
```bash
npm run dev
```
*The server will run on `http://localhost:3001`.*

### 3. Frontend Setup
Open a new terminal, navigate to the frontend directory, and start the app:
```bash
cd frontend
npm install
```

Ensure `.env.local` exists:
```properties
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

Start the frontend server:
```bash
npm run dev
```
*The application will run on `http://localhost:3000`.*

## Key Features
*   **User Auth**: Register/Login with JWT.
*   **Book Management**: Add books by ISBN (auto-fetched from Google Books).
*   **Exchange System**: Request books from other users, Approve/Reject flows.

## API Documentation
*   `POST /api/auth/register`: Create account.
*   `POST /api/auth/login`: Sign in.
*   `POST /api/books`: Add book (Body: `{ isbn, condition, isForExchange }`).
*   `GET /api/books`: List all available books.
*   `POST /api/exchange`: Request a book.
