-- Ensure foreign key relationship exists between admin_garages and garages
-- This allows Supabase to perform JOINS between these two tables

DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_admin_garages_garage'
    ) THEN
        ALTER TABLE admin_garages
        ADD CONSTRAINT fk_admin_garages_garage
        FOREIGN KEY (garage_id) 
        REFERENCES garages(id)
        ON DELETE SET NULL;
    END IF;
END $$;
