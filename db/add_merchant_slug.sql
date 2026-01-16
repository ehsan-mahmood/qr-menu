-- ==================================================
-- Add slug field to merchants table
-- ==================================================

-- Add slug column if it doesn't exist
ALTER TABLE merchants 
ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- Add index for fast lookups
CREATE INDEX IF NOT EXISTS idx_merchants_slug ON merchants(slug);

-- Update existing demo merchant with slug
UPDATE merchants 
SET slug = 'cafe-delight' 
WHERE email = 'demo@cafedelight.com';

-- Make slug NOT NULL after setting values
-- (commented out for safety - uncomment if you want to enforce)
-- ALTER TABLE merchants ALTER COLUMN slug SET NOT NULL;

-- Verify
SELECT 'Merchant slug updated:' as info, name, slug, email 
FROM merchants 
WHERE email = 'demo@cafedelight.com';

