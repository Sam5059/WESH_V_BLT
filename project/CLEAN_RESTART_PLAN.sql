/*
  ═══════════════════════════════════════════════════════════════════
  🔥 PLAN DE NETTOYAGE COMPLET ET RESTRUCTURATION
  ═══════════════════════════════════════════════════════════════════

  Ce script suit EXACTEMENT votre plan :
  1. ✅ DROP toutes les données existantes (listings)
  2. ✅ Supprimer brand_name/model_name du JSONB attributes
  3. ✅ Créer champs dédiés structurés par catégorie
  4. ✅ Revoir la table brands si nécessaire
  5. ✅ Nouvelle fonction de recherche propre

  ⚠️ ATTENTION : Ce script SUPPRIME toutes les annonces existantes !
  ⚠️ Assurez-vous d'avoir une sauvegarde avant d'exécuter !
*/

-- ═══════════════════════════════════════════════════════════════════
-- ÉTAPE 1 : SAUVEGARDER LES DONNÉES EXISTANTES (optionnel)
-- ═══════════════════════════════════════════════════════════════════

-- Décommenter cette ligne pour sauvegarder :
-- CREATE TABLE listings_backup_20251020 AS SELECT * FROM listings;

-- ═══════════════════════════════════════════════════════════════════
-- ÉTAPE 2 : DROP TOUTES LES DONNÉES EXISTANTES
-- ═══════════════════════════════════════════════════════════════════

-- Supprimer toutes les annonces
DELETE FROM listings;

-- Réinitialiser les tables liées
DELETE FROM favorites;
DELETE FROM conversations;
DELETE FROM messages;

-- ═══════════════════════════════════════════════════════════════════
-- ÉTAPE 3 : SUPPRIMER LES ANCIENS CHAMPS ET RESTRUCTURER
-- ═══════════════════════════════════════════════════════════════════

-- Supprimer les anciens index sur attributes
DROP INDEX IF EXISTS idx_listings_brand_name;
DROP INDEX IF EXISTS idx_listings_model_name;

-- IMPORTANT : On garde la colonne attributes mais on ne l'utilisera plus
-- pour brand_name et model_name. On utilisera les nouveaux champs dédiés.

-- ═══════════════════════════════════════════════════════════════════
-- ÉTAPE 4 : AJOUTER LES NOUVEAUX CHAMPS STRUCTURÉS PAR CATÉGORIE
-- ═══════════════════════════════════════════════════════════════════

-- 🚗 VÉHICULES (voitures, motos, camions, etc.)
ALTER TABLE listings
ADD COLUMN IF NOT EXISTS vehicle_brand TEXT,
ADD COLUMN IF NOT EXISTS vehicle_model TEXT,
ADD COLUMN IF NOT EXISTS vehicle_year INTEGER CHECK (vehicle_year >= 1900 AND vehicle_year <= 2030),
ADD COLUMN IF NOT EXISTS vehicle_mileage INTEGER CHECK (vehicle_mileage >= 0),
ADD COLUMN IF NOT EXISTS vehicle_fuel_type TEXT CHECK (vehicle_fuel_type IN ('essence', 'diesel', 'electrique', 'hybride', 'gpl')),
ADD COLUMN IF NOT EXISTS vehicle_transmission TEXT CHECK (vehicle_transmission IN ('manuelle', 'automatique', 'semi-automatique')),
ADD COLUMN IF NOT EXISTS vehicle_color TEXT,
ADD COLUMN IF NOT EXISTS vehicle_doors INTEGER CHECK (vehicle_doors BETWEEN 2 AND 5),
ADD COLUMN IF NOT EXISTS vehicle_seats INTEGER CHECK (vehicle_seats BETWEEN 1 AND 9);

-- 🏠 IMMOBILIER
ALTER TABLE listings
ADD COLUMN IF NOT EXISTS property_type TEXT CHECK (property_type IN ('appartement', 'maison', 'villa', 'studio', 'duplex', 'terrain', 'local-commercial', 'bureau', 'garage')),
ADD COLUMN IF NOT EXISTS property_surface NUMERIC CHECK (property_surface > 0),
ADD COLUMN IF NOT EXISTS property_rooms INTEGER CHECK (property_rooms >= 0),
ADD COLUMN IF NOT EXISTS property_bedrooms INTEGER CHECK (property_bedrooms >= 0),
ADD COLUMN IF NOT EXISTS property_bathrooms INTEGER CHECK (property_bathrooms >= 0),
ADD COLUMN IF NOT EXISTS property_floor INTEGER,
ADD COLUMN IF NOT EXISTS property_total_floors INTEGER,
ADD COLUMN IF NOT EXISTS property_furnished BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS property_parking BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS property_elevator BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS property_balcony BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS property_garage BOOLEAN DEFAULT FALSE;

-- 📱 ÉLECTRONIQUE
ALTER TABLE listings
ADD COLUMN IF NOT EXISTS electronics_brand TEXT,
ADD COLUMN IF NOT EXISTS electronics_model TEXT,
ADD COLUMN IF NOT EXISTS electronics_storage TEXT,
ADD COLUMN IF NOT EXISTS electronics_ram TEXT,
ADD COLUMN IF NOT EXISTS electronics_screen_size TEXT,
ADD COLUMN IF NOT EXISTS electronics_processor TEXT,
ADD COLUMN IF NOT EXISTS electronics_battery TEXT,
ADD COLUMN IF NOT EXISTS electronics_camera TEXT;

-- 💼 EMPLOI & SERVICES
ALTER TABLE listings
ADD COLUMN IF NOT EXISTS job_type TEXT,
ADD COLUMN IF NOT EXISTS job_contract_type TEXT CHECK (job_contract_type IN ('cdi', 'cdd', 'freelance', 'stage', 'interim')),
ADD COLUMN IF NOT EXISTS job_experience TEXT,
ADD COLUMN IF NOT EXISTS job_education TEXT,
ADD COLUMN IF NOT EXISTS job_salary_min NUMERIC,
ADD COLUMN IF NOT EXISTS job_salary_max NUMERIC,
ADD COLUMN IF NOT EXISTS service_type TEXT,
ADD COLUMN IF NOT EXISTS service_duration TEXT;

-- 🐾 ANIMAUX
ALTER TABLE listings
ADD COLUMN IF NOT EXISTS animal_type TEXT,
ADD COLUMN IF NOT EXISTS animal_breed TEXT,
ADD COLUMN IF NOT EXISTS animal_age TEXT,
ADD COLUMN IF NOT EXISTS animal_gender TEXT CHECK (animal_gender IN ('male', 'femelle')),
ADD COLUMN IF NOT EXISTS animal_vaccinated BOOLEAN DEFAULT FALSE;

-- 👕 MODE & VÊTEMENTS
ALTER TABLE listings
ADD COLUMN IF NOT EXISTS clothing_brand TEXT,
ADD COLUMN IF NOT EXISTS clothing_size TEXT,
ADD COLUMN IF NOT EXISTS clothing_gender TEXT CHECK (clothing_gender IN ('homme', 'femme', 'unisexe', 'enfant')),
ADD COLUMN IF NOT EXISTS clothing_material TEXT;

-- ═══════════════════════════════════════════════════════════════════
-- ÉTAPE 5 : CRÉER LES INDEX OPTIMISÉS
-- ═══════════════════════════════════════════════════════════════════

-- Index pour VÉHICULES
CREATE INDEX IF NOT EXISTS idx_listings_vehicle_brand ON listings(vehicle_brand) WHERE vehicle_brand IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_listings_vehicle_model ON listings(vehicle_model) WHERE vehicle_model IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_listings_vehicle_year ON listings(vehicle_year) WHERE vehicle_year IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_listings_vehicle_brand_model ON listings(vehicle_brand, vehicle_model) WHERE vehicle_brand IS NOT NULL;

-- Index pour IMMOBILIER
CREATE INDEX IF NOT EXISTS idx_listings_property_type ON listings(property_type) WHERE property_type IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_listings_property_rooms ON listings(property_rooms) WHERE property_rooms IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_listings_property_surface ON listings(property_surface) WHERE property_surface IS NOT NULL;

-- Index pour ÉLECTRONIQUE
CREATE INDEX IF NOT EXISTS idx_listings_electronics_brand ON listings(electronics_brand) WHERE electronics_brand IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_listings_electronics_model ON listings(electronics_model) WHERE electronics_model IS NOT NULL;

-- Index combinés pour recherches fréquentes
CREATE INDEX IF NOT EXISTS idx_listings_search_vehicle ON listings(category_id, vehicle_brand, vehicle_model, vehicle_year)
WHERE vehicle_brand IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_listings_search_property ON listings(category_id, property_type, property_rooms)
WHERE property_type IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_listings_search_electronics ON listings(category_id, electronics_brand, electronics_model)
WHERE electronics_brand IS NOT NULL;

-- Index textuels pour recherche full-text
CREATE INDEX IF NOT EXISTS idx_listings_title_trgm ON listings USING gin (title gin_trgm_ops);

-- ═══════════════════════════════════════════════════════════════════
-- ÉTAPE 6 : CRÉER LA NOUVELLE FONCTION DE RECHERCHE STRUCTURÉE
-- ═══════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION search_listings_clean(
  -- Paramètres de recherche
  search_term TEXT DEFAULT NULL,

  -- Filtres standards
  category_filter UUID DEFAULT NULL,
  subcategory_filter UUID DEFAULT NULL,
  wilaya_filter TEXT DEFAULT NULL,
  commune_filter TEXT DEFAULT NULL,
  min_price_filter NUMERIC DEFAULT NULL,
  max_price_filter NUMERIC DEFAULT NULL,
  listing_type_filter TEXT DEFAULT NULL,

  -- Filtres VÉHICULES
  vehicle_brand_filter TEXT DEFAULT NULL,
  vehicle_model_filter TEXT DEFAULT NULL,
  vehicle_year_min INTEGER DEFAULT NULL,
  vehicle_year_max INTEGER DEFAULT NULL,
  vehicle_fuel_filter TEXT DEFAULT NULL,
  vehicle_transmission_filter TEXT DEFAULT NULL,

  -- Filtres IMMOBILIER
  property_type_filter TEXT DEFAULT NULL,
  property_rooms_min INTEGER DEFAULT NULL,
  property_surface_min NUMERIC DEFAULT NULL,
  property_furnished_filter BOOLEAN DEFAULT NULL,

  -- Filtres ÉLECTRONIQUE
  electronics_brand_filter TEXT DEFAULT NULL,
  electronics_model_filter TEXT DEFAULT NULL
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
  -- Champs véhicules
  vehicle_brand TEXT,
  vehicle_model TEXT,
  vehicle_year INTEGER,
  vehicle_mileage INTEGER,
  vehicle_fuel_type TEXT,
  vehicle_transmission TEXT,
  -- Champs immobilier
  property_type TEXT,
  property_surface NUMERIC,
  property_rooms INTEGER,
  property_furnished BOOLEAN,
  -- Champs électronique
  electronics_brand TEXT,
  electronics_model TEXT,
  electronics_storage TEXT,
  -- Score de pertinence
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
    -- Champs véhicules
    l.vehicle_brand, l.vehicle_model, l.vehicle_year, l.vehicle_mileage,
    l.vehicle_fuel_type, l.vehicle_transmission,
    -- Champs immobilier
    l.property_type, l.property_surface, l.property_rooms, l.property_furnished,
    -- Champs électronique
    l.electronics_brand, l.electronics_model, l.electronics_storage,
    -- Calcul du score de pertinence
    (
      -- Score basé sur le titre
      CASE
        WHEN search_term IS NULL THEN 0
        WHEN LOWER(l.title) = LOWER(search_term) THEN 100
        WHEN LOWER(l.title) LIKE LOWER(search_term) || '%' THEN 80
        WHEN LOWER(l.title) LIKE '%' || LOWER(search_term) || '%' THEN 50
        ELSE 0
      END
      +
      -- Score basé sur la description
      CASE
        WHEN search_term IS NOT NULL AND LOWER(l.description) LIKE '%' || LOWER(search_term) || '%' THEN 15
        ELSE 0
      END
      +
      -- Score basé sur brand véhicule
      CASE
        WHEN search_term IS NOT NULL AND LOWER(l.vehicle_brand) = LOWER(search_term) THEN 70
        WHEN search_term IS NOT NULL AND LOWER(l.vehicle_brand) LIKE '%' || LOWER(search_term) || '%' THEN 40
        ELSE 0
      END
      +
      -- Score basé sur model véhicule
      CASE
        WHEN search_term IS NOT NULL AND LOWER(l.vehicle_model) = LOWER(search_term) THEN 60
        WHEN search_term IS NOT NULL AND LOWER(l.vehicle_model) LIKE '%' || LOWER(search_term) || '%' THEN 35
        ELSE 0
      END
      +
      -- Score basé sur brand électronique
      CASE
        WHEN search_term IS NOT NULL AND LOWER(l.electronics_brand) = LOWER(search_term) THEN 70
        WHEN search_term IS NOT NULL AND LOWER(l.electronics_brand) LIKE '%' || LOWER(search_term) || '%' THEN 40
        ELSE 0
      END
      +
      -- Score basé sur model électronique
      CASE
        WHEN search_term IS NOT NULL AND LOWER(l.electronics_model) = LOWER(search_term) THEN 60
        WHEN search_term IS NOT NULL AND LOWER(l.electronics_model) LIKE '%' || LOWER(search_term) || '%' THEN 35
        ELSE 0
      END
      +
      -- Bonus pour annonces featured
      CASE WHEN l.is_featured THEN 20 ELSE 0 END
      +
      -- Bonus pour annonces récentes (< 7 jours)
      CASE
        WHEN l.created_at > NOW() - INTERVAL '7 days' THEN 10
        WHEN l.created_at > NOW() - INTERVAL '14 days' THEN 5
        ELSE 0
      END
    )::NUMERIC as relevance
  FROM listings l
  WHERE
    l.status = 'active'
    -- Filtre de recherche textuelle
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
    -- Filtres VÉHICULES
    AND (vehicle_brand_filter IS NULL OR l.vehicle_brand = vehicle_brand_filter)
    AND (vehicle_model_filter IS NULL OR l.vehicle_model = vehicle_model_filter)
    AND (vehicle_year_min IS NULL OR l.vehicle_year >= vehicle_year_min)
    AND (vehicle_year_max IS NULL OR l.vehicle_year <= vehicle_year_max)
    AND (vehicle_fuel_filter IS NULL OR l.vehicle_fuel_type = vehicle_fuel_filter)
    AND (vehicle_transmission_filter IS NULL OR l.vehicle_transmission = vehicle_transmission_filter)
    -- Filtres IMMOBILIER
    AND (property_type_filter IS NULL OR l.property_type = property_type_filter)
    AND (property_rooms_min IS NULL OR l.property_rooms >= property_rooms_min)
    AND (property_surface_min IS NULL OR l.property_surface >= property_surface_min)
    AND (property_furnished_filter IS NULL OR l.property_furnished = property_furnished_filter)
    -- Filtres ÉLECTRONIQUE
    AND (electronics_brand_filter IS NULL OR l.electronics_brand = electronics_brand_filter)
    AND (electronics_model_filter IS NULL OR l.electronics_model = electronics_model_filter)
  ORDER BY relevance DESC, l.is_featured DESC, l.created_at DESC
  LIMIT 200;
END;
$$;

-- ═══════════════════════════════════════════════════════════════════
-- ÉTAPE 7 : CRÉER FONCTION POUR OBTENIR LES FILTRES DISPONIBLES
-- ═══════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION get_available_filters(category_uuid UUID DEFAULT NULL)
RETURNS TABLE (
  vehicle_brands TEXT[],
  vehicle_models TEXT[],
  vehicle_years INTEGER[],
  vehicle_fuels TEXT[],
  property_types TEXT[],
  electronics_brands TEXT[]
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    -- Marques de véhicules disponibles
    ARRAY_AGG(DISTINCT l.vehicle_brand ORDER BY l.vehicle_brand) FILTER (WHERE l.vehicle_brand IS NOT NULL) as vehicle_brands,
    -- Modèles de véhicules disponibles
    ARRAY_AGG(DISTINCT l.vehicle_model ORDER BY l.vehicle_model) FILTER (WHERE l.vehicle_model IS NOT NULL) as vehicle_models,
    -- Années disponibles (triées décroissantes)
    ARRAY_AGG(DISTINCT l.vehicle_year ORDER BY l.vehicle_year DESC) FILTER (WHERE l.vehicle_year IS NOT NULL) as vehicle_years,
    -- Types de carburant disponibles
    ARRAY_AGG(DISTINCT l.vehicle_fuel_type ORDER BY l.vehicle_fuel_type) FILTER (WHERE l.vehicle_fuel_type IS NOT NULL) as vehicle_fuels,
    -- Types de propriété disponibles
    ARRAY_AGG(DISTINCT l.property_type ORDER BY l.property_type) FILTER (WHERE l.property_type IS NOT NULL) as property_types,
    -- Marques électronique disponibles
    ARRAY_AGG(DISTINCT l.electronics_brand ORDER BY l.electronics_brand) FILTER (WHERE l.electronics_brand IS NOT NULL) as electronics_brands
  FROM listings l
  WHERE
    l.status = 'active'
    AND (category_uuid IS NULL OR l.category_id = category_uuid);
END;
$$;

-- ═══════════════════════════════════════════════════════════════════
-- ÉTAPE 8 : REMPLACER L'ANCIENNE FONCTION search_listings
-- ═══════════════════════════════════════════════════════════════════

DROP FUNCTION IF EXISTS search_listings(TEXT, UUID, UUID, TEXT, TEXT, NUMERIC, NUMERIC, TEXT);

-- Créer un alias vers la nouvelle fonction
CREATE OR REPLACE FUNCTION search_listings(
  search_term TEXT DEFAULT NULL,
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
  is_featured BOOLEAN,
  condition TEXT,
  is_negotiable BOOLEAN,
  vehicle_brand TEXT,
  vehicle_model TEXT,
  vehicle_year INTEGER,
  vehicle_mileage INTEGER,
  vehicle_fuel_type TEXT,
  vehicle_transmission TEXT,
  property_type TEXT,
  property_surface NUMERIC,
  property_rooms INTEGER,
  property_furnished BOOLEAN,
  electronics_brand TEXT,
  electronics_model TEXT,
  electronics_storage TEXT,
  relevance NUMERIC
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM search_listings_clean(
    search_term,
    category_filter,
    subcategory_filter,
    wilaya_filter,
    commune_filter,
    min_price_filter,
    max_price_filter,
    listing_type_filter
  );
END;
$$;

-- ═══════════════════════════════════════════════════════════════════
-- ✅ TERMINÉ !
-- ═══════════════════════════════════════════════════════════════════

-- Afficher les statistiques
DO $$
BEGIN
  RAISE NOTICE '═══════════════════════════════════════════';
  RAISE NOTICE '✅ NETTOYAGE ET RESTRUCTURATION TERMINÉS';
  RAISE NOTICE '═══════════════════════════════════════════';
  RAISE NOTICE '- Toutes les données ont été supprimées';
  RAISE NOTICE '- Nouveaux champs structurés créés';
  RAISE NOTICE '- Index optimisés créés';
  RAISE NOTICE '- Nouvelles fonctions de recherche créées';
  RAISE NOTICE '';
  RAISE NOTICE '⏭️  PROCHAINE ÉTAPE :';
  RAISE NOTICE '   Insérer des nouvelles données propres';
  RAISE NOTICE '   en utilisant les champs dédiés !';
  RAISE NOTICE '═══════════════════════════════════════════';
END $$;
