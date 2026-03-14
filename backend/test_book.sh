#!/bin/bash

# 1. Login to get token
echo "Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "password123"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "Login failed"
  echo $LOGIN_RESPONSE
  exit 1
fi

echo "Token: $TOKEN"

# 2. Add Book (The Great Gatsby: 9780743273565, or Harry Potter: 9780747532743)
echo -e "\n\nAdding Book (9780743273565)..."
curl -X POST http://localhost:3001/api/books \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "isbn": "9780743273565",
    "condition": "Good",
    "isForExchange": true,
    "isForSale": false
  }'

# 3. List Books
echo -e "\n\nListing Books..."
curl -X GET http://localhost:3001/api/books
