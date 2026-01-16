# Digital Menu Frontend UI Design Guidelines

This document provides **three different UI design guidelines** for the Digital Menu frontend. All designs prioritize **ease of use, mobile-first, welcoming experience**, and subtle festive touches suitable for cafés, restaurants, and food businesses.

---

## **UI Design 1: Warm & Cozy Café**

**Color Palette:**
- Primary: Warm coral (#FF8360)
- Secondary: Muted teal (#5EB1BF)
- Accent: Golden yellow (#FFD166)
- Background: Soft cream (#FFF8F3)
- Text Primary: Charcoal (#333333)
- Text Secondary: Soft gray (#777777)
- Borders / Cards: Light warm gray (#EAEAEA)

**Component Design:**
- **Menu Cards:** Rounded corners, light shadow, card gradient coral → cream
- **Menu Sections:** Accordion with thin golden accent line on expanded section
- **Basket / Orders:** Floating bottom panel with primary color highlight, subtle slide-up animation
- **QR Scanner:** Fullscreen overlay, soft shadow, success indicated by glowing checkmark
- **Buttons:** Rounded, soft shadows, primary color for main actions

**User Flow:**
1. Scan QR on table → QR Store updated
2. MenuDisplay.vue loads menu → expandable sections
3. Tap MenuItem → ItemModal shows details → add to Basket
4. Basket slide-up → review and send order
5. Toast feedback for actions (item added, order sent)

---

## **UI Design 2: Bright & Subtle Festive**

**Color Palette:**
- Primary: Soft pastel orange (#F7A072)
- Secondary: Light teal (#6EC1B3)
- Accent: Sunny yellow (#FFE066)
- Background: Off-white (#FEF9F3)
- Text Primary: Dark charcoal (#2E2E2E)
- Text Secondary: Gray (#6B6B6B)
- Borders / Cards: Pale gray (#EDEDED)

**Component Design:**
- **Menu Cards:** Slightly rounded corners, subtle pastel gradient, minimal shadows
- **Menu Sections:** Collapsible sections, section title with accent dot
- **Basket / Orders:** Bottom drawer, accent buttons for confirm, subtle pop animation when adding items
- **QR Scanner:** Minimal overlay, rounded camera window, confetti animation on successful scan
- **Buttons:** Soft rounded edges, primary color for main action, accent color for secondary actions

**User Flow:**
1. Landing page with demo scan → scan QR → QR Store updates
2. Menu loaded dynamically → MenuSection expanded on tap
3. MenuItem modal for details → add to Basket Store
4. Basket drawer shows selected items → review → submit order
5. Optional: small celebratory animation for festive feel

---

## **UI Design 3: Modern Minimalist**

**Color Palette:**
- Primary: Muted coral (#FF7F6F)
- Secondary: Soft slate blue (#6B8E9B)
- Accent: Warm yellow (#FFD36E)
- Background: White (#FFFFFF)
- Text Primary: Dark slate (#2B2B2B)
- Text Secondary: Medium gray (#7A7A7A)
- Borders / Cards: Very light gray (#F0F0F0)

**Component Design:**
- **Menu Cards:** Flat design, minimal shadows, image at top, text below, add button at corner
- **Menu Sections:** Horizontal tabs for categories or simple collapsible vertical sections
- **Basket / Orders:** Floating circular button with item count → opens modal for full order
- **QR Scanner:** Clean overlay with thin border, soft pulse animation for guidance, checkmark for success
- **Buttons:** Flat, rounded, subtle hover effects, primary for key actions

**User Flow:**
1. Scan QR → menu loaded instantly → tabs or sections displayed
2. Tap MenuItem → slide-in modal for details → add to basket
3. Floating basket button shows item count → opens modal for review
4. Submit order → success toast, optional subtle celebratory animation
5. Menu scrolling smooth, minimal distraction, focus on readability

---

### **General Guidelines for All Designs**

- **Mobile-first:** All interactions optimized for touch devices
- **Typography:** Friendly sans-serif fonts (Inter, Poppins, Nunito)
- **Animations:** Subtle, smooth, enhance feedback without overwhelming
- **Readability:** High contrast for text, clear hierarchy, avoid clutter
- **Reusability:** Components should be modular and maintainable for future scaling
- **Festive touches:** Subtle, mood-brightening elements like gradients, accents, and small animations

---

**Summary:**
These three UI guidelines offer a spectrum from **warm & cozy**, to **subtle festive**, to **modern minimalist**, all prioritizing **ease of use, welcoming feel, and intuitive customer experience**. The frontend engineer can pick one as the primary direction or mix elements from all three to create a polished, user-friendly Digital Menu UI.

