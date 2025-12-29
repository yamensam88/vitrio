-- Analyse duplicate garages and appointment links
SELECT 
    name, 
    COUNT(*) as count,
    STRING_AGG(id, ', ') as garage_ids
FROM garages
GROUP BY name
ORDER BY count DESC;

-- Check which garage_ids are actually used by appointments
SELECT 
    a.garage_id,
    g.name,
    COUNT(*) as appointment_count
FROM appointments a
LEFT JOIN garages g ON a.garage_id = g.id
GROUP BY a.garage_id, g.name;

-- See details of 'lm' garages since they appear to be duplicates
SELECT id, name, created_at, access_code
FROM garages
WHERE name = 'lm';
