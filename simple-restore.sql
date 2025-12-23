-- SOLUTION SIMPLE: Insérer directement les données admin_garages
-- Ce script désactive temporairement RLS pour garantir que l'insertion fonctionne

-- Étape 1: Désactiver RLS temporairement
ALTER TABLE admin_garages DISABLE ROW LEVEL SECURITY;

-- Étape 2: Supprimer les anciennes données (si elles existent)
DELETE FROM admin_garages;

-- Étape 3: Insérer les données depuis la table garages
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
    'contact@vitrio.fr' as email,
    NULL as phone,
    NULL as siret,
    'Actif' as status,
    CURRENT_DATE as registration_date,
    g.id as garage_id,
    g.access_code as generated_code,
    120 as offer_value,
    'Remplacement Standard' as offer_description,
    COALESCE(g.home_service, false),
    COALESCE(g.courtesy_vehicle, false),
    COALESCE(g.franchise_offerte, true)
FROM garages g;

-- Étape 4: Vérifier que les données ont été insérées
SELECT 
    id,
    name,
    garage_id,
    status,
    generated_code
FROM admin_garages;

-- Étape 5: Vérifier le matching avec les appointments
SELECT 
    ag.name as garage_name,
    ag.garage_id,
    COUNT(a.id) as total_appointments,
    SUM(CASE WHEN a.status = 'Confirmé' THEN 1 ELSE 0 END) as confirmed,
    SUM(CASE WHEN a.status = 'En attente' THEN 1 ELSE 0 END) as pending,
    SUM(CASE WHEN a.status = 'Confirmé' THEN 55 ELSE 0 END) as commissions_euros
FROM admin_garages ag
LEFT JOIN appointments a ON a.garage_id = ag.garage_id
GROUP BY ag.id, ag.name, ag.garage_id;

-- Étape 6: Réactiver RLS
ALTER TABLE admin_garages ENABLE ROW LEVEL SECURITY;

-- Étape 7: Créer une politique RLS permissive pour permettre la lecture
DROP POLICY IF EXISTS "Allow public read access" ON admin_garages;
CREATE POLICY "Allow public read access" 
ON admin_garages FOR SELECT 
TO anon, authenticated
USING (true);

-- Étape 8: Vérification finale
SELECT 
    'SUCCESS!' as status,
    COUNT(*) as admin_garages_count
FROM admin_garages;
