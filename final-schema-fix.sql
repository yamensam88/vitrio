-- FINAL SCHEMA FIX for admin_garages
-- Run this in the Supabase SQL Editor

-- 1. Add all missing columns if they don't exist
ALTER TABLE admin_garages 
ADD COLUMN IF NOT EXISTS siret TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS franchise_offerte BOOLEAN DEFAULT TRUE;

-- 2. Update existing rows for franchise_offerte
UPDATE admin_garages SET franchise_offerte = TRUE WHERE franchise_offerte IS NULL;

-- 3. Ensure RLS is enabled and allows inserts
ALTER TABLE admin_garages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anyone to insert registration" ON admin_garages;
CREATE POLICY "Allow anyone to insert registration"
ON admin_garages
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- 4. Force a schema refresh (this is a common trick)
COMMENT ON TABLE admin_garages IS 'Table for partner registration - last updated 2025-12-19';

-- 5. Verification
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'admin_garages';
