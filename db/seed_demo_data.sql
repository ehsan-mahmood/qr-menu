-- ==================================================
-- DEMO DATA: Cafe Delight
-- Purpose: Populate database with realistic test data
-- ==================================================

-- Clean up existing demo data (if any)
DELETE FROM events WHERE merchant_id IN (SELECT id FROM merchants WHERE email = 'demo@cafedelight.com');
DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE table_qr_id IN (SELECT id FROM table_qrs WHERE location_id IN (SELECT id FROM locations WHERE merchant_id IN (SELECT id FROM merchants WHERE email = 'demo@cafedelight.com'))));
DELETE FROM orders WHERE table_qr_id IN (SELECT id FROM table_qrs WHERE location_id IN (SELECT id FROM locations WHERE merchant_id IN (SELECT id FROM merchants WHERE email = 'demo@cafedelight.com')));
DELETE FROM table_qrs WHERE location_id IN (SELECT id FROM locations WHERE merchant_id IN (SELECT id FROM merchants WHERE email = 'demo@cafedelight.com'));
DELETE FROM menu_items WHERE section_id IN (SELECT id FROM menu_sections WHERE menu_id IN (SELECT id FROM menus WHERE location_id IN (SELECT id FROM locations WHERE merchant_id IN (SELECT id FROM merchants WHERE email = 'demo@cafedelight.com'))));
DELETE FROM menu_sections WHERE menu_id IN (SELECT id FROM menus WHERE location_id IN (SELECT id FROM locations WHERE merchant_id IN (SELECT id FROM merchants WHERE email = 'demo@cafedelight.com')));
DELETE FROM menus WHERE location_id IN (SELECT id FROM locations WHERE merchant_id IN (SELECT id FROM merchants WHERE email = 'demo@cafedelight.com'));
DELETE FROM locations WHERE merchant_id IN (SELECT id FROM merchants WHERE email = 'demo@cafedelight.com');
DELETE FROM ocr_imports WHERE merchant_id IN (SELECT id FROM merchants WHERE email = 'demo@cafedelight.com');
DELETE FROM merchants WHERE email = 'demo@cafedelight.com';

-- ==================================================
-- 1. Create Demo Merchant
-- ==================================================
-- Note: Ensure merchants table has slug column (run add_merchant_slug.sql if needed)
INSERT INTO merchants (id, name, email, phone, slug, created_at) VALUES
('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Cafe Delight', 'demo@cafedelight.com', '+1-555-0123', 'cafe-delight', NOW() - INTERVAL '30 days');

-- ==================================================
-- 2. Create Location
-- ==================================================
INSERT INTO locations (id, merchant_id, name, address, created_at) VALUES
('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Cafe Delight Downtown', '123 Main Street, Downtown, CA 94101', NOW() - INTERVAL '30 days');

-- ==================================================
-- 3. Create Menu
-- ==================================================
INSERT INTO menus (id, location_id, name, is_active, created_at) VALUES
('c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f', 'b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e', 'All Day Menu', true, NOW() - INTERVAL '29 days');

-- ==================================================
-- 4. Create Menu Sections
-- ==================================================
INSERT INTO menu_sections (id, menu_id, title, sort_order) VALUES
-- Coffee & Beverages
('d4e5f6a7-b8c9-4d5e-1f2a-3b4c5d6e7f8a', 'c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f', 'Coffee & Beverages', 1),
-- Breakfast
('e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9b', 'c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f', 'Breakfast', 2),
-- Lunch
('f6a7b8c9-d0e1-4f5a-3b4c-5d6e7f8a9b0c', 'c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f', 'Lunch', 3),
-- Sandwiches & Wraps
('a7b8c9d0-e1f2-4a5b-4c5d-6e7f8a9b0c1d', 'c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f', 'Sandwiches & Wraps', 4),
-- Salads
('b8c9d0e1-f2a3-4b5c-5d6e-7f8a9b0c1d2e', 'c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f', 'Salads', 5),
-- Desserts
('c9d0e1f2-a3b4-4c5d-6e7f-8a9b0c1d2e3f', 'c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f', 'Desserts', 6);

-- ==================================================
-- 5. Create Menu Items
-- ==================================================

-- Coffee & Beverages Section
INSERT INTO menu_items (id, section_id, name, description, price_cents, is_available, sort_order) VALUES
('10000000-0000-0000-0000-000000000001', 'd4e5f6a7-b8c9-4d5e-1f2a-3b4c5d6e7f8a', 'Espresso', 'Rich and bold single shot', 350, true, 1),
('10000000-0000-0000-0000-000000000002', 'd4e5f6a7-b8c9-4d5e-1f2a-3b4c5d6e7f8a', 'Americano', 'Espresso with hot water', 425, true, 2),
('10000000-0000-0000-0000-000000000003', 'd4e5f6a7-b8c9-4d5e-1f2a-3b4c5d6e7f8a', 'Cappuccino', 'Espresso with steamed milk and foam', 475, true, 3),
('10000000-0000-0000-0000-000000000004', 'd4e5f6a7-b8c9-4d5e-1f2a-3b4c5d6e7f8a', 'Latte', 'Smooth espresso with steamed milk', 495, true, 4),
('10000000-0000-0000-0000-000000000005', 'd4e5f6a7-b8c9-4d5e-1f2a-3b4c5d6e7f8a', 'Mocha', 'Chocolate and espresso with steamed milk', 545, true, 5),
('10000000-0000-0000-0000-000000000006', 'd4e5f6a7-b8c9-4d5e-1f2a-3b4c5d6e7f8a', 'Flat White', 'Velvety microfoam with double shot', 495, true, 6),
('10000000-0000-0000-0000-000000000007', 'd4e5f6a7-b8c9-4d5e-1f2a-3b4c5d6e7f8a', 'Iced Coffee', 'Cold brew over ice', 450, true, 7),
('10000000-0000-0000-0000-000000000008', 'd4e5f6a7-b8c9-4d5e-1f2a-3b4c5d6e7f8a', 'Chai Latte', 'Spiced tea with steamed milk', 475, true, 8),
('10000000-0000-0000-0000-000000000009', 'd4e5f6a7-b8c9-4d5e-1f2a-3b4c5d6e7f8a', 'Hot Chocolate', 'Rich chocolate with whipped cream', 450, true, 9),
('10000000-0000-0000-0000-000000000010', 'd4e5f6a7-b8c9-4d5e-1f2a-3b4c5d6e7f8a', 'Fresh Orange Juice', 'Freshly squeezed oranges', 525, true, 10);

-- Breakfast Section
INSERT INTO menu_items (id, section_id, name, description, price_cents, is_available, sort_order) VALUES
('20000000-0000-0000-0000-000000000001', 'e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9b', 'Avocado Toast', 'Smashed avocado on sourdough with cherry tomatoes', 1250, true, 1),
('20000000-0000-0000-0000-000000000002', 'e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9b', 'Classic Eggs Benedict', 'Poached eggs, hollandaise, English muffin', 1450, true, 2),
('20000000-0000-0000-0000-000000000003', 'e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9b', 'Pancake Stack', 'Fluffy buttermilk pancakes with maple syrup', 1150, true, 3),
('20000000-0000-0000-0000-000000000004', 'e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9b', 'French Toast', 'Brioche bread with berries and cream', 1200, true, 4),
('20000000-0000-0000-0000-000000000005', 'e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9b', 'Breakfast Burrito', 'Scrambled eggs, bacon, cheese, avocado', 1350, true, 5),
('20000000-0000-0000-0000-000000000006', 'e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9b', 'Granola Bowl', 'Greek yogurt, house granola, fresh berries', 995, true, 6),
('20000000-0000-0000-0000-000000000007', 'e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9b', 'Veggie Omelette', 'Three eggs with seasonal vegetables', 1095, true, 7);

-- Lunch Section
INSERT INTO menu_items (id, section_id, name, description, price_cents, is_available, sort_order) VALUES
('30000000-0000-0000-0000-000000000001', 'f6a7b8c9-d0e1-4f5a-3b4c-5d6e7f8a9b0c', 'Grilled Chicken Bowl', 'Quinoa, grilled chicken, roasted vegetables', 1495, true, 1),
('30000000-0000-0000-0000-000000000002', 'f6a7b8c9-d0e1-4f5a-3b4c-5d6e7f8a9b0c', 'Fish & Chips', 'Beer-battered fish with hand-cut fries', 1695, true, 2),
('30000000-0000-0000-0000-000000000003', 'f6a7b8c9-d0e1-4f5a-3b4c-5d6e7f8a9b0c', 'Margherita Pizza', 'Fresh mozzarella, basil, tomato sauce', 1395, true, 3),
('30000000-0000-0000-0000-000000000004', 'f6a7b8c9-d0e1-4f5a-3b4c-5d6e7f8a9b0c', 'Beef Burger', 'Angus beef, lettuce, tomato, special sauce', 1595, true, 4),
('30000000-0000-0000-0000-000000000005', 'f6a7b8c9-d0e1-4f5a-3b4c-5d6e7f8a9b0c', 'Pasta Carbonara', 'Creamy sauce, bacon, parmesan', 1495, true, 5);

-- Sandwiches & Wraps Section
INSERT INTO menu_items (id, section_id, name, description, price_cents, is_available, sort_order) VALUES
('40000000-0000-0000-0000-000000000001', 'a7b8c9d0-e1f2-4a5b-4c5d-6e7f8a9b0c1d', 'Turkey Club', 'Triple-decker with bacon, lettuce, tomato', 1295, true, 1),
('40000000-0000-0000-0000-000000000002', 'a7b8c9d0-e1f2-4a5b-4c5d-6e7f8a9b0c1d', 'BLT Sandwich', 'Crispy bacon, lettuce, tomato on sourdough', 1095, true, 2),
('40000000-0000-0000-0000-000000000003', 'a7b8c9d0-e1f2-4a5b-4c5d-6e7f8a9b0c1d', 'Chicken Caesar Wrap', 'Grilled chicken, romaine, parmesan, Caesar dressing', 1195, true, 3),
('40000000-0000-0000-0000-000000000004', 'a7b8c9d0-e1f2-4a5b-4c5d-6e7f8a9b0c1d', 'Veggie Wrap', 'Hummus, roasted vegetables, feta cheese', 1095, true, 4),
('40000000-0000-0000-0000-000000000005', 'a7b8c9d0-e1f2-4a5b-4c5d-6e7f8a9b0c1d', 'Tuna Melt', 'Albacore tuna, melted cheese on rye', 1195, true, 5);

-- Salads Section
INSERT INTO menu_items (id, section_id, name, description, price_cents, is_available, sort_order) VALUES
('50000000-0000-0000-0000-000000000001', 'b8c9d0e1-f2a3-4b5c-5d6e-7f8a9b0c1d2e', 'Caesar Salad', 'Romaine, croutons, parmesan, Caesar dressing', 995, true, 1),
('50000000-0000-0000-0000-000000000002', 'b8c9d0e1-f2a3-4b5c-5d6e-7f8a9b0c1d2e', 'Greek Salad', 'Cucumber, tomato, olives, feta cheese', 1095, true, 2),
('50000000-0000-0000-0000-000000000003', 'b8c9d0e1-f2a3-4b5c-5d6e-7f8a9b0c1d2e', 'Cobb Salad', 'Chicken, bacon, egg, avocado, blue cheese', 1395, true, 3),
('50000000-0000-0000-0000-000000000004', 'b8c9d0e1-f2a3-4b5c-5d6e-7f8a9b0c1d2e', 'Quinoa Power Bowl', 'Quinoa, kale, roasted chickpeas, tahini dressing', 1295, true, 4);

-- Desserts Section
INSERT INTO menu_items (id, section_id, name, description, price_cents, is_available, sort_order) VALUES
('60000000-0000-0000-0000-000000000001', 'c9d0e1f2-a3b4-4c5d-6e7f-8a9b0c1d2e3f', 'New York Cheesecake', 'Classic creamy cheesecake with berry compote', 795, true, 1),
('60000000-0000-0000-0000-000000000002', 'c9d0e1f2-a3b4-4c5d-6e7f-8a9b0c1d2e3f', 'Chocolate Brownie', 'Warm brownie with vanilla ice cream', 695, true, 2),
('60000000-0000-0000-0000-000000000003', 'c9d0e1f2-a3b4-4c5d-6e7f-8a9b0c1d2e3f', 'Tiramisu', 'Italian coffee-soaked dessert', 750, true, 3),
('60000000-0000-0000-0000-000000000004', 'c9d0e1f2-a3b4-4c5d-6e7f-8a9b0c1d2e3f', 'Apple Pie', 'Homemade apple pie with cinnamon', 695, true, 4),
('60000000-0000-0000-0000-000000000005', 'c9d0e1f2-a3b4-4c5d-6e7f-8a9b0c1d2e3f', 'Ice Cream Sundae', 'Three scoops with toppings', 650, true, 5);

-- ==================================================
-- 6. Create QR Codes for Tables
-- ==================================================
INSERT INTO table_qrs (id, location_id, menu_id, qr_token, table_label, created_at) VALUES
('qr00000-0000-0000-0000-000000000001', 'b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e', 'c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f', 'demo-cafe-table-1', 'Table 1', NOW() - INTERVAL '29 days'),
('qr00000-0000-0000-0000-000000000002', 'b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e', 'c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f', 'demo-cafe-table-2', 'Table 2', NOW() - INTERVAL '29 days'),
('qr00000-0000-0000-0000-000000000003', 'b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e', 'c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f', 'demo-cafe-table-3', 'Table 3', NOW() - INTERVAL '29 days'),
('qr00000-0000-0000-0000-000000000004', 'b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e', 'c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f', 'demo-cafe-table-4', 'Table 4', NOW() - INTERVAL '29 days'),
('qr00000-0000-0000-0000-000000000005', 'b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e', 'c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f', 'demo-cafe-counter', 'Counter', NOW() - INTERVAL '29 days');

-- ==================================================
-- 7. Create Sample Events (for analytics)
-- ==================================================

-- QR Scans over the last 30 days
INSERT INTO events (merchant_id, event_type, created_at)
SELECT 
    'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
    'qr_scan',
    NOW() - (random() * INTERVAL '30 days')
FROM generate_series(1, 150);

-- Menu Views
INSERT INTO events (merchant_id, event_type, created_at)
SELECT 
    'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
    'menu_view',
    NOW() - (random() * INTERVAL '30 days')
FROM generate_series(1, 200);

-- Item Clicks (with specific popular items)
INSERT INTO events (merchant_id, event_type, menu_item_id, created_at)
VALUES
-- Latte is most popular (50 clicks)
('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'item_click', '10000000-0000-0000-0000-000000000004', NOW() - INTERVAL '1 day'),
('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'item_click', '10000000-0000-0000-0000-000000000004', NOW() - INTERVAL '2 days'),
('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'item_click', '10000000-0000-0000-0000-000000000004', NOW() - INTERVAL '3 days'),
('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'item_click', '10000000-0000-0000-0000-000000000004', NOW() - INTERVAL '4 days'),
('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'item_click', '10000000-0000-0000-0000-000000000004', NOW() - INTERVAL '5 days');

-- Avocado Toast (40 clicks)
INSERT INTO events (merchant_id, event_type, menu_item_id, created_at)
SELECT 
    'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
    'item_click',
    '20000000-0000-0000-0000-000000000001',
    NOW() - (random() * INTERVAL '30 days')
FROM generate_series(1, 40);

-- Beef Burger (35 clicks)
INSERT INTO events (merchant_id, event_type, menu_item_id, created_at)
SELECT 
    'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
    'item_click',
    '30000000-0000-0000-0000-000000000004',
    NOW() - (random() * INTERVAL '30 days')
FROM generate_series(1, 35);

-- Cappuccino (30 clicks)
INSERT INTO events (merchant_id, event_type, menu_item_id, created_at)
SELECT 
    'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
    'item_click',
    '10000000-0000-0000-0000-000000000003',
    NOW() - (random() * INTERVAL '30 days')
FROM generate_series(1, 30);

-- Caesar Salad (25 clicks)
INSERT INTO events (merchant_id, event_type, menu_item_id, created_at)
SELECT 
    'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
    'item_click',
    '50000000-0000-0000-0000-000000000001',
    NOW() - (random() * INTERVAL '30 days')
FROM generate_series(1, 25);

-- ==================================================
-- 8. Create Sample Orders
-- ==================================================

-- Draft order (current customer at Table 1)
INSERT INTO orders (id, table_qr_id, status, total_cents, created_at, updated_at) VALUES
('order000-0000-0000-0000-000000000001', 'qr00000-0000-0000-0000-000000000001', 'draft', 1940, NOW() - INTERVAL '10 minutes', NOW() - INTERVAL '5 minutes');

INSERT INTO order_items (order_id, menu_item_id, quantity, price_cents) VALUES
('order000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000004', 2, 495), -- 2x Latte
('order000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000003', 1, 950); -- 1x Pancake Stack

-- Submitted order (from yesterday)
INSERT INTO orders (id, table_qr_id, status, total_cents, created_at, updated_at) VALUES
('order000-0000-0000-0000-000000000002', 'qr00000-0000-0000-0000-000000000002', 'submitted', 3285, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day');

INSERT INTO order_items (order_id, menu_item_id, quantity, price_cents) VALUES
('order000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 1, 1250), -- Avocado Toast
('order000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000004', 1, 1595), -- Beef Burger
('order000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003', 1, 475);  -- Cappuccino

-- Completed order
INSERT INTO orders (id, table_qr_id, status, total_cents, created_at, updated_at) VALUES
('order000-0000-0000-0000-000000000003', 'qr00000-0000-0000-0000-000000000003', 'completed', 2690, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days');

INSERT INTO order_items (order_id, menu_item_id, quantity, price_cents) VALUES
('order000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000002', 1, 1695), -- Fish & Chips
('order000-0000-0000-0000-000000000003', '50000000-0000-0000-0000-000000000001', 1, 995);  -- Caesar Salad

-- ==================================================
-- VERIFICATION QUERIES
-- ==================================================

-- Check merchant
SELECT 'Merchant Created:' as info, id, name, email FROM merchants WHERE email = 'demo@cafedelight.com';

-- Check location
SELECT 'Location Created:' as info, l.id, l.name, l.address 
FROM locations l 
JOIN merchants m ON l.merchant_id = m.id 
WHERE m.email = 'demo@cafedelight.com';

-- Check menu
SELECT 'Menu Created:' as info, me.id, me.name, me.is_active 
FROM menus me 
JOIN locations l ON me.location_id = l.id 
JOIN merchants m ON l.merchant_id = m.id 
WHERE m.email = 'demo@cafedelight.com';

-- Check sections count
SELECT 'Menu Sections:' as info, COUNT(*) as section_count 
FROM menu_sections ms 
JOIN menus me ON ms.menu_id = me.id 
JOIN locations l ON me.location_id = l.id 
JOIN merchants m ON l.merchant_id = m.id 
WHERE m.email = 'demo@cafedelight.com';

-- Check items count
SELECT 'Menu Items:' as info, COUNT(*) as item_count 
FROM menu_items mi 
JOIN menu_sections ms ON mi.section_id = ms.id 
JOIN menus me ON ms.menu_id = me.id 
JOIN locations l ON me.location_id = l.id 
JOIN merchants m ON l.merchant_id = m.id 
WHERE m.email = 'demo@cafedelight.com';

-- Check QR codes
SELECT 'QR Codes:' as info, COUNT(*) as qr_count 
FROM table_qrs tq 
JOIN locations l ON tq.location_id = l.id 
JOIN merchants m ON l.merchant_id = m.id 
WHERE m.email = 'demo@cafedelight.com';

-- Check events summary
SELECT 
    'Events Summary:' as info,
    event_type, 
    COUNT(*) as event_count 
FROM events 
WHERE merchant_id = 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d'
GROUP BY event_type
ORDER BY event_type;

-- Check orders
SELECT 'Orders:' as info, status, COUNT(*) as order_count 
FROM orders o 
JOIN table_qrs tq ON o.table_qr_id = tq.id 
JOIN locations l ON tq.location_id = l.id 
JOIN merchants m ON l.merchant_id = m.id 
WHERE m.email = 'demo@cafedelight.com'
GROUP BY status;

-- ==================================================
-- SUCCESS MESSAGE
-- ==================================================
SELECT '✅ Demo data loaded successfully!' as status,
       'Merchant: Cafe Delight' as merchant,
       'Location: Downtown' as location,
       '40+ menu items across 6 categories' as menu,
       '5 QR codes created' as qr_codes,
       '350+ analytics events' as events;

