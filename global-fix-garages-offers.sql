-- GLOBAL FIX for Garages and Offers
-- This ensures the admin can generate codes (insert into garages/offers)

-- 1. Ensure Garages table has all columns
ALTER TABLE garages 
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS home_service BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS courtesy_vehicle BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS franchise_offerte BOOLEAN DEFAULT TRUE;

-- 2. Enable RLS on Garages and Offers
ALTER TABLE garages ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow authenticated select garages" ON garages;
DROP POLICY IF EXISTS "Allow authenticated insert garages" ON garages;
DROP POLICY IF EXISTS "Allow authenticated update garages" ON garages;
DROP POLICY IF EXISTS "Allow public select garages" ON garages;

DROP POLICY IF EXISTS "Allow authenticated select offers" ON offers;
DROP POLICY IF EXISTS "Allow authenticated insert offers" ON offers;
DROP POLICY IF EXISTS "Allow authenticated update offers" ON offers;
DROP POLICY IF EXISTS "Allow public select offers" ON offers;

-- 4. Create NEW Policies for Admin (Authenticated)
CREATE POLICY "Admin manage garages" ON garages FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin manage offers" ON offers FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 5. Create Policies for Public (Anon) - SELECT ONLY
CREATE POLICY "Public view garages" ON garages FOR SELECT TO anon USING (true);
CREATE POLICY "Public view offers" ON offers FOR SELECT TO anon USING (true);

-- 6. Force schema refresh
COMMENT ON TABLE garages IS 'Table for garage details - last updated 2025-12-19';
COMMENT ON TABLE offers IS 'Table for garage offers - last updated 2025-12-19';

-- 7. Verification
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name IN ('garages', 'offers');
