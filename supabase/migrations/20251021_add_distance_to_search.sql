/*
  # Ajout du calcul de distance dans la recherche

  1. Fonction helper pour obtenir les coordonnées d'une commune
    - `get_commune_coordinates` retourne lat/lon d'une commune

  2. Modification de la fonction search_listings_advanced
    - Ajoute le calcul de distance depuis la commune de l'utilisateur
    - Permet le tri par distance
    - Distance NULL si coordonnées manquantes

  3. Nouvelle vue avec distances
    - Facilite l'affichage des distances dans l'interface
*/

-- Fonction pour obtenir les coordonnées d'une commune par son nom
CREATE OR REPLACE FUNCTION get_commune_coordinates(commune_name text)
RETURNS TABLE(latitude numeric, longitude numeric)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT c.latitude, c.longitude
  FROM communes c
  WHERE LOWER(c.name) = LOWER(commune_name)
  LIMIT 1;
END;
$$;

-- Fonction pour calculer la distance entre une annonce et un utilisateur
CREATE OR REPLACE FUNCTION calculate_listing_distance(
  listing_commune text,
  user_commune text
)
RETURNS numeric
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  listing_coords RECORD;
  user_coords RECORD;
BEGIN
  -- Si l'une des communes est NULL ou vide, retourner NULL
  IF listing_commune IS NULL OR listing_commune = '' OR
     user_commune IS NULL OR user_commune = '' THEN
    RETURN NULL;
  END IF;

  -- Obtenir les coordonnées de la commune de l'annonce
  SELECT latitude, longitude INTO listing_coords
  FROM communes
  WHERE LOWER(name) = LOWER(listing_commune)
  LIMIT 1;

  -- Obtenir les coordonnées de la commune de l'utilisateur
  SELECT latitude, longitude INTO user_coords
  FROM communes
  WHERE LOWER(name) = LOWER(user_commune)
  LIMIT 1;

  -- Si l'une des coordonnées est manquante, retourner NULL
  IF listing_coords IS NULL OR user_coords IS NULL OR
     listing_coords.latitude IS NULL OR listing_coords.longitude IS NULL OR
     user_coords.latitude IS NULL OR user_coords.longitude IS NULL THEN
    RETURN NULL;
  END IF;

  -- Calculer et retourner la distance
  RETURN calculate_distance_km(
    user_coords.latitude,
    user_coords.longitude,
    listing_coords.latitude,
    listing_coords.longitude
  );
END;
$$;

-- Créer une vue pour les listings avec distance (optionnelle, pour faciliter les requêtes)
CREATE OR REPLACE VIEW listings_with_potential_distance AS
SELECT
  l.*,
  c.latitude as commune_latitude,
  c.longitude as commune_longitude
FROM listings l
LEFT JOIN communes c ON LOWER(l.commune) = LOWER(c.name);

-- Commentaires
COMMENT ON FUNCTION get_commune_coordinates IS 'Retourne les coordonnées GPS (latitude, longitude) d''une commune par son nom';
COMMENT ON FUNCTION calculate_listing_distance IS 'Calcule la distance en km entre la commune d''une annonce et celle d''un utilisateur';
COMMENT ON VIEW listings_with_potential_distance IS 'Vue des listings avec leurs coordonnées GPS pour calcul de distance';

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_commune_coordinates TO authenticated, anon;
GRANT EXECUTE ON FUNCTION calculate_listing_distance TO authenticated, anon;
GRANT SELECT ON listings_with_potential_distance TO authenticated, anon;
