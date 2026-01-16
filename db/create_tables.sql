-- ==================================================
-- DATABASE SCHEMA: digital_menu
-- Purpose: QR menu with visibility, orders, and analytics
-- ==================================================

-- ==================================================
-- Table: merchants
-- Represents each café or restaurant owner account
-- ==================================================
CREATE TABLE IF NOT EXISTS merchants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- unique merchant id
    name TEXT NOT NULL,                             -- merchant name
    email TEXT UNIQUE,                              -- optional email
    phone TEXT,                                     -- optional phone number
    created_at TIMESTAMP DEFAULT now()             -- record creation timestamp
);

COMMENT ON TABLE merchants IS 'Café/restaurant merchant accounts';
COMMENT ON COLUMN merchants.id IS 'Unique identifier for merchant';
COMMENT ON COLUMN merchants.name IS 'Merchant display name';
COMMENT ON COLUMN merchants.email IS 'Optional email for contact';
COMMENT ON COLUMN merchants.phone IS 'Optional phone number';
COMMENT ON COLUMN merchants.created_at IS 'Timestamp when merchant was created';

-- ==================================================
-- Table: locations
-- Represents physical locations of a merchant
-- ==================================================
CREATE TABLE IF NOT EXISTS locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),  -- unique location id
    merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE, -- merchant owner
    name TEXT NOT NULL,                             -- location name
    address TEXT,                                   -- optional physical address
    created_at TIMESTAMP DEFAULT now()             -- record creation timestamp
);

COMMENT ON TABLE locations IS 'Physical locations of a merchant';
COMMENT ON COLUMN locations.id IS 'Unique location identifier';
COMMENT ON COLUMN locations.merchant_id IS 'FK to merchants';
COMMENT ON COLUMN locations.name IS 'Location display name';
COMMENT ON COLUMN locations.address IS 'Optional location address';
COMMENT ON COLUMN locations.created_at IS 'Creation timestamp';

-- ==================================================
-- Table: menus
-- Represents a menu at a location (e.g., Breakfast, Drinks)
-- ==================================================
CREATE TABLE IF NOT EXISTS menus (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),  -- unique menu id
    location_id UUID REFERENCES locations(id) ON DELETE CASCADE, -- location it belongs to
    name TEXT NOT NULL,                             -- menu name
    is_active BOOLEAN DEFAULT true,                 -- whether menu is active
    created_at TIMESTAMP DEFAULT now()             -- creation timestamp
);

COMMENT ON TABLE menus IS 'Menus belonging to a location';
COMMENT ON COLUMN menus.id IS 'Unique menu id';
COMMENT ON COLUMN menus.location_id IS 'FK to location';
COMMENT ON COLUMN menus.name IS 'Menu name';
COMMENT ON COLUMN menus.is_active IS 'Flag to indicate active menu';
COMMENT ON COLUMN menus.created_at IS 'Timestamp when menu was created';

-- ==================================================
-- Table: menu_sections
-- Sections inside a menu (e.g., Starters, Mains)
-- ==================================================
CREATE TABLE IF NOT EXISTS menu_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),  -- unique section id
    menu_id UUID REFERENCES menus(id) ON DELETE CASCADE, -- parent menu
    title TEXT NOT NULL,                             -- section title
    sort_order INT DEFAULT 0                         -- order of sections in menu
);

COMMENT ON TABLE menu_sections IS 'Sections inside a menu';
COMMENT ON COLUMN menu_sections.id IS 'Unique section id';
COMMENT ON COLUMN menu_sections.menu_id IS 'FK to menus';
COMMENT ON COLUMN menu_sections.title IS 'Section title';
COMMENT ON COLUMN menu_sections.sort_order IS 'Position in menu for sorting';

-- ==================================================
-- Table: menu_items
-- Represents individual items under a section
-- ==================================================
CREATE TABLE IF NOT EXISTS menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),  -- unique item id
    section_id UUID REFERENCES menu_sections(id) ON DELETE CASCADE, -- parent section
    name TEXT NOT NULL,                             -- item name
    description TEXT,                               -- optional description
    price_cents INT NOT NULL,                        -- price in cents
    image_url TEXT,                                 -- optional image URL
    is_available BOOLEAN DEFAULT true,             -- availability flag
    sort_order INT DEFAULT 0                        -- order within section
);

COMMENT ON TABLE menu_items IS 'Menu items under each section';
COMMENT ON COLUMN menu_items.id IS 'Unique menu item id';
COMMENT ON COLUMN menu_items.section_id IS 'FK to menu_sections';
COMMENT ON COLUMN menu_items.name IS 'Item name';
COMMENT ON COLUMN menu_items.description IS 'Optional item description';
COMMENT ON COLUMN menu_items.price_cents IS 'Price in cents';
COMMENT ON COLUMN menu_items.image_url IS 'Optional image URL';
COMMENT ON COLUMN menu_items.is_available IS 'Availability flag';
COMMENT ON COLUMN menu_items.sort_order IS 'Position within section';

-- ==================================================
-- Table: table_qrs
-- Maps QR code tokens to menus and table labels
-- ==================================================
CREATE TABLE IF NOT EXISTS table_qrs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),  -- unique QR record id
    location_id UUID REFERENCES locations(id) ON DELETE CASCADE, -- location
    menu_id UUID REFERENCES menus(id),              -- associated menu
    qr_token TEXT UNIQUE NOT NULL,                  -- QR code string
    table_label TEXT,                               -- optional table identifier
    is_active BOOLEAN DEFAULT true,                -- whether QR code is active
    created_at TIMESTAMP DEFAULT now()             -- creation timestamp
);

COMMENT ON TABLE table_qrs IS 'Maps printed QR codes to menu & table';
COMMENT ON COLUMN table_qrs.id IS 'Unique QR code record id';
COMMENT ON COLUMN table_qrs.location_id IS 'FK to location';
COMMENT ON COLUMN table_qrs.menu_id IS 'FK to menu';
COMMENT ON COLUMN table_qrs.qr_token IS 'Unique QR token string';
COMMENT ON COLUMN table_qrs.table_label IS 'Optional table label';
COMMENT ON COLUMN table_qrs.is_active IS 'Whether the QR code is active and can be scanned';
COMMENT ON COLUMN table_qrs.created_at IS 'Timestamp when QR was created';

-- ==================================================
-- Table: orders
-- Represents customer orders (draft or submitted)
-- ==================================================
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),  -- unique order id
    table_qr_id UUID REFERENCES table_qrs(id),      -- table QR associated
    status TEXT NOT NULL DEFAULT 'draft',          -- draft / submitted / completed / cancelled
    total_cents INT DEFAULT 0,                      -- total order price
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

COMMENT ON TABLE orders IS 'Orders corresponding to table QR codes';
COMMENT ON COLUMN orders.id IS 'Unique order id';
COMMENT ON COLUMN orders.table_qr_id IS 'FK to table_qrs';
COMMENT ON COLUMN orders.status IS 'Order status';
COMMENT ON COLUMN orders.total_cents IS 'Total order price in cents';
COMMENT ON COLUMN orders.created_at IS 'Order creation timestamp';
COMMENT ON COLUMN orders.updated_at IS 'Order last updated timestamp';

-- ==================================================
-- Table: order_items
-- Represents items under an order
-- ==================================================
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),  -- unique order item id
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE, -- parent order
    menu_item_id UUID REFERENCES menu_items(id),    -- menu item ordered
    quantity INT DEFAULT 1,                         -- quantity
    price_cents INT NOT NULL                         -- price at time of order
);

COMMENT ON TABLE order_items IS 'Items included in each order';
COMMENT ON COLUMN order_items.id IS 'Unique order item id';
COMMENT ON COLUMN order_items.order_id IS 'FK to orders';
COMMENT ON COLUMN order_items.menu_item_id IS 'FK to menu_items';
COMMENT ON COLUMN order_items.quantity IS 'Quantity ordered';
COMMENT ON COLUMN order_items.price_cents IS 'Price at order time in cents';

-- ==================================================
-- Table: events
-- Tracks analytics events: QR scan, menu view, item click
-- ==================================================
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),  -- unique event id
    merchant_id UUID REFERENCES merchants(id),      -- related merchant
    event_type TEXT NOT NULL,                       -- qr_scan / menu_view / item_click
    menu_item_id UUID,                              -- optional item id
    created_at TIMESTAMP DEFAULT now()
);

COMMENT ON TABLE events IS 'Tracks merchant analytics events';
COMMENT ON COLUMN events.id IS 'Unique event id';
COMMENT ON COLUMN events.merchant_id IS 'FK to merchants';
COMMENT ON COLUMN events.event_type IS 'Type of event';
COMMENT ON COLUMN events.menu_item_id IS 'Optional menu item associated';
COMMENT ON COLUMN events.created_at IS 'Event timestamp';

-- ==================================================
-- Table: ocr_imports
-- Stores raw OCR text during demo setup
-- ==================================================
CREATE TABLE IF NOT EXISTS ocr_imports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),  -- unique import record
    merchant_id UUID REFERENCES merchants(id),      -- associated merchant
    raw_text TEXT NOT NULL,                         -- OCR extracted text
    status TEXT DEFAULT 'parsed',                   -- parsed / confirmed / discarded
    created_at TIMESTAMP DEFAULT now()
);

COMMENT ON TABLE ocr_imports IS 'Stores raw OCR text for demo/demo setup';
COMMENT ON COLUMN ocr_imports.id IS 'Unique OCR import id';
COMMENT ON COLUMN ocr_imports.merchant_id IS 'FK to merchant';
COMMENT ON COLUMN ocr_imports.raw_text IS 'Raw OCR extracted text';
COMMENT ON COLUMN ocr_imports.status IS 'Processing status';
COMMENT ON COLUMN ocr_imports.created_at IS 'Creation timestamp';

