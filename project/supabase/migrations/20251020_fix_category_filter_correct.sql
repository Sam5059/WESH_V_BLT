/*
  # Correction FINALE du filtre de catégorie

  ## Nouvelle structure
  Après la restructuration, la table listings a :
  - category_id → Pointe vers la CATÉGORIE PARENTE (Véhicules, Immobilier, etc.)
  - subcategory_id → Pointe vers la SOUS-CATÉGORIE (Voitures, Appartements, etc.)

  ## Logique correcte
  Quand on filtre par category_filter :
  - Si c'est une catégorie parente → Chercher où l.category_id = category_filter
  - Si c'est une sous-catégorie → Chercher où l.subcategory_id = category_filter

  ## Solution
  Vérifier si category_filter est une catégorie parente ou une sous-catégorie
*/

-- Supprimer l'ancienne version
DROP FUNCTION IF EXISTS search_listings(TEXT, UUID, UUID, TEXT, TEXT, NUMERIC, NUMERIC, TEXT);

-- Créer la fonction corrigée
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
  is_parent_category BOOLEAN;
BEGIN
  -- Nettoyer le terme de recherche
  search_term := TRIM(COALESCE(search_term, ''));

  -- Vérifier si c'est une recherche vide (afficher tout)
  is_empty_search := (search_term = '' OR search_term = '%');

  -- Préparer les mots de recherche si non vide
  IF NOT is_empty_search THEN
    search_words := string_to_array(LOWER(search_term), ' ');
  END IF;

  -- Vérifier si category_filter est une catégorie parente (parent_id IS NULL)
  IF category_filter IS NOT NULL THEN
    SELECT (parent_id IS NULL) INTO is_parent_category
    FROM categories
    WHERE id = category_filter;
  ELSE
    is_parent_category := FALSE;
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
          -- Score basé sur les mots trouvés
          (
            SELECT COALESCE(SUM(
              CASE
                WHEN LOWER(l.title) LIKE '%' || w.search_word || '%' THEN 15
                WHEN LOWER(l.description) LIKE '%' || w.search_word || '%' THEN 5
                WHEN l.attributes IS NOT NULL
                  AND LOWER(l.attributes::text) LIKE '%' || w.search_word || '%' THEN 10
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
    -- ✅ NOUVELLE LOGIQUE CORRECTE
    AND (
      category_filter IS NULL
      OR (
        -- Si c'est une catégorie parente, chercher dans category_id
        (is_parent_category AND l.category_id = category_filter)
        OR
        -- Si c'est une sous-catégorie, chercher dans subcategory_id
        (NOT is_parent_category AND l.subcategory_id = category_filter)
      )
    )
    AND (subcategory_filter IS NULL OR l.subcategory_id = subcategory_filter)
    AND (wilaya_filter IS NULL OR l.wilaya = wilaya_filter)
    AND (commune_filter IS NULL OR l.commune = commune_filter)
    AND (min_price_filter IS NULL OR l.price >= min_price_filter)
    AND (max_price_filter IS NULL OR l.price <= max_price_filter)
    AND (listing_type_filter IS NULL OR l.listing_type = listing_type_filter)
  ORDER BY relevance DESC, l.created_at DESC;
END;
$$;

-- Tester la fonction
DO $$
DECLARE
  result_count INTEGER;
  vehicules_id UUID;
  immobilier_id UUID;
BEGIN
  -- Récupérer les IDs des catégories
  SELECT id INTO vehicules_id FROM categories WHERE slug = 'vehicules' AND parent_id IS NULL LIMIT 1;
  SELECT id INTO immobilier_id FROM categories WHERE slug = 'immobilier' AND parent_id IS NULL LIMIT 1;

  -- Test 1 : Recherche avec catégorie Véhicules
  IF vehicules_id IS NOT NULL THEN
    SELECT COUNT(*) INTO result_count FROM search_listings('', vehicules_id, NULL, NULL, NULL, NULL, NULL, NULL);
    RAISE NOTICE 'Test Véhicules : % annonces trouvées', result_count;
  END IF;

  -- Test 2 : Recherche avec catégorie Immobilier
  IF immobilier_id IS NOT NULL THEN
    SELECT COUNT(*) INTO result_count FROM search_listings('', immobilier_id, NULL, NULL, NULL, NULL, NULL, NULL);
    RAISE NOTICE 'Test Immobilier : % annonces trouvées', result_count;
  END IF;

  -- Test 3 : Recherche sans filtre (tout)
  SELECT COUNT(*) INTO result_count FROM search_listings('', NULL, NULL, NULL, NULL, NULL, NULL, NULL);
  RAISE NOTICE 'Test sans filtre : % annonces trouvées (total)', result_count;

  RAISE NOTICE '✅ Tests terminés !';
END $$;
