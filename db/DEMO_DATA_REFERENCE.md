# Demo Data Quick Reference

## 🏪 Merchant Details

**Name:** Cafe Delight  
**ID:** `a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d`  
**Email:** demo@cafedelight.com  
**Phone:** +1-555-0123  

**Location:** Cafe Delight Downtown  
**Address:** 123 Main Street, Downtown, CA 94101  

---

## 🔲 Menu Access

**Merchant Slug:** `cafe-delight`

**Main Menu URL:**
```
http://192.168.1.13:3000/m/cafe-delight
```

### QR Codes (for future ordering feature)

| Table | QR Token | Notes |
|-------|----------|-------|
| Table 1 | `demo-cafe-table-1` | For tracking table-specific orders |
| Table 2 | `demo-cafe-table-2` | For tracking table-specific orders |
| Table 3 | `demo-cafe-table-3` | For tracking table-specific orders |
| Table 4 | `demo-cafe-table-4` | For tracking table-specific orders |
| Counter | `demo-cafe-counter` | For counter orders |

---

## 📋 Menu Overview

### ☕ Coffee & Beverages (10 items)
- Espresso ($3.50)
- Americano ($4.25)
- Cappuccino ($4.75) ⭐ Top 5
- Latte ($4.95) ⭐ #1 Most Clicked!
- Mocha ($5.45)
- Flat White ($4.95)
- Iced Coffee ($4.50)
- Chai Latte ($4.75)
- Hot Chocolate ($4.50)
- Fresh Orange Juice ($5.25)

### 🍳 Breakfast (7 items)
- Avocado Toast ($12.50) ⭐ Top 5
- Classic Eggs Benedict ($14.50)
- Pancake Stack ($11.50)
- French Toast ($12.00)
- Breakfast Burrito ($13.50)
- Granola Bowl ($9.95)
- Veggie Omelette ($10.95)

### 🍽️ Lunch (5 items)
- Grilled Chicken Bowl ($14.95)
- Fish & Chips ($16.95)
- Margherita Pizza ($13.95)
- Beef Burger ($15.95) ⭐ Top 5
- Pasta Carbonara ($14.95)

### 🥪 Sandwiches & Wraps (5 items)
- Turkey Club ($12.95)
- BLT Sandwich ($10.95)
- Chicken Caesar Wrap ($11.95)
- Veggie Wrap ($10.95)
- Tuna Melt ($11.95)

### 🥗 Salads (4 items)
- Caesar Salad ($9.95) ⭐ Top 5
- Greek Salad ($10.95)
- Cobb Salad ($13.95)
- Quinoa Power Bowl ($12.95)

### 🍰 Desserts (5 items)
- New York Cheesecake ($7.95)
- Chocolate Brownie ($6.95)
- Tiramisu ($7.50)
- Apple Pie ($6.95)
- Ice Cream Sundae ($6.50)

**Total Menu Items:** 40+

---

## 📊 Analytics Data

### Events Summary (Last 30 Days)
- **QR Scans:** ~150 scans
- **Menu Views:** ~200 views
- **Item Clicks:** ~185 clicks

### Top 5 Most Clicked Items
1. **Latte** - 50 clicks
2. **Avocado Toast** - 40 clicks
3. **Beef Burger** - 35 clicks
4. **Cappuccino** - 30 clicks
5. **Caesar Salad** - 25 clicks

---

## 🛒 Sample Orders

### Draft Order (Table 1)
- 2x Latte ($4.95 each)
- 1x Pancake Stack ($11.50)
- **Total:** $19.40

### Submitted Order (Table 2 - Yesterday)
- 1x Avocado Toast ($12.50)
- 1x Beef Burger ($15.95)
- 1x Cappuccino ($4.75)
- **Total:** $32.85

### Completed Order (Table 3 - 2 days ago)
- 1x Fish & Chips ($16.95)
- 1x Caesar Salad ($9.95)
- **Total:** $26.90

---

## 🧪 Testing Scenarios

### 1. Customer Scanning QR Code
```
1. Open: http://192.168.1.13:3000/m/cafe-delight
2. Should see: "Cafe Delight" menu with all categories
3. Event logged: menu_view
4. Click any item → item_click event logged
```

### 2. Merchant Dashboard
```
1. Login with: demo@cafedelight.com
2. View stats:
   - QR scans (7/30 days)
   - Menu views (7/30 days)
   - Top 5 clicked items
```

### 3. Menu Editing Flow
```
1. Start setup: /setup/scan
2. Upload menu image
3. Review items: /setup/review
4. Edit Cafe Delight menu
5. Generate new QR code
```

---

## 🔍 Useful SQL Queries

### Check Demo Data
```sql
-- Verify merchant
SELECT * FROM merchants WHERE email = 'demo@cafedelight.com';

-- Count menu items
SELECT COUNT(*) FROM menu_items mi
JOIN menu_sections ms ON mi.section_id = ms.id
JOIN menus m ON ms.menu_id = m.id
JOIN locations l ON m.location_id = l.id
WHERE l.merchant_id = 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d';

-- View top items
SELECT mi.name, COUNT(e.id) as clicks
FROM events e
JOIN menu_items mi ON e.menu_item_id = mi.id
WHERE e.merchant_id = 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d'
  AND e.event_type = 'item_click'
GROUP BY mi.name
ORDER BY clicks DESC
LIMIT 5;
```

### Add New Event
```sql
-- Log a QR scan
INSERT INTO events (merchant_id, event_type)
VALUES ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'qr_scan');

-- Log item click (Latte)
INSERT INTO events (merchant_id, event_type, menu_item_id)
VALUES (
    'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
    'item_click',
    '10000000-0000-0000-0000-000000000004'
);
```

---

## 🚀 Quick Setup Commands

```bash
# 1. Setup database
cd /home/dev/qrmenu/db
./setup_database.sh

# 2. Verify data loaded
psql -U postgres -d qrmenu -c "SELECT name FROM merchants WHERE email = 'demo@cafedelight.com';"

# 3. Start frontend
cd /home/dev/qrmenu/frontend
npm run dev

# 4. Access from browser
# http://192.168.1.13:3000
# http://192.168.1.13:3000/m/demo-cafe-table-1
```

---

## 📱 Mobile Testing URLs

**Landing Page:**
```
http://192.168.1.13:3000
```

**Public Menu (scan this with phone):**
```
http://192.168.1.13:3000/m/cafe-delight
```

**Setup Flow:**
```
http://192.168.1.13:3000/setup/scan
```

**Dashboard (requires login):**
```
http://192.168.1.13:3000/dashboard
```

---

## 💡 Tips for Testing

1. **Test QR Scanning:** Use your phone to scan and view the menu
2. **Click Items:** Click various items to generate click events
3. **Check Dashboard:** Login to see updated stats
4. **Try Different Tables:** Each QR code tracks separately
5. **Add Events:** Manually add events via SQL to test analytics

---

## 🔧 Troubleshooting

**Menu not showing?**
- Check database connection
- Verify merchant_id in queries
- Check if menu is active: `is_active = true`

**Events not tracking?**
- Check merchant_id matches
- Verify event_type values
- Check timestamps are recent

**Items not displaying?**
- Verify `is_available = true`
- Check sort_order for proper ordering
- Ensure section_id FK is correct

---

**Ready to test the whole system!** 🎉

