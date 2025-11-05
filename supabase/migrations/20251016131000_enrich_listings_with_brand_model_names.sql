/*
  # Enrichir les Annonces avec les Noms de Marque et Modèle

  Cette migration ajoute les noms de marque et modèle dans les attributs
  des annonces existantes pour améliorer la recherche.

  ## Modifications
  - Mettre à jour les annonces existantes avec brand_name et model_name
  - Créer un trigger pour maintenir ces champs à jour

  ## Notes
  - Améliore la recherche en permettant de chercher par nom de marque
*/

-- ============================================
-- 1. Enrichir les annonces existantes
-- ============================================

-- Ajouter brand_name pour les annonces qui ont un brand_id
UPDATE listings
SET attributes = jsonb_set(
  COALESCE(attributes, '{}'::jsonb),
  '{brand_name}',
  to_jsonb((SELECT name FROM brands WHERE id = (listings.attributes->>'brand_id')::uuid LIMIT 1)),
  true
)
WHERE attributes->>'brand_id' IS NOT NULL
  AND attributes->>'brand_name' IS NULL
  AND EXISTS (SELECT 1 FROM brands WHERE id = (listings.attributes->>'brand_id')::uuid);

-- Ajouter model_name pour les annonces qui ont un model_id
UPDATE listings
SET attributes = jsonb_set(
  COALESCE(attributes, '{}'::jsonb),
  '{model_name}',
  to_jsonb((SELECT name FROM models WHERE id = (listings.attributes->>'model_id')::uuid LIMIT 1)),
  true
)
WHERE attributes->>'model_id' IS NOT NULL
  AND attributes->>'model_name' IS NULL
  AND EXISTS (SELECT 1 FROM models WHERE id = (listings.attributes->>'model_id')::uuid);

-- ============================================
-- 2. Fonction pour enrichir automatiquement
-- ============================================

CREATE OR REPLACE FUNCTION enrich_listing_with_brand_model_names()
RETURNS TRIGGER AS $$
DECLARE
  brand_name_value TEXT;
  model_name_value TEXT;
BEGIN
  -- Récupérer le nom de la marque si brand_id est présent
  IF NEW.attributes->>'brand_id' IS NOT NULL THEN
    SELECT name INTO brand_name_value
    FROM brands
    WHERE id = (NEW.attributes->>'brand_id')::uuid
    LIMIT 1;

    IF brand_name_value IS NOT NULL THEN
      NEW.attributes = jsonb_set(
        COALESCE(NEW.attributes, '{}'::jsonb),
        '{brand_name}',
        to_jsonb(brand_name_value),
        true
      );
    END IF;
  END IF;

  -- Récupérer le nom du modèle si model_id est présent
  IF NEW.attributes->>'model_id' IS NOT NULL THEN
    SELECT name INTO model_name_value
    FROM models
    WHERE id = (NEW.attributes->>'model_id')::uuid
    LIMIT 1;

    IF model_name_value IS NOT NULL THEN
      NEW.attributes = jsonb_set(
        COALESCE(NEW.attributes, '{}'::jsonb),
        '{model_name}',
        to_jsonb(model_name_value),
        true
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 3. Créer le trigger
-- ============================================

DROP TRIGGER IF EXISTS enrich_listing_brand_model_trigger ON listings;

CREATE TRIGGER enrich_listing_brand_model_trigger
BEFORE INSERT OR UPDATE ON listings
FOR EACH ROW
EXECUTE FUNCTION enrich_listing_with_brand_model_names();

-- ============================================
-- 4. Commentaires
-- ============================================

COMMENT ON FUNCTION enrich_listing_with_brand_model_names IS 'Enrichit automatiquement les annonces avec les noms de marque et modèle pour améliorer la recherche';
COMMENT ON TRIGGER enrich_listing_brand_model_trigger ON listings IS 'Trigger qui enrichit automatiquement les annonces avec brand_name et model_name';
