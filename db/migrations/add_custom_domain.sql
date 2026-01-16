-- Add custom_domain field to merchants table
-- Works with both UUID-based and VARCHAR-based schemas
ALTER TABLE merchants 
ADD COLUMN IF NOT EXISTS custom_domain TEXT;

COMMENT ON COLUMN merchants.custom_domain IS 'Custom domain for QR code redirects (e.g., www.cafemenu.com)';
