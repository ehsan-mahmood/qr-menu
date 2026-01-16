# Digital Menu Demo – GitHub Pages Full Plan

## Objective
Provide a **fully interactive demo** of the Digital Menu app **without a backend**, deployable on GitHub Pages.  
Constraints:
- Max 4 minutes / 8 clicks demo
- Shows **menu digitization, QR scan, orders, notifications, and analytics**
- Safe: no real payments, no backend required

---

## 1. Frontend Technology

- **Framework:** Vue.js (composition API or options API)
- **Build tool:** Vue CLI or Vite
- **Deployment:** GitHub Pages (static site)
- **State Management:** Pinia or Vue reactive objects
- **Optional:** CSS framework (Tailwind or Bootstrap) for fast styling

---

## 2. Data & JSON Files

- **menu.json**  
  - Contains menu sections and items  
  - Used for OCR simulation or pre-loaded menus  

- **qr_tokens.json**  
  - Maps QR tokens to menu IDs  
  - Used to simulate QR scan  

- **analytics.json (optional)**  
  - Pre-loaded numbers for demo, e.g., scans, top clicked items  

- **localStorage (optional)**  
  - Store orders and analytics for session persistence

---

## 3. Component / Feature Plan

### **3.1 Menu Setup (OCR Simulation)**

- Components:
  - `MenuUpload.vue`
  - `OCRSimulator.vue`
- Workflow:
  1. User clicks “Scan Menu” → show **loading animation**
  2. After 1–2 seconds, load **menu.json** into frontend state
  3. Display menu items for **quick edit/correction**
- Optional: “Upload pre-tested image” button to instantly load menu

---

### **3.2 QR Code Simulation**

- Components:
  - `QRCodeGenerator.vue`
  - `QRScanSimulator.vue`
- Workflow:
  1. Menu is linked to a **predefined QR token** from `qr_tokens.json`
  2. “Scan QR” button simulates customer scanning
  3. Loads associated menu on simulated mobile view

---

### **3.3 Orders / Basket**

- Components:
  - `MenuItem.vue`
  - `Basket.vue`
  - `SendOrderButton.vue`
- Workflow:
  1. Customer taps items → added to basket (reactive array)
  2. “Send Order” → push to `orders` array (reactive or Pinia)
  3. Show **toast notification**: “New order at Table X”
  4. Optional: store in `localStorage` for persistence

---

### **3.4 Dashboard / Analytics**

- Components:
  - `Dashboard.vue`
  - `OrderList.vue`
  - `AnalyticsPanel.vue`
- Workflow:
  1. Display all orders from `orders` array
  2. Highlight new orders briefly
  3. Show counts for:
     - Total menu scans
     - Total menu views
     - Top clicked items
  4. Optional: periodic auto-refresh simulation using `setInterval` (2–3 seconds)

---

### **3.5 Order Management (Kitchen Simulation)**

- Components:
  - `KitchenOrders.vue`
- Workflow:
  1. Orders appear in **real-time** from frontend state
  2. Buttons to update order status:
     - Pending → Preparing → Ready → Served → Cancelled
  3. Show **time elapsed** since order received
  4. Update dashboard analytics in real-time

---

### **3.6 Notifications**

- Toast or subtle pop-ups when:
  - New order arrives
  - Menu updated (optional)
- Auto-dismiss after 2–3 seconds
- Highlight new order row on dashboard

---

## 4. Demo Flow (4 minutes / 8 clicks)

1. **Intro (0:30 – 1:00)**  
   - Explain digital menu value, fast setup, analytics
2. **Menu Upload / OCR Simulation (1 click)**  
   - “Scan menu” or upload pre-tested image
3. **Menu Confirmation (1 click)**  
   - Quick edit if necessary
4. **QR Code Assignment / Scan (1 click)**  
   - Link menu to table QR or simulate scan
5. **Customer Adds Items / Basket (2–3 clicks)**  
   - Tap 2–3 items
6. **Send Order (1 click)**  
   - Show toast notification
7. **Dashboard Updates (automatic)**  
   - Orders appear, new order highlighted
8. **Analytics / Top Clicked Items (automatic)**  
   - Show scan counts, menu views, top items
- Total: ≤ 8 clicks, smooth workflow

---

## 5. Deployment Steps

1. Build Vue.js project:

```bash
npm run build
````

2. Push `dist/` folder to **GitHub Pages branch** (`gh-pages`)

3. Enable GitHub Pages in repo settings:

   * Source: `gh-pages` branch
   * URL: `https://<username>.github.io/<repo>/`

4. Optional: Add `CNAME` if custom domain is needed

---

## 6. Notes / Best Practices

* Backend processing is **not required** for demo:

  * OCR simulated with pre-loaded menu JSON
  * Orders managed in reactive frontend state
  * QR scan simulated via JSON lookup
  * Analytics counters updated in frontend
* Ensure **smooth transitions and minimal clicks** to impress café owners
* Make all data **editable** so demo feels interactive
* Keep UI **bright, welcoming, intuitive**, following previously defined design guidelines

---

## 7. Validation / QA Checklist

* [x] Menu loads correctly from JSON / testData
* [x] Menu edits are saved in frontend state
* [x] QR scan simulation opens correct menu
* [x] Orders appear instantly on dashboard with toast notification
* [x] Order status updates reflect on dashboard
* [x] Analytics panel shows updated scan/click/order data
* [x] All flows complete in ≤ 4 minutes and ≤ 8 clicks
* [x] LocalStorage persistence for orders and analytics
* [x] GitHub Pages auto-detection and demo mode
* [x] Deployment scripts and documentation

## 8. Implementation Status

✅ **COMPLETED** - Frontend is ready for GitHub Pages deployment in demo mode.

See `frontend/docs/DEMO_MODE_IMPLEMENTATION.md` for implementation details.
See `frontend/docs/GITHUB_PAGES_DEPLOYMENT.md` for deployment instructions.

Key implementations:
- Auto-detection of GitHub Pages (demo mode)
- LocalStorage persistence for all data
- Updated services (order, analytics, menu)
- Deployment automation (GitHub Actions + script)
- JSON data files for initial state

---




