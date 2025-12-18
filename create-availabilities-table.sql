-- Table to store custom availability slots for garages
CREATE TABLE IF NOT EXISTS garage_availabilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    garage_id TEXT REFERENCES garages(id) ON DELETE CASCADE,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_garage_availabilities_garage_id ON garage_availabilities(garage_id);
CREATE INDEX IF NOT EXISTS idx_garage_availabilities_start_time ON garage_availabilities(start_time);

-- RLS Policies
ALTER TABLE garage_availabilities ENABLE ROW LEVEL SECURITY;

-- Allow public read (customer search needs to know availability)
CREATE POLICY "Allow public read of availabilities" 
ON garage_availabilities FOR SELECT 
TO anon, authenticated
USING (true);

-- Allow authenticated admins full access
CREATE POLICY "Allow admins full access to availabilities" 
ON garage_availabilities ALL 
TO authenticated
USING (true);
