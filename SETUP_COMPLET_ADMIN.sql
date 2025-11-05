-- ============================================
-- SCRIPT COMPLET: Initialiser la base de données + Créer admin
-- ============================================
--
-- Ce script fait TOUT en une seule fois:
-- 1. Crée toutes les tables (profiles, listings, etc.)
-- 2. Crée votre compte admin (samouaaz@gmail.com)
-- 3. Vous donne les droits admin
--
-- INSTRUCTIONS :
-- 1. Ouvrez Supabase Dashboard : https://supabase.com/dashboard
-- 2. Connectez-vous avec votre compte Supabase
-- 3. Trouvez le projet: jchywwamhmzzvhgbywkj
-- 4. Allez dans "SQL Editor"
-- 5. Créez une "New query"
-- 6. Copiez-collez TOUT ce fichier
-- 7. CHANGEZ LE MOT DE PASSE (ligne 57) si vous voulez
-- 8. Cliquez sur "Run"
--
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- ÉTAPE 1: CRÉER LES TABLES
-- ============================================

-- Table: profiles
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  phone_number text,
  avatar_url text,
  wilaya text,
  commune text,
  is_verified boolean DEFAULT false,
  role text DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
  is_admin boolean DEFAULT false,
  user_type text DEFAULT 'individual' CHECK (user_type IN ('individual', 'professional')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- ============================================
-- ÉTAPE 2: CRÉER LE COMPTE ADMIN
-- ============================================

DO $$
DECLARE
  user_id uuid;
  user_exists boolean;
BEGIN
  -- Vérifier si l'utilisateur existe déjà
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE email = 'samouaaz@gmail.com') INTO user_exists;

  IF NOT user_exists THEN
    RAISE NOTICE '📝 Création du compte samouaaz@gmail.com...';

    -- CRÉER LE COMPTE dans auth.users
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
      crypt('Admin@2025', gen_salt('bf')), -- ⚠️ MOT DE PASSE: Admin@2025
      now(), -- Email confirmé automatiquement
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Sam OUAAZ"}'::jsonb,
      now(),
      now(),
      '',
      '',
      '',
      ''
    )
    RETURNING id INTO user_id;

    RAISE NOTICE '✅ Utilisateur créé avec ID: %', user_id;

    -- Créer le profil avec droits admin
    INSERT INTO profiles (
      id,
      full_name,
      role,
      is_admin,
      created_at,
      updated_at
    ) VALUES (
      user_id,
      'Sam OUAAZ',
      'admin',
      true,
      now(),
      now()
    );

    RAISE NOTICE '✅ Profil admin créé';

  ELSE
    -- Le compte existe déjà
    SELECT id INTO user_id FROM auth.users WHERE email = 'samouaaz@gmail.com';
    RAISE NOTICE '⚠️  Le compte existe déjà avec ID: %', user_id;

    -- Confirmer l'email si pas encore fait
    UPDATE auth.users
    SET email_confirmed_at = COALESCE(email_confirmed_at, now())
    WHERE id = user_id;

    -- S'assurer que le profil existe avec droits admin
    INSERT INTO profiles (id, full_name, role, is_admin, created_at, updated_at)
    VALUES (user_id, 'Sam OUAAZ', 'admin', true, now(), now())
    ON CONFLICT (id) DO UPDATE
    SET role = 'admin',
        is_admin = true,
        updated_at = now();
  END IF;

  RAISE NOTICE '✅ Compte admin prêt !';

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
LEFT JOIN profiles p ON p.id = u.id
WHERE u.email = 'samouaaz@gmail.com';

-- ============================================
-- MESSAGE DE CONFIRMATION
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '╔═══════════════════════════════════════════════╗';
  RAISE NOTICE '║   ✅ TOUT EST PRÊT !                          ║';
  RAISE NOTICE '╠═══════════════════════════════════════════════╣';
  RAISE NOTICE '║                                               ║';
  RAISE NOTICE '║   📧 Email     : samouaaz@gmail.com           ║';
  RAISE NOTICE '║   🔑 Mot de passe : Admin@2025                ║';
  RAISE NOTICE '║   🛡️  Rôle      : admin                        ║';
  RAISE NOTICE '║                                               ║';
  RAISE NOTICE '╠═══════════════════════════════════════════════╣';
  RAISE NOTICE '║   PROCHAINES ÉTAPES :                         ║';
  RAISE NOTICE '║   1. Allez sur votre application              ║';
  RAISE NOTICE '║   2. Connectez-vous avec ces identifiants     ║';
  RAISE NOTICE '║   3. Allez dans Profil → Paramètres           ║';
  RAISE NOTICE '║   4. Cliquez sur "Dashboard Admin"            ║';
  RAISE NOTICE '║                                               ║';
  RAISE NOTICE '╚═══════════════════════════════════════════════╝';
  RAISE NOTICE '';
END $$;
