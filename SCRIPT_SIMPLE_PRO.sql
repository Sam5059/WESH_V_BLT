-- ═══════════════════════════════════════════════════════════════
-- 🚀 SCRIPT ULTRA-SIMPLE: ACTIVER UN COMPTE PRO
-- ═══════════════════════════════════════════════════════════════
--
-- 📝 INSTRUCTIONS:
-- 1. Créez d'abord un compte dans l'application
-- 2. Remplacez 'VOTRE_EMAIL_ICI' par votre vrai email (ligne 15)
-- 3. Copiez-collez tout ce code dans Supabase > SQL Editor
-- 4. Cliquez sur "Run" (Exécuter)
-- 5. Reconnectez-vous à l'application
-- 6. C'est prêt !
--
-- ═══════════════════════════════════════════════════════════════

DO $$
DECLARE
  v_email text := 'VOTRE_EMAIL_ICI';  -- 👈 CHANGEZ UNIQUEMENT ICI

  -- Variables (ne touchez pas)
  v_user_id uuid;
  v_package_id uuid;
  v_category_id uuid;
BEGIN
  -- Trouver l'utilisateur
  SELECT id INTO v_user_id FROM auth.users WHERE email = v_email;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION '❌ Email "%" non trouvé. Créez le compte d''abord !', v_email;
  END IF;

  -- Trouver catégorie et forfait
  SELECT id INTO v_category_id FROM categories WHERE slug = 'vehicules' LIMIT 1;
  SELECT id INTO v_package_id FROM pro_packages WHERE category_id = v_category_id AND is_active = true LIMIT 1;

  -- Supprimer ancien abonnement
  DELETE FROM pro_subscriptions WHERE user_id = v_user_id;

  -- Créer abonnement PRO (30 jours)
  INSERT INTO pro_subscriptions (
    user_id, package_id, category_id,
    starts_at, expires_at, status,
    paid_amount, payment_method, payment_reference
  ) VALUES (
    v_user_id, v_package_id, v_category_id,
    now(), now() + interval '30 days', 'active',
    5000, 'test', 'TEST-' || v_user_id
  );

  -- Mettre profil en "professional"
  UPDATE profiles SET user_type = 'professional' WHERE id = v_user_id;

  -- Confirmation
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════';
  RAISE NOTICE '✅ COMPTE PRO ACTIVÉ AVEC SUCCÈS !';
  RAISE NOTICE '════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '📧 Email: %', v_email;
  RAISE NOTICE '📦 Catégorie: Véhicules';
  RAISE NOTICE '⏰ Expire dans: 30 jours';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Prochaines étapes:';
  RAISE NOTICE '   1. Reconnectez-vous à l''app';
  RAISE NOTICE '   2. Allez sur "Stores PRO" 🏪';
  RAISE NOTICE '   3. Cliquez "Créer mon Store PRO"';
  RAISE NOTICE '';
END $$;

-- ═══════════════════════════════════════════════════════════════
-- 🔍 VÉRIFICATION (résultat affiché en bas)
-- ═══════════════════════════════════════════════════════════════
SELECT
  '✅ ABONNEMENT CRÉÉ' as statut,
  u.email,
  ps.status as etat,
  ps.expires_at::date as expiration,
  c.name as categorie
FROM pro_subscriptions ps
JOIN auth.users u ON ps.user_id = u.id
JOIN categories c ON ps.category_id = c.id
WHERE u.email = 'VOTRE_EMAIL_ICI'  -- 👈 CHANGEZ AUSSI ICI
ORDER BY ps.created_at DESC
LIMIT 1;
