/*
  # Enrichir les listings avec brand_name et model_name

  ## Description
  Cette migration enrichit les listings existants en extrayant les informations
  de marque et modèle depuis les titres et en les ajoutant aux attributs JSON.
  Cela améliore la recherche par marque/modèle.

  ## Modifications
  1. Créer une fonction pour extraire la marque depuis le titre
  2. Mettre à jour tous les listings de véhicules avec brand_name et model_name
  3. Mettre à jour les listings d'électronique avec brand_name

  ## Sécurité
  - Opération en lecture/écriture sur les listings existants
  - Pas de suppression de données
*/

-- ============================================
-- 1. Fonction pour extraire la marque depuis le titre
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
-- 2. Enrichir les listings de véhicules
-- ============================================

-- Mettre à jour les listings de véhicules avec brand_name et model_name
UPDATE listings l
SET attributes = COALESCE(l.attributes, '{}'::jsonb) || 
  jsonb_build_object(
    'brand_name', COALESCE(
      extract_brand_from_title(l.title, 'vehicles'),
      l.attributes->>'brand_name'
    ),
    'model_name', COALESCE(
      -- Extraire le modèle en retirant la marque du titre
      CASE 
        WHEN extract_brand_from_title(l.title, 'vehicles') IS NOT NULL THEN
          TRIM(REGEXP_REPLACE(
            l.title, 
            extract_brand_from_title(l.title, 'vehicles'), 
            '', 
            'i'
          ))
        ELSE l.title
      END,
      l.attributes->>'model_name'
    )
  )
WHERE l.category_id IN (
  SELECT id FROM categories 
  WHERE slug LIKE '%vehicule%' 
    OR parent_id IN (SELECT id FROM categories WHERE slug LIKE '%vehicule%')
)
AND l.status = 'active';

-- ============================================
-- 3. Enrichir les listings d'électronique
-- ============================================

UPDATE listings l
SET attributes = COALESCE(l.attributes, '{}'::jsonb) || 
  jsonb_build_object(
    'brand_name', COALESCE(
      extract_brand_from_title(l.title, 'electronics'),
      l.attributes->>'brand_name'
    )
  )
WHERE l.category_id IN (
  SELECT id FROM categories 
  WHERE slug LIKE '%electronique%' 
    OR parent_id IN (SELECT id FROM categories WHERE slug LIKE '%electronique%')
)
AND l.status = 'active';

-- ============================================
-- 4. Index pour améliorer les performances
-- ============================================

-- Index sur brand_name dans les attributs
CREATE INDEX IF NOT EXISTS idx_listings_brand_name 
ON listings ((attributes->>'brand_name'));

-- Index sur model_name dans les attributs
CREATE INDEX IF NOT EXISTS idx_listings_model_name 
ON listings ((attributes->>'model_name'));

-- ============================================
-- 5. Permissions
-- ============================================

GRANT EXECUTE ON FUNCTION extract_brand_from_title TO authenticated, anon;

-- ============================================
-- 6. Commentaires
-- ============================================

COMMENT ON FUNCTION extract_brand_from_title IS 'Extrait le nom de la marque depuis le titre d''une annonce';
COMMENT ON INDEX idx_listings_brand_name IS 'Index pour recherche rapide par marque';
COMMENT ON INDEX idx_listings_model_name IS 'Index pour recherche rapide par modèle';
