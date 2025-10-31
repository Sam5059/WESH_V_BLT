/*
  # Amélioration de la Fonction de Recherche

  Cette migration crée une fonction de recherche améliorée qui:
  - Recherche dans le titre, description, et attributs
  - Priorise les résultats exacts
  - Recherche les noms de marque et modèle

  ## Modifications
  - Créer une fonction `search_listings` pour recherche intelligente
  - Ajouter index GIN pour recherche full-text

  ## Sécurité
  - Fonction accessible aux utilisateurs anonymes et authentifiés
*/

-- ============================================
-- 1. Créer des index pour améliorer les performances
-- ============================================

-- Index GIN pour recherche full-text dans titre et description
DROP INDEX IF EXISTS idx_listings_title_description_search;
CREATE INDEX IF NOT EXISTS idx_listings_title_description_search
ON listings USING gin(to_tsvector('french', title || ' ' || description));

-- Index sur les attributs JSON pour recherche rapide
DROP INDEX IF EXISTS idx_listings_attributes_gin;
CREATE INDEX IF NOT EXISTS idx_listings_attributes_gin
ON listings USING gin(attributes);

-- ============================================
-- 2. Fonction de recherche améliorée
-- ============================================

CREATE OR REPLACE FUNCTION search_listings(
  search_term TEXT,
  category_filter TEXT DEFAULT NULL,
  wilaya_filter TEXT DEFAULT NULL,
  min_price_filter NUMERIC DEFAULT NULL,
  max_price_filter NUMERIC DEFAULT NULL,
  listing_type_filter TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  price NUMERIC,
  category_id UUID,
  wilaya TEXT,
  commune TEXT,
  images TEXT[],
  status TEXT,
  listing_type TEXT,
  user_id UUID,
  created_at TIMESTAMPTZ,
  attributes JSONB,
  relevance NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    l.id,
    l.title,
    l.description,
    l.price,
    l.category_id,
    l.wilaya,
    l.commune,
    l.images,
    l.status,
    l.listing_type,
    l.user_id,
    l.created_at,
    l.attributes,
    -- Score de pertinence (plus le score est élevé, plus c'est pertinent)
    (
      -- Titre exact: score 100
      CASE WHEN LOWER(l.title) = LOWER(search_term) THEN 100
      -- Titre commence par le terme: score 50
      WHEN LOWER(l.title) LIKE LOWER(search_term) || '%' THEN 50
      -- Titre contient le terme: score 30
      WHEN LOWER(l.title) LIKE '%' || LOWER(search_term) || '%' THEN 30
      ELSE 0 END
      +
      -- Description contient le terme: score 10
      CASE WHEN LOWER(l.description) LIKE '%' || LOWER(search_term) || '%' THEN 10 ELSE 0 END
      +
      -- Marque dans attributes: score 40
      CASE WHEN l.attributes->>'brand_name' IS NOT NULL
           AND LOWER(l.attributes->>'brand_name') LIKE '%' || LOWER(search_term) || '%' THEN 40 ELSE 0 END
      +
      -- Modèle dans attributes: score 35
      CASE WHEN l.attributes->>'model_name' IS NOT NULL
           AND LOWER(l.attributes->>'model_name') LIKE '%' || LOWER(search_term) || '%' THEN 35 ELSE 0 END
    )::NUMERIC as relevance
  FROM listings l
  WHERE
    l.status = 'active'
    AND (
      -- Recherche dans titre
      LOWER(l.title) LIKE '%' || LOWER(search_term) || '%'
      OR
      -- Recherche dans description
      LOWER(l.description) LIKE '%' || LOWER(search_term) || '%'
      OR
      -- Recherche dans marque (attributes)
      (l.attributes->>'brand_name' IS NOT NULL
       AND LOWER(l.attributes->>'brand_name') LIKE '%' || LOWER(search_term) || '%')
      OR
      -- Recherche dans modèle (attributes)
      (l.attributes->>'model_name' IS NOT NULL
       AND LOWER(l.attributes->>'model_name') LIKE '%' || LOWER(search_term) || '%')
    )
    -- Filtres optionnels
    AND (category_filter IS NULL OR l.category_id = category_filter::UUID)
    AND (wilaya_filter IS NULL OR l.wilaya = wilaya_filter)
    AND (min_price_filter IS NULL OR l.price >= min_price_filter)
    AND (max_price_filter IS NULL OR l.price <= max_price_filter)
    AND (listing_type_filter IS NULL OR l.listing_type = listing_type_filter)
  ORDER BY relevance DESC, l.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 3. Permissions
-- ============================================

-- Permettre l'accès public à la fonction de recherche
GRANT EXECUTE ON FUNCTION search_listings TO anon, authenticated;

-- ============================================
-- 4. Commentaires
-- ============================================

COMMENT ON FUNCTION search_listings IS 'Fonction de recherche améliorée avec scoring de pertinence pour les annonces';
COMMENT ON INDEX idx_listings_title_description_search IS 'Index GIN pour recherche full-text dans titre et description';
COMMENT ON INDEX idx_listings_attributes_gin IS 'Index GIN pour recherche rapide dans les attributs JSON';
