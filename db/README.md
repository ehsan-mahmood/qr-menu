# Database Setup Guide

## Overview

This directory contains SQL scripts and utilities for setting up the QR Menu PostgreSQL database.

## Files

- `create_tables.sql` - Creates all database tables and schema
- `seed_demo_data.sql` - Loads demo data for testing
- `setup_database.sh` - Automated setup script
- `db_documentation.md` - Complete schema documentation

## Quick Start

### Option 1: Using the Setup Script (Recommended)

```bash
cd db
./setup_database.sh
```

The script will:
1. Test database connection
2. Create all tables
3. Optionally load demo data

### Option 2: Manual Setup

```bash
# Create tables
psql -U postgres -d qrmenu -f create_tables.sql

# Load demo data (optional)
psql -U postgres -d qrmenu -f seed_demo_data.sql
```

## Database Connection

Default connection parameters:
- **Database:** `qrmenu`
- **Host:** `localhost`
- **Port:** `5432`
- **User:** `postgres`

Set environment variables to override:
```bash
export DB_NAME=qrmenu
export DB_USER=postgres
export DB_HOST=localhost
export DB_PORT=5432
export DB_PASSWORD=yourpassword
```

## Demo Data

The `seed_demo_data.sql` script creates:

### Merchant: **Cafe Delight**
- **ID:** `a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d`
- **Email:** `demo@cafedelight.com`
- **Phone:** `+1-555-0123`

### Location: **Cafe Delight Downtown**
- **Address:** 123 Main Street, Downtown, CA 94101

### Menu: **All Day Menu**
Contains 6 sections with 40+ items:

1. **Coffee & Beverages** (10 items)
   - Espresso, Americano, Cappuccino, Latte, Mocha, etc.

2. **Breakfast** (7 items)
   - Avocado Toast, Eggs Benedict, Pancakes, French Toast, etc.

3. **Lunch** (5 items)
   - Grilled Chicken Bowl, Fish & Chips, Pizza, Burger, Pasta

4. **Sandwiches & Wraps** (5 items)
   - Turkey Club, BLT, Caesar Wrap, Veggie Wrap, Tuna Melt

5. **Salads** (4 items)
   - Caesar, Greek, Cobb, Quinoa Power Bowl

6. **Desserts** (5 items)
   - Cheesecake, Brownie, Tiramisu, Apple Pie, Ice Cream

### QR Codes (5 tables)
- Table 1: `demo-cafe-table-1`
- Table 2: `demo-cafe-table-2`
- Table 3: `demo-cafe-table-3`
- Table 4: `demo-cafe-table-4`
- Counter: `demo-cafe-counter`

### Analytics Events (~350 events)
- **QR Scans:** ~150 events over 30 days
- **Menu Views:** ~200 events
- **Item Clicks:** Popular items tracked
  - Latte (most clicked)
  - Avocado Toast
  - Beef Burger
  - Cappuccino
  - Caesar Salad

### Sample Orders
- 1 draft order (in progress)
- 1 submitted order
- 1 completed order

## Verification Queries

After loading data, verify with these queries:

```sql
-- Check merchant
SELECT * FROM merchants WHERE email = 'demo@cafedelight.com';

-- Check menu items count
SELECT ms.title, COUNT(mi.id) as item_count
FROM menu_sections ms
LEFT JOIN menu_items mi ON mi.section_id = ms.id
GROUP BY ms.title, ms.sort_order
ORDER BY ms.sort_order;

-- Check analytics events
SELECT event_type, COUNT(*) as count
FROM events
WHERE merchant_id = 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d'
GROUP BY event_type;

-- Top 5 clicked items
SELECT mi.name, COUNT(e.id) as clicks
FROM events e
JOIN menu_items mi ON e.menu_item_id = mi.id
WHERE e.merchant_id = 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d'
  AND e.event_type = 'item_click'
GROUP BY mi.name
ORDER BY clicks DESC
LIMIT 5;

-- Check QR codes
SELECT qr_token, table_label
FROM table_qrs tq
JOIN locations l ON tq.location_id = l.id
JOIN merchants m ON l.merchant_id = m.id
WHERE m.email = 'demo@cafedelight.com';
```

## API Integration

To use this demo data with your backend:

### Get Menu by Merchant ID
```sql
SELECT 
    mi.id, mi.name, mi.description, mi.price_cents,
    ms.title as category
FROM menu_items mi
JOIN menu_sections ms ON mi.section_id = ms.id
JOIN menus m ON ms.menu_id = m.id
JOIN locations l ON m.location_id = l.id
WHERE l.merchant_id = 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d'
  AND m.is_active = true
  AND mi.is_available = true
ORDER BY ms.sort_order, mi.sort_order;
```

### Get Menu by QR Token
```sql
SELECT 
    m.id as merchant_id,
    m.name as merchant_name,
    me.name as menu_name,
    tq.table_label
FROM table_qrs tq
JOIN locations l ON tq.location_id = l.id
JOIN merchants m ON l.merchant_id = m.id
JOIN menus me ON tq.menu_id = me.id
WHERE tq.qr_token = 'demo-cafe-table-1';
```

### Log Event
```sql
INSERT INTO events (merchant_id, event_type, menu_item_id)
VALUES (
    'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
    'item_click',
    '10000000-0000-0000-0000-000000000004'
);
```

### Get Dashboard Stats
```sql
-- QR Scans (last 7 days)
SELECT COUNT(*) as scans_7_days
FROM events
WHERE merchant_id = 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d'
  AND event_type = 'qr_scan'
  AND created_at >= NOW() - INTERVAL '7 days';

-- QR Scans (last 30 days)
SELECT COUNT(*) as scans_30_days
FROM events
WHERE merchant_id = 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d'
  AND event_type = 'qr_scan'
  AND created_at >= NOW() - INTERVAL '30 days';

-- Menu Views
SELECT COUNT(*) as views_7_days
FROM events
WHERE merchant_id = 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d'
  AND event_type = 'menu_view'
  AND created_at >= NOW() - INTERVAL '7 days';

-- Top Items
SELECT mi.name, COUNT(e.id) as clicks
FROM events e
JOIN menu_items mi ON e.menu_item_id = mi.id
WHERE e.merchant_id = 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d'
  AND e.event_type = 'item_click'
GROUP BY mi.name
ORDER BY clicks DESC
LIMIT 5;
```

## Clean Up Demo Data

To remove all demo data:

```sql
DELETE FROM events WHERE merchant_id = 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d';
DELETE FROM merchants WHERE email = 'demo@cafedelight.com';
-- Cascade deletes will remove all related data
```

## Troubleshooting

### Connection Refused
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Start PostgreSQL
sudo systemctl start postgresql
```

### Database Doesn't Exist
```bash
# Create database
createdb -U postgres qrmenu

# Or via psql
psql -U postgres -c "CREATE DATABASE qrmenu;"
```

### Permission Denied
```bash
# Grant privileges
psql -U postgres -d qrmenu -c "GRANT ALL PRIVILEGES ON DATABASE qrmenu TO your_user;"
```

### Reset Everything
```bash
# Drop and recreate database
dropdb -U postgres qrmenu
createdb -U postgres qrmenu
./setup_database.sh
```

## Testing the Setup

After setup, test with:

```bash
# Count tables
psql -U postgres -d qrmenu -c "\dt"

# Count records in merchants
psql -U postgres -d qrmenu -c "SELECT COUNT(*) FROM merchants;"

# Check demo merchant
psql -U postgres -d qrmenu -c "SELECT name, email FROM merchants WHERE email = 'demo@cafedelight.com';"
```

## Next Steps

1. ✅ Database tables created
2. ✅ Demo data loaded
3. 🔄 Configure backend to connect to database
4. 🔄 Test API endpoints
5. 🔄 Test frontend with real data

---

**Need help?** Check `db_documentation.md` for complete schema details.

