# Additional / Live App Features for Digital Menu

This document outlines **additional features** to be added for the full live app, beyond the in-person demo workflow. These focus on **order management, operational efficiency, and analytics enhancement**.

---

## 1. Order Management Page (Kitchen-Focused) ✅ **COMPLETED**

**Purpose:** Provide a centralized interface for kitchen staff to view, manage, and process incoming orders.

**Key Features:**
- ✅ **Order List:** Display all orders with table, timestamp, items, and current status.
- ✅ **Status Update:** Allow staff to update order status:
  - Pending → Preparing → Ready → Served → Cancelled
- ✅ **Time Tracking:** Automatically capture:
  - Time order received
  - Time each status changes
  - Total processing time per order
- ✅ **Search / Filter:** Quickly find orders by table, status, or time.
- ✅ **Notifications:** Optional toast or sound when a new order arrives.
- ✅ **Dashboard Sync:** Updates merchant analytics and real-time metrics as orders progress.

**Optional Enhancements (All Implemented):**
- ✅ **Tablet/Kitchen mode:** Full-screen Kanban board interface for fast operations.
- ✅ **Color-coded statuses:** Easy visual reference with distinct colors per status.
- ✅ **Historical order tracking:** Processing time and status history tracking.

**Additional Enhancements Implemented:**
- ✅ **Kanban Board Layout:** Jira-style board organization with columns for each status (Pending, Preparing, Ready, Served)
- ✅ **Dual View Modes:** Toggle between full details and summary view for better space utilization
- ✅ **Print Docket Functionality:** One-click print button on each order card for kitchen ticket printing
- ✅ **Auto-refresh:** Configurable automatic refresh every 10 seconds with toggle
- ✅ **Wide Card Layout:** Optimized for maximum horizontal space usage
- ✅ **Explicit Button Labels:** Clear, descriptive labels on all action buttons with tooltips
- ✅ **Status Column Headers:** Descriptive headers with order counts and status descriptions
- ✅ **Visual Priority:** Ready orders highlighted with ring effects for immediate attention
- ✅ **Responsive Design:** Works in both kitchen mode (Kanban) and regular mode (Grid)
- ✅ **Test Mode Support:** Fully functional in demo/test mode with realistic mock data

**Implementation Details:**
- **Route:** `/orders` (protected, requires authentication)
- **Backend:** Updated order statuses to support: `pending`, `preparing`, `ready`, `served`, `cancelled`
- **Frontend:** Complete OrderManagement.vue component with Kanban board and grid layouts
- **Print:** Hidden iframe-based printing (no new tabs, clean print dialog)

---

## 2. Advanced Analytics Enhancements ⚠️ **PARTIALLY IMPLEMENTED**

**Purpose:** Provide deeper insights into customer behavior and operational efficiency.

**Key Features:**
- ⚠️ **Time-Based Metrics:** 
  - ✅ Date range filtering (startDate/endDate) - IMPLEMENTED in Dashboard
  - ✅ Processing time calculation - IMPLEMENTED in OrderManagement page (`getProcessingTime` function)
  - ❌ Average order prep time in analytics dashboard - NOT IMPLEMENTED (calculation exists but not displayed in analytics)
  - ❌ Peak hours analysis - NOT IMPLEMENTED (no hourly breakdown of orders/scans)
- ⚠️ **Trending Items:** 
  - ✅ Top performing items - IMPLEMENTED (TopItems component with scans/clicks)
  - ✅ Date range filtering - IMPLEMENTED (allows time-based analysis)
  - ❌ Trend visualization over time - NOT IMPLEMENTED (no charts showing growth/decline over periods)
  - ❌ Category-level trending - NOT IMPLEMENTED (only item-level)
- ❌ **Export / Reports:** 
  - ❌ CSV export functionality - NOT IMPLEMENTED (no export button or download feature)
  - ❌ Weekly summary emails - NOT IMPLEMENTED (no email functionality)
- ⚠️ **Customer Interaction Insights:** 
  - ✅ QR scans tracking - IMPLEMENTED (totalScans from `qr_scan` events)
  - ✅ Item clicks tracking - IMPLEMENTED (displayed in TopItems component)
  - ✅ Order data tracking - IMPLEMENTED (totalOrders, avgOrderValue)
  - ❌ Combined insights/recommendations - NOT IMPLEMENTED (data tracked separately but not combined into actionable insights)

**What's Missing:**
- Average order prep time metric in analytics dashboard
- Peak hours analysis (hourly breakdown)
- CSV export/download functionality
- Email report functionality
- Trend visualization (charts showing item popularity over time)
- Category-level analytics
- Combined insights that merge scans, clicks, and orders for recommendations

---

## 3. Menu Upload & OCR Flexibility ✅ **COMPLETED**

**Purpose:** Make menu setup easier and more reliable for live use.

**Key Features:**
- ✅ **Toggle between Live OCR Scan / Pre-Tested Image / CSV Upload:** Implemented in both `OCRImport.vue` and `Onboarding.vue` with tabbed interface
- ✅ **Editable OCR results:** Full text editor with raw text display and structured menu preview for instant corrections
- ✅ **Pool of verified menu images:** Saved images library stores up to 10 previously processed menu images with previews, dates, and parsed data for reuse

**Additional Enhancements Implemented:**
- ✅ **Image Preprocessing for OCR:** Automatic image enhancement before OCR processing:
  - Grayscale conversion
  - Contrast enhancement
  - Noise reduction (median filter)
  - Binary thresholding
  - Smart resizing (max 2000x2000)
- ✅ **Advanced OCR Text Cleaning:** Intelligent parsing with:
  - Price pattern detection (supports $ and S currency symbols)
  - Missing decimal point correction (e.g., "699" → "$6.99")
  - Price filtering ($0 and >$200 items removed)
  - Common OCR error corrections (e.g., "wrop" → "wrap", "Breaky" → "Breakfast")
  - Garbled text filtering (special character ratio, letter ratio, consecutive letters check)
- ✅ **CSV Template Download:** One-click download of CSV template for easy menu import
- ✅ **Progress Tracking:** Real-time progress bars and detailed logging for OCR processing
- ✅ **Error Handling:** Comprehensive error messages and fallback options

**Implementation Details:**
- **Routes:** `/ocr` (OCR Import page) and `/onboarding` (Step 2)
- **Components:** Enhanced OCRImport.vue and Onboarding.vue with tabbed interfaces
- **Services:** `ocrService.js` with Tesseract.js integration
- **Utils:** `imagePreprocessor.js` for image enhancement, `menuParser.js` for text parsing
- **Storage:** In-memory saved images library (last 10 images) with parsed data persistence

---

## 4. QR Code Management ✅ **COMPLETED**

**Purpose:** Simplify menu-to-table linking and multi-location setups.

**Key Features:**
- ✅ **Assign menu to multiple pre-printed or dynamically generated QR codes:** 
  - Generate new QR codes with optional table labels
  - Custom domain redirect system for pre-printed QR codes
  - Pre-saved QR code support (3 pre-configured in test mode)
- ✅ **View QR code status (active/inactive) in dashboard:** 
  - Complete QR codes list with status indicators
  - Toggle active/inactive status with one click
  - Visual distinction (green for active, gray for inactive)
- ✅ **Supports multiple tables and seasonal menus:** 
  - Generate unlimited QR codes per menu
  - Optional table labels for organization
  - No re-creation needed when switching menus

**Additional Enhancements Implemented:**
- ✅ **Custom Domain Redirect System:** 
  - Configure custom domain for pre-printed QR codes
  - Automatic redirect from old domain/IP to custom domain
  - Works in both test mode (localStorage) and production (backend)
  - Preserves menu path during redirect
- ✅ **QR Code Scanner with Multiple Methods:**
  - Camera scanning (real-time with jsQR library)
  - File upload fallback (when camera unavailable)
  - Manual token entry
  - Automatic menu navigation after successful scan
- ✅ **Dynamic IP/Domain Detection:**
  - Pre-saved QR codes automatically adapt to current origin
  - No hardcoded IP addresses needed
  - Works with any domain/IP at runtime
- ✅ **Pre-Saved QR Codes for Test Mode:**
  - 3 pre-configured QR codes (test-menu-001, test-menu-002, test-menu-003)
  - Automatically uses current origin (IP/domain)
  - Works without backend connection
- ✅ **QR Code URL Generation:**
  - Configurable domain via `VITE_QR_CODE_DOMAIN` environment variable
  - Falls back to current origin if not configured
  - Full URL format: `{domain}/?qr={token}`
- ✅ **QR Code Image Preview:**
  - Visual QR code display after generation
  - Copy URL functionality
  - Test instructions included

**Implementation Details:**
- **Route:** `/qr` (QR Management page)
- **Components:** QRManagement.vue with tabbed interface, QRScanner.vue component
- **Services:** `qrService.js` for QR code operations
- **Database:** `table_qrs` table with `is_active` column
- **Backend:** QR code CRUD operations, status updates, pre-printed registration
- **Test Mode:** Pre-saved QR codes in `testData.js` with dynamic origin detection

---

## 5. Optional Payment Integration ✅ **COMPLETED**

**Purpose:** Provide flexibility without breaking core workflow.

**Key Features:**
- ✅ Payment is **optional** and independent of order creation - present as simulation in demo mode.
- ✅ Can be integrated later for fully online payment or customer prepayment.
- ✅ Demo flow **simulates payments** for safety and simplicity.

**Additional Enhancements Implemented:**
- ✅ **Payment Database Schema:** Complete `payments` table with support for multiple payment methods (card, digital wallet, cash)
- ✅ **Backend Payment API:** Full CRUD operations for payments with transaction tracking
- ✅ **Payment Modal Component:** Beautiful, user-friendly payment interface with card input validation
- ✅ **Demo Mode Integration:** Payment modal appears automatically after order creation in test/demo mode
- ✅ **Optional Flow:** Users can skip payment - orders work perfectly without payment
- ✅ **Payment Methods:** Support for card, digital wallet, and cash (pay at counter)
- ✅ **Transaction Tracking:** Simulated transaction IDs for demo mode, ready for real payment gateway integration

**Implementation Details:**
- **Database:** `payments` table with order_id, amount_cents, payment_method, payment_status, transaction_id, metadata
- **Backend Routes:** `/api/payments` (POST, GET, PATCH) - public payment creation, protected management routes
- **Frontend Service:** `paymentService.js` with full test mode simulation
- **Component:** `PaymentModal.vue` with card number formatting, expiry validation, and multiple payment methods
- **Integration:** Seamlessly integrated into `Basket.vue` - appears after order creation in demo mode only
- **Flow:** Order → Payment Modal (optional) → Success Modal with payment confirmation

---

## 6. Dashboard / Notifications ⚠️ **PARTIALLY IMPLEMENTED**

**Purpose:** Keep café owner informed in real-time.

**Key Features:**
- ⚠️ **Toast Notifications:** 
  - ✅ Toast notification component created (`ToastNotification.vue`)
  - ✅ Notification system implemented in Dashboard
  - ❌ **NOT WORKING IN DEMO MODE** - Notifications not appearing when orders are placed (needs investigation)
- ✅ **Auto-refreshing dashboards:** 
  - ✅ Auto-refresh functionality implemented (every 10 seconds, toggleable)
  - ✅ Recent Orders component with auto-refresh toggle
  - ✅ Manual refresh button available
- ✅ **Row highlights for new orders:** 
  - ✅ New orders highlighted with green background and left border
  - ✅ Highlight fades after 5 seconds
  - ✅ Smooth transitions implemented
- ⚠️ **Real-time sync with kitchen order management:** 
  - ✅ Dashboard detects new orders on refresh
  - ✅ Order status updates reflected
  - ❌ **NOT WORKING IN DEMO MODE** - New orders from order placement not triggering notifications (orders are added to test data but notifications don't fire)

**What's Missing / Issues:**
- ⚠️ **Demo Mode Notification Issue:** When orders are placed in demo mode, they are added to test data but toast notifications don't appear. The auto-refresh should detect them, but notifications may not be triggering correctly. Need to investigate:
  - Order creation flow in test mode
  - Notification trigger logic in `loadRecentOrders` function
  - Whether the condition `previousOrderIds.size > 0` is preventing first-time notifications
- Real-time WebSocket/polling integration for instant notifications (currently relies on 10-second auto-refresh)

**Implementation Details:**
- **Components:** `ToastNotification.vue`, `RecentOrders.vue`
- **Service:** `orderService.getRecentOrders()` method added
- **Dashboard:** Auto-refresh interval, new order detection, notification system
- **Test Mode:** Orders added to `testOrders` array on creation

---

## Notes

- All features are **optional or toggleable** to avoid overloading the core workflow.
- Designed to scale for **multi-table, multi-location cafés and restaurants**.
- Focus remains on **smooth, fast, intuitive UI**, emphasizing minimal clicks and instant feedback.
