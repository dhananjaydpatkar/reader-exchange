#!/bin/bash

echo "Registering User..."
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "password123",
    "name": "Jane Doe",
    "role": "student",
    "addressLine1": "123 Campus Dr",
    "city": "College Town",
    "zipCode": "12345"
  }'

echo -e "\n\nLogging in..."
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "password123"
  }'
