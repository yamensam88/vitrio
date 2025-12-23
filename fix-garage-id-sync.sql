-- Fix garage_id synchronization between admin_garages and appointments
-- This script ensures that the admin dashboard can see appointments

-- DIAGNOSTIC: Check current state
SELECT 
    'admin_garages' as table_name,
    id,
    name,
    garage_id,
    status
FROM admin_garages
ORDER BY created_at DESC;

SELECT 
    'appointments' as table_name,
    id,
    client_name,
    garage_id,
    status
FROM appointments
ORDER BY created_at DESC;

-- DIAGNOSTIC: Show which appointments don't match any admin_garage
SELECT 
    a.id as appointment_id,
    a.client_name,
    a.garage_id as appointment_garage_id,
    'No matching admin_garage' as issue
FROM appointments a
WHERE NOT EXISTS (
    SELECT 1 FROM admin_garages ag 
    WHERE ag.garage_id = a.garage_id
);

-- SOLUTION 1: If admin_garages should link to existing garages table
-- Update admin_garages.garage_id to match the garage IDs used in appointments
-- This assumes appointments are using the correct garage IDs from the garages table

-- First, let's see what garage_ids are being used in appointments
SELECT DISTINCT garage_id 
FROM appointments 
ORDER BY garage_id;

-- SOLUTION 2: Create a view or update query
-- If you want to update admin_garages to match appointments:
-- UPDATE admin_garages ag
-- SET garage_id = (
--     SELECT DISTINCT a.garage_id 
--     FROM appointments a
--     WHERE a.garage_id LIKE '%' || ag.id || '%'
--     LIMIT 1
-- )
-- WHERE ag.garage_id IS NULL OR ag.garage_id != (
--     SELECT DISTINCT a.garage_id 
--     FROM appointments a
--     WHERE a.garage_id LIKE '%' || ag.id || '%'
--     LIMIT 1
-- );

-- RECOMMENDED APPROACH:
-- Since the partner dashboard works correctly, appointments.garage_id is correct
-- We need to ensure admin_garages.garage_id points to the same garage ID

-- Check the garages table to see the actual garage IDs
SELECT id, name, access_code 
FROM garages 
ORDER BY created_at DESC;

-- The fix depends on your data structure. 
-- Please run the diagnostic queries above first to see the actual data,
-- then we can create the appropriate UPDATE statement.
