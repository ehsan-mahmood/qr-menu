# QR Menu Backend API

RESTful API backend for the QR Menu system, built with Node.js, TypeScript, Express, and PostgreSQL.

## Features

- JWT-based authentication
- Menu CRUD operations
- Order management
- QR code generation and tracking
- Analytics event tracking
- OCR menu import (AWS Textract)
- Image upload support
- Rate limiting
- CORS enabled

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 12+
- AWS account (for Textract OCR - optional)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `CORS_ORIGIN`: Frontend URL(s)
- AWS credentials (if using Textract)

3. Set up the database:
```bash
npm run migrate
```

This will create all necessary tables and indexes.

## Development

Run the development server with hot reload:
```bash
npm run dev
```

The server will start on `http://localhost:8000` (or the port specified in `.env`).

## Building

Build TypeScript to JavaScript:
```bash
npm run build
```

## Production

Start the production server:
```bash
npm start
```

## API Endpoints

All endpoints are prefixed with `/api`. See `docs/API_SPECIFICATION.md` for complete documentation.

### Authentication
- `POST /api/auth/login` - Merchant login
- `POST /api/auth/signup` - Merchant registration
- `GET /api/auth/verify` - Verify JWT token

### Menus
- `GET /api/menu/qr/:qrToken` - Get menu by QR token
- `GET /api/menu/:menuId` - Get menu by ID
- `GET /api/menu/:menuId/items` - Get menu items
- `GET /api/menu/:menuId/config` - Get menu configuration
- `POST /api/menu` - Create/update menu (protected)

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders/:orderId` - Get order by ID
- `PATCH /api/orders/:orderId` - Update order status (protected)
- `GET /api/orders` - Get all orders (protected)

### QR Codes
- `GET /api/qr/codes/:qrToken` - Get QR code data
- `POST /api/qr/codes` - Create QR code (protected)
- `GET /api/qr/merchant/:merchantId` - Get merchant QR codes (protected)

### Analytics
- `POST /api/analytics/events` - Post analytics event
- `GET /api/analytics/dashboard/:merchantId` - Get dashboard analytics (protected)
- `GET /api/analytics/top-items/:merchantId` - Get top items (protected)

### OCR
- `POST /api/ocr/parse` - Parse menu image (protected)
- `GET /api/ocr/status/:ocrId` - Get OCR status (protected)

### Onboarding
- `POST /api/merchants/onboarding` - Complete onboarding (protected)
- `POST /api/merchants/menu-images` - Upload menu item image (protected)

## Response Format

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

## Authentication

Protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

Tokens expire after 24 hours (or 30 days with "remember me").

## Database Schema

See `src/db/schema.sql` for the complete database schema. Key tables:
- `users` - Merchant user accounts
- `merchants` - Merchant business information
- `menus` - Menu definitions
- `menu_sections` - Menu sections/categories
- `menu_items` - Individual menu items
- `orders` - Customer orders
- `qr_codes` - QR code records
- `analytics_events` - Event tracking

## Environment Variables

- `PORT` - Server port (default: 8000)
- `NODE_ENV` - Environment (development/production)
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - JWT signing secret
- `JWT_EXPIRY` - JWT expiration (default: 24h)
- `JWT_REMEMBER_ME_EXPIRY` - Remember me expiration (default: 30d)
- `CORS_ORIGIN` - Allowed CORS origins (comma-separated)
- `AWS_S3_BUCKET` - S3 bucket for image storage
- `AWS_REGION` - AWS region
- `AWS_ACCESS_KEY_ID` - AWS access key
- `AWS_SECRET_ACCESS_KEY` - AWS secret key
- `AWS_TEXTRACT_REGION` - Textract region
- `CDN_URL` - CDN URL for images
- `FRONTEND_URL` - Frontend URL for QR codes

## Rate Limiting

- General API: 100 requests per minute per IP
- Authentication endpoints: 5 requests per minute per IP

## Error Handling

The API uses consistent error responses with appropriate HTTP status codes:
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Validation Error
- `500` - Internal Server Error

## Testing

The frontend includes test mode with mocked APIs. To test with the real backend:
1. Set `VITE_TEST_MODE=false` in frontend `.env`
2. Set `VITE_API_BASE_URL=http://localhost:8000/api` in frontend `.env`
3. Start both frontend and backend servers

## Deployment

### AWS Lambda (Serverless)

The code can be adapted for AWS Lambda deployment using:
- Serverless Framework
- AWS SAM
- AWS CDK

### Traditional Server

Deploy to any Node.js hosting service:
- Heroku
- DigitalOcean
- AWS EC2
- Railway
- Render

Ensure:
- PostgreSQL database is accessible
- Environment variables are set
- Database migrations are run
- CORS is configured for your frontend domain

## License

ISC

