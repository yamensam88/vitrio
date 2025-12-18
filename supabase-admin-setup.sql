-- Admin Authentication Setup for Vitrio
-- Run this SQL in your Supabase SQL Editor

-- 1. Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role TEXT DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- 3. Create policy to allow authenticated users to read admin_users
CREATE POLICY "Allow authenticated users to read admin_users"
ON admin_users
FOR SELECT
TO authenticated
USING (true);

-- 4. Create policy to allow service role to manage admin_users
CREATE POLICY "Allow service role to manage admin_users"
ON admin_users
FOR ALL
TO service_role
USING (true);

-- 5. Insert default admin user (linked to Supabase Auth)
-- IMPORTANT: You need to create this user in Supabase Auth first!
-- Go to Authentication > Users in Supabase Dashboard and create a user with:
-- Email: admin@vitrio.com
-- Password: Admin123!
-- Then run the following INSERT (it will link to the auth user automatically)

INSERT INTO admin_users (email, full_name, role)
VALUES ('admin@vitrio.com', 'Super Admin', 'admin')
ON CONFLICT (email) DO NOTHING;

-- 6. Verify the setup
SELECT * FROM admin_users;
