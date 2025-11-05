/*
  # Correction de la recherche par marque - Enrichissement des listings

  ## Description
  Cette migration corrige le problème de recherche par marque en s'assurant que
  tous les listings de véhicules et électronique ont bien leurs attributs
  brand_name et model_name remplis automatiquement.

  ## Problème identifié
  - La fonction extract_brand_from_title existe
  - Le trigger auto_enrich_listing_brand existe
  - Mais les listings existants n'ont pas été enrichis correctement

  ## Solution
  1. Vérifier que la fonction et le trigger existent
  2. Ré-enrichir TOUS les listings de véhicules et électronique
  3. Forcer la mise à jour même si brand_name existe déjà (re-calcul)

  ## Sécurité
  - Opération de mise à jour sur les listings existants
  - Pas de suppression de données
*/

-- ============================================
-- 1. S'assurer que la fonction extract_brand_from_title existe
-- ============================================

CREATE OR REPLACE FUNCTION extract_brand_from_title(title_text TEXT, cat_type TEXT)
RETURNS TEXT AS $$
DECLARE
  brand_name TEXT;
BEGIN
  -- Liste des marques automobiles courantes
  IF cat_type = 'vehicles' THEN
    -- Recherche la première marque trouvée dans le titre
    SELECT b.name INTO brand_name
    FROM brands b
    WHERE b.category_type = 'vehicles'
      AND LOWER(title_text) LIKE '%' || LOWER(b.name) || '%'
    ORDER BY LENGTH(b.name) DESC
    LIMIT 1;

    RETURN brand_name;
  END IF;

  -- Pour l'électronique
  IF cat_type = 'electronics' THEN
    SELECT b.name INTO brand_name
    FROM brands b
    WHERE b.category_type = 'electronics'
      AND LOWER(title_text) LIKE '%' || LOWER(b.name) || '%'
    ORDER BY LENGTH(b.name) DESC
    LIMIT 1;

    RETURN brand_name;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 2. Enrichir TOUS les listings de véhicules
-- ============================================

-- Étape 2a: Enrichir depuis brand_id (si disponible)
UPDATE listings l
SET attributes = COALESCE(l.attributes, '{}'::jsonb) ||
  jsonb_build_object(
    'brand_name', (SELECT name FROM brands WHERE id = (l.attributes->>'brand_id')::uuid LIMIT 1)
  )
WHERE l.category_id IN (
  SELECT id FROM categories
  WHERE slug LIKE '%vehicule%'
    OR slug LIKE '%voiture%'
    OR slug LIKE '%moto%'
    OR slug LIKE '%camion%'
    OR parent_id IN (
      SELECT id FROM categories
      WHERE slug LIKE '%vehicule%'
    )
)
AND l.status = 'active'
AND l.attributes->>'brand_id' IS NOT NULL
AND l.attributes->>'brand_id' != ''
AND EXISTS (SELECT 1 FROM brands WHERE id = (l.attributes->>'brand_id')::uuid);

-- Étape 2b: Enrichir depuis vehicle_brand (champ texte)
UPDATE listings l
SET attributes = COALESCE(l.attributes, '{}'::jsonb) ||
  jsonb_build_object(
    'brand_name', l.attributes->>'vehicle_brand'
  )
WHERE l.category_id IN (
  SELECT id FROM categories
  WHERE slug LIKE '%vehicule%'
    OR slug LIKE '%voiture%'
    OR slug LIKE '%moto%'
    OR slug LIKE '%camion%'
    OR parent_id IN (
      SELECT id FROM categories
      WHERE slug LIKE '%vehicule%'
    )
)
AND l.status = 'active'
AND l.attributes->>'vehicle_brand' IS NOT NULL
AND l.attributes->>'vehicle_brand' != ''
AND (l.attributes->>'brand_name' IS NULL OR l.attributes->>'brand_name' = '');

-- Étape 2c: Enrichir depuis le titre (fallback)
UPDATE listings l
SET attributes = COALESCE(l.attributes, '{}'::jsonb) ||
  jsonb_build_object(
    'brand_name', extract_brand_from_title(l.title, 'vehicles'),
    'model_name', CASE
      WHEN extract_brand_from_title(l.title, 'vehicles') IS NOT NULL THEN
        TRIM(REGEXP_REPLACE(
          l.title,
          extract_brand_from_title(l.title, 'vehicles'),
          '',
          'i'
        ))
      ELSE l.title
    END
  )
WHERE l.category_id IN (
  SELECT id FROM categories
  WHERE slug LIKE '%vehicule%'
    OR slug LIKE '%voiture%'
    OR slug LIKE '%moto%'
    OR slug LIKE '%camion%'
    OR parent_id IN (
      SELECT id FROM categories
      WHERE slug LIKE '%vehicule%'
    )
)
AND l.status = 'active'
AND (l.attributes->>'brand_name' IS NULL OR l.attributes->>'brand_name' = '')
AND extract_brand_from_title(l.title, 'vehicles') IS NOT NULL;

-- ============================================
-- 3. Enrichir TOUS les listings d'électronique
-- ============================================

-- Étape 3a: Enrichir depuis brand_id (si disponible)
UPDATE listings l
SET attributes = COALESCE(l.attributes, '{}'::jsonb) ||
  jsonb_build_object(
    'brand_name', (SELECT name FROM brands WHERE id = (l.attributes->>'brand_id')::uuid LIMIT 1)
  )
WHERE l.category_id IN (
  SELECT id FROM categories
  WHERE slug LIKE '%electronique%'
    OR slug LIKE '%telephone%'
    OR slug LIKE '%ordinateur%'
    OR slug LIKE '%tablette%'
    OR parent_id IN (
      SELECT id FROM categories
      WHERE slug LIKE '%electronique%'
    )
)
AND l.status = 'active'
AND l.attributes->>'brand_id' IS NOT NULL
AND l.attributes->>'brand_id' != ''
AND EXISTS (SELECT 1 FROM brands WHERE id = (l.attributes->>'brand_id')::uuid);

-- Étape 3b: Enrichir depuis le titre (fallback)
UPDATE listings l
SET attributes = COALESCE(l.attributes, '{}'::jsonb) ||
  jsonb_build_object(
    'brand_name', extract_brand_from_title(l.title, 'electronics')
  )
WHERE l.category_id IN (
  SELECT id FROM categories
  WHERE slug LIKE '%electronique%'
    OR slug LIKE '%telephone%'
    OR slug LIKE '%ordinateur%'
    OR slug LIKE '%tablette%'
    OR parent_id IN (
      SELECT id FROM categories
      WHERE slug LIKE '%electronique%'
    )
)
AND l.status = 'active'
AND (l.attributes->>'brand_name' IS NULL OR l.attributes->>'brand_name' = '')
AND extract_brand_from_title(l.title, 'electronics') IS NOT NULL;

-- ============================================
-- 4. Vérifier et recréer le trigger si nécessaire
-- ============================================

CREATE OR REPLACE FUNCTION auto_enrich_listing_brand()
RETURNS TRIGGER AS $$
DECLARE
  detected_brand TEXT;
  brand_from_id TEXT;
  model_from_id TEXT;
BEGIN
  -- Si le listing appartient à une catégorie de véhicules
  IF EXISTS (
    SELECT 1 FROM categories
    WHERE id = NEW.category_id
      AND (
        slug LIKE '%vehicule%'
        OR slug LIKE '%voiture%'
        OR slug LIKE '%moto%'
        OR slug LIKE '%camion%'
        OR parent_id IN (
          SELECT id FROM categories
          WHERE slug LIKE '%vehicule%'
        )
      )
  ) THEN
    -- Priorité 1: Si brand_id existe dans attributes, utiliser le nom de la table brands
    IF NEW.attributes->>'brand_id' IS NOT NULL AND NEW.attributes->>'brand_id' != '' THEN
      SELECT name INTO brand_from_id
      FROM brands
      WHERE id = (NEW.attributes->>'brand_id')::uuid
      LIMIT 1;

      IF brand_from_id IS NOT NULL THEN
        NEW.attributes = COALESCE(NEW.attributes, '{}'::jsonb) ||
          jsonb_build_object('brand_name', brand_from_id);
      END IF;
    END IF;

    -- Priorité 2: Si vehicle_brand existe (champ texte libre), l'utiliser
    IF NEW.attributes->>'vehicle_brand' IS NOT NULL AND NEW.attributes->>'vehicle_brand' != '' THEN
      NEW.attributes = COALESCE(NEW.attributes, '{}'::jsonb) ||
        jsonb_build_object('brand_name', NEW.attributes->>'vehicle_brand');
    END IF;

    -- Priorité 3: Si brand_name n'est toujours pas défini, extraire du titre
    IF NEW.attributes->>'brand_name' IS NULL OR NEW.attributes->>'brand_name' = '' THEN
      detected_brand := extract_brand_from_title(NEW.title, 'vehicles');

      IF detected_brand IS NOT NULL THEN
        NEW.attributes = COALESCE(NEW.attributes, '{}'::jsonb) ||
          jsonb_build_object(
            'brand_name', detected_brand,
            'model_name', TRIM(REGEXP_REPLACE(NEW.title, detected_brand, '', 'i'))
          );
      END IF;
    END IF;

    -- Ajouter model_name depuis model_id si disponible
    IF NEW.attributes->>'model_id' IS NOT NULL AND NEW.attributes->>'model_id' != '' THEN
      SELECT name INTO model_from_id
      FROM models
      WHERE id = (NEW.attributes->>'model_id')::uuid
      LIMIT 1;

      IF model_from_id IS NOT NULL THEN
        NEW.attributes = COALESCE(NEW.attributes, '{}'::jsonb) ||
          jsonb_build_object('model_name', model_from_id);
      END IF;
    END IF;
  END IF;

  -- Si le listing appartient à une catégorie d'électronique
  IF EXISTS (
    SELECT 1 FROM categories
    WHERE id = NEW.category_id
      AND (
        slug LIKE '%electronique%'
        OR slug LIKE '%telephone%'
        OR slug LIKE '%ordinateur%'
        OR slug LIKE '%tablette%'
        OR parent_id IN (
          SELECT id FROM categories
          WHERE slug LIKE '%electronique%'
        )
      )
  ) THEN
    -- Priorité 1: Si brand_id existe dans attributes, utiliser le nom de la table brands
    IF NEW.attributes->>'brand_id' IS NOT NULL AND NEW.attributes->>'brand_id' != '' THEN
      SELECT name INTO brand_from_id
      FROM brands
      WHERE id = (NEW.attributes->>'brand_id')::uuid
      LIMIT 1;

      IF brand_from_id IS NOT NULL THEN
        NEW.attributes = COALESCE(NEW.attributes, '{}'::jsonb) ||
          jsonb_build_object('brand_name', brand_from_id);
      END IF;
    END IF;

    -- Priorité 2: Si brand_name n'est toujours pas défini, extraire du titre
    IF NEW.attributes->>'brand_name' IS NULL OR NEW.attributes->>'brand_name' = '' THEN
      detected_brand := extract_brand_from_title(NEW.title, 'electronics');

      IF detected_brand IS NOT NULL THEN
        NEW.attributes = COALESCE(NEW.attributes, '{}'::jsonb) ||
          jsonb_build_object('brand_name', detected_brand);
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recréer le trigger
DROP TRIGGER IF EXISTS trigger_auto_enrich_listing_brand ON listings;
CREATE TRIGGER trigger_auto_enrich_listing_brand
  BEFORE INSERT OR UPDATE OF title, category_id
  ON listings
  FOR EACH ROW
  EXECUTE FUNCTION auto_enrich_listing_brand();

-- ============================================
-- 5. Index pour améliorer les performances de recherche
-- ============================================

-- Index sur brand_name dans les attributs (si pas déjà créé)
CREATE INDEX IF NOT EXISTS idx_listings_brand_name
ON listings ((attributes->>'brand_name'));

-- Index sur model_name dans les attributs (si pas déjà créé)
CREATE INDEX IF NOT EXISTS idx_listings_model_name
ON listings ((attributes->>'model_name'));

-- ============================================
-- 6. Permissions
-- ============================================

GRANT EXECUTE ON FUNCTION extract_brand_from_title TO authenticated, anon;
GRANT EXECUTE ON FUNCTION auto_enrich_listing_brand TO authenticated, anon;

-- ============================================
-- 7. Commentaires
-- ============================================

COMMENT ON FUNCTION extract_brand_from_title IS 'Extrait le nom de la marque depuis le titre d''une annonce (véhicules ou électronique)';
COMMENT ON FUNCTION auto_enrich_listing_brand IS 'Trigger function qui enrichit automatiquement les listings avec brand_name et model_name';
COMMENT ON TRIGGER trigger_auto_enrich_listing_brand ON listings IS 'Enrichit automatiquement les nouveaux et modifiés listings avec informations de marque';
