-- FIX: Allow Admin to Update admin_garages
-- The admin needs to update 'generated_code' and 'status'

-- 1. Ensure RLS is enabled
ALTER TABLE admin_garages ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing update policy if any
DROP POLICY IF EXISTS "Allow admins to update registrations" ON admin_garages;

-- 3. Create NEW policy for admin to MANAGE all registrations
-- This covers SELECT, INSERT, UPDATE, DELETE for authenticated users (admins)
CREATE POLICY "Allow admins to manage registrations"
ON admin_garages
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 4. Keep the public insert policy for new registration
-- (Already exists, but good to ensure it stays)

-- 5. Verification
SELECT * FROM pg_policies WHERE tablename = 'admin_garages';
