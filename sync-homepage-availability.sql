-- SQL for automatic availability synchronization
-- This script ensures garages.next_availability stays in sync with garage_availabilities granular slots.

-- 1. Function to calculate and update next_availability for a garage
CREATE OR REPLACE FUNCTION update_garage_next_availability()
RETURNS TRIGGER AS $$
BEGIN
    -- For the affected garage, find the earliest start_time in the future that is marked as available
    UPDATE garages
    SET next_availability = (
        SELECT COALESCE(
            (SELECT MIN(start_time) 
             FROM garage_availabilities 
             WHERE garage_id = COALESCE(NEW.garage_id, OLD.garage_id) 
               AND start_time > NOW() 
               AND is_available = true),
            NOW() -- Fallback if no future slots found
        )
    )
    WHERE id = COALESCE(NEW.garage_id, OLD.garage_id);
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 2. Trigger on garage_availabilities (ON INSERT, UPDATE, or DELETE)
DROP TRIGGER IF EXISTS tr_sync_availability ON garage_availabilities;
CREATE TRIGGER tr_sync_availability
AFTER INSERT OR UPDATE OR DELETE ON garage_availabilities
FOR EACH ROW
EXECUTE FUNCTION update_garage_next_availability();

-- 3. Initial update for all garages to sync current state
UPDATE garages g
SET next_availability = (
    SELECT COALESCE(
        (SELECT MIN(start_time) 
         FROM garage_availabilities 
         WHERE garage_id = g.id 
           AND start_time > NOW() 
           AND is_available = true),
        NOW()
    )
);

-- 4. Verification
SELECT id, name, next_availability FROM garages;
