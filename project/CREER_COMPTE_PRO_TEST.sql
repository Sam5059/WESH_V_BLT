/*
  ==========================================
  SCRIPT DE TEST : CRÉER UN COMPTE PRO COMPLET
  ==========================================

  Ce script crée automatiquement :
  1. Un utilisateur de test
  2. Active un abonnement PRO
  3. Crée un Store PRO

  USAGE :
  Copiez-collez ce script dans l'éditeur SQL de Supabase
  et exécutez-le directement.
*/

DO $$
DECLARE
  v_user_id uuid;
  v_email text;
  v_password text := 'Test123!';
  v_category_id uuid;
  v_package_id uuid;
  v_store_slug text;
  v_result jsonb;
BEGIN
  -- ==========================================
  -- ÉTAPE 1 : CRÉER UN UTILISATEUR DE TEST
  -- ==========================================

  v_email := 'pro.test.' || floor(random() * 100000) || '@buygo.dz';

  RAISE NOTICE '';
  RAISE NOTICE '====================================';
  RAISE NOTICE '🚀 CRÉATION COMPTE PRO DE TEST';
  RAISE NOTICE '====================================';
  RAISE NOTICE '';
  RAISE NOTICE '📧 Email: %', v_email;
  RAISE NOTICE '🔑 Password: %', v_password;
  RAISE NOTICE '';

  -- Créer l'utilisateur dans auth.users
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    v_email,
    crypt(v_password, gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'Test Vendeur PRO'),
    now(),
    now(),
    '',
    '',
    '',
    ''
  ) RETURNING id INTO v_user_id;

  RAISE NOTICE '✅ Utilisateur créé avec succès !';
  RAISE NOTICE '   User ID: %', v_user_id;
  RAISE NOTICE '';

  -- Attendre que le profil soit créé par le trigger
  PERFORM pg_sleep(0.5);

  -- ==========================================
  -- ÉTAPE 2 : ACTIVER UN PACKAGE PRO
  -- ==========================================

  RAISE NOTICE '📦 Activation du package PRO...';
  RAISE NOTICE '';

  -- Récupérer une catégorie (Véhicules)
  SELECT id INTO v_category_id
  FROM categories
  WHERE slug = 'vehicules'
  LIMIT 1;

  IF v_category_id IS NULL THEN
    RAISE EXCEPTION 'Catégorie Véhicules non trouvée !';
  END IF;

  RAISE NOTICE '   Catégorie: Véhicules (ID: %)', v_category_id;

  -- Récupérer un package PRO Basic
  SELECT id INTO v_package_id
  FROM pro_packages
  WHERE category_id = v_category_id
  AND name LIKE '%Basic%'
  AND is_active = true
  LIMIT 1;

  IF v_package_id IS NULL THEN
    RAISE EXCEPTION 'Package PRO Basic non trouvé !';
  END IF;

  RAISE NOTICE '   Package: PRO Basic (ID: %)', v_package_id;
  RAISE NOTICE '';

  -- Activer l'abonnement PRO
  SELECT activate_pro_subscription(
    v_user_id,
    v_package_id,
    'test',
    'TEST-' || to_char(now(), 'YYYYMMDDHH24MISS')
  ) INTO v_result;

  IF (v_result->>'success')::boolean = true THEN
    RAISE NOTICE '✅ Abonnement PRO activé avec succès !';
    RAISE NOTICE '   Subscription ID: %', v_result->>'subscription_id';
  ELSE
    RAISE EXCEPTION 'Erreur activation PRO: %', v_result->>'error';
  END IF;

  RAISE NOTICE '';

  -- ==========================================
  -- ÉTAPE 3 : CRÉER UN STORE PRO
  -- ==========================================

  RAISE NOTICE '🏪 Création du Store PRO...';
  RAISE NOTICE '';

  v_store_slug := 'store-test-' || floor(random() * 100000);

  -- Créer le store
  INSERT INTO pro_stores (
    user_id,
    name,
    slug,
    description,
    location,
    contact_email,
    contact_phone,
    whatsapp_number,
    category_id,
    is_active
  ) VALUES (
    v_user_id,
    'Store Test PRO Auto',
    v_store_slug,
    'Spécialiste de la vente de véhicules neufs et d''occasion. Plus de 15 ans d''expérience dans le secteur automobile algérien.',
    'Alger, Hydra',
    v_email,
    '0555123456',
    '0555123456',
    v_category_id,
    true
  );

  RAISE NOTICE '✅ Store PRO créé avec succès !';
  RAISE NOTICE '   Store Slug: %', v_store_slug;
  RAISE NOTICE '';

  -- ==========================================
  -- RÉSUMÉ FINAL
  -- ==========================================

  RAISE NOTICE '';
  RAISE NOTICE '====================================';
  RAISE NOTICE '✅ COMPTE PRO CRÉÉ AVEC SUCCÈS !';
  RAISE NOTICE '====================================';
  RAISE NOTICE '';
  RAISE NOTICE '📋 INFORMATIONS DE CONNEXION :';
  RAISE NOTICE '   Email    : %', v_email;
  RAISE NOTICE '   Password : %', v_password;
  RAISE NOTICE '';
  RAISE NOTICE '🔗 LIENS UTILES :';
  RAISE NOTICE '   Dashboard PRO : /pro/dashboard';
  RAISE NOTICE '   Mon Store     : /pro/%', v_store_slug;
  RAISE NOTICE '   Tous les stores : /stores';
  RAISE NOTICE '';
  RAISE NOTICE '🎉 Vous pouvez maintenant :';
  RAISE NOTICE '   1. Vous connecter avec ces identifiants';
  RAISE NOTICE '   2. Accéder à votre store PRO';
  RAISE NOTICE '   3. Publier des annonces PRO';
  RAISE NOTICE '';
  RAISE NOTICE '====================================';

END $$;


-- ==========================================
-- VÉRIFICATION : Voir le compte créé
-- ==========================================

SELECT
  '=== DERNIER COMPTE PRO CRÉÉ ===' as info;

SELECT
  u.email,
  u.created_at,
  pr.user_type,
  pr.pro_expires_at,
  pr.pro_listings_remaining,
  pk.name as package_name,
  s.name as store_name,
  s.slug as store_slug
FROM auth.users u
LEFT JOIN profiles pr ON pr.id = u.id
LEFT JOIN pro_packages pk ON pk.id = pr.pro_package_id
LEFT JOIN pro_stores s ON s.user_id = u.id
WHERE u.email LIKE 'pro.test.%'
ORDER BY u.created_at DESC
LIMIT 1;
