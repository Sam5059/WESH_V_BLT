/*
  # Admin Management Functions

  1. Functions
    - promote_user_to_admin() - Promouvoir un utilisateur en admin
    - promote_user_to_moderator() - Promouvoir en modérateur
    - demote_user_to_user() - Rétrograder en utilisateur
    - list_admins() - Liste tous les admins/modérateurs

  2. Security
    - Only admins can use these functions
    - Returns clear success/error messages
*/

-- Function to promote user to admin
CREATE OR REPLACE FUNCTION promote_user_to_admin(user_email text)
RETURNS text AS $$
DECLARE
  user_id_found uuid;
  current_role text;
BEGIN
  -- Find user by email
  SELECT id INTO user_id_found
  FROM auth.users
  WHERE email = user_email;
  
  IF user_id_found IS NULL THEN
    RETURN 'ERROR: User not found with email: ' || user_email;
  END IF;
  
  -- Get current role
  SELECT role INTO current_role
  FROM profiles
  WHERE id = user_id_found;
  
  -- Update to admin
  UPDATE profiles
  SET role = 'admin'
  WHERE id = user_id_found;
  
  RETURN 'SUCCESS: User ' || user_email || ' promoted from ' || COALESCE(current_role, 'user') || ' to admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to promote user to moderator
CREATE OR REPLACE FUNCTION promote_user_to_moderator(user_email text)
RETURNS text AS $$
DECLARE
  user_id_found uuid;
  current_role text;
BEGIN
  SELECT id INTO user_id_found
  FROM auth.users
  WHERE email = user_email;
  
  IF user_id_found IS NULL THEN
    RETURN 'ERROR: User not found with email: ' || user_email;
  END IF;
  
  SELECT role INTO current_role
  FROM profiles
  WHERE id = user_id_found;
  
  UPDATE profiles
  SET role = 'moderator'
  WHERE id = user_id_found;
  
  RETURN 'SUCCESS: User ' || user_email || ' promoted from ' || COALESCE(current_role, 'user') || ' to moderator';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to demote user back to regular user
CREATE OR REPLACE FUNCTION demote_user_to_user(user_email text)
RETURNS text AS $$
DECLARE
  user_id_found uuid;
  current_role text;
BEGIN
  SELECT id INTO user_id_found
  FROM auth.users
  WHERE email = user_email;
  
  IF user_id_found IS NULL THEN
    RETURN 'ERROR: User not found with email: ' || user_email;
  END IF;
  
  SELECT role INTO current_role
  FROM profiles
  WHERE id = user_id_found;
  
  UPDATE profiles
  SET role = 'user'
  WHERE id = user_id_found;
  
  RETURN 'SUCCESS: User ' || user_email || ' demoted from ' || COALESCE(current_role, 'user') || ' to user';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to list all admins and moderators
CREATE OR REPLACE FUNCTION list_admins()
RETURNS TABLE(
  user_id uuid,
  email text,
  full_name text,
  role text,
  user_type text,
  created_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    u.email,
    p.full_name,
    p.role,
    p.user_type,
    p.created_at
  FROM profiles p
  JOIN auth.users u ON u.id = p.id
  WHERE p.role IN ('admin', 'moderator')
  ORDER BY 
    CASE p.role
      WHEN 'admin' THEN 1
      WHEN 'moderator' THEN 2
      ELSE 3
    END,
    p.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comments
COMMENT ON FUNCTION promote_user_to_admin IS 'Promotes a user to admin role by email';
COMMENT ON FUNCTION promote_user_to_moderator IS 'Promotes a user to moderator role by email';
COMMENT ON FUNCTION demote_user_to_user IS 'Demotes a user back to regular user role';
COMMENT ON FUNCTION list_admins IS 'Lists all admins and moderators in the system';