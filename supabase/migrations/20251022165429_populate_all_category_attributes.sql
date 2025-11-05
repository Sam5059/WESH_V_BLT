/*
  # Populate attributes for all categories
  
  1. Changes
    - Update VÉHICULES: Voitures, Motos → fuel_type, transmission
    - Update ÉLECTRONIQUE: Téléphones, Ordinateurs → device_type
    - Update MAISON & JARDIN: Meubles, Électroménager, Décoration → product_type
    - Update MODE & BEAUTÉ: Vêtements, Chaussures, Bijoux → category_type
    - Update SERVICES: Plomberie, Électricité, Nettoyage → service_type
    - Update ANIMAUX: Chiens, Chats, Oiseaux → animal_type
    - Update LOCATION VÉHICULES: Voitures, 4x4 → rental_type
    - Update LOCATION VACANCES: Appartements, Villas → rental_property_type
  
  2. Notes
    - Only updates listings where attributes are missing
    - Uses JSONB merge to preserve other attributes
*/

-- ==============================================
-- VÉHICULES
-- ==============================================

-- Voitures (category_id: d4468142-7dbc-41ae-a860-97125054bb60)
UPDATE listings
SET attributes = COALESCE(attributes, '{}'::jsonb) || '{"vehicle_type": "Voiture"}'::jsonb
WHERE category_id = 'd4468142-7dbc-41ae-a860-97125054bb60'
  AND (attributes->>'vehicle_type' IS NULL OR attributes->>'vehicle_type' = '');

-- Motos (category_id: 3cd2ea84-f047-41b5-9fb3-4a6be31c88b3)
UPDATE listings
SET attributes = COALESCE(attributes, '{}'::jsonb) || '{"vehicle_type": "Moto"}'::jsonb
WHERE category_id = '3cd2ea84-f047-41b5-9fb3-4a6be31c88b3'
  AND (attributes->>'vehicle_type' IS NULL OR attributes->>'vehicle_type' = '');

-- Camions (category_id: 147c0a84-8d10-413c-9657-4bb6ec3dfae5)
UPDATE listings
SET attributes = COALESCE(attributes, '{}'::jsonb) || '{"vehicle_type": "Camion"}'::jsonb
WHERE category_id = '147c0a84-8d10-413c-9657-4bb6ec3dfae5'
  AND (attributes->>'vehicle_type' IS NULL OR attributes->>'vehicle_type' = '');

-- ==============================================
-- ÉLECTRONIQUE
-- ==============================================

-- Téléphones (category_id: 3c981ce1-12b9-4300-b588-70dce366f5e2)
UPDATE listings
SET attributes = COALESCE(attributes, '{}'::jsonb) || '{"device_type": "Téléphone"}'::jsonb
WHERE category_id = '3c981ce1-12b9-4300-b588-70dce366f5e2'
  AND (attributes->>'device_type' IS NULL OR attributes->>'device_type' = '');

-- Ordinateurs (category_id: fb006973-a4e1-4cf6-8deb-1c1399ff23e8)
UPDATE listings
SET attributes = COALESCE(attributes, '{}'::jsonb) || '{"device_type": "Ordinateur"}'::jsonb
WHERE category_id = 'fb006973-a4e1-4cf6-8deb-1c1399ff23e8'
  AND (attributes->>'device_type' IS NULL OR attributes->>'device_type' = '');

-- Tablettes (category_id: d75960e1-95b5-474e-8706-8f10b102c7b8)
UPDATE listings
SET attributes = COALESCE(attributes, '{}'::jsonb) || '{"device_type": "Tablette"}'::jsonb
WHERE category_id = 'd75960e1-95b5-474e-8706-8f10b102c7b8'
  AND (attributes->>'device_type' IS NULL OR attributes->>'device_type' = '');

-- TV & Audio (category_id: 93a5499c-b937-4fc6-aaca-a84f7cdcc3e3)
UPDATE listings
SET attributes = COALESCE(attributes, '{}'::jsonb) || '{"device_type": "TV"}'::jsonb
WHERE category_id = '93a5499c-b937-4fc6-aaca-a84f7cdcc3e3'
  AND (attributes->>'device_type' IS NULL OR attributes->>'device_type' = '');

-- ==============================================
-- MAISON & JARDIN
-- ==============================================

-- Meubles (category_id: 93ada6ef-36f4-47c2-b223-0bc6be73691c)
UPDATE listings
SET attributes = COALESCE(attributes, '{}'::jsonb) || '{"product_type": "Meuble"}'::jsonb
WHERE category_id = '93ada6ef-36f4-47c2-b223-0bc6be73691c'
  AND (attributes->>'product_type' IS NULL OR attributes->>'product_type' = '');

-- Électroménager (category_id: f550a033-8a18-4317-adc1-7120f50006f1)
UPDATE listings
SET attributes = COALESCE(attributes, '{}'::jsonb) || '{"product_type": "Électroménager"}'::jsonb
WHERE category_id = 'f550a033-8a18-4317-adc1-7120f50006f1'
  AND (attributes->>'product_type' IS NULL OR attributes->>'product_type' = '');

-- Décoration (category_id: e9df8335-8bd7-4120-8a8a-443126885cbe)
UPDATE listings
SET attributes = COALESCE(attributes, '{}'::jsonb) || '{"product_type": "Décoration"}'::jsonb
WHERE category_id = 'e9df8335-8bd7-4120-8a8a-443126885cbe'
  AND (attributes->>'product_type' IS NULL OR attributes->>'product_type' = '');

-- Bricolage & Outils (category_id: a48bff1e-9e3e-47a1-b8c0-6c14b9e4135b)
UPDATE listings
SET attributes = COALESCE(attributes, '{}'::jsonb) || '{"product_type": "Bricolage"}'::jsonb
WHERE category_id = 'a48bff1e-9e3e-47a1-b8c0-6c14b9e4135b'
  AND (attributes->>'product_type' IS NULL OR attributes->>'product_type' = '');

-- ==============================================
-- MODE & BEAUTÉ
-- ==============================================

-- Vêtements femme (category_id: edb0c17b-8544-49d6-970f-c931ed4b31cf)
UPDATE listings
SET attributes = COALESCE(attributes, '{}'::jsonb) || '{"category_type": "Vêtements femme"}'::jsonb
WHERE category_id = 'edb0c17b-8544-49d6-970f-c931ed4b31cf'
  AND (attributes->>'category_type' IS NULL OR attributes->>'category_type' = '');

-- Vêtements homme (category_id: d008ed32-6226-4589-b388-87eadcea714e)
UPDATE listings
SET attributes = COALESCE(attributes, '{}'::jsonb) || '{"category_type": "Vêtements homme"}'::jsonb
WHERE category_id = 'd008ed32-6226-4589-b388-87eadcea714e'
  AND (attributes->>'category_type' IS NULL OR attributes->>'category_type' = '');

-- Chaussures (category_id: 608d8bb5-90e6-41ff-94f9-7a774d1a3d19)
UPDATE listings
SET attributes = COALESCE(attributes, '{}'::jsonb) || '{"category_type": "Chaussures"}'::jsonb
WHERE category_id = '608d8bb5-90e6-41ff-94f9-7a774d1a3d19'
  AND (attributes->>'category_type' IS NULL OR attributes->>'category_type' = '');

-- Bijoux & Montres (category_id: 6582ed3a-8b47-473f-a6e8-6a1b7baf3651)
UPDATE listings
SET attributes = COALESCE(attributes, '{}'::jsonb) || '{"category_type": "Bijoux"}'::jsonb
WHERE category_id = '6582ed3a-8b47-473f-a6e8-6a1b7baf3651'
  AND (attributes->>'category_type' IS NULL OR attributes->>'category_type' = '');

-- Produits de beauté (category_id: d88bffef-9573-42e3-9ddd-8965c693ae3c)
UPDATE listings
SET attributes = COALESCE(attributes, '{}'::jsonb) || '{"category_type": "Beauté"}'::jsonb
WHERE category_id = 'd88bffef-9573-42e3-9ddd-8965c693ae3c'
  AND (attributes->>'category_type' IS NULL OR attributes->>'category_type' = '');

-- ==============================================
-- SERVICES
-- ==============================================

-- Plomberie (category_id: 5bbc5685-7dc8-4888-88ce-20227a81e166)
UPDATE listings
SET attributes = COALESCE(attributes, '{}'::jsonb) || '{"service_type": "Plomberie"}'::jsonb
WHERE category_id = '5bbc5685-7dc8-4888-88ce-20227a81e166'
  AND (attributes->>'service_type' IS NULL OR attributes->>'service_type' = '');

-- Électricité (category_id: 39288bea-d159-45da-9b68-3ffdaf5628b0)
UPDATE listings
SET attributes = COALESCE(attributes, '{}'::jsonb) || '{"service_type": "Électricité"}'::jsonb
WHERE category_id = '39288bea-d159-45da-9b68-3ffdaf5628b0'
  AND (attributes->>'service_type' IS NULL OR attributes->>'service_type' = '');

-- Nettoyage (category_id: ee7fa33f-7099-45a3-9847-8d4a22a2b73f)
UPDATE listings
SET attributes = COALESCE(attributes, '{}'::jsonb) || '{"service_type": "Nettoyage"}'::jsonb
WHERE category_id = 'ee7fa33f-7099-45a3-9847-8d4a22a2b73f'
  AND (attributes->>'service_type' IS NULL OR attributes->>'service_type' = '');

-- ==============================================
-- ANIMAUX
-- ==============================================

-- Chiens (category_id: 8c1b449e-2ebe-4591-9ad7-423303d1d217)
UPDATE listings
SET attributes = COALESCE(attributes, '{}'::jsonb) || '{"animal_type": "Chien"}'::jsonb
WHERE category_id = '8c1b449e-2ebe-4591-9ad7-423303d1d217'
  AND (attributes->>'animal_type' IS NULL OR attributes->>'animal_type' = '');

-- Chats (category_id: 1a51fd7a-2b70-4b99-b321-d092292ad55d)
UPDATE listings
SET attributes = COALESCE(attributes, '{}'::jsonb) || '{"animal_type": "Chat"}'::jsonb
WHERE category_id = '1a51fd7a-2b70-4b99-b321-d092292ad55d'
  AND (attributes->>'animal_type' IS NULL OR attributes->>'animal_type' = '');

-- Oiseaux (category_id: f89e03bd-edb9-4397-a528-0aa6e1b9320e)
UPDATE listings
SET attributes = COALESCE(attributes, '{}'::jsonb) || '{"animal_type": "Oiseau"}'::jsonb
WHERE category_id = 'f89e03bd-edb9-4397-a528-0aa6e1b9320e'
  AND (attributes->>'animal_type' IS NULL OR attributes->>'animal_type' = '');

-- ==============================================
-- LOCATION VÉHICULES
-- ==============================================

-- Voitures de tourisme (category_id: 5f1cafb3-f2aa-4fc3-b2b8-51dbc804628e)
UPDATE listings
SET attributes = COALESCE(attributes, '{}'::jsonb) || '{"rental_type": "Voiture de tourisme"}'::jsonb
WHERE category_id = '5f1cafb3-f2aa-4fc3-b2b8-51dbc804628e'
  AND (attributes->>'rental_type' IS NULL OR attributes->>'rental_type' = '');

-- Voitures de luxe (category_id: 3d2306f2-6448-4ae3-acd1-b047da084f8f)
UPDATE listings
SET attributes = COALESCE(attributes, '{}'::jsonb) || '{"rental_type": "Voiture de luxe"}'::jsonb
WHERE category_id = '3d2306f2-6448-4ae3-acd1-b047da084f8f'
  AND (attributes->>'rental_type' IS NULL OR attributes->>'rental_type' = '');

-- 4x4 & SUV (category_id: a9548f08-39fb-49ba-b9fa-02476d11a15a)
UPDATE listings
SET attributes = COALESCE(attributes, '{}'::jsonb) || '{"rental_type": "4x4 SUV"}'::jsonb
WHERE category_id = 'a9548f08-39fb-49ba-b9fa-02476d11a15a'
  AND (attributes->>'rental_type' IS NULL OR attributes->>'rental_type' = '');

-- ==============================================
-- LOCATION VACANCES
-- ==============================================

-- Appartements de vacances (category_id: a97f8438-c6aa-47b3-a679-2909fd71e75f)
UPDATE listings
SET attributes = COALESCE(attributes, '{}'::jsonb) || '{"rental_property_type": "Appartement de vacances"}'::jsonb
WHERE category_id = 'a97f8438-c6aa-47b3-a679-2909fd71e75f'
  AND (attributes->>'rental_property_type' IS NULL OR attributes->>'rental_property_type' = '');

-- Log the changes
DO $$
DECLARE
  vehicules_count INTEGER;
  electronique_count INTEGER;
  maison_count INTEGER;
  mode_count INTEGER;
  services_count INTEGER;
  animaux_count INTEGER;
  location_vehicules_count INTEGER;
  location_vacances_count INTEGER;
BEGIN
  -- Count updates per category
  SELECT COUNT(*) INTO vehicules_count FROM listings WHERE attributes->>'vehicle_type' IS NOT NULL;
  SELECT COUNT(*) INTO electronique_count FROM listings WHERE attributes->>'device_type' IS NOT NULL;
  SELECT COUNT(*) INTO maison_count FROM listings WHERE attributes->>'product_type' IS NOT NULL;
  SELECT COUNT(*) INTO mode_count FROM listings WHERE attributes->>'category_type' IS NOT NULL;
  SELECT COUNT(*) INTO services_count FROM listings WHERE attributes->>'service_type' IS NOT NULL;
  SELECT COUNT(*) INTO animaux_count FROM listings WHERE attributes->>'animal_type' IS NOT NULL;
  SELECT COUNT(*) INTO location_vehicules_count FROM listings WHERE attributes->>'rental_type' IS NOT NULL;
  SELECT COUNT(*) INTO location_vacances_count FROM listings WHERE attributes->>'rental_property_type' IS NOT NULL;
  
  RAISE NOTICE 'Attributes updated:';
  RAISE NOTICE '  Véhicules: % listings', vehicules_count;
  RAISE NOTICE '  Électronique: % listings', electronique_count;
  RAISE NOTICE '  Maison & Jardin: % listings', maison_count;
  RAISE NOTICE '  Mode & Beauté: % listings', mode_count;
  RAISE NOTICE '  Services: % listings', services_count;
  RAISE NOTICE '  Animaux: % listings', animaux_count;
  RAISE NOTICE '  Location Véhicules: % listings', location_vehicules_count;
  RAISE NOTICE '  Location Vacances: % listings', location_vacances_count;
END $$;
