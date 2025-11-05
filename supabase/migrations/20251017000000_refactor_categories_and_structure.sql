/*
  # Refonte des catégories et structure

  ## Changements principaux

  1. **Nouvelles catégories**
    - Location immobilières (avec sous-catégories)
    - Colocation
    - Santé (avec sous-catégories)
    - DIVERS

  2. **Suppressions**
    - Suppression du doublon "Location vacances" dans Immobilier

  3. **Type d'annonce**
    - "a_vendre" → "offre" (Je propose)
    - "recherche" → "je_cherche" (Je cherche)
    - Suppression de "location" du type (géré par catégories)

  4. **Sécurité**
    - Maintien des RLS existantes
    - Pas de perte de données
*/

-- =====================================================
-- 1. CRÉER LA CATÉGORIE "LOCATION IMMOBILIÈRES"
-- =====================================================

DO $$
DECLARE
  v_location_immo_id uuid;
  v_location_appart_id uuid;
  v_location_maison_id uuid;
  v_location_studio_id uuid;
  v_location_bureau_id uuid;
  v_location_commerce_id uuid;
BEGIN
  -- Vérifier si la catégorie existe déjà
  SELECT id INTO v_location_immo_id
  FROM categories
  WHERE slug = 'location-immobilieres';

  IF v_location_immo_id IS NULL THEN
    -- Créer la catégorie principale
    INSERT INTO categories (name, name_ar, name_en, slug, icon, display_order)
    VALUES (
      'Location immobilières',
      'إيجارات عقارية',
      'Real Estate Rentals',
      'location-immobilieres',
      'home',
      7
    )
    RETURNING id INTO v_location_immo_id;

    -- Sous-catégories
    INSERT INTO categories (name, name_ar, name_en, slug, icon, parent_id, display_order)
    VALUES
      ('Appartements', 'شقق', 'Apartments', 'appartements-location', 'building', v_location_immo_id, 1),
      ('Maisons', 'منازل', 'Houses', 'maisons-location', 'home', v_location_immo_id, 2),
      ('Studios', 'استوديوهات', 'Studios', 'studios-location', 'door-open', v_location_immo_id, 3),
      ('Bureaux', 'مكاتب', 'Offices', 'bureaux-location', 'briefcase', v_location_immo_id, 4),
      ('Commerces', 'محلات تجارية', 'Shops', 'commerces-location', 'store', v_location_immo_id, 5);
  END IF;
END $$;

-- =====================================================
-- 2. CRÉER LA CATÉGORIE "COLOCATION"
-- =====================================================

DO $$
DECLARE
  v_colocation_id uuid;
BEGIN
  SELECT id INTO v_colocation_id
  FROM categories
  WHERE slug = 'colocation';

  IF v_colocation_id IS NULL THEN
    INSERT INTO categories (name, name_ar, name_en, slug, icon, display_order)
    VALUES (
      'Colocation',
      'سكن مشترك',
      'Roommate',
      'colocation',
      'users',
      8
    )
    RETURNING id INTO v_colocation_id;

    -- Sous-catégories
    INSERT INTO categories (name, name_ar, name_en, slug, icon, parent_id, display_order)
    VALUES
      ('Chambre à louer', 'غرفة للإيجار', 'Room for rent', 'chambre-colocation', 'bed', v_colocation_id, 1),
      ('Cherche colocataire', 'أبحث عن شريك سكن', 'Looking for roommate', 'cherche-colocataire', 'user-plus', v_colocation_id, 2),
      ('Logement étudiant', 'سكن طلابي', 'Student housing', 'logement-etudiant', 'graduation-cap', v_colocation_id, 3);
  END IF;
END $$;

-- =====================================================
-- 3. CRÉER LA CATÉGORIE "SANTÉ"
-- =====================================================

DO $$
DECLARE
  v_sante_id uuid;
BEGIN
  SELECT id INTO v_sante_id
  FROM categories
  WHERE slug = 'sante';

  IF v_sante_id IS NULL THEN
    INSERT INTO categories (name, name_ar, name_en, slug, icon, display_order)
    VALUES (
      'Santé',
      'صحة',
      'Health',
      'sante',
      'heart-pulse',
      9
    )
    RETURNING id INTO v_sante_id;

    -- Sous-catégories
    INSERT INTO categories (name, name_ar, name_en, slug, icon, parent_id, display_order)
    VALUES
      ('Matériel médical', 'معدات طبية', 'Medical equipment', 'materiel-medical', 'stethoscope', v_sante_id, 1),
      ('Services de santé', 'خدمات صحية', 'Health services', 'services-sante', 'hospital', v_sante_id, 2),
      ('Bien-être & Sport', 'رفاهية ورياضة', 'Wellness & Sports', 'bien-etre-sport', 'heart', v_sante_id, 3),
      ('Produits naturels', 'منتجات طبيعية', 'Natural products', 'produits-naturels', 'leaf', v_sante_id, 4);
  END IF;
END $$;

-- =====================================================
-- 4. CRÉER LA CATÉGORIE "DIVERS"
-- =====================================================

DO $$
DECLARE
  v_divers_id uuid;
BEGIN
  SELECT id INTO v_divers_id
  FROM categories
  WHERE slug = 'divers';

  IF v_divers_id IS NULL THEN
    INSERT INTO categories (name, name_ar, name_en, slug, icon, display_order)
    VALUES (
      'Divers',
      'متنوعات',
      'Miscellaneous',
      'divers',
      'package',
      99
    )
    RETURNING id INTO v_divers_id;

    -- Sous-catégories
    INSERT INTO categories (name, name_ar, name_en, slug, icon, parent_id, display_order)
    VALUES
      ('Autres', 'أخرى', 'Others', 'autres', 'more-horizontal', v_divers_id, 1),
      ('Collections', 'مقتنيات', 'Collections', 'collections', 'archive', v_divers_id, 2),
      ('Dons', 'تبرعات', 'Donations', 'dons', 'gift', v_divers_id, 3);
  END IF;
END $$;

-- =====================================================
-- 5. SUPPRIMER DOUBLON "Location vacances" dans Immobilier
-- =====================================================

-- Transférer les annonces existantes vers la vraie catégorie "Location vacances"
DO $$
DECLARE
  v_doublon_id uuid;
  v_vraie_location_vacances_id uuid;
BEGIN
  -- Trouver le doublon (sous-catégorie d'Immobilier)
  SELECT c.id INTO v_doublon_id
  FROM categories c
  INNER JOIN categories parent ON c.parent_id = parent.id
  WHERE c.slug LIKE '%location-vacance%'
    AND parent.slug = 'immobilier';

  -- Trouver la vraie catégorie Location vacances (catégorie principale)
  SELECT id INTO v_vraie_location_vacances_id
  FROM categories
  WHERE slug = 'location-vacances'
    AND parent_id IS NULL;

  IF v_doublon_id IS NOT NULL AND v_vraie_location_vacances_id IS NOT NULL THEN
    -- Transférer les annonces
    UPDATE listings
    SET category_id = v_vraie_location_vacances_id
    WHERE category_id = v_doublon_id;

    -- Supprimer le doublon
    DELETE FROM categories WHERE id = v_doublon_id;
  END IF;
END $$;

-- =====================================================
-- 6. METTRE À JOUR LES TYPES D'ANNONCE
-- =====================================================

-- Ajouter une colonne temporaire pour la migration
ALTER TABLE listings ADD COLUMN IF NOT EXISTS listing_type_new text;

-- Migrer les anciennes valeurs
UPDATE listings
SET listing_type_new = CASE
  WHEN listing_type = 'a_vendre' OR listing_type = 'sale' THEN 'offre'
  WHEN listing_type = 'recherche' OR listing_type = 'wanted' OR listing_type = 'purchase' THEN 'je_cherche'
  WHEN listing_type = 'location' OR listing_type = 'rent' THEN 'offre'
  ELSE 'offre'
END
WHERE listing_type_new IS NULL;

-- Supprimer l'ancienne colonne et renommer
ALTER TABLE listings DROP COLUMN IF EXISTS listing_type CASCADE;
ALTER TABLE listings RENAME COLUMN listing_type_new TO listing_type;

-- Ajouter contrainte
ALTER TABLE listings ADD CONSTRAINT listings_type_check
  CHECK (listing_type IN ('offre', 'je_cherche'));

-- Mettre à jour l'index
DROP INDEX IF EXISTS idx_listings_type;
CREATE INDEX idx_listings_type ON listings(listing_type) WHERE listing_type IS NOT NULL;

-- =====================================================
-- 7. METTRE À JOUR display_order DES CATÉGORIES
-- =====================================================

-- Réorganiser l'ordre d'affichage
UPDATE categories SET display_order = 1 WHERE slug = 'immobilier';
UPDATE categories SET display_order = 2 WHERE slug = 'vehicules';
UPDATE categories SET display_order = 3 WHERE slug = 'electronique';
UPDATE categories SET display_order = 4 WHERE slug = 'emploi';
UPDATE categories SET display_order = 5 WHERE slug = 'services';
UPDATE categories SET display_order = 6 WHERE slug = 'location-vacances';
UPDATE categories SET display_order = 7 WHERE slug = 'location-immobilieres';
UPDATE categories SET display_order = 8 WHERE slug = 'colocation';
UPDATE categories SET display_order = 9 WHERE slug = 'sante';
UPDATE categories SET display_order = 10 WHERE slug = 'mode';
UPDATE categories SET display_order = 11 WHERE slug = 'maison-jardin';
UPDATE categories SET display_order = 12 WHERE slug = 'loisirs';
UPDATE categories SET display_order = 13 WHERE slug = 'animaux';
UPDATE categories SET display_order = 99 WHERE slug = 'divers';

-- =====================================================
-- 8. CRÉER TABLE POUR GESTION ROLES ADMIN
-- =====================================================

-- Table pour les rôles d'administration
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

-- Index
CREATE INDEX IF NOT EXISTS idx_admin_roles_user_id ON admin_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_roles_role ON admin_roles(role);

-- RLS
ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;

-- Politique: Super admins peuvent tout voir
CREATE POLICY "Super admins can view all roles"
  ON admin_roles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_roles
      WHERE user_id = auth.uid()
      AND role = 'super_admin'
    )
  );

-- Politique: Super admins peuvent créer des admins
CREATE POLICY "Super admins can create admin roles"
  ON admin_roles FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_roles
      WHERE user_id = auth.uid()
      AND role = 'super_admin'
    )
  );

-- Politique: Super admins peuvent modifier les rôles
CREATE POLICY "Super admins can update admin roles"
  ON admin_roles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_roles
      WHERE user_id = auth.uid()
      AND role = 'super_admin'
    )
  );

-- Politique: Super admins peuvent supprimer des rôles (sauf super_admin)
CREATE POLICY "Super admins can delete non-super-admin roles"
  ON admin_roles FOR DELETE
  TO authenticated
  USING (
    role != 'super_admin' AND
    EXISTS (
      SELECT 1 FROM admin_roles
      WHERE user_id = auth.uid()
      AND role = 'super_admin'
    )
  );

-- =====================================================
-- 9. FONCTION POUR CRÉER UN ADMIN
-- =====================================================

CREATE OR REPLACE FUNCTION create_admin_user(
  p_email text,
  p_password text,
  p_role text DEFAULT 'admin',
  p_full_name text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
  v_profile_id uuid;
  v_result jsonb;
BEGIN
  -- Vérifier que l'utilisateur actuel est super_admin
  IF NOT EXISTS (
    SELECT 1 FROM admin_roles
    WHERE user_id = auth.uid()
    AND role = 'super_admin'
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Unauthorized: Only super admins can create admin users'
    );
  END IF;

  -- Vérifier que le rôle est valide
  IF p_role NOT IN ('user', 'admin', 'super_admin') THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Invalid role. Must be user, admin, or super_admin'
    );
  END IF;

  -- Créer l'utilisateur dans auth.users (nécessite extension supabase_auth_admin)
  -- Note: Cette partie doit être adaptée selon votre configuration
  -- Pour l'instant, on retourne des instructions

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Create user via Supabase Dashboard, then assign role',
    'email', p_email,
    'role', p_role,
    'instructions', 'After creating user in Dashboard, call assign_admin_role function'
  );
END;
$$;

-- =====================================================
-- 10. FONCTION POUR ASSIGNER UN RÔLE ADMIN
-- =====================================================

CREATE OR REPLACE FUNCTION assign_admin_role(
  p_user_email text,
  p_role text DEFAULT 'admin'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
  v_profile_id uuid;
BEGIN
  -- Vérifier que l'utilisateur actuel est super_admin
  IF NOT EXISTS (
    SELECT 1 FROM admin_roles
    WHERE user_id = auth.uid()
    AND role = 'super_admin'
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Unauthorized: Only super admins can assign admin roles'
    );
  END IF;

  -- Trouver l'utilisateur par email
  SELECT id INTO v_user_id
  FROM profiles
  WHERE email = p_user_email;

  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User not found with email: ' || p_user_email
    );
  END IF;

  -- Insérer ou mettre à jour le rôle
  INSERT INTO admin_roles (user_id, role, granted_by)
  VALUES (v_user_id, p_role, auth.uid())
  ON CONFLICT (user_id)
  DO UPDATE SET
    role = EXCLUDED.role,
    granted_by = EXCLUDED.granted_by,
    granted_at = now();

  -- Mettre à jour is_admin dans profiles si c'est un admin ou super_admin
  UPDATE profiles
  SET is_admin = (p_role IN ('admin', 'super_admin'))
  WHERE id = v_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'user_id', v_user_id,
    'email', p_user_email,
    'role', p_role,
    'message', 'Role assigned successfully'
  );
END;
$$;

-- =====================================================
-- 11. FONCTION POUR OBTENIR LE RÔLE D'UN UTILISATEUR
-- =====================================================

CREATE OR REPLACE FUNCTION get_user_role()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  v_role text;
BEGIN
  SELECT role INTO v_role
  FROM admin_roles
  WHERE user_id = auth.uid();

  RETURN COALESCE(v_role, 'user');
END;
$$;

-- =====================================================
-- 12. CRÉER UN SUPER ADMIN PAR DÉFAUT
-- =====================================================

-- Cette section doit être exécutée manuellement avec l'email du premier super admin
-- Exemple: SELECT assign_admin_role('admin@ouech.dz', 'super_admin');

COMMENT ON TABLE admin_roles IS 'Gestion des rôles administrateurs: user, admin, super_admin';
COMMENT ON FUNCTION create_admin_user IS 'Créer un nouvel utilisateur admin (super_admin uniquement)';
COMMENT ON FUNCTION assign_admin_role IS 'Assigner un rôle admin à un utilisateur existant (super_admin uniquement)';
COMMENT ON FUNCTION get_user_role IS 'Obtenir le rôle de l''utilisateur connecté';
