
-- FORCE FIX FOR PERMISSIONS
-- This script completely resets the policies for admin_garages

-- 1. Enable RLS (just in case)
ALTER TABLE admin_garages ENABLE ROW LEVEL SECURITY;

-- 2. Drop ALL existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow public insert" ON admin_garages;
DROP POLICY IF EXISTS "Allow anyone to insert registration" ON admin_garages;
DROP POLICY IF EXISTS "Allow admins to see all registrations" ON admin_garages;
DROP POLICY IF EXISTS "Allow admins to manage registrations" ON admin_garages;
DROP POLICY IF EXISTS "Allow admins to update registrations" ON admin_garages;

-- 3. Create a SIMPLE, POWERFUL policy for authenticated users (Admins)
-- This allows admins to do EVERYTHING (Select, Insert, Update, Delete)
CREATE POLICY "Super Admin Policy"
ON admin_garages
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 4. Create a specific policy ONLY for insertion (Public registration)
CREATE POLICY "Public Registration Policy"
ON admin_garages
FOR INSERT
TO anon
WITH CHECK (true);

-- 5. Verify policies
SELECT * FROM pg_policies WHERE tablename = 'admin_garages';
