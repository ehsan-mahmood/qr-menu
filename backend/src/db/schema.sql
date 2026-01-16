-- QR Menu Database Schema

-- Users (merchants)
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Merchants
CREATE TABLE IF NOT EXISTS merchants (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
  restaurant_name VARCHAR(255) NOT NULL,
  business_type VARCHAR(50) NOT NULL, -- cafe | restaurant | bar | food-truck | bakery | other
  address TEXT,
  slug VARCHAR(255) UNIQUE,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Menus
CREATE TABLE IF NOT EXISTS menus (
  id VARCHAR(255) PRIMARY KEY,
  merchant_id VARCHAR(255) REFERENCES merchants(id) ON DELETE CASCADE,
  menu_name VARCHAR(255) NOT NULL,
  order_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Menu Sections
CREATE TABLE IF NOT EXISTS menu_sections (
  id VARCHAR(255) PRIMARY KEY,
  menu_id VARCHAR(255) REFERENCES menus(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Menu Items
CREATE TABLE IF NOT EXISTS menu_items (
  id VARCHAR(255) PRIMARY KEY,
  section_id VARCHAR(255) REFERENCES menu_sections(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category VARCHAR(100),
  image_url TEXT,
  available BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(255) PRIMARY KEY,
  merchant_id VARCHAR(255) REFERENCES merchants(id) ON DELETE CASCADE,
  menu_id VARCHAR(255) REFERENCES menus(id) ON DELETE CASCADE,
  table_number VARCHAR(50),
  customer_name VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending', -- pending | preparing | ready | served | cancelled
  items JSONB NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  special_instructions TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- QR Codes
CREATE TABLE IF NOT EXISTS qr_codes (
  id VARCHAR(255) PRIMARY KEY,
  merchant_id VARCHAR(255) REFERENCES merchants(id) ON DELETE CASCADE,
  menu_id VARCHAR(255) REFERENCES menus(id) ON DELETE CASCADE,
  qr_token VARCHAR(255) UNIQUE NOT NULL,
  qr_code_url TEXT,
  table_number VARCHAR(50),
  location VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Analytics Events
CREATE TABLE IF NOT EXISTS analytics_events (
  id VARCHAR(255) PRIMARY KEY,
  merchant_id VARCHAR(255) REFERENCES merchants(id) ON DELETE CASCADE,
  menu_id VARCHAR(255) REFERENCES menus(id) ON DELETE SET NULL,
  event_type VARCHAR(50) NOT NULL, -- qr_scan | menu_view | item_click | item_added | order_placed
  item_id VARCHAR(255),
  item_name VARCHAR(255),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sessions (for JWT refresh)
CREATE TABLE IF NOT EXISTS sessions (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_merchants_user_id ON merchants(user_id);
CREATE INDEX IF NOT EXISTS idx_menus_merchant_id ON menus(merchant_id);
CREATE INDEX IF NOT EXISTS idx_menu_sections_menu_id ON menu_sections(menu_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_section_id ON menu_items(section_id);
CREATE INDEX IF NOT EXISTS idx_orders_merchant_id ON orders(merchant_id);
CREATE INDEX IF NOT EXISTS idx_orders_menu_id ON orders(menu_id);
CREATE INDEX IF NOT EXISTS idx_qr_codes_merchant_id ON qr_codes(merchant_id);
CREATE INDEX IF NOT EXISTS idx_qr_codes_token ON qr_codes(qr_token);
CREATE INDEX IF NOT EXISTS idx_analytics_merchant_id ON analytics_events(merchant_id);
CREATE INDEX IF NOT EXISTS idx_analytics_menu_id ON analytics_events(menu_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);

