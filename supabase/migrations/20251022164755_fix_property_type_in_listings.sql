/*
  # Fix property_type in listings attributes
  
  1. Changes
    - Update all listings in Appartements category to have property_type = 'Appartement'
    - Update all listings in Maisons & Villas category to have property_type = 'Maison'
    - This ensures filters work correctly
  
  2. Notes
    - Only updates listings where property_type is missing
    - Uses JSONB merge to preserve other attributes
*/

-- Update Appartements
UPDATE listings
SET attributes = COALESCE(attributes, '{}'::jsonb) || '{"property_type": "Appartement"}'::jsonb
WHERE category_id = 'b37b961b-e306-4d1b-b6fc-ca40e94e76b6'  -- Appartements
  AND (attributes->>'property_type' IS NULL OR attributes->>'property_type' = '');

-- Update Maisons & Villas
UPDATE listings
SET attributes = COALESCE(attributes, '{}'::jsonb) || '{"property_type": "Maison"}'::jsonb
WHERE category_id = '1ddda010-ac8d-4c87-b3c1-b86842672004'  -- Maisons & Villas
  AND (attributes->>'property_type' IS NULL OR attributes->>'property_type' = '');

-- Update Bureaux
UPDATE listings
SET attributes = COALESCE(attributes, '{}'::jsonb) || '{"property_type": "Bureau"}'::jsonb
WHERE category_id = '03e8804c-d5c5-4f10-877d-e0dc117d2cf7'  -- Bureaux
  AND (attributes->>'property_type' IS NULL OR attributes->>'property_type' = '');

-- Update Terrains
UPDATE listings
SET attributes = COALESCE(attributes, '{}'::jsonb) || '{"property_type": "Terrain"}'::jsonb
WHERE category_id = '52fa9451-af17-409f-9d9d-e513cdd17a26'  -- Terrains
  AND (attributes->>'property_type' IS NULL OR attributes->>'property_type' = '');

-- Log the changes
DO $$
DECLARE
  appartements_count INTEGER;
  maisons_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO appartements_count 
  FROM listings 
  WHERE category_id = 'b37b961b-e306-4d1b-b6fc-ca40e94e76b6' 
    AND attributes->>'property_type' = 'Appartement';
    
  SELECT COUNT(*) INTO maisons_count 
  FROM listings 
  WHERE category_id = '1ddda010-ac8d-4c87-b3c1-b86842672004' 
    AND attributes->>'property_type' = 'Maison';
  
  RAISE NOTICE 'Property types updated: % appartements, % maisons', appartements_count, maisons_count;
END $$;
