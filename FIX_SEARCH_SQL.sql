-- =====================================
-- TEST RAPIDE - Fonction search_listings
-- =====================================

-- ÉTAPE 1 : Vérifier si la fonction existe
SELECT
  CASE
    WHEN COUNT(*) > 0 THEN '✅ La fonction search_listings existe'
    ELSE '❌ La fonction search_listings N''EXISTE PAS - APPLIQUEZ LA MIGRATION'
  END as resultat
FROM pg_proc
WHERE proname = 'search_listings';

-- ÉTAPE 2 : Compter les annonces actives
SELECT
  COUNT(*) as total_annonces_actives,
  CASE
    WHEN COUNT(*) = 0 THEN '❌ Aucune annonce active'
    ELSE '✅ Des annonces existent'
  END as statut
FROM listings
WHERE status = 'active';

-- ÉTAPE 3 : Voir les annonces par catégorie
SELECT
  c.name as categorie,
  COUNT(l.id) as nombre_annonces
FROM categories c
LEFT JOIN listings l ON l.category_id = c.id AND l.status = 'active'
WHERE c.parent_id IS NULL
GROUP BY c.id, c.name
ORDER BY c.display_order;

-- ÉTAPE 4 : Si la fonction existe, testez-la
-- Décommentez pour tester :

/*
-- Test 1 : Toutes les annonces
SELECT COUNT(*) as total
FROM search_listings('', NULL, NULL, NULL, NULL, NULL, NULL, NULL);

-- Test 2 : Filtre Véhicules
SELECT title, price, wilaya
FROM search_listings(
  '',
  (SELECT id FROM categories WHERE slug = 'vehicules' AND parent_id IS NULL),
  NULL, NULL, NULL, NULL, NULL, NULL
);

-- Test 3 : Recherche "BMW"
SELECT title, price, relevance
FROM search_listings('BMW', NULL, NULL, NULL, NULL, NULL, NULL, NULL)
ORDER BY relevance DESC;
*/

-- =====================================
-- SI LA FONCTION N'EXISTE PAS
-- =====================================

SELECT
  '⚠️  ACTION REQUISE' as titre,
  'Copiez 20251020_fix_category_filter_correct.sql' as etape_1,
  'Collez dans SQL Editor' as etape_2,
  'Cliquez Run' as etape_3;
