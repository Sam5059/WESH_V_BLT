/*
  # Correction des véhicules dans Location Immobilière

  1. Problème identifié
     - Des annonces de véhicules (BMW, Mercedes) apparaissent dans la catégorie "Location Immobilière"
     - Ces annonces devraient être dans les catégories Véhicules appropriées

  2. Solution
     - Identifier les annonces mal catégorisées
     - Les déplacer vers les bonnes catégories
     - Vérifier l'intégrité des catégories
*/

-- Étape 1: Vérifier la catégorie Location Immobilière et ses sous-catégories
SELECT
  'Catégorie Location Immobilière' as type,
  id,
  name,
  slug,
  parent_id
FROM categories
WHERE slug = 'location-immobiliere' OR name ILIKE '%location%immobil%';

-- Étape 2: Trouver les IDs des bonnes catégories pour véhicules
DO $$
DECLARE
  location_immobiliere_id UUID;
  voitures_cat_id UUID;
  listing_record RECORD;
BEGIN
  -- Récupérer l'ID de Location Immobilière
  SELECT id INTO location_immobiliere_id
  FROM categories
  WHERE slug = 'location-immobiliere'
  LIMIT 1;

  -- Récupérer l'ID de la catégorie Voitures
  SELECT id INTO voitures_cat_id
  FROM categories
  WHERE slug = 'voitures'
  LIMIT 1;

  RAISE NOTICE 'Location Immobilière ID: %', location_immobiliere_id;
  RAISE NOTICE 'Voitures ID: %', voitures_cat_id;

  -- Corriger les annonces de véhicules mal catégorisées
  IF location_immobiliere_id IS NOT NULL AND voitures_cat_id IS NOT NULL THEN
    FOR listing_record IN
      SELECT l.id, l.title, c.name as cat_name, c.slug as cat_slug
      FROM listings l
      JOIN categories c ON c.id = l.category_id
      WHERE l.status = 'active'
      AND (
        c.parent_id = location_immobiliere_id
        OR c.id = location_immobiliere_id
      )
      AND (
        l.title ILIKE '%BMW%'
        OR l.title ILIKE '%Mercedes%'
        OR l.title ILIKE '%Benz%'
        OR l.title ILIKE '%Dacia%'
        OR l.title ILIKE '%voiture%'
        OR l.title ILIKE '%Serie%'
        OR l.title ILIKE '%F4%'
        OR l.title ILIKE '%F3%'
      )
    LOOP
      RAISE NOTICE 'Correction de: % (%) - catégorie: %',
        listing_record.title,
        listing_record.id,
        listing_record.cat_name;

      -- Déplacer vers la catégorie Voitures
      UPDATE listings
      SET category_id = voitures_cat_id,
          updated_at = now()
      WHERE id = listing_record.id;
    END LOOP;
  END IF;
END $$;

-- Étape 3: Vérifier les résultats
SELECT
  'Annonces dans Location Immobilière après correction' as info,
  COUNT(*) as count
FROM listings l
JOIN categories c ON c.id = l.category_id
WHERE l.status = 'active'
AND (
  c.slug = 'location-immobiliere'
  OR c.parent_id IN (SELECT id FROM categories WHERE slug = 'location-immobiliere')
)
AND (
  l.title ILIKE '%BMW%'
  OR l.title ILIKE '%Mercedes%'
  OR l.title ILIKE '%voiture%'
);

-- Étape 4: Afficher les annonces restantes dans Location Immobilière
SELECT
  l.id,
  l.title,
  l.price,
  c.name as category_name,
  c.slug as category_slug
FROM listings l
JOIN categories c ON c.id = l.category_id
WHERE l.status = 'active'
AND (
  c.slug = 'location-immobiliere'
  OR c.parent_id IN (SELECT id FROM categories WHERE slug = 'location-immobiliere')
)
ORDER BY l.created_at DESC
LIMIT 10;
