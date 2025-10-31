/*
  Script SQL pour supprimer/corriger les véhicules dans Location Immobilière

  À exécuter dans: Supabase Dashboard > SQL Editor
*/

-- 1. Voir les annonces problématiques
SELECT
  l.id,
  l.title,
  l.price,
  c.name as categorie,
  c.slug as slug_categorie
FROM listings l
JOIN categories c ON c.id = l.category_id
WHERE l.status = 'active'
AND c.slug IN ('location-immobiliere', 'immobilier-location')
AND (
  l.title ILIKE '%BMW%' OR
  l.title ILIKE '%Mercedes%' OR
  l.title ILIKE '%Dacia%' OR
  l.title ILIKE '%voiture%' OR
  l.title ILIKE '%Serie%'
)
ORDER BY l.created_at DESC;

-- 2. OPTION A: Supprimer complètement ces annonces
-- DELETE FROM listings
-- WHERE id IN (
--   SELECT l.id
--   FROM listings l
--   JOIN categories c ON c.id = l.category_id
--   WHERE l.status = 'active'
--   AND c.slug IN ('location-immobiliere', 'immobilier-location')
--   AND (
--     l.title ILIKE '%BMW%' OR
--     l.title ILIKE '%Mercedes%' OR
--     l.title ILIKE '%Dacia%' OR
--     l.title ILIKE '%voiture%' OR
--     l.title ILIKE '%Serie%'
--   )
-- );

-- 3. OPTION B: Les déplacer vers la catégorie Voitures
UPDATE listings
SET category_id = (SELECT id FROM categories WHERE slug = 'voitures' LIMIT 1),
    updated_at = now()
WHERE id IN (
  SELECT l.id
  FROM listings l
  JOIN categories c ON c.id = l.category_id
  WHERE l.status = 'active'
  AND c.slug IN ('location-immobiliere', 'immobilier-location')
  AND (
    l.title ILIKE '%BMW%' OR
    l.title ILIKE '%Mercedes%' OR
    l.title ILIKE '%Dacia%' OR
    l.title ILIKE '%voiture%' OR
    l.title ILIKE '%Serie%' OR
    l.title ILIKE '%F3%' OR
    l.title ILIKE '%F4%'
  )
);

-- 4. Vérification finale
SELECT
  'Véhicules restants dans Location Immobilière' as info,
  COUNT(*) as count
FROM listings l
JOIN categories c ON c.id = l.category_id
WHERE l.status = 'active'
AND c.slug IN ('location-immobiliere', 'immobilier-location')
AND (
  l.title ILIKE '%BMW%' OR
  l.title ILIKE '%Mercedes%' OR
  l.title ILIKE '%voiture%'
);
