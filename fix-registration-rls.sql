-- SQL Fix for Partner Registration RLS
-- Run this in Supabase SQL Editor to allow public registration

-- 1. Ensure RLS is enabled
ALTER TABLE admin_garages ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing insert policies if any
DROP POLICY IF EXISTS "Allow public insert" ON admin_garages;
DROP POLICY IF EXISTS "Allow anyone to insert registration" ON admin_garages;

-- 3. Create policy to allow public (anon) to insert new registrations
-- This is necessary for the registration form to work without auth
CREATE POLICY "Allow anyone to insert registration"
ON admin_garages
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- 4. For security, ensure anon users can't see all registrations if not intended
-- (Usually only admins should see all, or specific rows via access code)
DROP POLICY IF EXISTS "Allow public select" ON admin_garages;
CREATE POLICY "Allow admins to see all registrations"
ON admin_garages
FOR SELECT
TO authenticated
USING (true);

-- 5. Verification
SELECT current_setting('role');
