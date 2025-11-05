/*
  # Créer la table pro_packages

  1. Nouvelle Table
    - `pro_packages` - Packages d'abonnement PRO avec tarification

  2. Colonnes
    - `id` (uuid, primary key)
    - `name`, `name_ar`, `name_en` - Noms multilingues
    - `description`, `description_ar`, `description_en` - Descriptions multilingues
    - `category_id` - Catégorie liée (NULL = tous)
    - `price` - Prix en DZD
    - `duration_days` - Durée en jours
    - `max_listings` - Nombre maximum d'annonces
    - `featured_listings` - Nombre d'annonces en vedette
    - `priority_support` - Support prioritaire
    - `custom_branding` - Branding personnalisé
    - `analytics` - Accès aux analytics
    - `is_active` - Package actif
    - `order_position` - Position d'affichage

  3. Security
    - RLS activé
    - Lecture publique
*/

-- =====================================================
-- TABLE: pro_packages
-- =====================================================
CREATE TABLE IF NOT EXISTS pro_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Noms multilingues
  name text NOT NULL,
  name_ar text,
  name_en text,
  
  -- Descriptions multilingues
  description text,
  description_ar text,
  description_en text,
  
  -- Lien catégorie (NULL = package universel)
  category_id uuid REFERENCES categories(id) ON DELETE CASCADE,
  
  -- Tarification
  price numeric NOT NULL,
  duration_days integer NOT NULL,
  
  -- Fonctionnalités
  max_listings integer,
  featured_listings integer DEFAULT 0,
  priority_support boolean DEFAULT false,
  custom_branding boolean DEFAULT false,
  analytics boolean DEFAULT false,
  
  -- État
  is_active boolean DEFAULT true,
  order_position integer DEFAULT 0,
  
  -- Timestamps
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  
  -- Contraintes
  CONSTRAINT positive_price CHECK (price >= 0),
  CONSTRAINT positive_duration CHECK (duration_days > 0),
  CONSTRAINT positive_listings CHECK (max_listings IS NULL OR max_listings > 0)
);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_pro_packages_category_id ON pro_packages(category_id);
CREATE INDEX IF NOT EXISTS idx_pro_packages_is_active ON pro_packages(is_active);
CREATE INDEX IF NOT EXISTS idx_pro_packages_order_position ON pro_packages(order_position);

-- =====================================================
-- ENABLE RLS
-- =====================================================
ALTER TABLE pro_packages ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES
-- =====================================================
CREATE POLICY "Anyone can view active pro packages"
  ON pro_packages FOR SELECT
  USING (is_active = true);

-- =====================================================
-- TRIGGER: update_updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION update_pro_packages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_pro_packages_updated_at ON pro_packages;
CREATE TRIGGER update_pro_packages_updated_at
  BEFORE UPDATE ON pro_packages
  FOR EACH ROW
  EXECUTE FUNCTION update_pro_packages_updated_at();

-- =====================================================
-- DONNÉES INITIALES
-- =====================================================
INSERT INTO pro_packages (
  name, name_ar, name_en,
  description, description_ar, description_en,
  price, duration_days,
  max_listings, featured_listings,
  priority_support, custom_branding, analytics,
  order_position
) VALUES
  -- Package Starter
  (
    'Starter', 'البداية', 'Starter',
    'Parfait pour démarrer', 'مثالي للبدء', 'Perfect to start',
    5000, 30,
    10, 2,
    false, false, false,
    1
  ),
  -- Package Business
  (
    'Business', 'الأعمال', 'Business',
    'Pour les professionnels', 'للمحترفين', 'For professionals',
    15000, 30,
    50, 10,
    true, true, true,
    2
  ),
  -- Package Premium
  (
    'Premium', 'المتقدم', 'Premium',
    'Solution complète', 'حل كامل', 'Complete solution',
    30000, 30,
    NULL, 25,
    true, true, true,
    3
  );

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE pro_packages IS 'Packages d''abonnement PRO avec tarification et fonctionnalités';