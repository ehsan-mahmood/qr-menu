# Digital Menu Frontend UI Design Guidelines (Distinct Concepts)

This document defines **three clearly distinct UI design directions** for the Digital Menu product. Each design has a **different visual personality, component style, and interaction model**, while still prioritising:
- Ease of use
- Welcoming, intuitive experience
- Mobile-first QR usage
- Subtle mood‑lifting (not loud or gimmicky)

The frontend engineer should treat these as **separate design systems**, not variations of the same theme.

---

## DESIGN A — "Paper Menu, But Better" (Familiar & Comfort‑First)

### Design Intent
Make users feel like they are reading a **well-designed physical paper menu**. Zero learning curve. Ideal for cafés, bakeries, small eateries.

### Color Palette
- Background: Warm paper beige `#FAF7F2`
- Primary text: Espresso brown `#2F2A25`
- Secondary text: Soft mocha `#6E6259`
- Primary action: Olive green `#7A8F5B`
- Accent: Terracotta `#C47A5A`
- Dividers: Linen gray `#E6E1DA`

### Component Style
- **Menu layout**: Vertical list (not cards)
- **Menu items**:
  - Name on left, price aligned right
  - Description below in smaller italic text
  - No images by default (optional toggle)
- **Sections**:
  - Full-width separators like printed menus
  - Section titles in serif or semi-serif font
- **Buttons**:
  - Text buttons with underline or subtle highlight
  - No big CTA blocks
- **Basket**:
  - Sticky footer bar, text-based
  - Slides up like a receipt

### Interaction Feel
- No flashy animations
- Gentle fade-ins
- Scroll feels like reading

### User Flow
1. Scan QR → menu opens instantly
2. Scroll, read, tap “+” inline
3. Basket receipt slides up
4. Send order

Best for: cafés, bakeries, breakfast spots

---

## DESIGN B — "Modern Food App" (Visual & Engaging)

### Design Intent
Feels like **Uber Eats / Deliveroo**, but simpler. Image-forward, engaging, great for restaurants with visual dishes.

### Color Palette
- Background: Pure white `#FFFFFF`
- Primary: Vibrant coral `#FF6B57`
- Secondary: Mint green `#3ECF8E`
- Accent: Lemon yellow `#FFD23F`
- Text primary: Almost black `#1F1F1F`
- Text secondary: Neutral gray `#6F6F6F`

### Component Style
- **Menu items**: Image cards
  - Large image
  - Name + price overlay
  - Add button floating on image
- **Sections**:
  - Horizontal scroll chips (tabs)
- **Buttons**:
  - Rounded pill buttons
  - Strong color presence
- **Basket**:
  - Floating action button (FAB)
  - Expands into full-screen modal

### Interaction Feel
- Micro-animations
- Add-to-basket “fly” animation
- Tap feedback and haptics (where supported)

### User Flow
1. Scan QR → hero section loads
2. Swipe sections horizontally
3. Tap card → modal → add
4. Basket FAB expands → submit

Best for: restaurants, casual dining, bars

---

## DESIGN C — "Calm Premium" (Minimal & Elegant)

### Design Intent
Feels **premium, quiet, and refined**. Designed to stay out of the way and let content breathe. Ideal for upscale cafés or modern venues.

### Color Palette
- Background: Soft off-white `#F9FAF9`
- Primary: Deep forest green `#1F3D2B`
- Secondary: Slate gray `#8A8F8C`
- Accent: Champagne gold `#C8B87A`
- Text primary: Near-black `#222222`
- Dividers: Hairline gray `#ECECEC`

### Component Style
- **Menu items**:
  - Minimal rows with generous spacing
  - Price smaller, secondary emphasis
  - Optional monochrome icons
- **Sections**:
  - Expand/collapse with no borders
- **Buttons**:
  - Ghost buttons
  - Thin outlines or underline on hover
- **Basket**:
  - Top-right icon
  - Slides in from side

### Interaction Feel
- Slow, deliberate transitions
- No bounce or playful motion
- Calm, smooth fades

### User Flow
1. Scan QR → clean menu opens
2. Expand sections deliberately
3. Add items quietly
4. Review basket in side panel

Best for: specialty coffee, premium dining, wine bars

---

## Cross‑Design Rules (Non‑Negotiable)

- Mobile-first, thumb-friendly
- Clear visual hierarchy
- Fast load (<1s perceived)
- No popups on first load
- Offline-tolerant menu rendering
- One primary action per screen

---

## Final Recommendation

For **initial demo and validation**:
- Start with **Design A or B** (fast comprehension)
- Keep Design C as a premium option later

Frontend engineer should **build components flexible enough** to support switching themes without rewriting logic (CSS variables + Tailwind config).

