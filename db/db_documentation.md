# Digital Menu Database Schema Documentation

## Overview
This document describes the database schema for the Digital Menu system, including tables, relationships, and column details. The system supports QR menus, orders, and analytics tracking.

---

## Tables

### 1. merchants
Represents café or restaurant owners.

| Column      | Type      | Description                      |
|------------|-----------|----------------------------------|
| id         | UUID (PK) | Unique merchant identifier       |
| name       | TEXT      | Merchant display name            |
| email      | TEXT      | Optional email, must be unique  |
| phone      | TEXT      | Optional phone number           |
| created_at | TIMESTAMP | Record creation timestamp       |

---

### 2. locations
Physical locations for each merchant.

| Column      | Type      | Description                        |
|------------|-----------|------------------------------------|
| id         | UUID (PK) | Unique location identifier         |
| merchant_id| UUID (FK) | Reference to merchants.id          |
| name       | TEXT      | Location display name              |
| address    | TEXT      | Optional physical address          |
| created_at | TIMESTAMP | Record creation timestamp         |

---

### 3. menus
Menus available at a location.

| Column      | Type      | Description                       |
|------------|-----------|-----------------------------------|
| id         | UUID (PK) | Unique menu identifier            |
| location_id| UUID (FK) | Reference to locations.id         |
| name       | TEXT      | Menu name                         |
| is_active  | BOOLEAN   | Indicates if menu is active       |
| created_at | TIMESTAMP | Creation timestamp                |

---

### 4. menu_sections
Sections inside a menu (e.g., Starters, Mains).

| Column      | Type      | Description                       |
|------------|-----------|-----------------------------------|
| id         | UUID (PK) | Unique section identifier         |
| menu_id    | UUID (FK) | Reference to menus.id             |
| title      | TEXT      | Section title                     |
| sort_order | INT       | Order of sections in the menu     |

---

### 5. menu_items
Items under each menu section.

| Column      | Type      | Description                       |
|------------|-----------|-----------------------------------|
| id         | UUID (PK) | Unique menu item identifier       |
| section_id | UUID (FK) | Reference to menu_sections.id    |
| name       | TEXT      | Item name                         |
| description| TEXT      | Optional item description         |
| price_cents| INT       | Price in cents                    |
| image_url  | TEXT      | Optional image URL                |
| is_available| BOOLEAN  | Availability flag                 |
| sort_order | INT       | Order within section              |

---

### 6. table_qrs
Maps QR codes to menus and tables.

| Column      | Type      | Description                       |
|------------|-----------|-----------------------------------|
| id         | UUID (PK) | Unique QR record                  |
| location_id| UUID (FK) | Reference to locations.id         |
| menu_id    | UUID (FK) | Reference to menus.id             |
| qr_token   | TEXT      | Unique QR token                   |
| table_label| TEXT      | Optional table identifier         |
| created_at | TIMESTAMP | Timestamp when QR was created     |

---

### 7. orders
Represents customer orders, including draft/basket.

| Column      | Type      | Description                       |
|------------|-----------|-----------------------------------|
| id         | UUID (PK) | Unique order identifier           |
| table_qr_id| UUID (FK) | Reference to table_qrs.id         |
| status     | TEXT      | draft / submitted / completed / cancelled |
| total_cents| INT       | Total price in cents              |
| created_at | TIMESTAMP | Order creation timestamp          |
| updated_at | TIMESTAMP | Order last updated timestamp      |

---

### 8. order_items
Items included in an order.

| Column      | Type      | Description                       |
|------------|-----------|-----------------------------------|
| id         | UUID (PK) | Unique order item identifier      |
| order_id   | UUID (FK) | Reference to orders.id            |
| menu_item_id| UUID (FK)| Reference to menu_items.id        |
| quantity   | INT       | Quantity ordered                  |
| price_cents| INT       | Price at order time in cents      |

---

### 9. events
Analytics events for merchants.

| Column      | Type      | Description                       |
|------------|-----------|-----------------------------------|
| id         | UUID (PK) | Unique event identifier           |
| merchant_id| UUID (FK) | Reference to merchants.id         |
| event_type | TEXT      | qr_scan / menu_view / item_click  |
| menu_item_id| UUID     | Optional menu item ID             |
| created_at | TIMESTAMP | Event timestamp                   |

---

### 10. ocr_imports
Stores raw OCR text during demo setup.

| Column      | Type      | Description                       |
|------------|-----------|-----------------------------------|
| id         | UUID (PK) | Unique OCR import identifier      |
| merchant_id| UUID (FK) | Reference to merchants.id         |
| raw_text   | TEXT      | OCR extracted text                |
| status     | TEXT      | parsed / confirmed / discarded    |
| created_at | TIMESTAMP | Creation timestamp                |

---

## Relationships Overview
```
Merchant
  └── Location
        └── Menu
              └── Section
                    └── Item
        └── Table QR ──▶ Menu
Order
  └── Order Items
Events track Merchant and optionally Item
OCR Imports linked to Merchant
```

---
## Notes
- All primary keys use UUID for easy replication across systems
- `table_qrs` stores only token strings, not images
- `menu_sections` retained for structure and future metadata
- `orders` replace basket concept; status tracks lifecycle
- `image_url` added to menu_items for future demo / web display

