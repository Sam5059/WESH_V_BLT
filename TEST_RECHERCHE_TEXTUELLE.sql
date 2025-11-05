-- =====================================
-- TEST RECHERCHE TEXTUELLE
-- =====================================

-- 1. Vérifier les annonces existantes
SELECT
  id,
  title,
  description,
  category_id,
  subcategory_id,
  attributes->>'brand_name' as marque,
  attributes->>'model_name' as modele,
  status
FROM listings
WHERE status = 'active'
ORDER BY created_at DESC;

-- 2. Test recherche manuelle simple (sans fonction)
-- Recherche "BMW"
SELECT
  id,
  title,
  price,
  wilaya,
  attributes->>'brand_name' as marque
FROM listings
WHERE
  status = 'active'
  AND (
    LOWER(title) LIKE '%bmw%'
    OR LOWER(description) LIKE '%bmw%'
    OR LOWER(attributes->>'brand_name') LIKE '%bmw%'
  );

-- 3. Test recherche "Dacia"
SELECT
  id,
  title,
  price,
  wilaya,
  attributes->>'brand_name' as marque
FROM listings
WHERE
  status = 'active'
  AND (
    LOWER(title) LIKE '%dacia%'
    OR LOWER(description) LIKE '%dacia%'
    OR LOWER(attributes->>'brand_name') LIKE '%dacia%'
  );

-- 4. Test recherche "Villa"
SELECT
  id,
  title,
  price,
  wilaya
FROM listings
WHERE
  status = 'active'
  AND (
    LOWER(title) LIKE '%villa%'
    OR LOWER(description) LIKE '%villa%'
  );

-- 5. Tester la fonction search_listings avec terme de recherche
-- Test avec "BMW"
SELECT
  title,
  price,
  wilaya,
  relevance
FROM search_listings(
  'BMW',      -- search_term
  NULL,       -- category_filter
  NULL,       -- subcategory_filter
  NULL,       -- wilaya_filter
  NULL,       -- commune_filter
  NULL,       -- min_price
  NULL,       -- max_price
  NULL        -- listing_type
)
ORDER BY relevance DESC;

-- 6. Test avec "Dacia"
SELECT
  title,
  price,
  wilaya,
  relevance
FROM search_listings(
  'Dacia',
  NULL, NULL, NULL, NULL, NULL, NULL, NULL
)
ORDER BY relevance DESC;

-- 7. Test avec "Villa"
SELECT
  title,
  price,
  wilaya,
  relevance
FROM search_listings(
  'Villa',
  NULL, NULL, NULL, NULL, NULL, NULL, NULL
)
ORDER BY relevance DESC;

-- 8. Test recherche vide (doit retourner TOUT)
SELECT
  COUNT(*) as total_annonces
FROM search_listings(
  '',  -- Recherche vide
  NULL, NULL, NULL, NULL, NULL, NULL, NULL
);

-- 9. Afficher la définition de la fonction
SELECT
  pg_get_functiondef(oid)
FROM pg_proc
WHERE proname = 'search_listings';
