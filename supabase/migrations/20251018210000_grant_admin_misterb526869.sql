/*
  # Attribuer les droits admin à misterb526869@gmail.com

  ## Description
  Cette migration attribue les droits d'administrateur (super_admin) à l'utilisateur
  avec l'email misterb526869@gmail.com

  ## Modifications
  1. Trouver l'utilisateur par email dans la table profiles
  2. Créer ou mettre à jour son rôle dans admin_roles
  3. Mettre à jour is_admin dans profiles

  ## Sécurité
  - L'utilisateur devient super_admin et peut gérer tous les aspects admin
*/

-- ============================================
-- 1. Attribuer le rôle super_admin
-- ============================================

DO $$
DECLARE
  v_user_id uuid;
  v_profile_exists boolean;
BEGIN
  -- Trouver l'ID utilisateur depuis profiles
  SELECT id INTO v_user_id
  FROM profiles
  WHERE email = 'misterb526869@gmail.com'
  LIMIT 1;

  -- Vérifier si l'utilisateur existe
  IF v_user_id IS NULL THEN
    RAISE NOTICE 'Utilisateur avec email misterb526869@gmail.com non trouvé dans profiles';

    -- Essayer de trouver dans auth.users
    SELECT id INTO v_user_id
    FROM auth.users
    WHERE email = 'misterb526869@gmail.com'
    LIMIT 1;

    IF v_user_id IS NOT NULL THEN
      RAISE NOTICE 'Utilisateur trouvé dans auth.users avec ID: %', v_user_id;

      -- Créer le profil s'il n'existe pas
      INSERT INTO profiles (id, email, is_admin, user_type)
      VALUES (v_user_id, 'misterb526869@gmail.com', true, 'individual')
      ON CONFLICT (id) DO UPDATE
      SET is_admin = true,
          email = EXCLUDED.email;

      RAISE NOTICE 'Profil créé/mis à jour pour l''utilisateur';
    ELSE
      RAISE NOTICE 'Utilisateur non trouvé dans auth.users non plus. L''utilisateur doit d''abord créer un compte.';
      RETURN;
    END IF;
  END IF;

  -- Si l'utilisateur existe, attribuer le rôle super_admin
  IF v_user_id IS NOT NULL THEN
    -- Insérer ou mettre à jour dans admin_roles
    INSERT INTO admin_roles (user_id, role, granted_by, permissions)
    VALUES (
      v_user_id,
      'super_admin',
      v_user_id, -- auto-granted pour le premier super_admin
      jsonb_build_object(
        'can_manage_users', true,
        'can_manage_listings', true,
        'can_view_stats', true,
        'can_manage_categories', true,
        'can_manage_pro_packages', true
      )
    )
    ON CONFLICT (user_id)
    DO UPDATE SET
      role = 'super_admin',
      granted_by = v_user_id,
      granted_at = now(),
      permissions = jsonb_build_object(
        'can_manage_users', true,
        'can_manage_listings', true,
        'can_view_stats', true,
        'can_manage_categories', true,
        'can_manage_pro_packages', true
      );

    -- Mettre à jour is_admin dans profiles
    UPDATE profiles
    SET is_admin = true
    WHERE id = v_user_id;

    RAISE NOTICE 'Rôle super_admin attribué avec succès à l''utilisateur % (email: misterb526869@gmail.com)', v_user_id;
  END IF;
END $$;

-- ============================================
-- 2. Vérification
-- ============================================

-- Afficher le résultat
DO $$
DECLARE
  v_user_id uuid;
  v_role text;
  v_is_admin boolean;
BEGIN
  SELECT p.id, ar.role, p.is_admin
  INTO v_user_id, v_role, v_is_admin
  FROM profiles p
  LEFT JOIN admin_roles ar ON ar.user_id = p.id
  WHERE p.email = 'misterb526869@gmail.com'
  LIMIT 1;

  IF v_user_id IS NOT NULL THEN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'VÉRIFICATION DES DROITS ADMIN';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Email: misterb526869@gmail.com';
    RAISE NOTICE 'User ID: %', v_user_id;
    RAISE NOTICE 'Rôle admin_roles: %', COALESCE(v_role, 'aucun');
    RAISE NOTICE 'is_admin (profiles): %', v_is_admin;
    RAISE NOTICE '========================================';
  ELSE
    RAISE NOTICE 'Utilisateur non trouvé après tentative d''attribution';
  END IF;
END $$;

-- ============================================
-- 3. Commentaire
-- ============================================

COMMENT ON TABLE admin_roles IS 'Table des rôles administrateurs - misterb526869@gmail.com a les droits super_admin';
