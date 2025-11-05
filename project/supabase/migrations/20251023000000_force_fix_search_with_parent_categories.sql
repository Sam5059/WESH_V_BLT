/*
  # Force fix search function for parent categories

  This migration ensures the search_listings function properly handles parent category filtering.
  When a parent category ID is passed, it should find all listings in its subcategories.

  ## Key Changes
  - Drop and recreate search_listings function
  - When category_filter is provided (parent category), fetch all subcategories
  - Search listings where category_id matches any subcategory
*/

-- Drop existing function with all possible signatures
DROP FUNCTION IF EXISTS search_listings(TEXT, UUID, UUID, TEXT, TEXT, NUMERIC, NUMERIC, TEXT);
DROP FUNCTION IF EXISTS search_listings;

-- Recreate with proper parent category handling
CREATE OR REPLACE FUNCTION search_listings(
  search_term TEXT DEFAULT '',
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
SECURITY DEFINER
AS $$
DECLARE
  search_words TEXT[];
  is_empty_search BOOLEAN;
  subcategory_ids UUID[];
  parent_category_name TEXT;
BEGIN
  -- Clean search term
  search_term := TRIM(COALESCE(search_term, ''));
  is_empty_search := (search_term = '' OR search_term = '%');

  -- Prepare search words if not empty
  IF NOT is_empty_search THEN
    search_words := string_to_array(LOWER(search_term), ' ');
  END IF;

  -- CRITICAL: Handle parent category by finding all subcategories
  IF category_filter IS NOT NULL AND subcategory_filter IS NULL THEN
    -- Get subcategories of this parent category
    SELECT ARRAY_AGG(c.id) INTO subcategory_ids
    FROM categories c
    WHERE c.parent_id = category_filter;

    -- Debug log
    SELECT name INTO parent_category_name FROM categories WHERE id = category_filter;
    RAISE NOTICE 'Parent category: % (%), found % subcategories',
      parent_category_name, category_filter, COALESCE(array_length(subcategory_ids, 1), 0);

    -- If no subcategories found, maybe it's already a subcategory itself
    IF subcategory_ids IS NULL OR array_length(subcategory_ids, 1) IS NULL THEN
      subcategory_ids := ARRAY[category_filter];
      RAISE NOTICE 'No subcategories found, treating as subcategory itself';
    END IF;
  END IF;

  -- If subcategory_filter provided, use it directly
  IF subcategory_filter IS NOT NULL THEN
    subcategory_ids := ARRAY[subcategory_filter];
    RAISE NOTICE 'Using direct subcategory filter: %', subcategory_filter;
  END IF;

  -- Log the final subcategory_ids
  RAISE NOTICE 'Final subcategory_ids: %', subcategory_ids;

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
    -- Relevance calculation
    CASE
      WHEN is_empty_search THEN
        (CASE WHEN l.is_featured THEN 100 ELSE 0 END +
         CASE WHEN l.created_at > NOW() - INTERVAL '7 days' THEN 10 ELSE 0 END)::NUMERIC
      ELSE
        (
          CASE
            WHEN LOWER(l.title) = LOWER(search_term) THEN 100
            WHEN LOWER(l.title) LIKE LOWER(search_term) || '%' THEN 50
            WHEN LOWER(l.title) LIKE '%' || LOWER(search_term) || '%' THEN 30
            ELSE 0
          END
          +
          CASE WHEN LOWER(l.description) LIKE '%' || LOWER(search_term) || '%' THEN 10 ELSE 0 END
          +
          CASE
            WHEN l.attributes->>'brand_name' IS NOT NULL
              AND LOWER(l.attributes->>'brand_name') LIKE '%' || LOWER(search_term) || '%' THEN 25
            ELSE 0
          END
          +
          CASE
            WHEN l.attributes->>'model_name' IS NOT NULL
              AND LOWER(l.attributes->>'model_name') LIKE '%' || LOWER(search_term) || '%' THEN 25
            ELSE 0
          END
          +
          CASE
            WHEN l.attributes IS NOT NULL
              AND LOWER(l.attributes::text) LIKE '%' || LOWER(search_term) || '%' THEN 20
            ELSE 0
          END
          +
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
          CASE WHEN l.is_featured = true THEN 15 ELSE 0 END
          +
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
      is_empty_search
      OR
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
    -- CRITICAL: Category filter using subcategory_ids
    -- listings.category_id should match one of the subcategory IDs
    AND (
      subcategory_ids IS NULL
      OR l.category_id = ANY(subcategory_ids)
    )
    AND (wilaya_filter IS NULL OR l.wilaya = wilaya_filter)
    AND (commune_filter IS NULL OR l.commune = commune_filter)
    AND (min_price_filter IS NULL OR l.price >= min_price_filter)
    AND (max_price_filter IS NULL OR l.price <= max_price_filter)
    AND (listing_type_filter IS NULL OR l.listing_type = listing_type_filter)
  ORDER BY relevance DESC, l.created_at DESC
  LIMIT 200;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION search_listings TO authenticated, anon;

-- Add helpful comment
COMMENT ON FUNCTION search_listings IS 'Search listings with parent category support. When category_filter is a parent category ID, it automatically searches all its subcategories.';
