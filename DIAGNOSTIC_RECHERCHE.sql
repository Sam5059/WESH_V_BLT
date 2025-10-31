-- =====================================
-- DIAGNOSTIC COMPLET - Recherche
-- =====================================

-- 1. Vérifier les catégories parentes
SELECT
  id,
  name,
  slug,
  parent_id
FROM categories
WHERE parent_id IS NULL
ORDER BY display_order;

-- 2. Compter les annonces par catégorie
SELECT
  c.name as categorie,
  COUNT(l.id) as nombre_annonces
FROM categories c
LEFT JOIN listings l ON l.category_id = c.id AND l.status = 'active'
WHERE c.parent_id IS NULL
GROUP BY c.id, c.name
ORDER BY c.display_order;

-- 3. Vérifier la structure des annonces
SELECT
  l.title,
  c.name as categorie_parente,
  sc.name as sous_categorie,
  l.category_id,
  l.subcategory_id,
  l.status
FROM listings l
LEFT JOIN categories c ON c.id = l.category_id
LEFT JOIN categories sc ON sc.id = l.subcategory_id
WHERE l.status = 'active'
ORDER BY l.created_at DESC;

-- 4. Tester la fonction search_listings (si elle existe)
DO $$
DECLARE
  vehicules_id UUID;
  immobilier_id UUID;
  result_count INTEGER;
BEGIN
  -- Récupérer les IDs
  SELECT id INTO vehicules_id FROM categories WHERE slug = 'vehicules' AND parent_id IS NULL LIMIT 1;
  SELECT id INTO immobilier_id FROM categories WHERE slug = 'immobilier' AND parent_id IS NULL LIMIT 1;

  RAISE NOTICE '=================================';
  RAISE NOTICE 'TEST DE LA FONCTION search_listings()';
  RAISE NOTICE '=================================';

  -- Test Véhicules
  IF vehicules_id IS NOT NULL THEN
    BEGIN
      SELECT COUNT(*) INTO result_count
      FROM search_listings('', vehicules_id, NULL, NULL, NULL, NULL, NULL, NULL);
      RAISE NOTICE '✅ Véhicules : % annonces', result_count;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE '❌ Véhicules : Erreur - %', SQLERRM;
    END;
  ELSE
    RAISE NOTICE '⚠️  Catégorie Véhicules non trouvée';
  END IF;

  -- Test Immobilier
  IF immobilier_id IS NOT NULL THEN
    BEGIN
      SELECT COUNT(*) INTO result_count
      FROM search_listings('', immobilier_id, NULL, NULL, NULL, NULL, NULL, NULL);
      RAISE NOTICE '✅ Immobilier : % annonces', result_count;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE '❌ Immobilier : Erreur - %', SQLERRM;
    END;
  ELSE
    RAISE NOTICE '⚠️  Catégorie Immobilier non trouvée';
  END IF;

  -- Test sans filtre
  BEGIN
    SELECT COUNT(*) INTO result_count
    FROM search_listings('', NULL, NULL, NULL, NULL, NULL, NULL, NULL);
    RAISE NOTICE '✅ Sans filtre : % annonces (total)', result_count;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ Sans filtre : Erreur - %', SQLERRM;
  END;

  RAISE NOTICE '=================================';
END $$;

-- 5. Vérifier si la fonction existe
SELECT
  proname as nom_fonction,
  pg_get_function_arguments(oid) as parametres
FROM pg_proc
WHERE proname = 'search_listings';
