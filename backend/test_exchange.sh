#!/bin/bash

# 1. Register User A (Owner)
echo "Registering Owner..."
curl -s -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "owner@example.com",
    "password": "password123",
    "name": "Owner User",
    "role": "student"
  }'

# Login Owner
echo -e "\nLogging in Owner..."
OWNER_LOGIN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{ "email": "owner@example.com", "password": "password123" }')
OWNER_TOKEN=$(echo $OWNER_LOGIN | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

# 2. Add Book (Owner)
echo -e "\nAdding Book (Owner)..."
BOOK_RES=$(curl -s -X POST http://localhost:3001/api/books \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -d '{
    "isbn": "9780140328721",
    "condition": "New",
    "isForExchange": true,
    "isForSale": false
  }')
BOOK_ID=$(echo $BOOK_RES | grep -o '"id":"[^"]*"' | cut -d'"' -f4 | head -n 1)
echo "Book ID: $BOOK_ID"

# 3. Register User B (Requester)
echo -e "\nRegistering Requester..."
curl -s -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "requester@example.com",
    "password": "password123",
    "name": "Requester User",
    "role": "student"
  }'

# Login Requester
echo -e "\nLogging in Requester..."
REQ_LOGIN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{ "email": "requester@example.com", "password": "password123" }')
REQ_TOKEN=$(echo $REQ_LOGIN | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

# 4. Request Exchange (Requester)
echo -e "\nRequesting Exchange..."
REQ_RES=$(curl -s -X POST http://localhost:3001/api/exchange \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $REQ_TOKEN" \
  -d "{ \"bookId\": \"$BOOK_ID\" }")
echo "Exchange Response: $REQ_RES"
REQ_ID=$(echo $REQ_RES | grep -o '"id":"[^"]*"' | cut -d'"' -f4 | head -n 1)
echo "Request ID: $REQ_ID"

# 5. List My Requests (Requester)
echo -e "\nChecking Requests (Requester)..."
curl -s -X GET http://localhost:3001/api/exchange \
  -H "Authorization: Bearer $REQ_TOKEN"

# 6. Approve Request (Owner)
echo -e "\nApproving Request (Owner)..."
curl -s -X PUT http://localhost:3001/api/exchange/$REQ_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -d '{ "status": "approved" }'

# 7. Check Book Status (should be EXCHANGED)
echo -e "\nChecking Book Status..."
curl -s -X GET http://localhost:3001/api/books
