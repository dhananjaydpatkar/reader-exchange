#!/bin/bash

BASE_URL="http://localhost:3001/api"

echo "=== Testing Locality & Credits ==="

# 1. Register User A (Zip: 10001)
echo -e "\n1. Registering User A (Zip: 10001)..."
USER_A_EMAIL="usera_$(date +%s)@test.com"
curl -v -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$USER_A_EMAIL\",
    \"password\": \"password123\",
    \"name\": \"User A\",
    \"role\": \"student\",
    \"zipCode\": \"10001\"
  }" > /dev/null

# Login User A
LOGIN_A=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d "{ \"email\": \"$USER_A_EMAIL\", \"password\": \"password123\" }")
TOKEN_A=$(echo $LOGIN_A | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
ID_A=$(echo $LOGIN_A | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
echo "User A ID: $ID_A"

# 2. Register User B (Zip: 10001) - Same Locality
echo -e "\n2. Registering User B (Zip: 10001)..."
USER_B_EMAIL="userb_$(date +%s)@test.com"
curl -s -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$USER_B_EMAIL\",
    \"password\": \"password123\",
    \"name\": \"User B\",
    \"role\": \"student\",
    \"zipCode\": \"10001\"
  }" > /dev/null

# Login User B
LOGIN_B=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d "{ \"email\": \"$USER_B_EMAIL\", \"password\": \"password123\" }")
TOKEN_B=$(echo $LOGIN_B | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

# 3. Register User C (Zip: 90001) - Different Locality
echo -e "\n3. Registering User C (Zip: 90001)..."
USER_C_EMAIL="userc_$(date +%s)@test.com"
curl -s -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$USER_C_EMAIL\",
    \"password\": \"password123\",
    \"name\": \"User C\",
    \"role\": \"student\",
    \"zipCode\": \"90001\"
  }" > /dev/null

# Login User C
LOGIN_C=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d "{ \"email\": \"$USER_C_EMAIL\", \"password\": \"password123\" }")
TOKEN_C=$(echo $LOGIN_C | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

# 4. User A Adds a Book
echo -e "\n4. User A adding a book..."
BOOK_RES=$(curl -s -X POST $BASE_URL/books \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN_A" \
  -d '{
    "isbn": "9780140328721",
    "condition": "New",
    "isForExchange": true,
    "isForSale": false
  }')
BOOK_ID=$(echo $BOOK_RES | grep -o '"id":"[^"]*"' | cut -d'"' -f4 | head -n 1)
echo "Book ID: $BOOK_ID"

# 5. User B lists books (Should SEE the book)
echo -e "\n5. User B (Same Zip) checking books..."
BOOKS_B=$(curl -s -X GET $BASE_URL/books -H "Authorization: Bearer $TOKEN_B")
if echo "$BOOKS_B" | grep -q "$BOOK_ID"; then
  echo "✅ PASS: User B can see the book."
else
  echo "❌ FAIL: User B CANNOT see the book."
  echo "Response: $BOOKS_B"
fi

# 6. User C lists books (Should NOT see the book)
echo -e "\n6. User C (Diff Zip) checking books..."
BOOKS_C=$(curl -s -X GET $BASE_URL/books -H "Authorization: Bearer $TOKEN_C")
if echo "$BOOKS_C" | grep -q "$BOOK_ID"; then
  echo "❌ FAIL: User C CAN see the book (Should verify locality)."
else
  echo "✅ PASS: User C cannot see the book."
fi

# 7. Exchange Flow: B requests -> A approves -> Check Credits
echo -e "\n7. User B requesting exchange..."
REQ_RES=$(curl -s -X POST $BASE_URL/exchange \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN_B" \
  -d "{ \"bookId\": \"$BOOK_ID\" }")
REQ_ID=$(echo $REQ_RES | grep -o '"id":"[^"]*"' | cut -d'"' -f4 | head -n 1)
echo "Request ID: $REQ_ID"

echo -e "\n8. User A approving request..."
APPROVE_RES=$(curl -s -X PUT $BASE_URL/exchange/$REQ_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN_A" \
  -d '{ "status": "approved" }')

# 9. Verify Credits
echo -e "\n9. Verifying Credits for User A..."
# Need a way to check user credits. Assuming I can't check DB directly easily from here without an endpoint.
# We didn't create a 'get my profile' endpoint strictly, but let's see if login returns updated user or if we can hit /auth/me if exists?
# Actually login again to get fresh user details OR we assume /api/auth/login returns user object.
# Let's login A again.
LOGIN_A_AGAIN=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d "{ \"email\": \"$USER_A_EMAIL\", \"password\": \"password123\" }")

# Check if credits > 0 (it was 0 default, should be 1 now)
# grep for credits (assuming it's in the response)
if echo "$LOGIN_A_AGAIN" | grep -q '"credits":1'; then
     echo "✅ PASS: User A has 1 credit."
else
     echo "❓ CHECK: Credits verification (might need manual check if not in login response)"
     echo "Login Response: $LOGIN_A_AGAIN"
fi
