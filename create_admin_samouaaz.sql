-- ============================================
-- Script SQL : Créer compte admin pour samouaaz@gmail.com
-- ============================================
--
-- INSTRUCTIONS :
-- 1. Ouvrez Supabase Dashboard : https://tliwclxcgtjzaxbbfulr.supabase.co
-- 2. Allez dans SQL Editor
-- 3. Copiez-collez TOUT ce fichier
-- 4. CHANGEZ LE MOT DE PASSE (ligne 31) !
-- 5. Cliquez sur "Run"
--
-- ============================================

DO $$
DECLARE
  user_id uuid;
  user_exists boolean;
BEGIN
  -- Vérifier si l'utilisateur existe déjà
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE email = 'samouaaz@gmail.com') INTO user_exists;

  IF NOT user_exists THEN
    -- ============================================
    -- CRÉER LE COMPTE
    -- ============================================
    RAISE NOTICE '📝 Création du compte samouaaz@gmail.com...';

    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
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
      'samouaaz@gmail.com',
      crypt('Admin@2025', gen_salt('bf')), -- ⚠️ CHANGEZ CE MOT DE PASSE !
      now(), -- Email confirmé automatiquement
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Admin"}'::jsonb,
      now(),
      now(),
      '',
      '',
      '',
      ''
    )
    RETURNING id INTO user_id;

    RAISE NOTICE '✅ Utilisateur créé avec ID: %', user_id;

    -- Créer le profil
    INSERT INTO profiles (
      id,
      full_name,
      created_at,
      updated_at
    ) VALUES (
      user_id,
      'Admin',
      now(),
      now()
    );

    RAISE NOTICE '✅ Profil créé';

  ELSE
    -- Le compte existe déjà
    SELECT id INTO user_id FROM auth.users WHERE email = 'samouaaz@gmail.com';
    RAISE NOTICE '⚠️  Le compte existe déjà avec ID: %', user_id;

    -- Confirmer l'email si pas encore fait
    UPDATE auth.users
    SET email_confirmed_at = COALESCE(email_confirmed_at, now())
    WHERE id = user_id;

    -- S'assurer que le profil existe
    INSERT INTO profiles (id, full_name, created_at, updated_at)
    VALUES (user_id, 'Admin', now(), now())
    ON CONFLICT (id) DO NOTHING;
  END IF;

  -- ============================================
  -- PROMOUVOIR EN ADMIN
  -- ============================================
  RAISE NOTICE '🛡️  Promotion en admin...';

  UPDATE profiles
  SET
    role = 'admin',
    is_admin = true
  WHERE id = user_id;

  RAISE NOTICE '✅ Privilèges admin accordés !';

END $$;

-- ============================================
-- VÉRIFICATION DU RÉSULTAT
-- ============================================

SELECT
  '✅ COMPTE ADMIN CRÉÉ AVEC SUCCÈS !' as status,
  u.id,
  u.email,
  p.full_name,
  p.role,
  p.is_admin,
  CASE
    WHEN u.email_confirmed_at IS NOT NULL THEN '✅ Confirmé'
    ELSE '❌ Non confirmé'
  END as email_status,
  p.created_at
FROM auth.users u
JOIN profiles p ON p.id = u.id
WHERE u.email = 'samouaaz@gmail.com';

-- ============================================
-- INFORMATIONS DE CONNEXION
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '╔═══════════════════════════════════════════════╗';
  RAISE NOTICE '║   COMPTE ADMIN CRÉÉ AVEC SUCCÈS !             ║';
  RAISE NOTICE '╠═══════════════════════════════════════════════╣';
  RAISE NOTICE '║                                               ║';
  RAISE NOTICE '║   📧 Email     : samouaaz@gmail.com           ║';
  RAISE NOTICE '║   🔑 Mot de passe : Admin@2025                ║';
  RAISE NOTICE '║                     (CHANGEZ-LE !)            ║';
  RAISE NOTICE '║   🛡️  Rôle      : admin                        ║';
  RAISE NOTICE '║                                               ║';
  RAISE NOTICE '╠═══════════════════════════════════════════════╣';
  RAISE NOTICE '║   PROCHAINES ÉTAPES :                         ║';
  RAISE NOTICE '║   1. Connectez-vous avec ces identifiants     ║';
  RAISE NOTICE '║   2. Allez dans Profil → Paramètres           ║';
  RAISE NOTICE '║   3. Cliquez sur "Dashboard Admin"            ║';
  RAISE NOTICE '║   4. Profitez de vos privilèges admin ! 🎉   ║';
  RAISE NOTICE '║                                               ║';
  RAISE NOTICE '╚═══════════════════════════════════════════════╝';
  RAISE NOTICE '';
END $$;
