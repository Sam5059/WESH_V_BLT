-- ============================================
-- SOLUTION SIMPLIFIÉE: Gestion Utilisateurs Admin
-- ============================================
--
-- Cette version évite les problèmes de permissions avec auth.users
-- Elle utilise uniquement les données du schéma public
--
-- ⚠️ EXÉCUTEZ CE SQL DANS SUPABASE SQL EDITOR
--
-- ============================================

-- ============================================
-- 1. Ajouter la colonne email aux profiles (si elle n'existe pas)
-- ============================================

-- Vérifier et ajouter la colonne email
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'email'
  ) THEN
    ALTER TABLE profiles ADD COLUMN email text;
    RAISE NOTICE '✅ Colonne email ajoutée à profiles';
  ELSE
    RAISE NOTICE '✅ Colonne email existe déjà dans profiles';
  END IF;
END $$;

-- ============================================
-- 2. Trigger pour synchroniser les emails
-- ============================================

-- Fonction pour synchroniser l'email depuis auth.users vers profiles
CREATE OR REPLACE FUNCTION sync_user_email_to_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Mettre à jour l'email dans profiles
  UPDATE profiles
  SET email = NEW.email
  WHERE id = NEW.id;

  RETURN NEW;
END;
$$;

-- Créer le trigger sur auth.users (si possible)
DO $$
BEGIN
  DROP TRIGGER IF EXISTS on_auth_user_email_update ON auth.users;
  CREATE TRIGGER on_auth_user_email_update
    AFTER INSERT OR UPDATE OF email ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION sync_user_email_to_profile();
  RAISE NOTICE '✅ Trigger de synchronisation email créé';
END $$;

-- ============================================
-- 3. Synchroniser les emails existants
-- ============================================

-- Copier tous les emails existants de auth.users vers profiles
DO $$
DECLARE
  synced_count integer;
BEGIN
  UPDATE profiles p
  SET email = u.email
  FROM auth.users u
  WHERE p.id = u.id
    AND (p.email IS NULL OR p.email != u.email);

  GET DIAGNOSTICS synced_count = ROW_COUNT;
  RAISE NOTICE '✅ % emails synchronisés', synced_count;
END $$;

-- ============================================
-- 4. Fonction pour récupérer tous les utilisateurs (version simple)
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
  -- Obtenir l'ID de l'utilisateur qui appelle la fonction
  calling_user_id := auth.uid();

  -- Vérifier si l'utilisateur appelant est admin
  SELECT p.is_admin INTO is_admin_user
  FROM profiles p
  WHERE p.id = calling_user_id;

  -- Si pas admin, lever une erreur
  IF NOT COALESCE(is_admin_user, false) THEN
    RAISE EXCEPTION 'Accès refusé: seuls les administrateurs peuvent lister les utilisateurs';
  END IF;

  -- Retourner tous les utilisateurs depuis profiles uniquement
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

COMMENT ON FUNCTION admin_get_all_users IS 'Liste tous les utilisateurs pour les administrateurs';

DO $$
BEGIN
  RAISE NOTICE '✅ Fonction admin_get_all_users créée';
END $$;

-- ============================================
-- 5. Fonction pour supprimer un utilisateur (version simple)
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
  -- Obtenir l'ID de l'utilisateur qui appelle la fonction
  calling_user_id := auth.uid();

  -- Vérifier si l'utilisateur appelant est admin
  SELECT is_admin INTO is_admin_user
  FROM profiles
  WHERE id = calling_user_id;

  -- Si pas admin, lever une erreur
  IF NOT COALESCE(is_admin_user, false) THEN
    RAISE EXCEPTION 'Accès refusé: seuls les administrateurs peuvent supprimer des utilisateurs';
  END IF;

  -- Empêcher l'admin de se supprimer lui-même
  IF calling_user_id = target_user_id THEN
    RAISE EXCEPTION 'Vous ne pouvez pas supprimer votre propre compte';
  END IF;

  -- Supprimer le profil (les règles CASCADE supprimeront les données liées)
  DELETE FROM profiles WHERE id = target_user_id;

  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Erreur lors de la suppression: %', SQLERRM;
END;
$$;

-- Permissions
GRANT EXECUTE ON FUNCTION admin_delete_user(uuid) TO authenticated;

COMMENT ON FUNCTION admin_delete_user IS 'Supprime un utilisateur (admin uniquement)';

DO $$
BEGIN
  RAISE NOTICE '✅ Fonction admin_delete_user créée';
END $$;

-- ============================================
-- 6. Mettre à jour le trigger de création de profil
-- ============================================

-- S'assurer que l'email est copié lors de la création du profil
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

-- Recréer le trigger
DO $$
BEGIN
  DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
  CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();
  RAISE NOTICE '✅ Trigger de création de profil mis à jour';
END $$;

-- ============================================
-- VÉRIFICATION
-- ============================================

-- Vérifier que tout fonctionne
DO $$
DECLARE
  user_count integer;
  admin_count integer;
BEGIN
  SELECT COUNT(*) INTO user_count FROM profiles;
  SELECT COUNT(*) INTO admin_count FROM profiles WHERE is_admin = true;

  RAISE NOTICE '';
  RAISE NOTICE '====================================';
  RAISE NOTICE '✅ INSTALLATION TERMINÉE!';
  RAISE NOTICE '====================================';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Statistiques:';
  RAISE NOTICE '   • % utilisateurs dans la base', user_count;
  RAISE NOTICE '   • % administrateurs', admin_count;
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Prochaines étapes:';
  RAISE NOTICE '   1. Actualisez la page /admin/users';
  RAISE NOTICE '   2. Vous devriez voir tous les utilisateurs';
  RAISE NOTICE '   3. Les emails sont maintenant visibles';
  RAISE NOTICE '';
  RAISE NOTICE '💡 Note: Les colonnes last_sign_in_at et';
  RAISE NOTICE '   email_confirmed_at seront NULL car nous';
  RAISE NOTICE '   n''avons pas accès au schéma auth.users';
  RAISE NOTICE '';
END $$;
