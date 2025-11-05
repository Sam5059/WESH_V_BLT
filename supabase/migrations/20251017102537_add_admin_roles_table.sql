-- Admin roles management
CREATE TABLE IF NOT EXISTS admin_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role text NOT NULL CHECK (role IN ('user', 'admin', 'super_admin')),
  granted_by uuid REFERENCES auth.users(id),
  granted_at timestamptz DEFAULT now(),
  permissions jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_admin_roles_user_id ON admin_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_roles_role ON admin_roles(role);
ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Super admins view roles" ON admin_roles;
CREATE POLICY "Super admins view roles" ON admin_roles FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_roles WHERE user_id = auth.uid() AND role = 'super_admin'));

DROP POLICY IF EXISTS "Super admins create roles" ON admin_roles;
CREATE POLICY "Super admins create roles" ON admin_roles FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM admin_roles WHERE user_id = auth.uid() AND role = 'super_admin'));

DROP POLICY IF EXISTS "Super admins update roles" ON admin_roles;  
CREATE POLICY "Super admins update roles" ON admin_roles FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_roles WHERE user_id = auth.uid() AND role = 'super_admin'));

DROP POLICY IF EXISTS "Super admins delete roles" ON admin_roles;
CREATE POLICY "Super admins delete roles" ON admin_roles FOR DELETE TO authenticated
  USING (role != 'super_admin' AND EXISTS (SELECT 1 FROM admin_roles WHERE user_id = auth.uid() AND role = 'super_admin'));

CREATE OR REPLACE FUNCTION assign_admin_role(p_user_email text, p_role text DEFAULT 'admin')
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_user_id uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM admin_roles WHERE user_id = auth.uid() AND role = 'super_admin') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized');
  END IF;
  SELECT id INTO v_user_id FROM profiles WHERE email = p_user_email;
  IF v_user_id IS NULL THEN RETURN jsonb_build_object('success', false, 'error', 'User not found'); END IF;
  INSERT INTO admin_roles (user_id, role, granted_by) VALUES (v_user_id, p_role, auth.uid())
  ON CONFLICT (user_id) DO UPDATE SET role = EXCLUDED.role, granted_by = EXCLUDED.granted_by, granted_at = now();
  UPDATE profiles SET is_admin = (p_role IN ('admin', 'super_admin')) WHERE id = v_user_id;
  RETURN jsonb_build_object('success', true, 'message', 'Role assigned');
END;
$$;

CREATE OR REPLACE FUNCTION get_user_role() RETURNS text LANGUAGE plpgsql SECURITY DEFINER STABLE AS $$
DECLARE v_role text;
BEGIN
  SELECT role INTO v_role FROM admin_roles WHERE user_id = auth.uid();
  RETURN COALESCE(v_role, 'user');
END;
$$;