# Vue.js Frontend Development Guidelines for Digital Menu

## Overview
These guidelines are for building the frontend of the Digital Menu system using Vue.js. The goal is to have a **fast, mobile-first, smooth, and demo-friendly UI** that can scale in the future and is easy for new developers to pick up.

---

## 1. Project Setup

- **Framework**: Vue 3
- **Build Tool**: Vite (fast HMR, lightweight)
- **Styling**: TailwindCSS
- **State Management**: Pinia
- **Directory Structure**:
```
/src
  /assets      # Images, icons
  /components  # Reusable UI components
  /pages       # Main pages
  /router      # Vue Router config
  /stores      # Pinia stores
  /services    # API calls
  /utils       # Helper functions
```

---

## 2. Pages & Components

**Pages:**
- `Landing.vue`: Demo start, QR scan initiation
- `MenuDisplay.vue`: Menu sections and items
- `Basket.vue`: Review and send orders
- `QRManagement.vue`: Add / scan QR codes
- `OCRImport.vue`: Upload and parse paper menus
- `Dashboard.vue`: Merchant analytics

**Components:**
- `MenuSection.vue`: Collapsible section with menu items
- `MenuItem.vue`: Displays single menu item with add-to-basket functionality
- `ItemModal.vue`: Detailed item view popup
- `AnalyticsTable.vue`: Shows top scanned items and counts
- `TopItems.vue`: Chart/table for top items
- `QRScanner.vue`: Camera-based QR scanner

---

## 3. Routing (Vue Router)

| Route | Component | Notes |
|-------|-----------|-------|
| `/` | Landing.vue | Demo start / QR scan |
| `/menu/:menuId` | MenuDisplay.vue | Load menu by QR token |
| `/basket` | Basket.vue | Review / send order |
| `/qr` | QRManagement.vue | Add / scan QR codes |
| `/ocr` | OCRImport.vue | Upload & parse menu |
| `/dashboard` | Dashboard.vue | Merchant analytics |

---

## 4. State Management (Pinia)

**Stores:**
1. **Menu Store** → holds current menu data
2. **Basket Store** → items selected for order
3. **QR Store** → scanned QR token and table info
4. **Analytics Store** → dashboard data and events

---

## 5. Services Layer

**Purpose:** handle all API interactions.

- `menuService.js` → GET menu by QR token, GET menu items
- `orderService.js` → POST order, PATCH order status
- `analyticsService.js` → POST events (`qr_scan`, `menu_view`, `item_click`)
- `qrService.js` → POST/GET QR codes
- `ocrService.js` → POST OCR images, GET parsed text

---

## 6. Styling & UX Guidelines

- **Mobile-first** responsive design
- **Smooth transitions** using `<Transition>` component
- **Lazy-load** images and menu sections for performance
- **QR scanner** integration via HTML5 `getUserMedia`
- **Lightweight pages**, <200 KB JS bundle for demo
- Minimize clicks: expand/collapse sections, swipe gestures optional
- Quick demo flow: OCR import, menu load, QR scan to table

---

## 7. Component & Store Interaction

**Flow:**
1. Landing.vue → scan QR → updates QR Store → fetches menu via Menu Store
2. MenuDisplay.vue → renders MenuSection.vue and MenuItem.vue → adds items to Basket Store
3. Basket.vue → reads Basket Store → submits order via orderService
4. Dashboard.vue → reads Analytics Store → shows charts/tables
5. OCRImport.vue → uploads image → parsed data saved to Menu Store for editing

**Notes:** components should be reusable, stateless where possible, and communicate via props/events or Pinia stores.

---



## Summary
- Start with **Vue 3 + Vite + Tailwind + Pinia SPA**
- Keep **components reusable** and mobile-first
- Use **Pinia** for global state
- **Services layer** handles all API calls
- Migrate to **Nuxt** only if SSR/public pages are required
- Prioritize **fast load, smooth demo, and minimal friction** for café onboarding

