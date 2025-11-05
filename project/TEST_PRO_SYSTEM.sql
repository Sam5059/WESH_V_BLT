-- ============================================
-- Script de test pour le Système PRO
-- ============================================

-- 1. Vérifier que toutes les tables existent
SELECT
  table_name,
  CASE
    WHEN EXISTS (
      SELECT 1
      FROM information_schema.tables
      WHERE table_name = t.table_name
        AND table_schema = 'public'
    ) THEN '✅ Existe'
    ELSE '❌ Manquante'
  END as status
FROM (
  VALUES
    ('pro_packages'),
    ('pro_subscriptions'),
    ('pro_transactions'),
    ('pro_analytics'),
    ('profiles')
) AS t(table_name);

-- 2. Vérifier les RLS policies
SELECT
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename IN ('pro_packages', 'pro_subscriptions', 'pro_transactions', 'pro_analytics')
ORDER BY tablename, policyname;

-- 3. Vérifier les fonctions
SELECT
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines
WHERE routine_name IN (
  'activate_pro_subscription',
  'check_pro_status',
  'can_publish_listing',
  'get_pro_analytics'
)
AND routine_schema = 'public';

-- 4. Compter les packages par catégorie
SELECT
  c.name as category,
  COUNT(pp.id) as package_count,
  MIN(pp.price) as min_price,
  MAX(pp.price) as max_price
FROM categories c
LEFT JOIN pro_packages pp ON pp.category_id = c.id AND pp.is_active = true
WHERE c.parent_id IS NULL
GROUP BY c.name
ORDER BY c.name;

-- 5. Vérifier les indexes
SELECT
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename IN ('pro_packages', 'pro_subscriptions', 'pro_transactions', 'pro_analytics')
ORDER BY tablename, indexname;

-- 6. Test de la fonction check_pro_status (avec un UUID factice)
-- Remplacer 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' par un vrai UUID d'utilisateur
SELECT check_pro_status('xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx');

-- 7. Lister tous les packages actifs avec détails
SELECT
  pp.name,
  c.name as category,
  pp.price,
  pp.duration_days,
  CASE
    WHEN pp.max_listings IS NULL THEN 'Illimité'
    ELSE pp.max_listings::text
  END as max_listings,
  pp.featured_listings,
  pp.priority_support,
  pp.analytics,
  pp.is_active
FROM pro_packages pp
JOIN categories c ON c.id = pp.category_id
WHERE pp.is_active = true
ORDER BY c.name, pp.price DESC;

-- 8. Statistiques sur les abonnements
SELECT
  status,
  COUNT(*) as count,
  SUM(paid_amount) as total_revenue
FROM pro_subscriptions
GROUP BY status
ORDER BY status;

-- 9. Vérifier les contraintes
SELECT
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name IN ('pro_packages', 'pro_subscriptions', 'pro_transactions', 'pro_analytics')
  AND tc.constraint_type IN ('PRIMARY KEY', 'FOREIGN KEY', 'CHECK')
ORDER BY tc.table_name, tc.constraint_type, tc.constraint_name;

-- 10. Test d'insertion d'un package test (à supprimer après)
DO $$
DECLARE
  v_category_id uuid;
  v_package_id uuid;
BEGIN
  -- Récupérer une catégorie
  SELECT id INTO v_category_id FROM categories WHERE slug = 'vehicules' LIMIT 1;

  IF v_category_id IS NOT NULL THEN
    -- Insérer un package test
    INSERT INTO pro_packages (
      category_id,
      name,
      name_ar,
      name_en,
      description,
      description_ar,
      description_en,
      price,
      duration_days,
      max_listings,
      featured_listings,
      priority_support,
      analytics,
      is_active,
      order_position
    ) VALUES (
      v_category_id,
      'Pack Test',
      'باقة تجريبية',
      'Test Pack',
      'Ceci est un package de test',
      'هذه باقة تجريبية',
      'This is a test package',
      1000.00,
      7,
      5,
      1,
      false,
      false,
      false,
      999
    )
    RETURNING id INTO v_package_id;

    RAISE NOTICE '✅ Package test créé avec succès: %', v_package_id;

    -- Supprimer immédiatement le package test
    DELETE FROM pro_packages WHERE id = v_package_id;
    RAISE NOTICE '✅ Package test supprimé avec succès';
  ELSE
    RAISE NOTICE '❌ Aucune catégorie trouvée pour le test';
  END IF;
END $$;

-- 11. Vérifier les triggers
SELECT
  event_object_table,
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers
WHERE event_object_table IN ('pro_subscriptions', 'pro_analytics')
ORDER BY event_object_table, trigger_name;

-- 12. Test de performance - Compter les lignes
SELECT
  'pro_packages' as table_name,
  COUNT(*) as row_count
FROM pro_packages
UNION ALL
SELECT
  'pro_subscriptions',
  COUNT(*)
FROM pro_subscriptions
UNION ALL
SELECT
  'pro_transactions',
  COUNT(*)
FROM pro_transactions
UNION ALL
SELECT
  'pro_analytics',
  COUNT(*)
FROM pro_analytics;

-- 13. Vérifier les champs profiles pour PRO
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
  AND column_name LIKE 'pro_%'
ORDER BY column_name;

-- ============================================
-- RÉSULTATS ATTENDUS
-- ============================================
/*
1. Toutes les tables doivent exister (✅)
2. Au moins 6 policies par table doivent être présentes
3. Les 4 fonctions doivent exister et être de type 'FUNCTION'
4. Chaque catégorie doit avoir au moins 3 packages
5. Tous les indexes doivent être créés
6. Les contraintes FK et PK doivent être présentes
7. Les triggers doivent être actifs
8. Les champs PRO doivent être ajoutés à profiles
*/

-- ============================================
-- COMMANDES DE NETTOYAGE (si nécessaire)
-- ============================================
-- ATTENTION: Ne pas exécuter en production!
/*
-- Supprimer toutes les données de test
DELETE FROM pro_analytics WHERE user_id = 'test-user-id';
DELETE FROM pro_transactions WHERE user_id = 'test-user-id';
DELETE FROM pro_subscriptions WHERE user_id = 'test-user-id';

-- Réinitialiser les compteurs
UPDATE profiles
SET
  pro_package_id = NULL,
  pro_expires_at = NULL,
  pro_listings_remaining = NULL,
  pro_featured_remaining = NULL,
  pro_category_id = NULL
WHERE user_type != 'professional';
*/
