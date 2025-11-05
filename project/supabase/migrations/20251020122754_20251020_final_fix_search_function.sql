/*
  # Correction finale de la fonction de recherche

  ## Problèmes corrigés
  1. La recherche retourne maintenant TOUTES les annonces quand le terme est vide
  2. Support du caractère '%' ou chaîne vide pour "afficher tout"
  3. Meilleure gestion des cas sans terme de recherche

  ## Changements
  - Si search_term est vide, '%', ou NULL → retourne toutes les annonces actives avec filtres
  - Sinon → recherche dans titre, description, et tous les attributs
  - Tri par pertinence puis date
*/

-- Supprimer toutes les versions existantes
DROP FUNCTION IF EXISTS search_listings(TEXT, TEXT, TEXT, NUMERIC, NUMERIC, TEXT);
DROP FUNCTION IF EXISTS search_listings(TEXT, UUID, UUID, TEXT, TEXT, NUMERIC, NUMERIC, TEXT);

-- Créer la fonction finale corrigée
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
  is_empty_search BOOLEAN;
BEGIN
  -- Nettoyer le terme de recherche
  search_term := TRIM(COALESCE(search_term, ''));
  
  -- Vérifier si c'est une recherche vide (afficher tout)
  is_empty_search := (search_term = '' OR search_term = '%');

  -- Préparer les mots de recherche si non vide
  IF NOT is_empty_search THEN
    search_words := string_to_array(LOWER(search_term), ' ');
  END IF;

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
    -- Calcul de pertinence
    CASE
      WHEN is_empty_search THEN
        -- Si recherche vide, trier par featured puis date
        (CASE WHEN l.is_featured THEN 100 ELSE 0 END +
         CASE WHEN l.created_at > NOW() - INTERVAL '7 days' THEN 10 ELSE 0 END)::NUMERIC
      ELSE
        -- Sinon, calcul complet de pertinence
        (
          -- Score titre
          CASE
            WHEN LOWER(l.title) = LOWER(search_term) THEN 100
            WHEN LOWER(l.title) LIKE LOWER(search_term) || '%' THEN 50
            WHEN LOWER(l.title) LIKE '%' || LOWER(search_term) || '%' THEN 30
            ELSE 0
          END
          +
          -- Score description
          CASE WHEN LOWER(l.description) LIKE '%' || LOWER(search_term) || '%' THEN 10 ELSE 0 END
          +
          -- Score brand_name
          CASE
            WHEN l.attributes->>'brand_name' IS NOT NULL
              AND LOWER(l.attributes->>'brand_name') LIKE '%' || LOWER(search_term) || '%' THEN 25
            ELSE 0
          END
          +
          -- Score model_name
          CASE
            WHEN l.attributes->>'model_name' IS NOT NULL
              AND LOWER(l.attributes->>'model_name') LIKE '%' || LOWER(search_term) || '%' THEN 25
            ELSE 0
          END
          +
          -- Score tous les attributs JSON
          CASE
            WHEN l.attributes IS NOT NULL
              AND LOWER(l.attributes::text) LIKE '%' || LOWER(search_term) || '%' THEN 20
            ELSE 0
          END
          +
          -- Bonus mots individuels
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
            WHERE LENGTH(w.search_word) > 1
          )
          +
          -- Bonus featured
          CASE WHEN l.is_featured = true THEN 15 ELSE 0 END
          +
          -- Bonus récent
          CASE
            WHEN l.created_at > NOW() - INTERVAL '7 days' THEN 5
            WHEN l.created_at > NOW() - INTERVAL '30 days' THEN 2
            ELSE 0
          END
        )::NUMERIC
    END as relevance
  FROM listings l
  WHERE
    l.status = 'active'
    AND (
      -- Si recherche vide, retourner tout
      is_empty_search
      OR
      -- Sinon, filtrer par recherche
      (
        LOWER(l.title) LIKE '%' || LOWER(search_term) || '%'
        OR LOWER(l.description) LIKE '%' || LOWER(search_term) || '%'
        OR (l.attributes->>'brand_name' IS NOT NULL
            AND LOWER(l.attributes->>'brand_name') LIKE '%' || LOWER(search_term) || '%')
        OR (l.attributes->>'model_name' IS NOT NULL
            AND LOWER(l.attributes->>'model_name') LIKE '%' || LOWER(search_term) || '%')
        OR (l.attributes IS NOT NULL
            AND LOWER(l.attributes::text) LIKE '%' || LOWER(search_term) || '%')
        OR EXISTS (
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
COMMENT ON FUNCTION search_listings IS 'Fonction de recherche complète avec support des recherches vides et filtres avancés';