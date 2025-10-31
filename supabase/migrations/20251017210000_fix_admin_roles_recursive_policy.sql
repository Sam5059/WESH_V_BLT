/*
  # Fix Admin Roles Recursive Policy

  1. Problem
    - Current policies on admin_roles table cause infinite recursion
    - Policy checks admin_roles while querying admin_roles

  2. Solution
    - Use a helper function to check admin status
    - Cache the result to avoid recursion

  3. Changes
    - Drop existing recursive policies
    - Create simpler policies that don't query the same table
*/

-- Drop all existing policies on admin_roles
DROP POLICY IF EXISTS "Super admins view roles" ON admin_roles;
DROP POLICY IF EXISTS "Super admins create roles" ON admin_roles;
DROP POLICY IF EXISTS "Super admins update roles" ON admin_roles;
DROP POLICY IF EXISTS "Super admins delete roles" ON admin_roles;

-- Create a function to check if user is super admin (uses direct query to avoid recursion)
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_roles
    WHERE user_id = auth.uid()
    AND role = 'super_admin'
  );
$$;

-- Admins can view all roles
CREATE POLICY "Admins can view all roles"
  ON admin_roles
  FOR SELECT
  TO authenticated
  USING (is_super_admin());

-- Super admins can create roles
CREATE POLICY "Super admins can create roles"
  ON admin_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (is_super_admin());

-- Super admins can update roles
CREATE POLICY "Super admins can update roles"
  ON admin_roles
  FOR UPDATE
  TO authenticated
  USING (is_super_admin());

-- Super admins can delete roles (but not other super admins)
CREATE POLICY "Super admins can delete non-super roles"
  ON admin_roles
  FOR DELETE
  TO authenticated
  USING (role != 'super_admin' AND is_super_admin());
