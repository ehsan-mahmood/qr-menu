# QR Menu - Backend API Specification

## Overview
This document defines all API endpoints that the frontend Vue application expects from the backend. All responses should follow a consistent format with proper HTTP status codes.

---

## Base Configuration
- **Base URL**: `/api` (configurable via `VITE_API_BASE_URL`)
- **Timeout**: 10 seconds (30 seconds for OCR endpoints)
- **Authentication**: JWT token in `Authorization: Bearer <token>` header

---

## Response Format Standards

### Success Response (200)
```json
{
  "messageId": "OPERATION_SUCCESS",
  "receivingId": "unique-id-123",
  "data": { ... }
}
```

### Error Response (4xx/5xx)
```json
{
  "messageId": "ERROR_CODE",
  "error": "Error description",
  "details": { ... }
}
```

**Note**: All success responses (200) should include `messageId` and `receivingId` at the top level for consistency.

---

## 1. Authentication Endpoints

### 1.1 Login
**POST** `/auth/login`

**Request Body:**
```json
{
  "email": "merchant@example.com",
  "password": "password123",
  "rememberMe": true
}
```

**Response (200):**
```json
{
  "messageId": "LOGIN_SUCCESS",
  "receivingId": "session-abc123",
  "token": "jwt-token-here",
  "user": {
    "id": "user-001",
    "name": "John Doe",
    "email": "merchant@example.com",
    "merchantId": "merchant-001",
    "restaurantName": "The Coffee House",
    "businessType": "cafe",
    "phone": "+1234567890"
  }
}
```

**Error Responses:**
- `401`: Invalid credentials
- `400`: Missing required fields

---

### 1.2 Sign Up
**POST** `/auth/signup`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "merchant@example.com",
  "phone": "+1234567890",
  "password": "password123"
}
```

**Response (201):**
```json
{
  "messageId": "SIGNUP_SUCCESS",
  "receivingId": "user-123",
  "token": "jwt-token-here",
  "user": {
    "id": "user-123",
    "name": "John Doe",
    "email": "merchant@example.com",
    "phone": "+1234567890",
    "merchantId": "merchant-123"
  }
}
```

**Error Responses:**
- `409`: Email already exists
- `400`: Invalid data or password too short

---

### 1.3 Verify Token
**GET** `/auth/verify`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "messageId": "TOKEN_VALID",
  "user": {
    "id": "user-001",
    "name": "John Doe",
    "email": "merchant@example.com",
    "merchantId": "merchant-001"
  }
}
```

---

## 2. Menu Endpoints

### 2.1 Get Menu by QR Token
**GET** `/menu/qr/:qrToken`

**Parameters:**
- `qrToken` (path): QR code token string

**Response (200):**
```json
{
  "messageId": "MENU_RETRIEVED",
  "receivingId": "menu-001",
  "data": {
    "menuId": "menu-001",
    "merchantId": "merchant-001",
    "merchantName": "The Coffee House",
    "orderEnabled": true,
    "sections": [
      {
        "id": "section-001",
        "name": "Coffee",
        "items": [
          {
            "id": "item-001",
            "name": "Espresso",
            "description": "Strong Italian coffee",
            "price": 3.50,
            "image": "https://example.com/espresso.jpg",
            "category": "Coffee",
            "available": true
          }
        ]
      }
    ]
  }
}
```

---

### 2.2 Get Menu by ID
**GET** `/menu/:menuId`

**Parameters:**
- `menuId` (path): Menu ID

**Response (200):**
Same structure as 2.1

---

### 2.3 Get Menu Items
**GET** `/menu/:menuId/items`

**Response (200):**
```json
{
  "messageId": "ITEMS_RETRIEVED",
  "receivingId": "menu-001",
  "data": [
    {
      "id": "item-001",
      "name": "Espresso",
      "description": "Strong Italian coffee",
      "price": 3.50,
      "image": "https://example.com/espresso.jpg",
      "category": "Coffee",
      "available": true,
      "sectionId": "section-001"
    }
  ]
}
```

---

### 2.4 Get Menu Configuration
**GET** `/menu/:menuId/config`

**Response (200):**
```json
{
  "messageId": "CONFIG_RETRIEVED",
  "receivingId": "menu-001",
  "data": {
    "orderEnabled": true,
    "currency": "USD",
    "taxRate": 0.08,
    "serviceCharge": 0.00
  }
}
```

---

### 2.5 Create/Update Menu (Merchant Only)
**POST** `/menu`

**Headers:**
```
Authorization: Bearer <merchant-token>
```

**Request Body:**
```json
{
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
}
```

**Response (201):**
```json
{
  "messageId": "MENU_CREATED",
  "receivingId": "menu-123",
  "menu": {
    "menuId": "menu-123",
    "merchantId": "merchant-001",
    "menuName": "Main Menu",
    "createdAt": "2025-12-28T10:00:00Z"
  }
}
```

---

## 3. Order Endpoints

### 3.1 Create Order
**POST** `/orders`

**Request Body:**
```json
{
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
    },
    {
      "itemId": "item-002",
      "name": "Croissant",
      "quantity": 1,
      "price": 3.00
    }
  ],
  "totalAmount": 10.00,
  "specialInstructions": "No sugar please"
}
```

**Response (201):**
```json
{
  "messageId": "ORDER_CREATED",
  "receivingId": "order-abc123",
  "order": {
    "orderId": "order-abc123",
    "tableNumber": "5",
    "customerName": "John Customer",
    "status": "pending",
    "items": [...],
    "totalAmount": 10.00,
    "specialInstructions": "No sugar please",
    "createdAt": "2025-12-28T10:00:00Z"
  }
}
```

**Error Responses:**
- `400`: Invalid order data
- `404`: Menu or items not found

---

### 3.2 Get Order by ID
**GET** `/orders/:orderId`

**Response (200):**
```json
{
  "messageId": "ORDER_RETRIEVED",
  "receivingId": "order-abc123",
  "data": {
    "orderId": "order-abc123",
    "tableNumber": "5",
    "customerName": "John Customer",
    "status": "pending",
    "items": [...],
    "totalAmount": 10.00,
    "createdAt": "2025-12-28T10:00:00Z"
  }
}
```

---

### 3.3 Update Order Status (Merchant Only)
**PATCH** `/orders/:orderId`

**Headers:**
```
Authorization: Bearer <merchant-token>
```

**Request Body:**
```json
{
  "status": "preparing"
}
```

**Valid statuses:** `pending`, `preparing`, `ready`, `served`, `cancelled`

**Response (200):**
```json
{
  "messageId": "ORDER_UPDATED",
  "receivingId": "order-abc123",
  "status": "preparing"
}
```

---

### 3.4 Get All Orders (Merchant Only)
**GET** `/orders?merchantId=merchant-001`

**Headers:**
```
Authorization: Bearer <merchant-token>
```

**Query Parameters:**
- `merchantId` (required): Merchant ID
- `status` (optional): Filter by status
- `date` (optional): Filter by date (ISO format)

**Response (200):**
```json
{
  "messageId": "ORDERS_RETRIEVED",
  "receivingId": "merchant-001",
  "data": [
    {
      "orderId": "order-abc123",
      "tableNumber": "5",
      "status": "pending",
      "totalAmount": 10.00,
      "createdAt": "2025-12-28T10:00:00Z"
    }
  ]
}
```

---

## 4. QR Code Endpoints

### 4.1 Create QR Code (Merchant Only)
**POST** `/qr/codes`

**Headers:**
```
Authorization: Bearer <merchant-token>
```

**Request Body:**
```json
{
  "merchantId": "merchant-001",
  "menuId": "menu-001",
  "tableNumber": "5",
  "location": "Main Dining Area"
}
```

**Response (201):**
```json
{
  "messageId": "QR_CREATED",
  "receivingId": "qr-xyz789",
  "qrCode": {
    "qrToken": "token-xyz789",
    "qrCodeUrl": "https://api.example.com/qr/qr-xyz789.png",
    "merchantId": "merchant-001",
    "menuId": "menu-001",
    "tableNumber": "5",
    "location": "Main Dining Area",
    "createdAt": "2025-12-28T10:00:00Z"
  }
}
```

---

### 4.2 Get QR Code Data
**GET** `/qr/codes/:qrToken`

**Response (200):**
```json
{
  "messageId": "QR_DATA_RETRIEVED",
  "receivingId": "qr-xyz789",
  "data": {
    "qrToken": "token-xyz789",
    "merchantId": "merchant-001",
    "menuId": "menu-001",
    "tableNumber": "5",
    "location": "Main Dining Area",
    "isActive": true
  }
}
```

---

### 4.3 Get Merchant QR Codes
**GET** `/qr/merchant/:merchantId`

**Headers:**
```
Authorization: Bearer <merchant-token>
```

**Response (200):**
```json
{
  "messageId": "QR_CODES_RETRIEVED",
  "receivingId": "merchant-001",
  "data": [
    {
      "qrToken": "token-xyz789",
      "qrCodeUrl": "https://api.example.com/qr/qr-xyz789.png",
      "tableNumber": "5",
      "location": "Main Dining Area",
      "isActive": true,
      "createdAt": "2025-12-28T10:00:00Z"
    }
  ]
}
```

---

## 5. Analytics Endpoints

### 5.1 Post Analytics Event
**POST** `/analytics/events`

**Request Body:**
```json
{
  "eventType": "item_added",
  "menuId": "menu-001",
  "itemId": "item-001",
  "itemName": "Espresso",
  "timestamp": "2025-12-28T10:00:00Z"
}
```

**Event Types:**
- `menu_view`: Customer viewed menu
- `item_click`: Customer clicked on item
- `item_added`: Customer added item to basket
- `order_placed`: Customer placed order
- `qr_scan`: QR code was scanned

**Response (201):**
```json
{
  "messageId": "EVENT_RECORDED",
  "receivingId": "event-123",
  "success": true
}
```

---

### 5.2 Get Dashboard Analytics (Merchant Only)
**GET** `/analytics/dashboard/:merchantId`

**Headers:**
```
Authorization: Bearer <merchant-token>
```

**Query Parameters:**
- `startDate` (optional): ISO date string
- `endDate` (optional): ISO date string

**Response (200):**
```json
{
  "messageId": "ANALYTICS_RETRIEVED",
  "receivingId": "merchant-001",
  "data": {
    "totalScans": 245,
    "totalOrders": 89,
    "avgOrderValue": 15.50,
    "topItems": [
      {
        "itemId": "item-001",
        "name": "Espresso",
        "orderCount": 45,
        "revenue": 157.50
      }
    ],
    "recentOrders": [
      {
        "orderId": "order-123",
        "tableNumber": "5",
        "totalAmount": 10.00,
        "status": "pending",
        "timestamp": "2025-12-28T10:00:00Z"
      }
    ]
  }
}
```

---

### 5.3 Get Top Items (Merchant Only)
**GET** `/analytics/top-items/:merchantId`

**Headers:**
```
Authorization: Bearer <merchant-token>
```

**Query Parameters:**
- `limit` (optional): Number of items to return (default: 10)

**Response (200):**
```json
{
  "messageId": "TOP_ITEMS_RETRIEVED",
  "receivingId": "merchant-001",
  "data": [
    {
      "itemId": "item-001",
      "name": "Espresso",
      "category": "Coffee",
      "orderCount": 45,
      "revenue": 157.50,
      "avgRating": 4.5
    }
  ]
}
```

---

## 6. OCR Endpoints

### 6.1 Parse Menu Image
**POST** `/ocr/parse`

**Headers:**
```
Authorization: Bearer <merchant-token>
Content-Type: multipart/form-data
```

**Request Body (multipart/form-data):**
```
image: <image file>
merchantId: merchant-001
```

**Supported Formats:** JPG, PNG (max 10MB)

**Response (200):**
```json
{
  "messageId": "OCR_PARSED",
  "receivingId": "ocr-abc123",
  "parsedText": "Coffee Menu\nEspresso $3.50\nCappuccino $4.50...",
  "confidence": 0.95,
  "sections": [
    {
      "name": "Coffee",
      "items": [
        {
          "name": "Espresso",
          "price": 3.50,
          "description": ""
        }
      ]
    }
  ]
}
```

**Note:** In test mode, frontend uses Tesseract.js to process OCR locally. Backend should use a more robust OCR service (e.g., Google Cloud Vision, AWS Textract).

---

### 6.2 Get OCR Status
**GET** `/ocr/status/:ocrId`

**Headers:**
```
Authorization: Bearer <merchant-token>
```

**Response (200):**
```json
{
  "messageId": "OCR_STATUS",
  "receivingId": "ocr-abc123",
  "data": {
    "ocrId": "ocr-abc123",
    "status": "completed",
    "progress": 100,
    "result": {
      "parsedText": "...",
      "sections": [...]
    }
  }
}
```

**Statuses:** `processing`, `completed`, `failed`

---

## 7. Onboarding Endpoints

### 7.1 Complete Onboarding (Merchant Only)
**POST** `/merchants/onboarding`

**Headers:**
```
Authorization: Bearer <merchant-token>
```

**Request Body:**
```json
{
  "merchantId": "merchant-001",
  "restaurantName": "The Coffee House",
  "businessType": "cafe",
  "address": "123 Main St, City, State",
  "menuData": {
    "sections": [
      {
        "name": "Coffee",
        "items": [
          {
            "name": "Espresso",
            "price": 3.50,
            "category": "Coffee",
            "description": "Strong Italian coffee"
          }
        ]
      }
    ]
  }
}
```

**Response (200):**
```json
{
  "messageId": "ONBOARDING_COMPLETED",
  "receivingId": "merchant-001",
  "merchant": {
    "merchantId": "merchant-001",
    "restaurantName": "The Coffee House",
    "businessType": "cafe",
    "menuId": "menu-123",
    "onboardingCompleted": true
  }
}
```

---

### 7.2 Upload Menu Item Images
**POST** `/merchants/menu-images`

**Headers:**
```
Authorization: Bearer <merchant-token>
Content-Type: multipart/form-data
```

**Request Body (multipart/form-data):**
```
merchantId: merchant-001
itemId: item-001
image: <image file>
```

**Response (200):**
```json
{
  "messageId": "IMAGE_UPLOADED",
  "receivingId": "item-001",
  "imageUrl": "https://cdn.example.com/menu-images/item-001.jpg"
}
```

---

## 8. File Upload Requirements

### Image Uploads
- **Max Size**: 10MB
- **Formats**: JPG, PNG, WebP
- **Storage**: Images should be stored on CDN or cloud storage (AWS S3, Cloudflare R2, etc.)
- **Response**: Always return public URL to uploaded image

---

## Error Codes Reference

| Code | Message | Description |
|------|---------|-------------|
| 400 | BAD_REQUEST | Invalid request data |
| 401 | UNAUTHORIZED | Missing or invalid token |
| 403 | FORBIDDEN | Insufficient permissions |
| 404 | NOT_FOUND | Resource not found |
| 409 | CONFLICT | Resource already exists |
| 422 | VALIDATION_ERROR | Data validation failed |
| 500 | INTERNAL_ERROR | Server error |

---

## Notes for Backend Engineer

1. **Authentication**: Implement JWT-based authentication. Tokens should expire after 24 hours (or 30 days if "remember me" is checked).

2. **CORS**: Enable CORS for frontend domain (http://localhost:3000, http://localhost:3001 for development).

3. **Rate Limiting**: Implement rate limiting on authentication endpoints (5 attempts per minute).

4. **Database Schema**: You'll need tables/collections for:
   - Users/Merchants
   - Menus
   - Menu Items
   - Orders
   - QR Codes
   - Analytics Events

5. **Real-time Updates**: Consider WebSocket or Server-Sent Events for real-time order status updates to merchant dashboard.

6. **Image Processing**: For OCR, recommend using Google Cloud Vision API or AWS Textract for production.

7. **Testing**: Frontend is currently in TEST_MODE. All endpoints are mocked. Backend should match these mock response structures exactly.

8. **Consistent Format**: ALL success responses must include `messageId` and `receivingId` at the top level as shown in examples.

---

## Environment Variables

Backend should expose these configuration options:

```env
PORT=8000
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
JWT_EXPIRY=24h
CORS_ORIGIN=http://localhost:3000
AWS_S3_BUCKET=menu-images
CDN_URL=https://cdn.example.com
OCR_API_KEY=your-ocr-api-key
```

---

## Getting Started

1. Set up your preferred backend framework (Node.js/Express, Python/FastAPI, Go/Gin, etc.)
2. Create database schema matching the data structures above
3. Implement authentication middleware
4. Build endpoints following this specification
5. Test each endpoint with the expected request/response formats
6. Update `VITE_API_BASE_URL` in frontend `.env` file to point to your backend
7. Disable `TEST_MODE` in frontend config once backend is ready

---

## Questions?

If you need clarification on any endpoint or want to suggest changes to the API design, please document them and we can discuss.

**Last Updated**: December 28, 2025

