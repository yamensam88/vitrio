-- SQL Migration: Add Offer Details to admin_garages
-- Run this in the Supabase SQL Editor

-- 1. Add missing columns to admin_garages
ALTER TABLE admin_garages 
ADD COLUMN IF NOT EXISTS offer_value NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS offer_description TEXT;

-- 2. Refine RLS for admin_garages
-- We need to ensure that:
-- - Anyone (public) can register (INSERT)
-- - ONLY admins (authenticated) can see all (SELECT)
-- - ONLY admins (authenticated) can update (UPDATE) e.g. for generating codes

-- Enable RLS
ALTER TABLE admin_garages ENABLE ROW LEVEL SECURITY;

-- Drop existing to re-create clearly
DROP POLICY IF EXISTS "Allow public insert" ON admin_garages;
DROP POLICY IF EXISTS "Allow anyone to insert registration" ON admin_garages;
DROP POLICY IF EXISTS "Allow admins to see all registrations" ON admin_garages;
DROP POLICY IF EXISTS "Allow admins to manage registrations" ON admin_garages;
DROP POLICY IF EXISTS "Allow admins to update registrations" ON admin_garages;

-- PUBLIC INSERT
CREATE POLICY "Allow public insert"
ON admin_garages
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- ADMIN READ ALL
CREATE POLICY "Admin view all registrations"
ON admin_garages
FOR SELECT
TO authenticated
USING (true);

-- ADMIN UPDATE
CREATE POLICY "Admin update registrations"
ON admin_garages
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- 3. Verification
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'admin_garages';

COMMENT ON TABLE admin_garages IS 'Table for partner registration with offer details - last updated 2025-12-19';
