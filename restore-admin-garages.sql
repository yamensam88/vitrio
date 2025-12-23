-- Emergency Fix: Restore admin_garages data from garages table
-- This script will recreate admin_garages entries based on existing garages

-- First, check if admin_garages is truly empty or if it's an RLS issue
-- Run this as a superuser or with RLS disabled

-- Option 1: Disable RLS temporarily to check if data exists
ALTER TABLE admin_garages DISABLE ROW LEVEL SECURITY;

-- Check if data exists now
SELECT COUNT(*) as admin_garages_count FROM admin_garages;

-- If count is still 0, we need to recreate the data
-- Option 2: Recreate admin_garages from garages table

INSERT INTO admin_garages (
    name,
    city,
    address,
    email,
    phone,
    siret,
    status,
    registration_date,
    garage_id,
    generated_code,
    offer_value,
    offer_description,
    home_service,
    courtesy_vehicle,
    franchise_offerte
)
SELECT 
    g.name,
    g.city,
    g.address,
    'contact@' || LOWER(REPLACE(g.name, ' ', '')) || '.fr' as email,
    NULL as phone,
    NULL as siret,
    'Actif' as status,
    CAST(g.created_at AS date) as registration_date, -- Fixed: cast to date type
    g.id as garage_id,
    g.access_code as generated_code,
    120 as offer_value,
    'Remplacement Standard' as offer_description,
    g.home_service,
    g.courtesy_vehicle,
    g.franchise_offerte
FROM garages g
WHERE NOT EXISTS (
    SELECT 1 FROM admin_garages ag WHERE ag.garage_id = g.id
);

-- Re-enable RLS
ALTER TABLE admin_garages ENABLE ROW LEVEL SECURITY;

-- Verify the data
SELECT 
    ag.id,
    ag.name,
    ag.garage_id,
    ag.status,
    ag.generated_code,
    (SELECT COUNT(*) FROM appointments a WHERE a.garage_id = ag.garage_id) as appointment_count
FROM admin_garages ag
ORDER BY ag.created_at DESC;

-- Show the matching now
SELECT 
    ag.name as garage_name,
    ag.garage_id,
    COUNT(a.id) as total_appointments,
    SUM(CASE WHEN a.status = 'Confirmé' THEN 1 ELSE 0 END) as confirmed_appointments,
    SUM(CASE WHEN a.status = 'En attente' THEN 1 ELSE 0 END) as pending_appointments,
    SUM(CASE WHEN a.status = 'Confirmé' THEN 55 ELSE 0 END) as commissions
FROM admin_garages ag
LEFT JOIN appointments a ON a.garage_id = ag.garage_id
GROUP BY ag.id, ag.name, ag.garage_id
ORDER BY ag.name;
