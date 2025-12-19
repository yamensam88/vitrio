-- Migration: Add siret, phone, and address to admin_garages
-- Run this in the Supabase SQL Editor

ALTER TABLE admin_garages 
ADD COLUMN IF NOT EXISTS siret TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS address TEXT;

-- Verify the columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'admin_garages';
