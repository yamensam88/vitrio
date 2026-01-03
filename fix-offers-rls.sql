-- Enable RLS on offers
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;

-- Allow public access for now (since auth is custom code-based)
CREATE POLICY "Enable read access for all users" ON offers
    FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON offers
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON offers
    FOR UPDATE USING (true);

CREATE POLICY "Enable delete access for all users" ON offers
    FOR DELETE USING (true);
