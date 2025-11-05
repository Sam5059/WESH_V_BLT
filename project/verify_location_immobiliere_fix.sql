-- Vérifier que les véhicules n'apparaissent plus dans Location Immobilière

-- 1. Compter les véhicules restants dans Location Immobilière
SELECT
  'Véhicules dans Location Immobilière (devrait être 0)' as check_type,
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
  OR l.title ILIKE '%Dacia%'
);

-- 2. Afficher les 10 premières annonces dans Location Immobilière (devrait être uniquement immobilier)
SELECT
  l.id,
  l.title,
  l.price,
  c.name as category,
  l.listing_type
FROM listings l
JOIN categories c ON c.id = l.category_id
WHERE l.status = 'active'
AND (
  c.slug = 'location-immobiliere'
  OR c.parent_id IN (SELECT id FROM categories WHERE slug = 'location-immobiliere')
)
ORDER BY l.created_at DESC
LIMIT 10;
