/*
  # Restructuration avec table sub_categories séparée

  ## Nouvelle architecture

  ### Table categories (catégories parentes uniquement)
  - id (UUID)
  - name (FR)
  - name_ar (AR)
  - name_en (EN)
  - slug
  - display_order

  ### Table sub_categories (sous-catégories)
  - id (UUID)
  - category_id (FK → categories)
  - name (FR)
  - name_ar (AR)
  - name_en (EN)
  - slug
  - display_order

  ### Table listings
  - category_id (FK → categories)
  - subcategory_id (FK → sub_categories)

  ## Avantages
  - Structure claire et séparée
  - Plus facile à maintenir
  - Pas de confusion avec parent_id
  - Support multilingue complet (FR, AR, EN)
*/

-- ===============================================
-- ÉTAPE 1 : Créer la nouvelle table sub_categories
-- ===============================================

CREATE TABLE IF NOT EXISTS sub_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  name_ar TEXT,
  name_en TEXT,
  slug TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Contraintes
  CONSTRAINT unique_subcategory_slug UNIQUE(slug),
  CONSTRAINT unique_subcategory_per_category UNIQUE(category_id, slug)
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_sub_categories_category_id ON sub_categories(category_id);
CREATE INDEX IF NOT EXISTS idx_sub_categories_slug ON sub_categories(slug);

-- RLS (Row Level Security)
ALTER TABLE sub_categories ENABLE ROW LEVEL SECURITY;

-- Politique : Tout le monde peut lire les sous-catégories
CREATE POLICY "Sub-categories are viewable by everyone"
  ON sub_categories FOR SELECT
  TO public
  USING (true);

-- ===============================================
-- ÉTAPE 2 : Migrer les données existantes
-- ===============================================

DO $$
DECLARE
  vehicules_id UUID;
  immobilier_id UUID;
  electronique_id UUID;
  mode_beaute_id UUID;
  maison_jardin_id UUID;
  loisirs_id UUID;
  animaux_id UUID;
  location_immo_id UUID;
  location_vacances_id UUID;
  location_vehicules_id UUID;
  location_equipements_id UUID;
BEGIN
  -- Récupérer les IDs des catégories parentes
  SELECT id INTO vehicules_id FROM categories WHERE slug = 'vehicules' AND parent_id IS NULL LIMIT 1;
  SELECT id INTO immobilier_id FROM categories WHERE slug = 'immobilier' AND parent_id IS NULL LIMIT 1;
  SELECT id INTO electronique_id FROM categories WHERE slug = 'electronique' AND parent_id IS NULL LIMIT 1;
  SELECT id INTO mode_beaute_id FROM categories WHERE slug = 'mode-beaute' AND parent_id IS NULL LIMIT 1;
  SELECT id INTO maison_jardin_id FROM categories WHERE slug = 'maison-jardin' AND parent_id IS NULL LIMIT 1;
  SELECT id INTO loisirs_id FROM categories WHERE slug = 'loisirs-hobbies' AND parent_id IS NULL LIMIT 1;
  SELECT id INTO animaux_id FROM categories WHERE slug = 'animaux' AND parent_id IS NULL LIMIT 1;
  SELECT id INTO location_immo_id FROM categories WHERE slug = 'location-immobilier' AND parent_id IS NULL LIMIT 1;
  SELECT id INTO location_vacances_id FROM categories WHERE slug = 'location-vacances' AND parent_id IS NULL LIMIT 1;
  SELECT id INTO location_vehicules_id FROM categories WHERE slug = 'location-vehicules' AND parent_id IS NULL LIMIT 1;
  SELECT id INTO location_equipements_id FROM categories WHERE slug = 'location-equipements' AND parent_id IS NULL LIMIT 1;

  -- ===== IMMOBILIER =====
  IF immobilier_id IS NOT NULL THEN
    INSERT INTO sub_categories (category_id, name, name_ar, name_en, slug, display_order)
    SELECT
      immobilier_id,
      name,
      name_ar,
      name_en,
      slug,
      COALESCE(order_position, display_order, 0)
    FROM categories
    WHERE parent_id = immobilier_id
    ON CONFLICT (category_id, slug) DO NOTHING;

    RAISE NOTICE '✅ Sous-catégories Immobilier migrées';
  END IF;

  -- ===== VÉHICULES =====
  IF vehicules_id IS NOT NULL THEN
    INSERT INTO sub_categories (category_id, name, name_ar, name_en, slug, display_order)
    SELECT
      vehicules_id,
      name,
      name_ar,
      name_en,
      slug,
      COALESCE(order_position, display_order, 0)
    FROM categories
    WHERE parent_id = vehicules_id
    ON CONFLICT (category_id, slug) DO NOTHING;

    RAISE NOTICE '✅ Sous-catégories Véhicules migrées';
  END IF;

  -- ===== ÉLECTRONIQUE =====
  IF electronique_id IS NOT NULL THEN
    INSERT INTO sub_categories (category_id, name, name_ar, name_en, slug, display_order)
    SELECT
      electronique_id,
      name,
      name_ar,
      name_en,
      slug,
      COALESCE(order_position, display_order, 0)
    FROM categories
    WHERE parent_id = electronique_id
    ON CONFLICT (category_id, slug) DO NOTHING;

    RAISE NOTICE '✅ Sous-catégories Électronique migrées';
  END IF;

  -- ===== MODE & BEAUTÉ =====
  IF mode_beaute_id IS NOT NULL THEN
    INSERT INTO sub_categories (category_id, name, name_ar, name_en, slug, display_order)
    SELECT
      mode_beaute_id,
      name,
      name_ar,
      name_en,
      slug,
      COALESCE(order_position, display_order, 0)
    FROM categories
    WHERE parent_id = mode_beaute_id
    ON CONFLICT (category_id, slug) DO NOTHING;

    RAISE NOTICE '✅ Sous-catégories Mode & Beauté migrées';
  END IF;

  -- ===== MAISON & JARDIN =====
  IF maison_jardin_id IS NOT NULL THEN
    INSERT INTO sub_categories (category_id, name, name_ar, name_en, slug, display_order)
    SELECT
      maison_jardin_id,
      name,
      name_ar,
      name_en,
      slug,
      COALESCE(order_position, display_order, 0)
    FROM categories
    WHERE parent_id = maison_jardin_id
    ON CONFLICT (category_id, slug) DO NOTHING;

    RAISE NOTICE '✅ Sous-catégories Maison & Jardin migrées';
  END IF;

  -- ===== LOISIRS & HOBBIES =====
  IF loisirs_id IS NOT NULL THEN
    INSERT INTO sub_categories (category_id, name, name_ar, name_en, slug, display_order)
    SELECT
      loisirs_id,
      name,
      name_ar,
      name_en,
      slug,
      COALESCE(order_position, display_order, 0)
    FROM categories
    WHERE parent_id = loisirs_id
    ON CONFLICT (category_id, slug) DO NOTHING;

    RAISE NOTICE '✅ Sous-catégories Loisirs & Hobbies migrées';
  END IF;

  -- ===== ANIMAUX =====
  IF animaux_id IS NOT NULL THEN
    INSERT INTO sub_categories (category_id, name, name_ar, name_en, slug, display_order)
    SELECT
      animaux_id,
      name,
      name_ar,
      name_en,
      slug,
      COALESCE(order_position, display_order, 0)
    FROM categories
    WHERE parent_id = animaux_id
    ON CONFLICT (category_id, slug) DO NOTHING;

    RAISE NOTICE '✅ Sous-catégories Animaux migrées';
  END IF;

  -- ===== LOCATION IMMOBILIER =====
  IF location_immo_id IS NOT NULL THEN
    INSERT INTO sub_categories (category_id, name, name_ar, name_en, slug, display_order)
    SELECT
      location_immo_id,
      name,
      name_ar,
      name_en,
      slug,
      COALESCE(order_position, display_order, 0)
    FROM categories
    WHERE parent_id = location_immo_id
    ON CONFLICT (category_id, slug) DO NOTHING;

    RAISE NOTICE '✅ Sous-catégories Location Immobilier migrées';
  END IF;

  -- ===== LOCATION VACANCES =====
  IF location_vacances_id IS NOT NULL THEN
    INSERT INTO sub_categories (category_id, name, name_ar, name_en, slug, display_order)
    SELECT
      location_vacances_id,
      name,
      name_ar,
      name_en,
      slug,
      COALESCE(order_position, display_order, 0)
    FROM categories
    WHERE parent_id = location_vacances_id
    ON CONFLICT (category_id, slug) DO NOTHING;

    RAISE NOTICE '✅ Sous-catégories Location Vacances migrées';
  END IF;

  -- ===== LOCATION VÉHICULES =====
  IF location_vehicules_id IS NOT NULL THEN
    INSERT INTO sub_categories (category_id, name, name_ar, name_en, slug, display_order)
    SELECT
      location_vehicules_id,
      name,
      name_ar,
      name_en,
      slug,
      COALESCE(order_position, display_order, 0)
    FROM categories
    WHERE parent_id = location_vehicules_id
    ON CONFLICT (category_id, slug) DO NOTHING;

    RAISE NOTICE '✅ Sous-catégories Location Véhicules migrées';
  END IF;

  -- ===== LOCATION ÉQUIPEMENTS =====
  IF location_equipements_id IS NOT NULL THEN
    INSERT INTO sub_categories (category_id, name, name_ar, name_en, slug, display_order)
    SELECT
      location_equipements_id,
      name,
      name_ar,
      name_en,
      slug,
      COALESCE(order_position, display_order, 0)
    FROM categories
    WHERE parent_id = location_equipements_id
    ON CONFLICT (category_id, slug) DO NOTHING;

    RAISE NOTICE '✅ Sous-catégories Location Équipements migrées';
  END IF;

  RAISE NOTICE '✅ Migration des sous-catégories terminée';
END $$;

-- ===============================================
-- ÉTAPE 3 : Mettre à jour les listings
-- ===============================================

DO $$
BEGIN
  -- Mettre à jour subcategory_id dans listings pour pointer vers sub_categories
  UPDATE listings l
  SET subcategory_id = sc.id
  FROM sub_categories sc
  JOIN categories old_cat ON old_cat.slug = sc.slug
  WHERE l.category_id = old_cat.id
    AND old_cat.parent_id IS NOT NULL;

  RAISE NOTICE '✅ Listings mis à jour avec les nouvelles sous-catégories';
END $$;

-- ===============================================
-- ÉTAPE 4 : Mettre à jour category_id des listings
-- ===============================================

DO $$
BEGIN
  -- Mettre à jour category_id pour pointer vers la catégorie parente
  UPDATE listings l
  SET category_id = parent.id
  FROM categories child
  JOIN categories parent ON child.parent_id = parent.id
  WHERE l.category_id = child.id
    AND child.parent_id IS NOT NULL;

  RAISE NOTICE '✅ category_id des listings pointent maintenant vers les catégories parentes';
END $$;

-- ===============================================
-- ÉTAPE 5 : Nettoyer les anciennes sous-catégories
-- ===============================================

-- Supprimer les anciennes sous-catégories de la table categories
-- (garder uniquement les catégories parentes)
DELETE FROM categories WHERE parent_id IS NOT NULL;

RAISE NOTICE '✅ Anciennes sous-catégories supprimées de la table categories';

-- ===============================================
-- ÉTAPE 6 : Nettoyer la colonne parent_id
-- ===============================================

-- Optionnel : Supprimer la colonne parent_id si elle n'est plus utilisée
-- ALTER TABLE categories DROP COLUMN IF EXISTS parent_id;

RAISE NOTICE '✅ Migration terminée avec succès !';
RAISE NOTICE '📊 Vérifiez les résultats :';
RAISE NOTICE '   - Table categories : Uniquement les catégories parentes';
RAISE NOTICE '   - Table sub_categories : Toutes les sous-catégories avec traductions';
RAISE NOTICE '   - Table listings : category_id pointe vers catégorie parente, subcategory_id vers sub_categories';
