/*
  # Amélioration de la recherche dans tous les attributs

  ## Description
  Cette migration améliore la fonction de recherche pour chercher dans TOUS les champs
  des attributs JSON, pas seulement brand_name et model_name.

  ## Problèmes résolus
  - Recherche "Dacia" ne trouve pas les annonces avec Dacia dans attributes
  - Recherche "appartement" ne trouve pas les annonces avec type="Appartement" dans attributes
  - Recherche "F3" ne trouve pas les annonces avec ce type dans le titre ou attributs

  ## Solution
  - Convertir tout le JSON attributes en texte pour la recherche
  - Chercher dans toutes les valeurs des attributs
  - Améliorer le scoring pour les correspondances dans les attributs
*/

-- Supprimer l'ancienne fonction
DROP FUNCTION IF EXISTS search_listings(TEXT, UUID, UUID, TEXT, TEXT, NUMERIC, NUMERIC, TEXT);

-- Créer la nouvelle fonction de recherche améliorée
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
  attributes_text TEXT;
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
      -- Score pour le titre (exact match)
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
      -- Score pour brand_name
      CASE
        WHEN l.attributes->>'brand_name' IS NOT NULL
          AND LOWER(l.attributes->>'brand_name') LIKE '%' || LOWER(search_term) || '%' THEN 25
        ELSE 0
      END
      +
      -- Score pour model_name
      CASE
        WHEN l.attributes->>'model_name' IS NOT NULL
          AND LOWER(l.attributes->>'model_name') LIKE '%' || LOWER(search_term) || '%' THEN 25
        ELSE 0
      END
      +
      -- Score pour TOUS les autres attributs (nouveau)
      CASE
        WHEN l.attributes IS NOT NULL
          AND LOWER(l.attributes::text) LIKE '%' || LOWER(search_term) || '%' THEN 20
        ELSE 0
      END
      +
      -- Bonus pour chaque mot trouvé individuellement
      (
        SELECT COALESCE(SUM(
          CASE
            WHEN LOWER(l.title) LIKE '%' || w.search_word || '%' THEN 5
            WHEN LOWER(l.description) LIKE '%' || w.search_word || '%' THEN 2
            WHEN l.attributes IS NOT NULL
              AND LOWER(l.attributes::text) LIKE '%' || w.search_word || '%' THEN 3
            ELSE 0
          END
        ), 0)
        FROM unnest(search_words) AS w(search_word)
        WHERE LENGTH(w.search_word) > 1  -- Accepter les mots de 2+ caractères (pour F3, etc)
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
      -- Recherche dans brand_name
      (l.attributes->>'brand_name' IS NOT NULL
        AND LOWER(l.attributes->>'brand_name') LIKE '%' || LOWER(search_term) || '%')
      OR
      -- Recherche dans model_name
      (l.attributes->>'model_name' IS NOT NULL
        AND LOWER(l.attributes->>'model_name') LIKE '%' || LOWER(search_term) || '%')
      OR
      -- Recherche dans TOUS les attributs (nouveau)
      (l.attributes IS NOT NULL
        AND LOWER(l.attributes::text) LIKE '%' || LOWER(search_term) || '%')
      OR
      -- Recherche par mots individuels
      EXISTS (
        SELECT 1 FROM unnest(search_words) AS w(search_word)
        WHERE LENGTH(w.search_word) > 1
          AND (
            LOWER(l.title) LIKE '%' || w.search_word || '%'
            OR LOWER(l.description) LIKE '%' || w.search_word || '%'
            OR (l.attributes IS NOT NULL
              AND LOWER(l.attributes::text) LIKE '%' || w.search_word || '%')
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

-- Permissions
GRANT EXECUTE ON FUNCTION search_listings TO authenticated, anon;

-- Commentaire
COMMENT ON FUNCTION search_listings IS 'Recherche avancée dans les listings avec support de tous les attributs JSON';
