# QR Menu - Frontend Documentation

## Table of Contents
1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Getting Started](#getting-started)
5. [Architecture](#architecture)
6. [Pages & Routes](#pages--routes)
7. [State Management (Pinia Stores)](#state-management-pinia-stores)
8. [Components](#components)
9. [Services & API](#services--api)
10. [Styling & Themes](#styling--themes)
11. [Configuration](#configuration)
12. [Test Mode](#test-mode)
13. [Deployment](#deployment)
14. [Development Guide](#development-guide)

---

## Overview

The QR Menu frontend is a Vue.js 3 single-page application (SPA) that provides two distinct experiences:

1. **Customer Experience**: Browse menus, add items to basket, place orders
2. **Merchant Experience**: Authentication, onboarding, menu management, analytics dashboard

### Key Features
- ✅ Complete authentication system (login/signup)
- ✅ 3-step merchant onboarding with OCR menu import
- ✅ Customer menu with shopping basket
- ✅ Two design themes (Paper Menu / Modern Food App)
- ✅ QR code generation and management
- ✅ Analytics dashboard
- ✅ Fully functional in test mode (no backend required)
- ✅ Mobile-first responsive design

---

## Technology Stack

### Core
- **Framework**: Vue.js 3.4+ (Composition API)
- **State Management**: Pinia
- **Routing**: Vue Router 4
- **Build Tool**: Vite 5
- **Language**: JavaScript (ES6+)

### Styling
- **CSS Framework**: Tailwind CSS 3
- **Fonts**: Inter, Poppins, Nunito, Merriweather (Google Fonts)
- **Icons**: Emoji-based (no icon library)

### Additional Libraries
- **HTTP Client**: Axios
- **OCR**: Tesseract.js (test mode only)
- **QR Scanner**: Custom implementation

### Development Tools
- **Hot Module Replacement**: Vite HMR
- **Code Quality**: ESLint (optional)
- **Package Manager**: npm

---

## Project Structure

```
frontend_vue/
├── src/
│   ├── assets/          # Static assets (minimal)
│   ├── components/      # Reusable Vue components
│   │   ├── AnalyticsTable.vue
│   │   ├── ItemModal.vue
│   │   ├── MenuItem.vue
│   │   ├── MenuSection.vue
│   │   ├── QRScanner.vue
│   │   └── TopItems.vue
│   ├── pages/           # Route-level components
│   │   ├── Basket.vue
│   │   ├── Dashboard.vue
│   │   ├── Landing.vue
│   │   ├── Login.vue
│   │   ├── MenuDisplay.vue
│   │   ├── OCRImport.vue
│   │   ├── Onboarding.vue
│   │   ├── QRManagement.vue
│   │   └── SignUp.vue
│   ├── router/          # Vue Router configuration
│   │   └── index.js
│   ├── services/        # API service layer
│   │   ├── analyticsService.js
│   │   ├── menuService.js
│   │   ├── ocrService.js
│   │   ├── orderService.js
│   │   └── qrService.js
│   ├── stores/          # Pinia stores
│   │   ├── analyticsStore.js
│   │   ├── authStore.js
│   │   ├── basketStore.js
│   │   ├── menuStore.js
│   │   ├── qrStore.js
│   │   └── themeStore.js
│   ├── utils/           # Utility functions
│   │   ├── menuParser.js
│   │   └── testData.js
│   ├── App.vue          # Root component
│   ├── config.js        # App configuration
│   ├── main.js          # Entry point
│   └── style.css        # Global styles + Tailwind
├── public/              # Public static files
├── dist/                # Build output (gitignored)
├── node_modules/        # Dependencies (gitignored)
├── .env                 # Environment variables (create this)
├── index.html           # HTML entry point
├── package.json         # Dependencies and scripts
├── vite.config.js       # Vite configuration
├── tailwind.config.js   # Tailwind configuration
├── postcss.config.js    # PostCSS configuration
└── DOCUMENTATION.md     # This file
```

---

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Modern browser (Chrome, Firefox, Safari, Edge)

### Installation

```bash
# Navigate to frontend directory
cd frontend_vue

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000` (or next available port).

### Environment Setup

Create a `.env` file in the `frontend_vue/` directory:

```env
# API Configuration
VITE_API_BASE_URL=/api

# Test Mode (true = work without backend)
VITE_TEST_MODE=true

# UI Theme (design-a or design-b)
VITE_UI_THEME=design-b
```

### Build for Production

```bash
npm run build
```

Output will be in the `dist/` directory, ready for deployment to any static hosting service.

---

## Architecture

### Application Flow

```
User lands on app
    ↓
[Authentication Check]
    ↓
├─ Not Authenticated → Login Page (/)
│   ↓
│   [Login/SignUp]
│   ↓
│   [Onboarding Flow]
│       ↓
│   Dashboard
│
└─ Authenticated → Dashboard (/dashboard)
    │
    ├─ Menu Management
    ├─ QR Code Management
    ├─ OCR Import
    └─ Analytics

Customer Flow (No Auth):
    Scan QR Code → Menu Page → Basket → Order
```

### State Management Architecture

```
Pinia Root Store
    ├─ authStore      (user session, authentication)
    ├─ menuStore      (menu data, configuration)
    ├─ basketStore    (shopping cart)
    ├─ qrStore        (QR code data)
    ├─ analyticsStore (events, dashboard data)
    └─ themeStore     (UI theme switching)
```

### Service Layer Architecture

```
Vue Components
    ↓
Pinia Stores
    ↓
Service Layer (menuService, orderService, etc.)
    ↓
Axios HTTP Client
    ↓
Backend API (or Test Mode Mocks)
```

---

## Pages & Routes

### Route Configuration

Routes are defined in `src/router/index.js` with navigation guards.

#### Public Routes (No Authentication)
- `/menu/:menuId` - Customer menu page
- `/basket` - Shopping basket

#### Guest Routes (Redirect if Authenticated)
- `/` - Login page (root)
- `/login` - Redirects to `/`
- `/signup` - Sign up page

#### Protected Routes (Authentication Required)
- `/dashboard` - Merchant analytics dashboard
- `/onboarding` - New merchant setup flow
- `/qr` - QR code management
- `/ocr` - OCR menu import

### Page Details

#### 1. Login Page (`/`)
**File**: `src/pages/Login.vue`

**Purpose**: Merchant authentication

**Features**:
- Email/password login
- "Remember me" checkbox
- Link to signup
- Link to customer demo
- Test mode banner

**Key Functions**:
```javascript
handleLogin(email, password, rememberMe)
goToSignUp()
goToCustomerDemo()
```

---

#### 2. Sign Up Page (`/signup`)
**File**: `src/pages/SignUp.vue`

**Purpose**: New merchant registration

**Features**:
- Full name, email, phone, password fields
- Password confirmation
- Terms of service agreement
- Form validation

**Validation Rules**:
- Password min 8 characters
- Passwords must match
- All required fields filled
- Terms must be agreed

---

#### 3. Onboarding Flow (`/onboarding`)
**File**: `src/pages/Onboarding.vue`

**Purpose**: 3-step merchant setup

**Step 1: Business Details**
- Restaurant/company name
- Business type (café, restaurant, bar, etc.)
- Address (optional)

**Step 2: Menu Upload**
- Photo/OCR upload
- CSV upload
- Manual entry
- Drag & drop support

**Step 3: Menu Items & Images**
- Review extracted/imported items
- Add item images
- Edit names, prices, categories
- Add/remove items

**State Management**:
```javascript
onboardingData = {
  restaurantName: '',
  businessType: 'cafe',
  address: '',
  uploadMethod: null,  // 'ocr' | 'csv' | 'manual'
  menuFile: null
}

menuItems = [{
  name: '',
  price: '',
  category: '',
  image: null,
  imagePreview: null
}]
```

---

#### 4. Menu Display (`/menu/:menuId`)
**File**: `src/pages/MenuDisplay.vue`

**Purpose**: Customer-facing menu (isolated experience)

**Features**:
- Two design themes (switchable via config)
- Section-based menu navigation
- Item cards with images
- Item detail modal
- Floating basket button
- Add to basket functionality

**Design A - "Paper Menu"**:
- Warm cream background
- Traditional list layout
- Simple dividers
- Text "Add" buttons

**Design B - "Modern Food App"** (default):
- Clean white background
- Card-based grid layout
- Section tabs
- Floating "+" buttons
- Basket FAB (Floating Action Button)

**Key Features**:
- No back button (isolated customer experience)
- Analytics event tracking
- Responsive mobile-first design

---

#### 5. Basket Page (`/basket`)
**File**: `src/pages/Basket.vue`

**Purpose**: Shopping cart and order placement

**Features**:
- Order summary with item list
- Quantity controls (+/-)
- Customer info input (table number or name)
- Special instructions textarea
- Order total calculation
- Place order button (if ordering enabled)
- Order confirmation modal

**Customer Info Logic**:
- Auto-filled from QR scan if available
- Manual entry if no QR data
- Validates table/name format

**Order Success Flow**:
```
Place Order → Show Success Modal → Return to Menu
```

---

#### 6. Dashboard (`/dashboard`)
**File**: `src/pages/Dashboard.vue`

**Purpose**: Merchant analytics and overview

**Features**:
- Total scans (last 7/30 days)
- Total orders
- Average order value
- Top 5 items list
- Recent orders table
- Date range filtering
- Logout button

**Components Used**:
- `TopItems.vue`
- `AnalyticsTable.vue`

**Protected**: Requires authentication, shows merchant name in header

---

#### 7. QR Management (`/qr`)
**File**: `src/pages/QRManagement.vue`

**Purpose**: QR code scanning and management

**Features**:
- QR code scanner (camera access)
- View active QR codes
- Create new QR codes
- Link QR to menu and table
- Display QR data

**Components Used**:
- `QRScanner.vue`

---

#### 8. OCR Import (`/ocr`)
**File**: `src/pages/OCRImport.vue`

**Purpose**: Import menu from photo

**Features**:
- Image upload (drag & drop or click)
- OCR processing with progress
- Uses Tesseract.js in test mode
- Parsed text preview
- Editable menu items table
- Save to menu

**OCR Flow**:
```
Upload Image → Process with Tesseract → Parse Text → Edit Items → Save
```

---

#### 9. Landing Page (`/landing` - deprecated)
**File**: `src/pages/Landing.vue`

**Note**: This page is no longer the root. It exists for backward compatibility but login page is now the main entry point.

---

## State Management (Pinia Stores)

### 1. Auth Store (`authStore.js`)

**Purpose**: User authentication and session management

**State**:
```javascript
{
  user: null,              // User object
  merchantId: null,        // Merchant ID
  isAuthenticated: false,  // Auth status
  loading: false,          // Loading state
  error: null             // Error message
}
```

**Actions**:
- `login({ email, password, rememberMe })` - Authenticate user
- `signUp({ name, email, phone, password })` - Register new merchant
- `logout()` - Clear session
- `checkAuth()` - Verify stored session
- `updateUserProfile(updates)` - Update user data

**Usage**:
```javascript
import { useAuthStore } from '@/stores/authStore'

const authStore = useAuthStore()
await authStore.login({ email, password, rememberMe: true })
```

---

### 2. Menu Store (`menuStore.js`)

**Purpose**: Menu data and configuration

**State**:
```javascript
{
  currentMenu: null,       // Full menu object
  loading: false,
  error: null,
  orderEnabled: true       // Can customers place orders?
}
```

**Getters**:
- `sections` - Menu sections array
- `merchantName` - Restaurant name
- `allItems` - Flattened items array

**Actions**:
- `fetchMenuByToken(qrToken)` - Load menu via QR
- `fetchMenuById(menuId)` - Load menu by ID
- `fetchMenuConfig(menuId)` - Get menu settings
- `setMenu(menu)` - Set menu data
- `clearMenu()` - Clear state

**Menu Data Structure**:
```javascript
{
  menuId: "menu-001",
  merchantName: "The Coffee House",
  orderEnabled: true,
  sections: [
    {
      id: "section-001",
      name: "Coffee",
      items: [
        {
          id: "item-001",
          name: "Espresso",
          description: "Strong Italian coffee",
          price: 3.50,
          image: "url",
          category: "Coffee",
          available: true
        }
      ]
    }
  ]
}
```

---

### 3. Basket Store (`basketStore.js`)

**Purpose**: Shopping cart management

**State**:
```javascript
{
  items: [],               // Cart items
  tableNumber: '',         // Customer table
  customerName: ''         // Customer name
}
```

**Getters**:
- `itemCount` - Total quantity of items
- `totalAmount` - Total price
- `isEmpty` - Boolean if cart is empty

**Actions**:
- `addItem(item)` - Add item or increment quantity
- `removeItem(itemId)` - Remove item completely
- `updateQuantity(itemId, quantity)` - Set specific quantity
- `incrementQuantity(itemId)` - Add 1
- `decrementQuantity(itemId)` - Remove 1
- `setTableNumber(table)` - Set table number
- `setCustomerName(name)` - Set customer name
- `clearBasket()` - Empty cart

**Item Structure**:
```javascript
{
  id: "item-001",
  name: "Espresso",
  price: 3.50,
  quantity: 2,
  // ... other item properties
}
```

---

### 4. QR Store (`qrStore.js`)

**Purpose**: QR code data management

**State**:
```javascript
{
  qrToken: '',
  qrData: null,
  tableNumber: '',
  menuId: '',
  merchantId: '',
  loading: false,
  error: null
}
```

**Actions**:
- `fetchQRData(token)` - Get QR code info
- `setQRToken(token)` - Set token
- `setTableNumber(table)` - Set table
- `setQRData(data)` - Set full QR data
- `clearQRData()` - Clear state

---

### 5. Analytics Store (`analyticsStore.js`)

**Purpose**: Event tracking and analytics

**State**:
```javascript
{
  dashboardData: null,
  topItems: [],
  loading: false,
  error: null
}
```

**Actions**:
- `postEvent(eventData)` - Log analytics event
- `fetchDashboardData(merchantId, dateRange)` - Get dashboard stats
- `fetchTopItems(merchantId, limit)` - Get popular items
- `clearAnalytics()` - Clear state

**Event Types**:
- `menu_view` - Customer viewed menu
- `item_click` - Customer clicked item
- `item_added` - Item added to basket
- `order_placed` - Order submitted
- `qr_scan` - QR code scanned

---

### 6. Theme Store (`themeStore.js`)

**Purpose**: UI theme management

**State**:
```javascript
{
  currentTheme: 'design-b'  // 'design-a' or 'design-b'
}
```

**Getters**:
- `isDesignA` - Boolean
- `isDesignB` - Boolean
- `theme` - Full theme object with colors and layout

**Actions**:
- `setTheme(themeName)` - Switch theme

**Theme Objects**:
```javascript
designA = {
  name: 'Design A - Paper Menu',
  colors: {
    background: '#FAF7F2',
    textPrimary: '#2F2A25',
    primary: '#7A8F5B',
    accent: '#C47A5A'
  },
  layout: {
    menuStyle: 'list',
    basketStyle: 'footer'
  }
}

designB = {
  name: 'Design B - Modern Food App',
  colors: {
    background: '#FFFFFF',
    primary: '#FF6B57',
    secondary: '#3ECF8E'
  },
  layout: {
    menuStyle: 'cards',
    basketStyle: 'fab'
  }
}
```

---

## Components

### MenuItem.vue
**Purpose**: Individual menu item card

**Props**:
- `item` (Object, required)

**Emits**:
- `click` - Item clicked
- `add-to-basket` - Add button clicked

**Features**:
- Item image thumbnail
- Name, description, price
- Availability status
- Add to basket button
- Analytics tracking on click

---

### MenuSection.vue
**Purpose**: Collapsible menu section

**Props**:
- `section` (Object, required)
- `defaultOpen` (Boolean, default: false)

**Emits**:
- `item-click`
- `item-added`

**Features**:
- Expandable/collapsible
- Contains multiple MenuItems
- Smooth animations

---

### ItemModal.vue
**Purpose**: Full-screen item details modal

**Props**:
- `isOpen` (Boolean, required)
- `item` (Object)

**Emits**:
- `close`
- `add-to-basket`

**Features**:
- Full item image
- Detailed description
- Add to basket from modal
- Close button
- Click outside to close

---

### QRScanner.vue
**Purpose**: Camera-based QR code scanner

**Emits**:
- `scan-success` - QR code detected
- `scan-error` - Scanning failed

**Features**:
- Camera access request
- Real-time QR detection
- Error handling
- Permission management

---

### TopItems.vue
**Purpose**: Top selling items list

**Props**:
- `items` (Array, required)

**Features**:
- Item name, category
- Order count
- Revenue display
- Responsive layout

---

### AnalyticsTable.vue
**Purpose**: Recent orders table

**Props**:
- `orders` (Array, required)

**Features**:
- Order ID, table, amount
- Status badges
- Timestamp
- Sortable columns (optional)

---

## Services & API

All services are located in `src/services/` and follow a consistent pattern.

### Service Pattern

```javascript
import axios from 'axios'
import { API_BASE_URL, TEST_MODE } from '@/config'
import { testData } from '@/utils/testData'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
})

export const exampleService = {
  async getData(id) {
    if (TEST_MODE) {
      // Mock delay
      await new Promise(resolve => setTimeout(resolve, 300))
      return { data: testData }
    }
    
    const response = await api.get(`/endpoint/${id}`)
    return response
  }
}
```

### Available Services

#### 1. menuService.js
- `getMenuByToken(qrToken)`
- `getMenuById(menuId)`
- `getMenuItems(menuId)`
- `getMenuConfig(menuId)`

#### 2. orderService.js
- `createOrder(orderData)`
- `updateOrderStatus(orderId, status)`
- `getOrderById(orderId)`
- `getAllOrders()`

#### 3. qrService.js
- `createQRCode(qrData)`
- `getQRData(qrToken)`
- `getMerchantQRCodes(merchantId)`

#### 4. analyticsService.js
- `postEvent(eventData)`
- `getDashboardData(merchantId, dateRange)`
- `getTopItems(merchantId, limit)`

#### 5. ocrService.js
- `parseMenuImage(imageFile, onProgress)`
- `getOCRStatus(ocrId)`

---

## Styling & Themes

### Tailwind Configuration

Custom colors and utilities defined in `tailwind.config.js`:

```javascript
colors: {
  cream: '#FAF7F2',
  charcoal: '#2F2A25',
  primary: '#FF8360',
  'warm-gray': '#E6E1DA',
  gray: '#6E6259'
}
```

### CSS Classes

**Buttons**:
- `.btn` - Base button
- `.btn-primary` - Primary action (orange)
- `.btn-secondary` - Secondary action (gray)

**Cards**:
- `.card` - White card with shadow
- `.card-gradient` - Gradient card with accent

**Inputs**:
- `.input` - Standard form input

**Responsive Breakpoints**:
- `sm:` - 640px
- `md:` - 768px
- `lg:` - 1024px
- `xl:` - 1280px

### Global Styles

Located in `src/style.css`:
- Tailwind directives
- Custom component classes
- Font imports
- Animation definitions

---

## Configuration

### config.js

Main configuration file:

```javascript
// Test mode - works without backend
export const TEST_MODE = import.meta.env.VITE_TEST_MODE === 'true' || true

// API base URL
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

// UI theme
export const UI_THEME = import.meta.env.VITE_UI_THEME || 'design-b'
```

### Environment Variables

Create `.env` file:

```env
# Backend API
VITE_API_BASE_URL=https://api.yourproject.com/api

# Test Mode (true/false)
VITE_TEST_MODE=true

# UI Theme (design-a/design-b)
VITE_UI_THEME=design-b
```

---

## Test Mode

### What is Test Mode?

Test mode allows the frontend to run completely independently without a backend server. All API calls are mocked with realistic data and delays.

### Enabling Test Mode

Set in `.env`:
```env
VITE_TEST_MODE=true
```

Or in `src/config.js`:
```javascript
export const TEST_MODE = true
```

### Test Mode Features

1. **Mocked API Responses**: All services return test data
2. **Realistic Delays**: Simulated network latency
3. **Browser-based OCR**: Uses Tesseract.js locally
4. **Console Logging**: All API calls logged
5. **No Backend Required**: Fully functional offline

### Test Data

Located in `src/utils/testData.js`:
- Test menu with sections and items
- Test orders
- Test QR data
- Test analytics data

### Disabling Test Mode

1. Set `VITE_TEST_MODE=false` in `.env`
2. Configure `VITE_API_BASE_URL` to your backend
3. Restart dev server

---

## Deployment

### Build Process

```bash
# Install dependencies
npm install

# Build for production
npm run build
```

Output: `dist/` directory containing:
- Optimized JavaScript bundles
- Processed CSS
- HTML entry point
- Static assets

### Deployment Options

#### 1. Netlify
```bash
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"
```

#### 2. Vercel
```bash
# vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist"
}
```

#### 3. AWS S3 + CloudFront
```bash
# Build
npm run build

# Upload to S3
aws s3 sync dist/ s3://your-bucket-name

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_ID --paths "/*"
```

#### 4. Traditional Web Server
- Build the project
- Upload `dist/` contents to server
- Configure server to serve `index.html` for all routes (SPA mode)

### Environment Variables for Production

Set these in your deployment platform:

```env
VITE_API_BASE_URL=https://api.yourproject.com/api
VITE_TEST_MODE=false
VITE_UI_THEME=design-b
```

### CORS Configuration

Ensure your backend allows requests from your frontend domain:

```javascript
// Backend CORS config
{
  origin: ['https://yourdomain.com'],
  credentials: true
}
```

---

## Development Guide

### Development Workflow

```bash
# 1. Start dev server
npm run dev

# 2. Make changes to files
# Vite will hot-reload automatically

# 3. Test in browser
# http://localhost:3000

# 4. Build and preview production
npm run build
npm run preview
```

### Adding a New Page

1. Create component in `src/pages/`:
```vue
<template>
  <div class="min-h-screen bg-cream">
    <h1>New Page</h1>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const data = ref(null)
</script>
```

2. Add route in `src/router/index.js`:
```javascript
{
  path: '/new-page',
  name: 'newPage',
  component: () => import('@/pages/NewPage.vue'),
  meta: { requiresAuth: true }
}
```

3. Add navigation link where needed

### Adding a New Store

1. Create store in `src/stores/`:
```javascript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useNewStore = defineStore('newStore', () => {
  const data = ref(null)
  
  const hasData = computed(() => data.value !== null)
  
  function setData(newData) {
    data.value = newData
  }
  
  return { data, hasData, setData }
})
```

2. Use in components:
```javascript
import { useNewStore } from '@/stores/newStore'

const newStore = useNewStore()
```

### Adding a New Service

1. Create service in `src/services/`:
```javascript
import axios from 'axios'
import { API_BASE_URL, TEST_MODE } from '@/config'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
})

export const newService = {
  async fetchData(id) {
    if (TEST_MODE) {
      await new Promise(resolve => setTimeout(resolve, 300))
      return { data: { id, name: 'Test' } }
    }
    
    const response = await api.get(`/new-endpoint/${id}`)
    return response
  }
}

export default newService
```

2. Use in stores or components

### Code Style Guide

**Vue Components**:
- Use Composition API (`<script setup>`)
- Organize: imports → reactive data → computed → functions
- Use PascalCase for component names
- Use kebab-case for event names

**JavaScript**:
- Use `const` by default, `let` when needed
- Use arrow functions
- Use template literals for strings
- Use async/await over promises

**CSS**:
- Prefer Tailwind utilities
- Use `@apply` for repeated patterns
- Scoped styles when needed
- Mobile-first breakpoints

### Debugging

**Vue DevTools**:
- Install Vue DevTools browser extension
- Inspect component tree
- View Pinia stores
- Track router history

**Console Logging**:
- Test mode logs all API calls
- Use `console.log()` liberally during development
- Remove or comment out before committing

**Vite Inspector**:
```bash
# Click on components in dev mode to open in editor
# Hover over components to see file location
```

### Common Issues

**Port Already in Use**:
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
npm run dev -- --port 3001
```

**Hot Reload Not Working**:
- Check file watcher limits
- Restart dev server
- Clear browser cache

**Build Errors**:
- Delete `node_modules` and reinstall
- Clear dist folder
- Check for console errors

---

## API Integration Checklist

When connecting to real backend:

- [ ] Set `VITE_TEST_MODE=false`
- [ ] Configure `VITE_API_BASE_URL`
- [ ] Update CORS settings on backend
- [ ] Test authentication flow
- [ ] Verify JWT token handling
- [ ] Test all CRUD operations
- [ ] Check error handling
- [ ] Test file uploads (images, OCR)
- [ ] Verify analytics events
- [ ] Test order creation
- [ ] Check QR code generation

---

## Security Considerations

1. **Authentication**:
   - JWT tokens stored in localStorage/sessionStorage
   - Tokens cleared on logout
   - Route guards protect merchant pages

2. **API Calls**:
   - Always use HTTPS in production
   - Add authorization header to protected endpoints
   - Validate responses before using

3. **User Input**:
   - Form validation on all inputs
   - Sanitize before display
   - File type validation on uploads

4. **Sensitive Data**:
   - Never commit `.env` files
   - Don't log sensitive information
   - Clear session on logout

---

## Performance Optimization

1. **Code Splitting**: Routes lazy-loaded
2. **Image Optimization**: Compress before upload
3. **Caching**: Use CDN for static assets
4. **Bundle Size**: Vite tree-shaking
5. **Lazy Loading**: Images loaded on demand

---

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

---

## Resources

### Documentation
- [Vue.js 3](https://vuejs.org/)
- [Pinia](https://pinia.vuejs.org/)
- [Vue Router](https://router.vuejs.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)

### Project Files
- `/backend/API_SPECIFICATION.md` - Backend API documentation
- `/tech_specs.md` - Overall technical specification
- `THEME_GUIDE.md` - UI theme documentation
- `TEST_MODE_GUIDE.md` - Test mode details

---

## Support & Contribution

### Getting Help
1. Check this documentation
2. Review existing code examples
3. Check browser console for errors
4. Review API specification

### Code Quality
- Follow existing patterns
- Add comments for complex logic
- Keep components focused and reusable
- Test in both design themes
- Test in test mode and with backend

---

**Last Updated**: December 28, 2025  
**Version**: 1.0.0  
**Framework**: Vue.js 3 + Vite

