# API Testing Guide

This guide shows you how to test the QR Menu API endpoints.

## Quick Test Script

Run the automated test script:

```bash
cd /home/dev/qrmenu/backend
./test-api.sh
```

## Manual Testing with curl

### 1. Health Check
```bash
curl http://localhost:8000/health
```

### 2. Sign Up (Create Merchant Account)
```bash
curl -X POST http://localhost:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Merchant",
    "email": "test@example.com",
    "phone": "+1234567890",
    "password": "test123456"
  }'
```

### 3. Login
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123456",
    "rememberMe": false
  }'
```

Save the `token` from the response for authenticated requests.

### 4. Verify Token
```bash
curl -X GET http://localhost:8000/api/auth/verify \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 5. Create Menu (Protected)
```bash
curl -X POST http://localhost:8000/api/menu \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "merchantId": "merchant-001",
    "menuName": "Main Menu",
    "orderEnabled": true,
    "sections": [
      {
        "name": "Coffee",
        "items": [
          {
            "name": "Espresso",
            "description": "Strong Italian coffee",
            "price": 3.50,
            "category": "Coffee",
            "available": true
          }
        ]
      }
    ]
  }'
```

### 6. Get Menu (Public)
```bash
curl http://localhost:8000/api/menu/MENU_ID_HERE
```

### 7. Create Order (Public)
```bash
curl -X POST http://localhost:8000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "tableNumber": "5",
    "customerName": "John Customer",
    "menuId": "menu-001",
    "merchantId": "merchant-001",
    "items": [
      {
        "itemId": "item-001",
        "name": "Espresso",
        "quantity": 2,
        "price": 3.50
      }
    ],
    "totalAmount": 7.00,
    "specialInstructions": "No sugar"
  }'
```

### 8. Post Analytics Event (Public)
```bash
curl -X POST http://localhost:8000/api/analytics/events \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "item_added",
    "menuId": "menu-001",
    "merchantId": "merchant-001",
    "itemId": "item-001",
    "itemName": "Espresso"
  }'
```

## Testing with HTTPie

If you have `httpie` installed:

```bash
# Sign up
http POST localhost:8000/api/auth/signup \
  name="Test Merchant" \
  email="test@example.com" \
  password="test123456"

# Login
http POST localhost:8000/api/auth/login \
  email="test@example.com" \
  password="test123456"

# Get menu (with token)
http GET localhost:8000/api/menu/menu-001 \
  Authorization:"Bearer YOUR_TOKEN"
```

## Testing with Postman

1. Import the collection (create manually):
   - Base URL: `http://localhost:8000/api`
   - Create requests for each endpoint
   - Set up environment variables:
     - `base_url`: `http://localhost:8000/api`
     - `token`: (set after login)

2. Test flow:
   - Sign up → Get token
   - Login → Get token
   - Use token in Authorization header: `Bearer {token}`
   - Test protected endpoints

## Testing with Frontend

1. Update frontend `.env`:
   ```
   VITE_API_BASE_URL=http://localhost:8000/api
   VITE_TEST_MODE=false
   ```

2. Start frontend:
   ```bash
   cd /home/dev/qrmenu/frontend_vue
   npm run dev
   ```

3. Test through the UI:
   - Sign up / Login
   - Create menu
   - View menu
   - Place orders

## Expected Response Format

All successful responses follow this format:
```json
{
  "messageId": "OPERATION_SUCCESS",
  "receivingId": "unique-id",
  "data": { ... }
}
```

Error responses:
```json
{
  "messageId": "ERROR_CODE",
  "error": "Error description",
  "details": { ... }
}
```

## Common Issues

1. **401 Unauthorized**: Token missing or expired
   - Solution: Login again to get a new token

2. **404 Not Found**: Resource doesn't exist
   - Solution: Check IDs are correct

3. **400 Bad Request**: Invalid data
   - Solution: Check request body matches API spec

4. **Database Connection Error**: DATABASE_URL not configured
   - Solution: Update `.env` with correct PostgreSQL connection string

## Testing Checklist

- [ ] Health check endpoint works
- [ ] Sign up creates user and merchant
- [ ] Login returns JWT token
- [ ] Token verification works
- [ ] Create menu (protected)
- [ ] Get menu (public)
- [ ] Create order (public)
- [ ] Post analytics event (public)
- [ ] Get orders (protected)
- [ ] Update order status (protected)
- [ ] Create QR code (protected)
- [ ] Get QR codes (protected)

