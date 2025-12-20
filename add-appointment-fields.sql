-- Add new columns to appointments table
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS intervention_type TEXT DEFAULT 'Pare-brise',
ADD COLUMN IF NOT EXISTS plate TEXT,
ADD COLUMN IF NOT EXISTS insurance_name TEXT,
ADD COLUMN IF NOT EXISTS postal_code TEXT,
ADD COLUMN IF NOT EXISTS address TEXT;

-- Update RLS if needed (usually not needed for adding columns if insert policy is open)
