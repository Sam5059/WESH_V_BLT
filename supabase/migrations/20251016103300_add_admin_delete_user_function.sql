/*
  # Fonction Admin pour Supprimer un Utilisateur

  Cette migration ajoute une fonction permettant aux administrateurs
  de supprimer un utilisateur et toutes ses données associées.

  ## Nouvelle Fonction
  - `admin_delete_user(user_id)`: Supprime un utilisateur et ses données

  ## Sécurité
  - Accessible uniquement aux administrateurs
  - Vérifie les permissions avant l'exécution
  - Supprime en cascade les données liées
*/

-- Fonction pour supprimer un utilisateur (admin seulement)
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
