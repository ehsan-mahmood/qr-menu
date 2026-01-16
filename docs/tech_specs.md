# QR Menu Visibility – Summarised Technical Specification

**Purpose:**
Build a low-cost, fast, demo-ready QR menu system where **demo flow = real setup flow**. Primary goals are **WOW factor**, **fast menu setup via OCR**, **smooth mobile UX**, and **minimal AWS cost**, while keeping the system scalable and easy to hand over to future developers.

---

## 1. High-Level Architecture

```
Mobile Browser (Customer / Merchant)
        ↓
Cloudflare CDN (cache public menu pages)
        ↓
Vue.js SPA (Frontend - Vite/Pinia/Vue Router)
        ↓
Backend API (RESTful JSON)
        ↓
AWS Lambda (serverless execution)
        ↓
PostgreSQL (RDS t4g.micro)
        ↓
S3 (QR images, menu item images, assets)

External Services:
- OCR: AWS Textract (on-demand) or Tesseract.js (test mode)
- CDN: Cloudflare (static assets, image delivery)
```

### Architecture Notes
- **Frontend**: Standalone Vue.js SPA, can be hosted separately from backend
- **Backend**: Stateless REST API, any framework/language (Node.js recommended)
- **Database**: PostgreSQL for relational data (merchants, menus, orders, events)
- **Storage**: S3 for images and generated QR codes
- **Test Mode**: Frontend works completely offline with mocked APIs

---

## 2. Frontend Specification

### Technology
- **Framework:** Vue.js 3 (Composition API)
- **State Management:** Pinia
- **Routing:** Vue Router
- **Styling:** Tailwind CSS
- **Build Tool:** Vite
- **Target:** Mobile-first (customers), Mobile + Desktop (merchants)

### Key Frontend Pages

#### 2.1 Login / Authentication (Root)
- Merchant login page at root (`/`)
- Sign up flow with validation
- JWT token-based authentication
- Session persistence (localStorage/sessionStorage)

#### 2.2 Onboarding Flow (New Merchants)
**Step 1: Business Details**
- Restaurant/company name
- Business type (café, restaurant, bar, etc.)
- Address (optional)

**Step 2: Menu Upload**
- Three options:
  - Photo/OCR upload (uses Tesseract.js in browser for test mode)
  - CSV file upload
  - Manual entry
- Drag & drop support
- Progress feedback

**Step 3: Menu Items & Images**
- Add/edit menu items
- Upload item images
- Set prices, categories
- Preview before completion

#### 2.3 Public Menu Page (`/menu/:menuId`)
- **Customer-facing, isolated experience**
- No navigation to merchant pages
- Fast-loading mobile menu with two design themes:
  - **Design A:** "Paper Menu" - Traditional, warm aesthetic
  - **Design B:** "Modern Food App" - Card-based, vibrant
- Section-based navigation
- Item details modal
- Add to basket functionality
- Floating basket button

#### 2.4 Basket Page (`/basket`)
- Order summary
- Customer info capture (table number or name)
- Quantity controls
- Special instructions
- Place order (if ordering enabled)
- Order confirmation modal

#### 2.5 Merchant Dashboard (`/dashboard`)
- Protected route (requires authentication)
- Total scans (7/30 days)
- Total orders
- Average order value
- Top items list
- Recent orders table
- Logout functionality

#### 2.6 QR Management (`/qr`)
- QR code scanner component
- View active QR codes
- Link QR to menu
- Table assignment

#### 2.7 OCR Import (`/ocr`)
- Menu photo upload
- Real-time OCR processing (Tesseract.js in test mode)
- Parsed menu review & edit
- Save to menu

### State Management (Pinia Stores)
- **authStore:** User authentication, merchant data
- **menuStore:** Menu data, sections, items, config
- **basketStore:** Shopping cart, customer info
- **qrStore:** QR code data, table numbers
- **analyticsStore:** Event tracking, dashboard data
- **themeStore:** UI theme switching (Design A/B)

### Routing Strategy
- **Public routes:** `/menu/:menuId`, `/basket` (no auth required)
- **Protected routes:** `/dashboard`, `/qr`, `/ocr`, `/onboarding` (auth required)
- **Guest routes:** `/` (login), `/signup` (redirect to dashboard if authenticated)
- Navigation guards for route protection

### Design System
- **Colors:** Cream background (#FAF7F2), Primary orange (#FF8360), Charcoal text
- **Components:** Reusable card, button, input components
- **Responsive:** Mobile-first with desktop breakpoints
- **Animations:** Smooth transitions, modal animations

### Test Mode
- All API calls mocked with realistic delays
- Works completely offline
- Browser-based OCR using Tesseract.js
- Console logging for debugging
- Easy toggle via environment variable

---

## 3. Backend Specification

### Technology
- **Runtime:** Node.js + TypeScript (or any backend framework)
- **API Format:** RESTful JSON API
- **Deployment:** AWS Lambda (or any serverless platform)
- **API Base URL:** `/api`

### Core Responsibilities
- Merchant authentication (JWT)
- Menu CRUD operations
- Order management
- QR code generation and tracking
- Event ingestion and analytics
- OCR processing (AWS Textract recommended)
- Image storage and CDN delivery

### API Specification
See `/backend/API_SPECIFICATION.md` for complete endpoint documentation including:
- Request/response formats
- Authentication requirements
- Error handling
- All data structures

### OCR Flow
1. Receive image upload (multipart/form-data)
2. Send to AWS Textract (or similar OCR service)
3. Receive text blocks
4. Parse into structured menu JSON (sections, items, prices)
5. Return editable menu data to frontend

### Response Format Standards
All successful responses (200) include:
```json
{
  "messageId": "OPERATION_SUCCESS",
  "receivingId": "unique-id",
  "data": { ... }
}
```

### Authentication
- JWT token-based
- Token in `Authorization: Bearer <token>` header
- 24-hour expiry (30 days with "remember me")
- Route protection for merchant endpoints

---

## 4. Database Specification (PostgreSQL)

### Tables

#### 4.1 users (merchants)
```sql
id (pk)
name
email (unique)
password_hash
phone (nullable)
created_at
updated_at
```

#### 4.2 merchants
```sql
id (pk)
user_id (fk)
restaurant_name
business_type -- cafe | restaurant | bar | food-truck | bakery | other
address (nullable)
slug (unique)
onboarding_completed
created_at
updated_at
```

#### 4.3 menus
```sql
id (pk)
merchant_id (fk)
menu_name
order_enabled (boolean)
created_at
updated_at
```

#### 4.4 menu_sections
```sql
id (pk)
menu_id (fk)
name
sort_order
created_at
```

#### 4.5 menu_items
```sql
id (pk)
section_id (fk)
name
description (nullable)
price (decimal)
category
image_url (nullable)
available (boolean, default true)
sort_order
created_at
updated_at
```

#### 4.6 orders
```sql
id (pk)
merchant_id (fk)
menu_id (fk)
table_number (nullable)
customer_name (nullable)
status -- pending | preparing | ready | served | cancelled
items (jsonb) -- array of order items
total_amount (decimal)
special_instructions (nullable)
created_at
updated_at
```

#### 4.7 qr_codes
```sql
id (pk)
merchant_id (fk)
menu_id (fk)
qr_token (unique)
qr_code_url
table_number (nullable)
location (nullable)
is_active (boolean)
created_at
```

#### 4.8 analytics_events
```sql
id (pk)
merchant_id (fk)
menu_id (nullable)
event_type  -- qr_scan | menu_view | item_click | item_added | order_placed
item_id (nullable)
item_name (nullable)
metadata (jsonb, nullable)
created_at
```

#### 4.9 sessions (optional, for JWT refresh)
```sql
id (pk)
user_id (fk)
token_hash
expires_at
created_at
```

---

## 5. Routing Specification

### Public Routes (No Authentication Required)
- `GET /menu/:menuId` → Public menu page (customer-facing)
- `GET /basket` → Shopping basket page
- `POST /api/analytics/events` → Event logging
- `POST /api/orders` → Create order (customer)

### Authentication Routes
- `POST /api/auth/login` → Merchant login
- `POST /api/auth/signup` → Merchant registration
- `GET /api/auth/verify` → Token verification

### Protected Merchant Routes (Authentication Required)
- `GET /dashboard` → Merchant dashboard
- `GET /onboarding` → Onboarding flow
- `GET /qr` → QR code management
- `GET /ocr` → OCR menu import
- `POST /api/menu` → Create/update menu
- `GET /api/menu/:menuId` → Get menu data
- `GET /api/menu/:menuId/config` → Get menu configuration
- `GET /api/orders` → Get merchant orders
- `PATCH /api/orders/:orderId` → Update order status
- `POST /api/qr/codes` → Create QR code
- `GET /api/qr/merchant/:merchantId` → Get merchant QR codes
- `GET /api/analytics/dashboard/:merchantId` → Analytics data
- `GET /api/analytics/top-items/:merchantId` → Top items
- `POST /api/ocr/parse` → OCR image processing
- `POST /api/merchants/onboarding` → Complete onboarding
- `POST /api/merchants/menu-images` → Upload item images

### Route Guards (Frontend)
- Public routes always accessible
- Guest-only routes (login, signup) redirect to dashboard if authenticated
- Protected routes redirect to login if not authenticated

---

## 6. QR Code Strategy (Optimised)

- Store **menu URL / slug** in DB
- Generate QR **once per merchant**
- Save QR PNG/SVG in S3
- Existing QR:
  - Scan → extract URL
  - Store as `original_menu_url`
  - Optional proxy redirect for tracking

---

## 7. Event Tracking

### Event Types
- `qr_scan` - QR code scanned by customer
- `menu_view` - Customer viewed menu page
- `item_click` - Customer clicked on menu item
- `item_added` - Customer added item to basket
- `order_placed` - Customer placed order

### Event Data Structure
```json
{
  "eventType": "item_added",
  "menuId": "menu-001",
  "merchantId": "merchant-001",
  "itemId": "item-001",
  "itemName": "Espresso",
  "timestamp": "2025-12-28T10:00:00Z"
}
```

### Principles
- No cookies required
- No personal data collected
- Fire-and-forget logging (non-blocking)
- Events posted from customer-facing pages
- Aggregated in merchant dashboard

---

## 8. Cloud Deployment

### AWS Services
- **Lambda:** Backend execution
- **RDS (t4g.micro):** PostgreSQL
- **S3:** QR images & static assets
- **CloudWatch:** Logs

### CDN
- **Cloudflare (Free Tier)**
- Cache public menu pages aggressively

### Estimated Monthly Cost (<10 cafés)
- RDS: ~$15
- Lambda + API Gateway: ~$2–3
- S3: <$1
- OCR (Textract): cents per scan

**Total:** ~$18–20/month

---

## 9. Explicit Non-Goals (Out of Scope)

- ~~Online ordering~~ **Now Implemented** (basic ordering with basket)
- Payments (customers order, staff handles payment)
- POS integration
- Charts & advanced analytics (kept minimal)
- Multi-location accounts
- Staff workflows
- Inventory management
- Table reservations
- Delivery/pickup scheduling

---

## 10. Design Principles

- Demo = Production (onboarding flow is the real setup)
- Speed > perfection
- Mobile-first, customer experience paramount
- Test mode for development without backend
- Boring, hire-friendly tech (Vue.js, PostgreSQL, AWS)
- Serverless-first (minimize infrastructure)
- Minimal AWS footprint
- Progressive enhancement
- Separation of merchant and customer experiences

---

## 11. Handover Summary (For Developers)

### Frontend (Vue.js)
> Vue.js 3 SPA with Pinia state management, featuring merchant authentication, onboarding flow with OCR-based menu scanning, dual design themes for customer menu display, shopping basket functionality, QR code management, and merchant dashboard. Built with Vite and Tailwind CSS, fully functional in test mode without backend.

**Key Features:**
- Complete authentication system (login/signup)
- 3-step onboarding (business details, menu upload, item images)
- Customer menu with basket and ordering
- Merchant dashboard with analytics
- QR code generation and management
- OCR menu import (Tesseract.js in test mode)
- Two design themes (Paper Menu / Modern App)
- Fully responsive, mobile-first

### Backend (To Be Built)
> RESTful JSON API with JWT authentication, PostgreSQL database, menu CRUD, order management, QR code generation, event tracking, and OCR processing using AWS Textract. See `/backend/API_SPECIFICATION.md` for complete endpoint documentation.

**Key Responsibilities:**
- Merchant authentication and session management
- Menu and order CRUD operations
- QR code generation and tracking
- Analytics aggregation
- Image storage and OCR processing
- Order status management

### Deployment
- **Frontend:** Vite build → Static hosting (Netlify, Vercel, or S3+CloudFront)
- **Backend:** AWS Lambda + API Gateway (or any serverless platform)
- **Database:** PostgreSQL on RDS t4g.micro
- **CDN:** Cloudflare (cache public menu pages)
- **Storage:** S3 for images and QR codes

### Configuration
Frontend requires backend URL in `.env`:
```
VITE_API_BASE_URL=https://api.yourproject.com/api
VITE_TEST_MODE=false
VITE_UI_THEME=design-b
```

Backend requires (example):
```
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
AWS_S3_BUCKET=qrmenu-images
AWS_TEXTRACT_REGION=us-east-1
```

---

**End of Spec**

