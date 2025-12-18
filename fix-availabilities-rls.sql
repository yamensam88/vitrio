-- SQL Fix for Garage Availabilities RLS
-- Run this in Supabase SQL Editor to allow the dashboard to save slots

-- 1. Ensure table exists with correct schema
CREATE TABLE IF NOT EXISTS garage_availabilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    garage_id TEXT NOT NULL, -- references garages(id)
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE garage_availabilities ENABLE ROW LEVEL SECURITY;

-- 3. DROP old policies to avoid duplicates
DROP POLICY IF EXISTS "Allow public select" ON garage_availabilities;
DROP POLICY IF EXISTS "Allow public insert" ON garage_availabilities;
DROP POLICY IF EXISTS "Allow public delete" ON garage_availabilities;
DROP POLICY IF EXISTS "Allow anyone to view slots" ON garage_availabilities;
DROP POLICY IF EXISTS "Allow anyone to insert slots" ON garage_availabilities;
DROP POLICY IF EXISTS "Allow anyone to delete slots" ON garage_availabilities;

-- 4. Create NEW open policies for the demo
-- In a real app, we would restrict by access_code or auth
CREATE POLICY "Allow anyone to view slots"
ON garage_availabilities FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Allow anyone to insert slots"
ON garage_availabilities FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Allow anyone to delete slots"
ON garage_availabilities FOR DELETE
TO anon, authenticated
USING (true);

-- 5. Verification
SELECT * FROM garage_availabilities LIMIT 1;
