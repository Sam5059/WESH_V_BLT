-- ============================================
-- SCRIPT DE RÉPARATION: Restaurer l'accès admin
-- ============================================
--
-- Ce script RÉPARE votre compte existant:
-- 1. Crée la table profiles (qui manque)
-- 2. Récupère votre compte existant samouaaz@gmail.com
-- 3. Crée/répare votre profil admin
-- 4. Réinitialise votre mot de passe à Admin@2025
--
-- INSTRUCTIONS :
-- 1. Ouvrez Supabase Dashboard : https://supabase.com/dashboard
-- 2. Connectez-vous avec votre compte Supabase
-- 3. Trouvez le projet: jchywwamhmzzvhgbywkj
-- 4. Allez dans "SQL Editor"
-- 5. Créez une "New query"
-- 6. Copiez-collez TOUT ce fichier
-- 7. Cliquez sur "Run"
--
-- ============================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- ÉTAPE 1: CRÉER LA TABLE PROFILES
-- ============================================

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
  is_banned boolean DEFAULT false,
  user_type text DEFAULT 'individual' CHECK (user_type IN ('individual', 'professional')),
  professional_slug text UNIQUE,
  company_name text,
  company_description text,
  siret text,
  website text,
  social_links jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies pour profiles
DO $$
BEGIN
  -- Supprimer les anciennes policies si elles existent
  DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
  DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
  DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

  -- Recréer les policies
  CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT TO authenticated USING (true);
  CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
  CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
EXCEPTION
  WHEN duplicate_object THEN
    RAISE NOTICE 'Policies already exist, continuing...';
END $$;

-- ============================================
-- ÉTAPE 2: RÉPARER LE COMPTE ADMIN
-- ============================================

DO $$
DECLARE
  user_id uuid;
  profile_exists boolean;
BEGIN
  -- Récupérer l'ID du compte existant
  SELECT id INTO user_id FROM auth.users WHERE email = 'samouaaz@gmail.com';

  IF user_id IS NULL THEN
    RAISE EXCEPTION '❌ Compte samouaaz@gmail.com introuvable!';
  END IF;

  RAISE NOTICE '📧 Compte trouvé: %', user_id;

  -- Réinitialiser le mot de passe à Admin@2025
  UPDATE auth.users
  SET
    encrypted_password = crypt('Admin@2025', gen_salt('bf')),
    email_confirmed_at = COALESCE(email_confirmed_at, now()),
    updated_at = now()
  WHERE id = user_id;

  RAISE NOTICE '🔑 Mot de passe réinitialisé à: Admin@2025';

  -- Vérifier si le profil existe
  SELECT EXISTS(SELECT 1 FROM profiles WHERE id = user_id) INTO profile_exists;

  IF profile_exists THEN
    -- Mettre à jour le profil existant
    UPDATE profiles
    SET
      role = 'admin',
      is_admin = true,
      is_banned = false,
      updated_at = now()
    WHERE id = user_id;

    RAISE NOTICE '✅ Profil admin mis à jour';
  ELSE
    -- Créer le profil
    INSERT INTO profiles (
      id,
      full_name,
      role,
      is_admin,
      is_banned,
      created_at,
      updated_at
    ) VALUES (
      user_id,
      'Sam OUAAZ',
      'admin',
      true,
      false,
      now(),
      now()
    );

    RAISE NOTICE '✅ Profil admin créé';
  END IF;

  RAISE NOTICE '';
  RAISE NOTICE '╔═══════════════════════════════════════════════╗';
  RAISE NOTICE '║   ✅ COMPTE RÉPARÉ AVEC SUCCÈS !              ║';
  RAISE NOTICE '╠═══════════════════════════════════════════════╣';
  RAISE NOTICE '║                                               ║';
  RAISE NOTICE '║   📧 Email        : samouaaz@gmail.com        ║';
  RAISE NOTICE '║   🔑 Mot de passe : Admin@2025                ║';
  RAISE NOTICE '║   🛡️  Rôle         : admin                     ║';
  RAISE NOTICE '║   🆔 User ID      : %                          ║', user_id;
  RAISE NOTICE '║                                               ║';
  RAISE NOTICE '╚═══════════════════════════════════════════════╝';
  RAISE NOTICE '';

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '❌ ERREUR: %', SQLERRM;
    RAISE;
END $$;

-- ============================================
-- ÉTAPE 3: CRÉER LES AUTRES TABLES ESSENTIELLES
-- ============================================

-- Table: categories
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  name_ar text,
  name_en text,
  slug text UNIQUE NOT NULL,
  parent_id uuid REFERENCES categories(id) ON DELETE CASCADE,
  icon text,
  order_position integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view categories" ON categories;
CREATE POLICY "Anyone can view categories" ON categories FOR SELECT TO authenticated USING (true);

-- Table: listings
CREATE TABLE IF NOT EXISTS listings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  subcategory_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text NOT NULL,
  price decimal(12,2) NOT NULL,
  is_negotiable boolean DEFAULT true,
  condition text CHECK (condition IN ('new', 'like_new', 'good', 'fair', 'poor')),
  wilaya text NOT NULL,
  commune text,
  images text[] DEFAULT '{}',
  status text DEFAULT 'active' CHECK (status IN ('active', 'sold', 'expired', 'suspended', 'pending_approval')),
  is_featured boolean DEFAULT false,
  featured_until timestamptz,
  views_count integer DEFAULT 0,
  listing_type text DEFAULT 'sale' CHECK (listing_type IN ('sale', 'rent', 'service', 'job')),
  attributes jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

-- Policies pour listings
DO $$
BEGIN
  DROP POLICY IF EXISTS "Anyone can view active listings" ON listings;
  DROP POLICY IF EXISTS "Users can insert own listings" ON listings;
  DROP POLICY IF EXISTS "Users can update own listings" ON listings;
  DROP POLICY IF EXISTS "Users can delete own listings" ON listings;

  CREATE POLICY "Anyone can view active listings" ON listings FOR SELECT TO authenticated USING (status = 'active' OR user_id = auth.uid());
  CREATE POLICY "Users can insert own listings" ON listings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
  CREATE POLICY "Users can update own listings" ON listings FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  CREATE POLICY "Users can delete own listings" ON listings FOR DELETE TO authenticated USING (auth.uid() = user_id);
EXCEPTION
  WHEN duplicate_object THEN
    RAISE NOTICE 'Listing policies already exist, continuing...';
END $$;

-- ============================================
-- ÉTAPE 4: VÉRIFICATION FINALE
-- ============================================

SELECT
  '✅ RÉPARATION TERMINÉE !' as status,
  u.id as user_id,
  u.email,
  u.email_confirmed_at IS NOT NULL as email_confirmed,
  p.full_name,
  p.role,
  p.is_admin,
  p.is_banned,
  p.created_at
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
WHERE u.email = 'samouaaz@gmail.com';

-- Message final
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════';
  RAISE NOTICE '🎉 TOUT EST RÉPARÉ !';
  RAISE NOTICE '═══════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE 'Vous pouvez maintenant:';
  RAISE NOTICE '1. Aller sur votre application';
  RAISE NOTICE '2. Vous connecter avec:';
  RAISE NOTICE '   Email: samouaaz@gmail.com';
  RAISE NOTICE '   Mot de passe: Admin@2025';
  RAISE NOTICE '3. Accéder au Dashboard Admin';
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════';
END $$;
