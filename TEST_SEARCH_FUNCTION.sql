-- TEST: Vérifier que search_listings fonctionne avec les catégories parentes

-- 1. Lister les catégories parentes
SELECT
  id,
  name,
  slug,
  parent_id
FROM categories
WHERE parent_id IS NULL
  AND slug != 'stores-pro'
ORDER BY display_order
LIMIT 5;

-- 2. Choisir une catégorie parente (ex: Véhicules)
-- Remplacez 'PARENT_CATEGORY_ID' par un ID de la requête ci-dessus
-- Exemple : SELECT id FROM categories WHERE slug = 'vehicules';

-- 3. Voir ses sous-catégories
SELECT
  id,
  name,
  parent_id
FROM categories
WHERE parent_id = (SELECT id FROM categories WHERE slug = 'vehicules' LIMIT 1);

-- 4. Compter les annonces dans ces sous-catégories
SELECT
  c.name as subcategory_name,
  COUNT(l.id) as listings_count
FROM categories c
LEFT JOIN listings l ON l.category_id = c.id AND l.status = 'active'
WHERE c.parent_id = (SELECT id FROM categories WHERE slug = 'vehicules' LIMIT 1)
GROUP BY c.id, c.name
ORDER BY listings_count DESC;

-- 5. TESTER LA FONCTION search_listings avec une catégorie parente
-- Remplacez PARENT_CATEGORY_ID par l'ID de Véhicules
SELECT
  id,
  title,
  category_id,
  price,
  wilaya
FROM search_listings(
  search_term := '',
  category_filter := (SELECT id FROM categories WHERE slug = 'vehicules' LIMIT 1),
  subcategory_filter := NULL,
  wilaya_filter := NULL,
  commune_filter := NULL,
  min_price_filter := NULL,
  max_price_filter := NULL,
  listing_type_filter := NULL
)
LIMIT 10;

-- 6. Vérifier que la fonction existe et sa signature
SELECT
  p.proname as function_name,
  pg_get_function_arguments(p.oid) as arguments,
  pg_get_functiondef(p.oid) LIKE '%subcategory_ids%' as has_subcategory_logic
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.proname = 'search_listings';
