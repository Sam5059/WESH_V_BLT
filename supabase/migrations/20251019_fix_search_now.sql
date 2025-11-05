-- Correction URGENTE de la recherche trop permissive
-- Cette migration corrige la fonction search_listings pour qu'elle soit plus stricte

DROP FUNCTION IF EXISTS search_listings(TEXT, UUID, UUID, TEXT, TEXT, NUMERIC, NUMERIC, TEXT);

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
BEGIN
  search_term := TRIM(search_term);
  search_words := string_to_array(LOWER(search_term), ' ');

  RETURN QUERY
  WITH scored_listings AS (
    SELECT
      l.id, l.title, l.description, l.price, l.category_id, l.subcategory_id,
      l.wilaya, l.commune, l.images, l.status, l.listing_type, l.user_id,
      l.created_at, l.updated_at, l.views_count, l.attributes, l.is_featured,
      l.condition, l.is_negotiable,
      (
        CASE
          WHEN LOWER(l.title) = LOWER(search_term) THEN 100
          WHEN LOWER(l.title) LIKE LOWER(search_term) || '%' THEN 50
          WHEN LOWER(l.title) LIKE '%' || LOWER(search_term) || '%' THEN 30
          ELSE 0
        END
        +
        CASE
          WHEN LOWER(l.description) LIKE '%' || LOWER(search_term) || '%' THEN 10
          ELSE 0
        END
        +
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
        (
          SELECT COALESCE(SUM(
            CASE
              WHEN LOWER(l.title) LIKE '%' || w.search_word || '%' THEN 5
              WHEN LOWER(l.description) LIKE '%' || w.search_word || '%' THEN 2
              ELSE 0
            END
          ), 0)
          FROM unnest(search_words) AS w(search_word)
          WHERE LENGTH(w.search_word) > 3
        )
        +
        CASE WHEN l.is_featured = true THEN 15 ELSE 0 END
        +
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
        LOWER(l.title) LIKE '%' || LOWER(search_term) || '%'
        OR LOWER(l.description) LIKE '%' || LOWER(search_term) || '%'
        OR (l.attributes->>'brand_name' IS NOT NULL
          AND LOWER(l.attributes->>'brand_name') LIKE '%' || LOWER(search_term) || '%')
        OR (l.attributes->>'model_name' IS NOT NULL
          AND LOWER(l.attributes->>'model_name') LIKE '%' || LOWER(search_term) || '%')
      )
      AND (category_filter IS NULL OR l.category_id = category_filter)
      AND (subcategory_filter IS NULL OR l.subcategory_id = subcategory_filter)
      AND (wilaya_filter IS NULL OR l.wilaya = wilaya_filter)
      AND (commune_filter IS NULL OR l.commune = commune_filter)
      AND (min_price_filter IS NULL OR l.price >= min_price_filter)
      AND (max_price_filter IS NULL OR l.price <= max_price_filter)
      AND (listing_type_filter IS NULL OR l.listing_type = listing_type_filter)
  )
  SELECT * FROM scored_listings
  WHERE scored_listings.relevance > 0
  ORDER BY scored_listings.relevance DESC, scored_listings.created_at DESC
  LIMIT 200;
END;
$$;
