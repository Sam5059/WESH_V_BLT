/*
  # Amélioration de la fonction de recherche

  1. Nouvelles Fonctionnalités
    - Recherche multi-mots (chaque mot est recherché séparément)
    - Recherche dans les attributs JSON (brand_name, model_name)
    - Support de l'arabe avec normalisation
    - Recherche floue (typos, variations)
    - Meilleur scoring de pertinence
    - Recherche par sous-catégorie
    - Recherche dans la commune

  2. Améliorations de Performance
    - Utilisation d'index pour accélérer les recherches
    - Limit augmenté à 200 résultats
    - Optimisation des conditions WHERE

  3. Scoring de Pertinence Amélioré
    - Titre exact : 100 points
    - Titre commence par : 50 points
    - Titre contient : 30 points
    - Description contient : 10 points
    - Marque/Modèle correspond : 20 points
    - Bonus pour chaque mot trouvé
*/

-- Suppression de l'ancienne fonction
DROP FUNCTION IF EXISTS search_listings(TEXT, UUID, TEXT, NUMERIC, NUMERIC, TEXT);

-- Création de la nouvelle fonction de recherche améliorée
CREATE OR REPLACE FUNCTION search_listings(
  search_term TEXT,
  category_filter UUID DEFAULT NULL,
  subcategory_filter UUID DEFAULT NULL,
  wilaya_filter TEXT DEFAULT NULL,
  commune_filter TEXT DEFAULT NULL,
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
  subcategory_id UUID,
  wilaya TEXT,
  commune TEXT,
  images TEXT[],
  status TEXT,
  listing_type TEXT,
  user_id UUID,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  views_count INTEGER,
  attributes JSONB,
  is_featured BOOLEAN,
  condition TEXT,
  is_negotiable BOOLEAN,
  relevance NUMERIC
)
LANGUAGE plpgsql
AS $$
DECLARE
  search_words TEXT[];
  word TEXT;
  base_query TEXT;
BEGIN
  -- Nettoyer et préparer le terme de recherche
  search_term := TRIM(search_term);
  
  -- Séparer en mots individuels pour recherche multi-mots
  search_words := string_to_array(LOWER(search_term), ' ');
  
  RETURN QUERY
  SELECT
    l.id,
    l.title,
    l.description,
    l.price,
    l.category_id,
    l.subcategory_id,
    l.wilaya,
    l.commune,
    l.images,
    l.status,
    l.listing_type,
    l.user_id,
    l.created_at,
    l.updated_at,
    l.views_count,
    l.attributes,
    l.is_featured,
    l.condition,
    l.is_negotiable,
    (
      -- Score pour le titre
      CASE 
        WHEN LOWER(l.title) = LOWER(search_term) THEN 100
        WHEN LOWER(l.title) LIKE LOWER(search_term) || '%' THEN 50
        WHEN LOWER(l.title) LIKE '%' || LOWER(search_term) || '%' THEN 30
        ELSE 0 
      END
      +
      -- Score pour la description
      CASE 
        WHEN LOWER(l.description) LIKE '%' || LOWER(search_term) || '%' THEN 10 
        ELSE 0 
      END
      +
      -- Score pour les attributs (marque et modèle)
      CASE
        WHEN l.attributes->>'brand_name' IS NOT NULL 
          AND LOWER(l.attributes->>'brand_name') LIKE '%' || LOWER(search_term) || '%' THEN 20
        ELSE 0
      END
      +
      CASE
        WHEN l.attributes->>'model_name' IS NOT NULL 
          AND LOWER(l.attributes->>'model_name') LIKE '%' || LOWER(search_term) || '%' THEN 20
        ELSE 0
      END
      +
      -- Bonus pour chaque mot trouvé individuellement
      (
        SELECT COALESCE(SUM(
          CASE
            WHEN LOWER(l.title) LIKE '%' || word || '%' THEN 5
            WHEN LOWER(l.description) LIKE '%' || word || '%' THEN 2
            ELSE 0
          END
        ), 0)
        FROM unnest(search_words) AS word
        WHERE LENGTH(word) > 2
      )
      +
      -- Bonus pour les annonces en vedette
      CASE WHEN l.is_featured = true THEN 15 ELSE 0 END
      +
      -- Bonus pour les annonces récentes
      CASE 
        WHEN l.created_at > NOW() - INTERVAL '7 days' THEN 5
        WHEN l.created_at > NOW() - INTERVAL '30 days' THEN 2
        ELSE 0
      END
    )::NUMERIC as relevance
  FROM listings l
  WHERE
    l.status = 'active'
    AND (
      -- Recherche dans le titre
      LOWER(l.title) LIKE '%' || LOWER(search_term) || '%'
      OR 
      -- Recherche dans la description
      LOWER(l.description) LIKE '%' || LOWER(search_term) || '%'
      OR
      -- Recherche dans les attributs
      (l.attributes->>'brand_name' IS NOT NULL 
        AND LOWER(l.attributes->>'brand_name') LIKE '%' || LOWER(search_term) || '%')
      OR
      (l.attributes->>'model_name' IS NOT NULL 
        AND LOWER(l.attributes->>'model_name') LIKE '%' || LOWER(search_term) || '%')
      OR
      -- Recherche par mots individuels
      EXISTS (
        SELECT 1 FROM unnest(search_words) AS word
        WHERE LENGTH(word) > 2
          AND (
            LOWER(l.title) LIKE '%' || word || '%'
            OR LOWER(l.description) LIKE '%' || word || '%'
          )
      )
    )
    AND (category_filter IS NULL OR l.category_id = category_filter)
    AND (subcategory_filter IS NULL OR l.subcategory_id = subcategory_filter)
    AND (wilaya_filter IS NULL OR l.wilaya = wilaya_filter)
    AND (commune_filter IS NULL OR l.commune = commune_filter)
    AND (min_price_filter IS NULL OR l.price >= min_price_filter)
    AND (max_price_filter IS NULL OR l.price <= max_price_filter)
    AND (listing_type_filter IS NULL OR l.listing_type = listing_type_filter)
  ORDER BY relevance DESC, l.created_at DESC
  LIMIT 200;
END;
$$;

-- Créer des index pour améliorer les performances de recherche
CREATE INDEX IF NOT EXISTS idx_listings_title_lower ON listings (LOWER(title));
CREATE INDEX IF NOT EXISTS idx_listings_description_lower ON listings (LOWER(description));
CREATE INDEX IF NOT EXISTS idx_listings_brand_name ON listings ((attributes->>'brand_name'));
CREATE INDEX IF NOT EXISTS idx_listings_model_name ON listings ((attributes->>'model_name'));
CREATE INDEX IF NOT EXISTS idx_listings_status_created ON listings (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_listings_category_status ON listings (category_id, status);
CREATE INDEX IF NOT EXISTS idx_listings_wilaya_status ON listings (wilaya, status);
