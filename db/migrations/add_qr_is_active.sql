-- Migration: Add is_active column to table_qrs
-- This allows merchants to activate/deactivate QR codes

ALTER TABLE table_qrs 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

COMMENT ON COLUMN table_qrs.is_active IS 'Whether the QR code is active and can be scanned';

