/*
  # Fonction Admin de Réinitialisation de Mot de Passe

  Cette migration ajoute une fonction permettant aux administrateurs 
  de réinitialiser directement le mot de passe d'un utilisateur.

  ## Nouvelle Fonction
  - `admin_reset_user_password(user_id, new_password)`: Permet à un admin de changer le mot de passe d'un utilisateur

  ## Sécurité
  - Accessible uniquement aux administrateurs
  - Vérifie les permissions avant l'exécution
  - Utilise le chiffrement bcrypt natif de PostgreSQL
*/

-- Fonction pour réinitialiser le mot de passe d'un utilisateur (admin seulement)
CREATE OR REPLACE FUNCTION admin_reset_user_password(
  user_id uuid,
  new_password text
)
RETURNS void
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
    RAISE EXCEPTION 'Accès refusé: seuls les administrateurs peuvent réinitialiser les mots de passe';
  END IF;
  
  -- Mettre à jour le mot de passe dans auth.users
  UPDATE auth.users
  SET 
    encrypted_password = crypt(new_password, gen_salt('bf')),
    updated_at = NOW()
  WHERE id = user_id;
  
  -- Vérifier si la mise à jour a réussi
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Utilisateur non trouvé';
  END IF;
END;
$$;

-- Permissions: accessible aux utilisateurs authentifiés (vérification admin interne)
GRANT EXECUTE ON FUNCTION admin_reset_user_password(uuid, text) TO authenticated;

-- Commentaire
COMMENT ON FUNCTION admin_reset_user_password IS 'Permet aux administrateurs de réinitialiser le mot de passe d''un utilisateur';
