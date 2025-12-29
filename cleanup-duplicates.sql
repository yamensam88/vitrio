-- Clean up duplicate 'lm' partners in admin_garages
-- Keeps 'yk' (which has appointments) and one single 'lm' entry

-- 1. Verify what we are about to delete
SELECT id, name, garage_id, (SELECT count(*) FROM appointments WHERE garage_id = ag.garage_id) as appt_count
FROM admin_garages ag
WHERE name = 'lm';

-- 2. Delete duplicates for 'lm', keeping only the one with the smallest ID (or specific one if preferred)
-- We use a CTE to identify IDs to delete
WITH duplicates AS (
    SELECT id
    FROM admin_garages
    WHERE name = 'lm'
    AND id NOT IN (
        SELECT min(id)
        FROM admin_garages
        WHERE name = 'lm'
    )
)
DELETE FROM admin_garages
WHERE id IN (SELECT id FROM duplicates);

-- 3. Verify final state
SELECT id, name, garage_id, status
FROM admin_garages
ORDER BY id;
