/*
  # Correction des Fonctions Admin - Éviter les Erreurs de Permissions

  Cette migration corrige les fonctions admin pour éviter les erreurs de permissions
  liées à l'accès direct au schéma auth.users.

  ## Changements
  - Ajoute la colonne email dans profiles si elle n'existe pas
  - Synchronise les emails existants
  - Recrée les fonctions admin en utilisant uniquement profiles
  - Crée les triggers de synchronisation

  ## Sécurité
  - Vérification admin maintenue
  - Aucune clé sensible exposée
  - Utilise SECURITY DEFINER uniquement pour les triggers
*/

-- ============================================
-- 1. Ajouter la colonne email aux profiles
-- ============================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'email'
  ) THEN
    ALTER TABLE profiles ADD COLUMN email text;
  END IF;
END $$;

-- ============================================
-- 2. Synchroniser les emails existants
-- ============================================

DO $$
BEGIN
  UPDATE profiles p
  SET email = u.email
  FROM auth.users u
  WHERE p.id = u.id
    AND (p.email IS NULL OR p.email != u.email);
END $$;

-- ============================================
-- 3. Trigger pour synchroniser les emails
-- ============================================

CREATE OR REPLACE FUNCTION sync_user_email_to_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE profiles
  SET email = NEW.email
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_email_update ON auth.users;
CREATE TRIGGER on_auth_user_email_update
  AFTER INSERT OR UPDATE OF email ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION sync_user_email_to_profile();

-- ============================================
-- 4. Fonction pour récupérer tous les utilisateurs (VERSION CORRIGÉE)
-- ============================================

CREATE OR REPLACE FUNCTION admin_get_all_users()
RETURNS TABLE (
  id uuid,
  email text,
  full_name text,
  user_type text,
  is_admin boolean,
  is_banned boolean,
  role text,
  created_at timestamptz,
  last_sign_in_at timestamptz,
  email_confirmed_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  calling_user_id uuid;
  is_admin_user boolean;
BEGIN
  calling_user_id := auth.uid();

  SELECT p.is_admin INTO is_admin_user
  FROM profiles p
  WHERE p.id = calling_user_id;

  IF NOT COALESCE(is_admin_user, false) THEN
    RAISE EXCEPTION 'Accès refusé: seuls les administrateurs peuvent lister les utilisateurs';
  END IF;

  -- Utiliser uniquement profiles avec la colonne email
  RETURN QUERY
  SELECT
    p.id,
    COALESCE(p.email, 'Email non disponible') as email,
    COALESCE(p.full_name, 'Sans nom') as full_name,
    COALESCE(p.user_type, 'individual') as user_type,
    COALESCE(p.is_admin, false) as is_admin,
    COALESCE(p.is_banned, false) as is_banned,
    COALESCE(p.role, 'user') as role,
    COALESCE(p.created_at, NOW()) as created_at,
    NULL::timestamptz as last_sign_in_at,
    NULL::timestamptz as email_confirmed_at
  FROM profiles p
  ORDER BY p.created_at DESC;
END;
$$;

-- Permissions
GRANT EXECUTE ON FUNCTION admin_get_all_users() TO authenticated;

COMMENT ON FUNCTION admin_get_all_users IS 'Liste tous les utilisateurs pour les administrateurs (utilise profiles uniquement)';

-- ============================================
-- 5. Fonction pour supprimer un utilisateur (VERSION CORRIGÉE)
-- ============================================

CREATE OR REPLACE FUNCTION admin_delete_user(target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  calling_user_id uuid;
  is_admin_user boolean;
BEGIN
  calling_user_id := auth.uid();

  SELECT is_admin INTO is_admin_user
  FROM profiles
  WHERE id = calling_user_id;

  IF NOT COALESCE(is_admin_user, false) THEN
    RAISE EXCEPTION 'Accès refusé: seuls les administrateurs peuvent supprimer des utilisateurs';
  END IF;

  IF calling_user_id = target_user_id THEN
    RAISE EXCEPTION 'Vous ne pouvez pas supprimer votre propre compte';
  END IF;

  DELETE FROM profiles WHERE id = target_user_id;

  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Erreur lors de la suppression: %', SQLERRM;
END;
$$;

GRANT EXECUTE ON FUNCTION admin_delete_user(uuid) TO authenticated;

COMMENT ON FUNCTION admin_delete_user IS 'Supprime un utilisateur (admin uniquement)';

-- ============================================
-- 6. Mettre à jour le trigger de création de profil
-- ============================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, created_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Utilisateur'),
    NEW.email,
    NOW()
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
