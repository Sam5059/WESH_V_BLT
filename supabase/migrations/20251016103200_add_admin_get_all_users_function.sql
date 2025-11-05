/*
  # Fonction Admin pour Récupérer Tous les Utilisateurs

  Cette migration ajoute une fonction permettant aux administrateurs
  de récupérer tous les utilisateurs avec leurs emails et informations d'authentification.

  ## Nouvelle Fonction
  - `admin_get_all_users()`: Retourne tous les utilisateurs avec emails et profils

  ## Sécurité
  - Accessible uniquement aux administrateurs
  - Vérifie les permissions avant l'exécution
  - Retourne les données combinées de auth.users et profiles
*/

-- Fonction pour récupérer tous les utilisateurs (admin seulement)
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

-- Permissions: accessible aux utilisateurs authentifiés (vérification admin interne)
GRANT EXECUTE ON FUNCTION admin_get_all_users() TO authenticated;

-- Commentaire
COMMENT ON FUNCTION admin_get_all_users IS 'Permet aux administrateurs de lister tous les utilisateurs avec leurs emails';
