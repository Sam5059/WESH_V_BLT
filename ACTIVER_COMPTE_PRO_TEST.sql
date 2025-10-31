-- ============================================
-- SCRIPT RAPIDE: ACTIVER UN COMPTE PRO
-- ============================================
--
-- Instructions:
-- 1. Créez un compte dans l'application (inscrivez-vous normalement)
-- 2. Remplacez 'VOTRE_EMAIL@example.com' par votre email
-- 3. Exécutez ce script dans Supabase > SQL Editor
-- 4. Reconnectez-vous à l'application
-- 5. Allez sur /pro/create-store pour créer votre store
--
-- ============================================

DO $$
DECLARE
  v_user_id uuid;
  v_package_id uuid;
  v_category_id uuid;
  v_user_email text := 'VOTRE_EMAIL@example.com';  -- ⚠️ CHANGEZ ICI
BEGIN
  -- ============================================
  -- 1. TROUVER L'UTILISATEUR
  -- ============================================
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = v_user_email;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION '❌ Utilisateur avec email "%" non trouvé. Vérifiez l''email ou inscrivez-vous d''abord.', v_user_email;
  END IF;

  RAISE NOTICE '✅ Utilisateur trouvé: %', v_user_id;

  -- ============================================
  -- 2. TROUVER UNE CATÉGORIE (Véhicules par défaut)
  -- ============================================
  SELECT id INTO v_category_id
  FROM categories
  WHERE slug = 'vehicules'
  LIMIT 1;

  IF v_category_id IS NULL THEN
    RAISE EXCEPTION '❌ Catégorie "Véhicules" non trouvée. Vérifiez votre base de données.';
  END IF;

  RAISE NOTICE '✅ Catégorie trouvée: Véhicules';

  -- ============================================
  -- 3. TROUVER UN FORFAIT PRO
  -- ============================================
  SELECT id INTO v_package_id
  FROM pro_packages
  WHERE category_id = v_category_id
    AND is_active = true
  ORDER BY price ASC
  LIMIT 1;

  IF v_package_id IS NULL THEN
    RAISE EXCEPTION '❌ Aucun forfait PRO trouvé pour la catégorie Véhicules.';
  END IF;

  RAISE NOTICE '✅ Forfait PRO trouvé';

  -- ============================================
  -- 4. SUPPRIMER LES ANCIENS ABONNEMENTS (éviter doublons)
  -- ============================================
  DELETE FROM pro_subscriptions WHERE user_id = v_user_id;
  RAISE NOTICE '🗑️  Anciens abonnements supprimés';

  -- ============================================
  -- 5. CRÉER L'ABONNEMENT PRO ACTIF
  -- ============================================
  INSERT INTO pro_subscriptions (
    user_id,
    package_id,
    category_id,
    starts_at,
    expires_at,
    status,
    listings_used,
    featured_used,
    paid_amount,
    payment_method,
    payment_reference
  ) VALUES (
    v_user_id,
    v_package_id,
    v_category_id,
    now(),                        -- Commence maintenant
    now() + interval '30 days',   -- Expire dans 30 jours
    'active',                     -- Statut actif
    0,                            -- Aucune annonce utilisée
    0,                            -- Aucune vedette utilisée
    5000,                         -- 5000 DA (fictif pour test)
    'test',                       -- Méthode de paiement
    'TEST-' || EXTRACT(EPOCH FROM now())::text  -- Référence unique
  );

  RAISE NOTICE '✅ Abonnement PRO créé (expire dans 30 jours)';

  -- ============================================
  -- 6. METTRE À JOUR LE PROFIL EN "PROFESSIONAL"
  -- ============================================
  UPDATE profiles
  SET user_type = 'professional'
  WHERE id = v_user_id;

  RAISE NOTICE '✅ Profil mis à jour en "professional"';

  -- ============================================
  -- RÉSUMÉ
  -- ============================================
  RAISE NOTICE '';
  RAISE NOTICE '╔════════════════════════════════════════════╗';
  RAISE NOTICE '║   🎉 COMPTE PRO ACTIVÉ AVEC SUCCÈS !     ║';
  RAISE NOTICE '╚════════════════════════════════════════════╝';
  RAISE NOTICE '';
  RAISE NOTICE 'Prochaines étapes:';
  RAISE NOTICE '1. Reconnectez-vous à l''application';
  RAISE NOTICE '2. Allez sur /pro/create-store';
  RAISE NOTICE '3. Créez votre Store PRO';
  RAISE NOTICE '';

END $$;

-- ============================================
-- VÉRIFICATION: Afficher l'abonnement créé
-- ============================================
SELECT
  u.email,
  ps.status,
  ps.starts_at::date as debut,
  ps.expires_at::date as expiration,
  c.name as categorie,
  pp.name as forfait,
  pp.price as prix
FROM pro_subscriptions ps
JOIN auth.users u ON ps.user_id = u.id
JOIN categories c ON ps.category_id = c.id
JOIN pro_packages pp ON ps.package_id = pp.id
WHERE u.email = 'VOTRE_EMAIL@example.com'  -- ⚠️ CHANGEZ ICI AUSSI
ORDER BY ps.created_at DESC
LIMIT 1;
