/*
  # Enrichissement automatique des nouveaux listings

  ## Description
  Cette migration crée un trigger qui enrichit automatiquement les nouveaux
  listings avec brand_name et model_name lors de leur création.

  ## Modifications
  1. Créer une fonction trigger pour enrichir automatiquement
  2. Créer un trigger BEFORE INSERT sur la table listings
  3. Créer un trigger BEFORE UPDATE pour maintenir les données à jour

  ## Sécurité
  - Trigger automatique sur INSERT/UPDATE
  - Pas d'impact sur les performances (exécution avant insertion)
*/

-- ============================================
-- 1. Fonction trigger pour enrichir automatiquement
-- ============================================

CREATE OR REPLACE FUNCTION auto_enrich_listing_brand()
RETURNS TRIGGER AS $$
BEGIN
  -- Si le listing appartient à une catégorie de véhicules
  IF EXISTS (
    SELECT 1 FROM categories 
    WHERE id = NEW.category_id 
      AND (slug LIKE '%vehicule%' OR parent_id IN (
        SELECT id FROM categories WHERE slug LIKE '%vehicule%'
      ))
  ) THEN
    -- Enrichir avec brand_name et model_name si pas déjà présents
    IF NEW.attributes->>'brand_name' IS NULL OR NEW.attributes->>'brand_name' = '' THEN
      NEW.attributes = COALESCE(NEW.attributes, '{}'::jsonb) || 
        jsonb_build_object(
          'brand_name', extract_brand_from_title(NEW.title, 'vehicles'),
          'model_name', CASE 
            WHEN extract_brand_from_title(NEW.title, 'vehicles') IS NOT NULL THEN
              TRIM(REGEXP_REPLACE(
                NEW.title, 
                extract_brand_from_title(NEW.title, 'vehicles'), 
                '', 
                'i'
              ))
            ELSE NEW.title
          END
        );
    END IF;
  END IF;
  
  -- Si le listing appartient à une catégorie d'électronique
  IF EXISTS (
    SELECT 1 FROM categories 
    WHERE id = NEW.category_id 
      AND (slug LIKE '%electronique%' OR parent_id IN (
        SELECT id FROM categories WHERE slug LIKE '%electronique%'
      ))
  ) THEN
    -- Enrichir avec brand_name si pas déjà présent
    IF NEW.attributes->>'brand_name' IS NULL OR NEW.attributes->>'brand_name' = '' THEN
      NEW.attributes = COALESCE(NEW.attributes, '{}'::jsonb) || 
        jsonb_build_object(
          'brand_name', extract_brand_from_title(NEW.title, 'electronics')
        );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 2. Créer le trigger BEFORE INSERT
-- ============================================

DROP TRIGGER IF EXISTS trigger_auto_enrich_listing_brand ON listings;
CREATE TRIGGER trigger_auto_enrich_listing_brand
  BEFORE INSERT OR UPDATE OF title, category_id
  ON listings
  FOR EACH ROW
  EXECUTE FUNCTION auto_enrich_listing_brand();

-- ============================================
-- 3. Commentaires
-- ============================================

COMMENT ON FUNCTION auto_enrich_listing_brand IS 'Enrichit automatiquement les listings avec brand_name et model_name lors de la création/modification';
COMMENT ON TRIGGER trigger_auto_enrich_listing_brand ON listings IS 'Trigger pour enrichir automatiquement les nouveaux listings avec les informations de marque';
