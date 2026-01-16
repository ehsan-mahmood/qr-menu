# Frontend Test Mode Guide

## Overview

The QR Menu frontend includes a **comprehensive test mode** that allows you to run and demo the entire application **without any backend connection**. All API calls are intercepted and return realistic static data with simulated network delays.

## Features in Test Mode

### ✅ Fully Functional Without Backend
- Browse complete demo menu (12 items across 4 sections)
- Add/remove items from basket
- Adjust quantities
- Place orders (simulated)
- View analytics dashboard
- Scan/generate QR codes
- Upload images for OCR parsing (simulated)
- All navigation and routing works

### ✅ Realistic Simulation
- Network delays (300-600ms) for realistic UX
- Loading states and transitions
- Error handling examples
- Success notifications
- Console logging for debugging

### ✅ Response Format Compliance
All mock responses follow the API standard format with `messageId` and `receivingId` at the top level (consistent with your memory preference):

```javascript
{
  messageId: 'ORDER_CREATED',
  receivingId: 'order-123',
  data: { /* payload */ }
}
```

## Enabling/Disabling Test Mode

### Method 1: Configuration File

Edit `src/config.js`:

```javascript
// Enable test mode
export const TEST_MODE = true

// Disable test mode (connect to real backend)
export const TEST_MODE = false
```

### Method 2: Environment Variable

Create `.env.local` file:

```bash
# Enable test mode
VITE_TEST_MODE=true

# Disable test mode
VITE_TEST_MODE=false
```

### Priority
Environment variable takes precedence over hardcoded value.

## Test Data

### Demo Menu
**Merchant**: Café Demo  
**Menu ID**: test-menu-001  
**Sections**: 4 (Breakfast, Lunch & Dinner, Beverages, Desserts)  
**Items**: 12 with images from Unsplash

Sample items:
- Avocado Toast - $12.50
- Grilled Salmon - $24.50
- Cappuccino - $4.50
- Chocolate Lava Cake - $9.50

### QR Data
**Token**: test-qr-token-001  
**Table**: 5  
**Menu ID**: test-menu-001  
**Merchant ID**: merchant-001

### Analytics
- **Total Scans**: 1,247
- **Total Orders**: 456
- **Avg Order Value**: $32.50
- **Top 5 Items**: Avocado Toast (156 scans), Cappuccino (142), Beef Burger (128), etc.

All test data is in `src/utils/testData.js` and can be customized.

## Testing Each Feature

### 1. Landing Page
**Route**: `/`

**Test Actions**:
- ✅ Click "View Demo Menu" → loads test menu
- ✅ Click "Scan QR Code" → opens QR scanner
- ✅ Click "Import Menu" → opens OCR uploader
- ✅ Click "Analytics Dashboard" → shows demo analytics

**Expected**:
- Test mode banner shows at top
- All buttons navigate correctly
- Icons and descriptions display

### 2. Menu Display
**Route**: `/menu/test-menu-001`

**Test Actions**:
- ✅ Expand/collapse sections
- ✅ Click menu items to view details
- ✅ Add items to basket (+ button)
- ✅ View basket count in header
- ✅ Click floating basket button

**Expected**:
- Menu loads with 4 sections
- Images lazy load
- Basket count updates
- Smooth animations

### 3. Basket
**Route**: `/basket`

**Test Actions**:
- ✅ Increment/decrement quantities
- ✅ Remove items
- ✅ Add special instructions
- ✅ Place order
- ✅ Clear basket

**Expected**:
- Quantities update correctly
- Total calculates properly
- Order submission shows success modal
- Order ID displayed (format: order-[timestamp])

### 4. QR Management
**Route**: `/qr`

**Test Actions**:
- ✅ Enter manual QR code: `test-qr-token-001`
- ✅ Click "Submit"
- ✅ View loaded QR data
- ✅ Generate new QR code
- ✅ Click "View Menu"

**Expected**:
- Manual code submission works
- QR data displays (table, menu ID, etc.)
- Generate creates new token
- Success messages show

### 5. OCR Import
**Route**: `/ocr`

**Test Actions**:
- ✅ Upload any image file
- ✅ Click "Parse Menu"
- ✅ View simulated parsed text
- ✅ Edit parsed text
- ✅ Save menu

**Expected**:
- File upload shows file info
- Progress bar animates
- Mock menu text appears
- Confidence score shows (92%)
- Save shows success message

### 6. Analytics Dashboard
**Route**: `/dashboard`

**Test Actions**:
- ✅ View stats cards
- ✅ Check top items list
- ✅ View detailed table
- ✅ Change date range
- ✅ Click "Apply Date Range"

**Expected**:
- 3 stat cards display
- Top 5 items show with scans/clicks
- Table has all data
- Date filter triggers reload

## Service Layer Behavior

### Menu Service
```javascript
// In test mode
await menuService.getMenuByToken('test-qr-token-001')
// Returns: testMenu after 500ms delay

// In production mode
await menuService.getMenuByToken(token)
// Calls: GET /api/menu/qr/:token
```

### Order Service
```javascript
// In test mode
await orderService.createOrder(orderData)
// Returns: { messageId, receivingId, order } after 600ms

// In production mode
await orderService.createOrder(orderData)
// Calls: POST /api/orders
```

### Analytics Service
```javascript
// In test mode
await analyticsService.getDashboardData(merchantId, dateRange)
// Returns: testAnalytics after 500ms

// In production mode
// Calls: GET /api/analytics/dashboard/:merchantId
```

### QR Service
```javascript
// In test mode
await qrService.createQRCode(qrData)
// Returns: { messageId, receivingId, qrCode } after 500ms

// In production mode
// Calls: POST /api/qr/codes
```

### OCR Service
```javascript
// In test mode
await ocrService.parseMenuImage(file)
// Returns: mock parsed text after 2000ms

// In production mode
// Calls: POST /api/ocr/parse (multipart/form-data)
```

## Console Logging

Analytics events log to console in test mode:

```
📊 Analytics Event (Test Mode): {
  eventType: 'menu_view',
  menuId: 'test-menu-001',
  timestamp: '2025-12-28T...'
}
```

## Switching to Production Mode

### Steps:

1. **Disable test mode**:
   ```javascript
   // src/config.js
   export const TEST_MODE = false
   ```

2. **Set backend URL**:
   ```bash
   # .env.local
   VITE_API_BASE_URL=http://your-backend:8080/api
   ```

3. **Verify backend is running** and endpoints match

4. **Test API responses** match expected format:
   ```json
   {
     "messageId": "SUCCESS",
     "receivingId": "entity-id",
     "data": {}
   }
   ```

5. **Handle CORS** if frontend/backend on different domains

## Customizing Test Data

Edit `src/utils/testData.js`:

```javascript
export const testMenu = {
  merchantName: 'Your Café Name',
  sections: [
    {
      name: 'Your Section',
      items: [
        {
          name: 'Your Item',
          price: 10.00,
          description: 'Description',
          image: 'https://...',
          available: true,
        }
      ]
    }
  ]
}
```

## Troubleshooting

### Test mode not working
1. Check `TEST_MODE` in `src/config.js`
2. Clear browser cache
3. Restart dev server
4. Check console for errors

### Images not loading
- Test data uses Unsplash URLs
- Check internet connection
- Images are lazy-loaded

### Navigation issues
- Check Vue Router console logs
- Verify route paths in `src/router/index.js`

### State not persisting
- Pinia stores are in-memory only
- Refresh clears all state
- No localStorage in test mode

## Demo Script

Perfect flow for showcasing the app:

1. **Start**: Landing page → Click "View Demo Menu"
2. **Browse**: Expand "Breakfast" section
3. **Add**: Add "Avocado Toast" and "Cappuccino" to basket
4. **Review**: Click basket (shows 2 items, $34.00)
5. **Order**: Add special instructions, place order
6. **Success**: See order confirmation modal
7. **Analytics**: Go back, click "Analytics Dashboard"
8. **Insights**: Show top items and stats
9. **QR**: Navigate to QR Management
10. **Generate**: Create QR for table 7
11. **OCR**: Upload a menu image (any image works)
12. **Parse**: Show simulated text extraction

Total demo time: ~3-5 minutes

## Benefits of Test Mode

✅ **No Backend Required** - Frontend devs work independently  
✅ **Fast Demos** - Show features to stakeholders instantly  
✅ **UI Testing** - Verify all flows without API  
✅ **Onboarding** - New devs see full app immediately  
✅ **Offline Development** - Work anywhere  
✅ **Consistent Data** - Same test data every time  
✅ **Error Handling** - Test error scenarios easily

## Production Deployment

When deploying to production:

1. Set `VITE_TEST_MODE=false` in production environment
2. Set `VITE_API_BASE_URL` to production API
3. Build: `npm run build`
4. Serve `dist/` folder
5. Verify all API endpoints are working

## Next Steps

- Customize test data for your needs
- Add more mock scenarios
- Implement localStorage persistence
- Add offline mode detection
- Create E2E tests using test mode

---

**Test Mode Status**: ✅ Fully Implemented  
**Last Updated**: December 28, 2025

