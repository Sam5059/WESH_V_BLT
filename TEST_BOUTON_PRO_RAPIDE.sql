-- ==========================================
-- TEST RAPIDE : Activer PRO en 1 minute
-- ==========================================
--
-- Ce script teste si le bouton "Choisir PRO" fonctionne
-- en créant un compte PRO complet automatiquement
--
-- COPIEZ-COLLEZ ce script dans Supabase SQL Editor
-- et EXÉCUTEZ-LE
--
-- ==========================================

-- 1️⃣ VÉRIFIER LES PACKAGES DISPONIBLES
SELECT
  '=== PACKAGES PRO DISPONIBLES ===' as info;

SELECT
  pk.id,
  pk.name,
  pk.price,
  pk.duration_days,
  pk.max_listings,
  c.name as category,
  c.slug as category_slug
FROM pro_packages pk
LEFT JOIN categories c ON c.id = pk.category_id
WHERE pk.is_active = true
ORDER BY c.name, pk.order_position
LIMIT 10;

-- 2️⃣ VÉRIFIER LA FONCTION RPC
SELECT
  '=== FONCTION activate_pro_subscription ===' as info;

SELECT
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name = 'activate_pro_subscription';

-- 3️⃣ CRÉER UN COMPTE PRO DE TEST
DO $$
DECLARE
  v_user_id uuid;
  v_email text;
  v_password text := 'Test123!';
  v_package_id uuid;
  v_result jsonb;
BEGIN
  -- Email unique
  v_email := 'pro.rapide.' || floor(random() * 100000) || '@test.dz';

  RAISE NOTICE '';
  RAISE NOTICE '⚡ TEST RAPIDE : Création compte PRO';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '';

  -- Créer l'utilisateur
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_app_meta_data, raw_user_meta_data
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    v_email,
    crypt(v_password, gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Test PRO Rapide"}'
  ) RETURNING id INTO v_user_id;

  RAISE NOTICE '✅ User créé: %', v_user_id;

  -- Attendre le trigger
  PERFORM pg_sleep(0.3);

  -- Prendre n'importe quel package PRO actif
  SELECT id INTO v_package_id
  FROM pro_packages
  WHERE is_active = true
  LIMIT 1;

  IF v_package_id IS NULL THEN
    RAISE EXCEPTION '❌ Aucun package PRO trouvé !';
  END IF;

  RAISE NOTICE '✅ Package ID: %', v_package_id;

  -- Activer l'abonnement
  SELECT activate_pro_subscription(
    v_user_id,
    v_package_id,
    'test',
    'TEST-RAPIDE-' || extract(epoch from now())
  ) INTO v_result;

  RAISE NOTICE '';
  IF (v_result->>'success')::boolean THEN
    RAISE NOTICE '✅✅✅ SUCCÈS ! Compte PRO activé !';
    RAISE NOTICE '';
    RAISE NOTICE '📧 Email    : %', v_email;
    RAISE NOTICE '🔑 Password : %', v_password;
    RAISE NOTICE '';
    RAISE NOTICE '🔗 Connectez-vous et allez sur:';
    RAISE NOTICE '   /pro/packages (voir les packages)';
    RAISE NOTICE '   /pro/create-store (créer votre store)';
    RAISE NOTICE '   /stores (voir tous les stores)';
  ELSE
    RAISE NOTICE '❌ ERREUR: %', v_result->>'error';
  END IF;

  RAISE NOTICE '';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';

END $$;

-- 4️⃣ VÉRIFIER LE RÉSULTAT
SELECT
  '=== DERNIER COMPTE PRO CRÉÉ ===' as info;

SELECT
  u.email,
  pr.user_type,
  pr.pro_expires_at,
  pr.pro_listings_remaining,
  s.status as subscription_status,
  pk.name as package_name
FROM auth.users u
LEFT JOIN profiles pr ON pr.id = u.id
LEFT JOIN pro_subscriptions s ON s.user_id = u.id AND s.status = 'active'
LEFT JOIN pro_packages pk ON pk.id = s.package_id
WHERE u.email LIKE 'pro.rapide.%'
ORDER BY u.created_at DESC
LIMIT 1;
