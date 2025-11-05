-- ============================================
-- MIGRATION: Fonctions Admin pour Gestion Utilisateurs
-- ============================================
--
-- ⚠️ IMPORTANT: Exécutez ce SQL dans l'éditeur SQL de Supabase
-- URL: https://supabase.com/dashboard/project/jchywwamhmzzvhgbywkj/sql
--
-- Ce script ajoute les fonctions nécessaires pour:
-- 1. Lister tous les utilisateurs avec leurs emails
-- 2. Supprimer un utilisateur
--
-- ============================================

-- ============================================
-- 1. FONCTION: Récupérer tous les utilisateurs
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
  IF NOT is_admin_user THEN
    RAISE EXCEPTION 'Accès refusé: seuls les administrateurs peuvent lister les utilisateurs';
  END IF;

  -- Retourner tous les utilisateurs avec leurs informations
  RETURN QUERY
  SELECT
    p.id,
    COALESCE(u.email, 'email@inconnu.com') as email,
    COALESCE(p.full_name, 'Sans nom') as full_name,
    COALESCE(p.user_type, 'individual') as user_type,
    COALESCE(p.is_admin, false) as is_admin,
    COALESCE(p.is_banned, false) as is_banned,
    COALESCE(p.role, 'user') as role,
    COALESCE(p.created_at, NOW()) as created_at,
    u.last_sign_in_at,
    u.email_confirmed_at
  FROM profiles p
  LEFT JOIN auth.users u ON p.id = u.id
  ORDER BY p.created_at DESC;
END;
$$;

-- Permissions
GRANT EXECUTE ON FUNCTION admin_get_all_users() TO authenticated;

-- Commentaire
COMMENT ON FUNCTION admin_get_all_users IS 'Permet aux administrateurs de lister tous les utilisateurs avec leurs emails';

-- ============================================
-- 2. FONCTION: Supprimer un utilisateur
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
  IF NOT is_admin_user THEN
    RAISE EXCEPTION 'Accès refusé: seuls les administrateurs peuvent supprimer des utilisateurs';
  END IF;

  -- Empêcher l'admin de se supprimer lui-même
  IF calling_user_id = target_user_id THEN
    RAISE EXCEPTION 'Vous ne pouvez pas supprimer votre propre compte';
  END IF;

  -- Supprimer le profil (cascade supprimera les autres données liées)
  DELETE FROM profiles WHERE id = target_user_id;

  -- Supprimer de auth.users
  DELETE FROM auth.users WHERE id = target_user_id;

  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Erreur lors de la suppression: %', SQLERRM;
END;
$$;

-- Permissions
GRANT EXECUTE ON FUNCTION admin_delete_user(uuid) TO authenticated;

-- Commentaire
COMMENT ON FUNCTION admin_delete_user IS 'Permet aux administrateurs de supprimer un utilisateur et toutes ses données';

-- ============================================
-- VÉRIFICATION: Tester les fonctions
-- ============================================

-- Tester la liste des utilisateurs (vous devez être admin)
-- SELECT * FROM admin_get_all_users();

-- ============================================
-- SUCCÈS!
-- ============================================

-- ✅ Les fonctions ont été créées avec succès
-- ✅ Vous pouvez maintenant utiliser l'interface de gestion des utilisateurs
-- ✅ L'application affichera correctement tous les utilisateurs avec leurs emails

-- 💡 NEXT STEPS:
-- 1. Actualisez la page /admin/users dans l'application
-- 2. Vous devriez maintenant voir tous les utilisateurs
-- 3. Testez les fonctionnalités de réinitialisation de mot de passe
-- 4. Testez la suppression d'un utilisateur test

DO $$
BEGIN
  RAISE NOTICE '✅ Fonctions admin créées avec succès!';
  RAISE NOTICE '📱 Actualisez la page /admin/users pour voir les changements';
END $$;
