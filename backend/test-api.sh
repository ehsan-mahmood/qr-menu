#!/bin/bash

# QR Menu API Test Script
# Usage: ./test-api.sh

BASE_URL="http://localhost:8000/api"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=========================================="
echo "QR Menu API Test Script"
echo "=========================================="
echo ""

# Test 1: Health Check
echo -e "${YELLOW}Test 1: Health Check${NC}"
response=$(curl -s http://localhost:8000/health)
echo "Response: $response"
echo ""

# Test 2: Sign Up
echo -e "${YELLOW}Test 2: Sign Up (Create new merchant)${NC}"
SIGNUP_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Merchant",
    "email": "test@example.com",
    "phone": "+1234567890",
    "password": "test123456"
  }')
echo "Response: $SIGNUP_RESPONSE"
TOKEN=$(echo $SIGNUP_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
if [ -z "$TOKEN" ]; then
  echo -e "${RED}Failed to get token. User may already exist.${NC}"
  echo "Trying login instead..."
  LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{
      "email": "test@example.com",
      "password": "test123456",
      "rememberMe": false
    }')
  TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
  echo "Login response: $LOGIN_RESPONSE"
fi
echo "Token: ${TOKEN:0:50}..."
echo ""

if [ -z "$TOKEN" ]; then
  echo -e "${RED}Could not get authentication token. Exiting.${NC}"
  exit 1
fi

# Test 3: Verify Token
echo -e "${YELLOW}Test 3: Verify Token${NC}"
VERIFY_RESPONSE=$(curl -s -X GET "$BASE_URL/auth/verify" \
  -H "Authorization: Bearer $TOKEN")
echo "Response: $VERIFY_RESPONSE"
echo ""

# Test 4: Get Merchant Info (from verify response)
MERCHANT_ID=$(echo $VERIFY_RESPONSE | grep -o '"merchantId":"[^"]*' | cut -d'"' -f4)
if [ -z "$MERCHANT_ID" ]; then
  MERCHANT_ID="merchant-001" # Fallback
  echo -e "${YELLOW}Using fallback merchant ID: $MERCHANT_ID${NC}"
fi
echo "Merchant ID: $MERCHANT_ID"
echo ""

# Test 5: Create Menu
echo -e "${YELLOW}Test 5: Create Menu${NC}"
MENU_RESPONSE=$(curl -s -X POST "$BASE_URL/menu" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"merchantId\": \"$MERCHANT_ID\",
    \"menuName\": \"Test Menu\",
    \"orderEnabled\": true,
    \"sections\": [
      {
        \"name\": \"Coffee\",
        \"items\": [
          {
            \"name\": \"Espresso\",
            \"description\": \"Strong Italian coffee\",
            \"price\": 3.50,
            \"category\": \"Coffee\",
            \"available\": true
          },
          {
            \"name\": \"Cappuccino\",
            \"description\": \"Espresso with steamed milk\",
            \"price\": 4.50,
            \"category\": \"Coffee\",
            \"available\": true
          }
        ]
      },
      {
        \"name\": \"Pastries\",
        \"items\": [
          {
            \"name\": \"Croissant\",
            \"description\": \"Buttery French pastry\",
            \"price\": 3.00,
            \"category\": \"Pastry\",
            \"available\": true
          }
        ]
      }
    ]
  }")
echo "Response: $MENU_RESPONSE"
MENU_ID=$(echo $MENU_RESPONSE | grep -o '"menuId":"[^"]*' | cut -d'"' -f4)
if [ -z "$MENU_ID" ]; then
  echo -e "${YELLOW}Menu may already exist. Getting existing menu...${NC}"
  # Try to get menu by merchant
  MENU_ID="menu-001" # Fallback
fi
echo "Menu ID: $MENU_ID"
echo ""

# Test 6: Get Menu
echo -e "${YELLOW}Test 6: Get Menu by ID${NC}"
GET_MENU_RESPONSE=$(curl -s -X GET "$BASE_URL/menu/$MENU_ID")
echo "Response: $GET_MENU_RESPONSE"
echo ""

# Test 7: Create Order
echo -e "${YELLOW}Test 7: Create Order${NC}"
ORDER_RESPONSE=$(curl -s -X POST "$BASE_URL/orders" \
  -H "Content-Type: application/json" \
  -d "{
    \"tableNumber\": \"5\",
    \"customerName\": \"John Customer\",
    \"menuId\": \"$MENU_ID\",
    \"merchantId\": \"$MERCHANT_ID\",
    \"items\": [
      {
        \"itemId\": \"item-001\",
        \"name\": \"Espresso\",
        \"quantity\": 2,
        \"price\": 3.50
      }
    ],
    \"totalAmount\": 7.00,
    \"specialInstructions\": \"No sugar please\"
  }")
echo "Response: $ORDER_RESPONSE"
ORDER_ID=$(echo $ORDER_RESPONSE | grep -o '"orderId":"[^"]*' | cut -d'"' -f4)
echo "Order ID: $ORDER_ID"
echo ""

# Test 8: Post Analytics Event
echo -e "${YELLOW}Test 8: Post Analytics Event${NC}"
ANALYTICS_RESPONSE=$(curl -s -X POST "$BASE_URL/analytics/events" \
  -H "Content-Type: application/json" \
  -d "{
    \"eventType\": \"item_added\",
    \"menuId\": \"$MENU_ID\",
    \"merchantId\": \"$MERCHANT_ID\",
    \"itemId\": \"item-001\",
    \"itemName\": \"Espresso\",
    \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"
  }")
echo "Response: $ANALYTICS_RESPONSE"
echo ""

echo "=========================================="
echo -e "${GREEN}Tests completed!${NC}"
echo "=========================================="

