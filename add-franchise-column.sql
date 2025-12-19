-- Ajout de la colonne franchise_offerte aux tables garages et admin_garages
ALTER TABLE garages ADD COLUMN IF NOT EXISTS franchise_offerte BOOLEAN DEFAULT TRUE;
ALTER TABLE admin_garages ADD COLUMN IF NOT EXISTS franchise_offerte BOOLEAN DEFAULT TRUE;

-- Mettre à jour les données existantes si nécessaire (ici on met tout à TRUE par défaut car c'est l'offre standard)
UPDATE garages SET franchise_offerte = TRUE;
UPDATE admin_garages SET franchise_offerte = TRUE;
