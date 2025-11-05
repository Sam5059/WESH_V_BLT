/*
  # Restructuration complète des annonces avec champs dédiés par catégorie

  ## Problème résolu
  - La recherche ne fonctionne pas car les données sont mal structurées
  - brand_name et model_name dans attributes JSONB sont souvent vides
  - Impossible de créer des index efficaces sur JSONB

  ## Solution
  - Créer des champs dédiés pour chaque type de catégorie
  - Supprimer la dépendance au champ attributes JSONB
  - Permettre une recherche structurée et performante

  ## Nouveaux champs par catégorie

  ### Véhicules (voitures, motos, camions)
  - vehicle_brand (text) - Marque du véhicule
  - vehicle_model (text) - Modèle du véhicule
  - vehicle_year (integer) - Année de fabrication
  - vehicle_mileage (integer) - Kilométrage
  - vehicle_fuel_type (text) - Type de carburant
  - vehicle_transmission (text) - Type de transmission
  - vehicle_color (text) - Couleur

  ### Immobilier
  - property_type (text) - Type: appartement, maison, terrain, etc.
  - property_surface (numeric) - Surface en m²
  - property_rooms (integer) - Nombre de pièces
  - property_floor (integer) - Étage
  - property_furnished (boolean) - Meublé ou non

  ### Électronique
  - electronics_brand (text) - Marque
  - electronics_model (text) - Modèle
  - electronics_storage (text) - Capacité de stockage
  - electronics_ram (text) - Mémoire RAM
  - electronics_screen_size (text) - Taille d'écran

  ### Emploi & Services
  - job_type (text) - Type de contrat
  - job_experience (text) - Expérience requise
  - job_education (text) - Niveau d'études
  - service_type (text) - Type de service
*/

-- ============================================================================
-- ÉTAPE 1: Ajouter les nouveaux champs à la table listings
-- ============================================================================

-- Champs pour VÉHICULES
ALTER TABLE listings
ADD COLUMN IF NOT EXISTS vehicle_brand TEXT,
ADD COLUMN IF NOT EXISTS vehicle_model TEXT,
ADD COLUMN IF NOT EXISTS vehicle_year INTEGER,
ADD COLUMN IF NOT EXISTS vehicle_mileage INTEGER,
ADD COLUMN IF NOT EXISTS vehicle_fuel_type TEXT,
ADD COLUMN IF NOT EXISTS vehicle_transmission TEXT,
ADD COLUMN IF NOT EXISTS vehicle_color TEXT,
ADD COLUMN IF NOT EXISTS vehicle_doors INTEGER,
ADD COLUMN IF NOT EXISTS vehicle_seats INTEGER;

-- Champs pour IMMOBILIER
ALTER TABLE listings
ADD COLUMN IF NOT EXISTS property_type TEXT,
ADD COLUMN IF NOT EXISTS property_surface NUMERIC,
ADD COLUMN IF NOT EXISTS property_rooms INTEGER,
ADD COLUMN IF NOT EXISTS property_bedrooms INTEGER,
ADD COLUMN IF NOT EXISTS property_bathrooms INTEGER,
ADD COLUMN IF NOT EXISTS property_floor INTEGER,
ADD COLUMN IF NOT EXISTS property_total_floors INTEGER,
ADD COLUMN IF NOT EXISTS property_furnished BOOLEAN,
ADD COLUMN IF NOT EXISTS property_parking BOOLEAN,
ADD COLUMN IF NOT EXISTS property_elevator BOOLEAN,
ADD COLUMN IF NOT EXISTS property_balcony BOOLEAN,
ADD COLUMN IF NOT EXISTS property_garage BOOLEAN;

-- Champs pour ÉLECTRONIQUE
ALTER TABLE listings
ADD COLUMN IF NOT EXISTS electronics_brand TEXT,
ADD COLUMN IF NOT EXISTS electronics_model TEXT,
ADD COLUMN IF NOT EXISTS electronics_storage TEXT,
ADD COLUMN IF NOT EXISTS electronics_ram TEXT,
ADD COLUMN IF NOT EXISTS electronics_screen_size TEXT,
ADD COLUMN IF NOT EXISTS electronics_processor TEXT,
ADD COLUMN IF NOT EXISTS electronics_battery TEXT,
ADD COLUMN IF NOT EXISTS electronics_camera TEXT;

-- Champs pour EMPLOI & SERVICES
ALTER TABLE listings
ADD COLUMN IF NOT EXISTS job_type TEXT,
ADD COLUMN IF NOT EXISTS job_contract_type TEXT,
ADD COLUMN IF NOT EXISTS job_experience TEXT,
ADD COLUMN IF NOT EXISTS job_education TEXT,
ADD COLUMN IF NOT EXISTS job_salary_min NUMERIC,
ADD COLUMN IF NOT EXISTS job_salary_max NUMERIC,
ADD COLUMN IF NOT EXISTS service_type TEXT,
ADD COLUMN IF NOT EXISTS service_duration TEXT;

-- Champs pour ANIMAUX
ALTER TABLE listings
ADD COLUMN IF NOT EXISTS animal_type TEXT,
ADD COLUMN IF NOT EXISTS animal_breed TEXT,
ADD COLUMN IF NOT EXISTS animal_age TEXT,
ADD COLUMN IF NOT EXISTS animal_gender TEXT,
ADD COLUMN IF NOT EXISTS animal_vaccinated BOOLEAN;

-- Champs pour MODE & VÊTEMENTS
ALTER TABLE listings
ADD COLUMN IF NOT EXISTS clothing_brand TEXT,
ADD COLUMN IF NOT EXISTS clothing_size TEXT,
ADD COLUMN IF NOT EXISTS clothing_gender TEXT,
ADD COLUMN IF NOT EXISTS clothing_material TEXT;

-- ============================================================================
-- ÉTAPE 2: Créer des INDEX pour optimiser les recherches
-- ============================================================================

-- Index pour véhicules
CREATE INDEX IF NOT EXISTS idx_listings_vehicle_brand ON listings(vehicle_brand) WHERE vehicle_brand IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_listings_vehicle_model ON listings(vehicle_model) WHERE vehicle_model IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_listings_vehicle_year ON listings(vehicle_year) WHERE vehicle_year IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_listings_vehicle_fuel ON listings(vehicle_fuel_type) WHERE vehicle_fuel_type IS NOT NULL;

-- Index pour immobilier
CREATE INDEX IF NOT EXISTS idx_listings_property_type ON listings(property_type) WHERE property_type IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_listings_property_surface ON listings(property_surface) WHERE property_surface IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_listings_property_rooms ON listings(property_rooms) WHERE property_rooms IS NOT NULL;

-- Index pour électronique
CREATE INDEX IF NOT EXISTS idx_listings_electronics_brand ON listings(electronics_brand) WHERE electronics_brand IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_listings_electronics_model ON listings(electronics_model) WHERE electronics_model IS NOT NULL;

-- Index combinés pour recherches fréquentes
CREATE INDEX IF NOT EXISTS idx_listings_category_vehicle ON listings(category_id, vehicle_brand, vehicle_model)
WHERE vehicle_brand IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_listings_category_property ON listings(category_id, property_type, property_rooms)
WHERE property_type IS NOT NULL;

-- ============================================================================
-- ÉTAPE 3: Migrer les données existantes du JSONB vers les nouveaux champs
-- ============================================================================

-- Migration des véhicules
UPDATE listings
SET
  vehicle_brand = attributes->>'brand_name',
  vehicle_model = attributes->>'model_name',
  vehicle_year = NULLIF(attributes->>'year', '')::INTEGER,
  vehicle_mileage = NULLIF(attributes->>'mileage', '')::INTEGER,
  vehicle_fuel_type = attributes->>'fuel_type',
  vehicle_transmission = attributes->>'transmission',
  vehicle_color = attributes->>'color'
WHERE category_id IN (
  SELECT id FROM categories WHERE slug IN ('voitures', 'motos', 'camions', 'vehicules')
)
AND (attributes->>'brand_name' IS NOT NULL OR attributes->>'model_name' IS NOT NULL);

-- Migration de l'électronique
UPDATE listings
SET
  electronics_brand = attributes->>'brand_name',
  electronics_model = attributes->>'model_name',
  electronics_storage = attributes->>'storage',
  electronics_ram = attributes->>'ram',
  electronics_screen_size = attributes->>'screen_size'
WHERE category_id IN (
  SELECT id FROM categories WHERE slug IN ('telephones', 'ordinateurs', 'tablettes', 'electronique')
)
AND (attributes->>'brand_name' IS NOT NULL OR attributes->>'model_name' IS NOT NULL);

-- ============================================================================
-- ÉTAPE 4: Créer la NOUVELLE fonction de recherche structurée
-- ============================================================================

CREATE OR REPLACE FUNCTION search_listings_v2(
  search_term TEXT DEFAULT NULL,
  category_filter UUID DEFAULT NULL,
  subcategory_filter UUID DEFAULT NULL,
  wilaya_filter TEXT DEFAULT NULL,
  commune_filter TEXT DEFAULT NULL,
  min_price_filter NUMERIC DEFAULT NULL,
  max_price_filter NUMERIC DEFAULT NULL,
  listing_type_filter TEXT DEFAULT NULL,
  -- Nouveaux filtres véhicules
  vehicle_brand_filter TEXT DEFAULT NULL,
  vehicle_model_filter TEXT DEFAULT NULL,
  vehicle_year_min INTEGER DEFAULT NULL,
  vehicle_year_max INTEGER DEFAULT NULL,
  vehicle_fuel_filter TEXT DEFAULT NULL,
  -- Nouveaux filtres immobilier
  property_type_filter TEXT DEFAULT NULL,
  property_rooms_min INTEGER DEFAULT NULL,
  property_surface_min NUMERIC DEFAULT NULL,
  -- Nouveaux filtres électronique
  electronics_brand_filter TEXT DEFAULT NULL
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
  is_featured BOOLEAN,
  condition TEXT,
  is_negotiable BOOLEAN,
  -- Nouveaux champs retournés
  vehicle_brand TEXT,
  vehicle_model TEXT,
  vehicle_year INTEGER,
  property_type TEXT,
  property_rooms INTEGER,
  electronics_brand TEXT,
  electronics_model TEXT,
  relevance NUMERIC
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    l.id, l.title, l.description, l.price, l.category_id, l.subcategory_id,
    l.wilaya, l.commune, l.images, l.status, l.listing_type, l.user_id,
    l.created_at, l.updated_at, l.views_count, l.is_featured, l.condition, l.is_negotiable,
    -- Nouveaux champs
    l.vehicle_brand, l.vehicle_model, l.vehicle_year,
    l.property_type, l.property_rooms,
    l.electronics_brand, l.electronics_model,
    -- Score de pertinence
    (
      -- Recherche texte dans titre
      CASE
        WHEN search_term IS NULL THEN 0
        WHEN LOWER(l.title) = LOWER(search_term) THEN 100
        WHEN LOWER(l.title) LIKE LOWER(search_term) || '%' THEN 80
        WHEN LOWER(l.title) LIKE '%' || LOWER(search_term) || '%' THEN 50
        ELSE 0
      END
      +
      -- Recherche dans description
      CASE
        WHEN search_term IS NOT NULL AND LOWER(l.description) LIKE '%' || LOWER(search_term) || '%' THEN 10
        ELSE 0
      END
      +
      -- Recherche dans champs véhicules
      CASE
        WHEN search_term IS NOT NULL AND LOWER(l.vehicle_brand) LIKE '%' || LOWER(search_term) || '%' THEN 40
        ELSE 0
      END
      +
      CASE
        WHEN search_term IS NOT NULL AND LOWER(l.vehicle_model) LIKE '%' || LOWER(search_term) || '%' THEN 30
        ELSE 0
      END
      +
      -- Recherche dans champs électronique
      CASE
        WHEN search_term IS NOT NULL AND LOWER(l.electronics_brand) LIKE '%' || LOWER(search_term) || '%' THEN 40
        ELSE 0
      END
      +
      CASE
        WHEN search_term IS NOT NULL AND LOWER(l.electronics_model) LIKE '%' || LOWER(search_term) || '%' THEN 30
        ELSE 0
      END
      +
      -- Bonus featured
      CASE WHEN l.is_featured THEN 15 ELSE 0 END
      +
      -- Bonus récent
      CASE
        WHEN l.created_at > NOW() - INTERVAL '7 days' THEN 5
        ELSE 0
      END
    )::NUMERIC as relevance
  FROM listings l
  WHERE
    l.status = 'active'
    -- Filtre recherche texte
    AND (
      search_term IS NULL
      OR LOWER(l.title) LIKE '%' || LOWER(search_term) || '%'
      OR LOWER(l.description) LIKE '%' || LOWER(search_term) || '%'
      OR LOWER(l.vehicle_brand) LIKE '%' || LOWER(search_term) || '%'
      OR LOWER(l.vehicle_model) LIKE '%' || LOWER(search_term) || '%'
      OR LOWER(l.electronics_brand) LIKE '%' || LOWER(search_term) || '%'
      OR LOWER(l.electronics_model) LIKE '%' || LOWER(search_term) || '%'
      OR LOWER(l.property_type) LIKE '%' || LOWER(search_term) || '%'
    )
    -- Filtres standards
    AND (category_filter IS NULL OR l.category_id = category_filter)
    AND (subcategory_filter IS NULL OR l.subcategory_id = subcategory_filter)
    AND (wilaya_filter IS NULL OR l.wilaya = wilaya_filter)
    AND (commune_filter IS NULL OR l.commune = commune_filter)
    AND (min_price_filter IS NULL OR l.price >= min_price_filter)
    AND (max_price_filter IS NULL OR l.price <= max_price_filter)
    AND (listing_type_filter IS NULL OR l.listing_type = listing_type_filter)
    -- Nouveaux filtres véhicules
    AND (vehicle_brand_filter IS NULL OR l.vehicle_brand = vehicle_brand_filter)
    AND (vehicle_model_filter IS NULL OR l.vehicle_model = vehicle_model_filter)
    AND (vehicle_year_min IS NULL OR l.vehicle_year >= vehicle_year_min)
    AND (vehicle_year_max IS NULL OR l.vehicle_year <= vehicle_year_max)
    AND (vehicle_fuel_filter IS NULL OR l.vehicle_fuel_type = vehicle_fuel_filter)
    -- Nouveaux filtres immobilier
    AND (property_type_filter IS NULL OR l.property_type = property_type_filter)
    AND (property_rooms_min IS NULL OR l.property_rooms >= property_rooms_min)
    AND (property_surface_min IS NULL OR l.property_surface >= property_surface_min)
    -- Nouveaux filtres électronique
    AND (electronics_brand_filter IS NULL OR l.electronics_brand = electronics_brand_filter)
  ORDER BY relevance DESC, l.created_at DESC
  LIMIT 200;
END;
$$;

-- ============================================================================
-- ÉTAPE 5: Créer une fonction pour obtenir les filtres disponibles par catégorie
-- ============================================================================

CREATE OR REPLACE FUNCTION get_category_filters(category_uuid UUID)
RETURNS TABLE (
  vehicle_brands TEXT[],
  vehicle_models TEXT[],
  vehicle_fuels TEXT[],
  property_types TEXT[],
  electronics_brands TEXT[]
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ARRAY_AGG(DISTINCT l.vehicle_brand ORDER BY l.vehicle_brand) FILTER (WHERE l.vehicle_brand IS NOT NULL),
    ARRAY_AGG(DISTINCT l.vehicle_model ORDER BY l.vehicle_model) FILTER (WHERE l.vehicle_model IS NOT NULL),
    ARRAY_AGG(DISTINCT l.vehicle_fuel_type ORDER BY l.vehicle_fuel_type) FILTER (WHERE l.vehicle_fuel_type IS NOT NULL),
    ARRAY_AGG(DISTINCT l.property_type ORDER BY l.property_type) FILTER (WHERE l.property_type IS NOT NULL),
    ARRAY_AGG(DISTINCT l.electronics_brand ORDER BY l.electronics_brand) FILTER (WHERE l.electronics_brand IS NOT NULL)
  FROM listings l
  WHERE l.category_id = category_uuid
    AND l.status = 'active';
END;
$$;

-- ============================================================================
-- Vérification de la migration
-- ============================================================================

-- Afficher les statistiques de migration
DO $$
DECLARE
  total_listings INTEGER;
  with_vehicle_brand INTEGER;
  with_electronics_brand INTEGER;
  with_property_type INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_listings FROM listings;
  SELECT COUNT(*) INTO with_vehicle_brand FROM listings WHERE vehicle_brand IS NOT NULL;
  SELECT COUNT(*) INTO with_electronics_brand FROM listings WHERE electronics_brand IS NOT NULL;
  SELECT COUNT(*) INTO with_property_type FROM listings WHERE property_type IS NOT NULL;

  RAISE NOTICE '=== STATISTIQUES DE MIGRATION ===';
  RAISE NOTICE 'Total annonces: %', total_listings;
  RAISE NOTICE 'Avec marque véhicule: %', with_vehicle_brand;
  RAISE NOTICE 'Avec marque électronique: %', with_electronics_brand;
  RAISE NOTICE 'Avec type propriété: %', with_property_type;
END $$;
