/*
  # Add Location Vacances and Location Véhicules Categories
  
  1. New Categories
    - Location Vacances (Vacation Rentals)
      - Appartements
      - Maisons
      - Studios
      - Villas
      - Bungalows
      - Chalets
      - Résidences de vacances
    
    - Location Véhicules (Vehicle Rentals)
      - Voitures
      - Motos
      - Scooters
      - Vélos
      - Camping-cars
      - Camionnettes
      - Bus et Minibus
  
  2. Features
    - High visibility with distinct icons/colors
    - Rental-specific attributes
    - Price per day/week/month options
*/

-- Insert Location Vacances parent category
INSERT INTO categories (name, name_ar, slug, parent_id, order_position) VALUES
('Location Vacances', 'تأجير عطل', 'location-vacances', NULL, 13)
ON CONFLICT (slug) DO NOTHING;

-- Get the ID of Location Vacances
DO $$
DECLARE
  location_vacances_id uuid;
BEGIN
  SELECT id INTO location_vacances_id FROM categories WHERE slug = 'location-vacances';
  
  -- Insert Location Vacances subcategories
  INSERT INTO categories (name, name_ar, slug, parent_id, order_position) VALUES
  ('Appartements', 'شقق', 'location-appartements', location_vacances_id, 1),
  ('Maisons', 'منازل', 'location-maisons', location_vacances_id, 2),
  ('Studios', 'استوديوهات', 'location-studios', location_vacances_id, 3),
  ('Villas', 'فيلات', 'location-villas', location_vacances_id, 4),
  ('Bungalows', 'بنغلات', 'location-bungalows', location_vacances_id, 5),
  ('Chalets', 'شاليهات', 'location-chalets', location_vacances_id, 6),
  ('Résidences de vacances', 'إقامات سياحية', 'location-residences', location_vacances_id, 7)
  ON CONFLICT (slug) DO NOTHING;
END $$;

-- Insert Location Véhicules parent category
INSERT INTO categories (name, name_ar, slug, parent_id, order_position) VALUES
('Location Véhicules', 'تأجير مركبات', 'location-vehicules', NULL, 14)
ON CONFLICT (slug) DO NOTHING;

-- Get the ID of Location Véhicules
DO $$
DECLARE
  location_vehicules_id uuid;
BEGIN
  SELECT id INTO location_vehicules_id FROM categories WHERE slug = 'location-vehicules';
  
  -- Insert Location Véhicules subcategories
  INSERT INTO categories (name, name_ar, slug, parent_id, order_position) VALUES
  ('Voitures', 'سيارات', 'location-voitures', location_vehicules_id, 1),
  ('Motos', 'دراجات نارية', 'location-motos', location_vehicules_id, 2),
  ('Scooters', 'سكوترات', 'location-scooters', location_vehicules_id, 3),
  ('Vélos', 'دراجات هوائية', 'location-velos', location_vehicules_id, 4),
  ('Camping-cars', 'عربات تخييم', 'location-camping-cars', location_vehicules_id, 5),
  ('Camionnettes', 'شاحنات صغيرة', 'location-camionnettes', location_vehicules_id, 6),
  ('Bus et Minibus', 'حافلات وميني باصات', 'location-bus-minibus', location_vehicules_id, 7)
  ON CONFLICT (slug) DO NOTHING;
END $$;

-- Add rental-specific attributes table if not exists
CREATE TABLE IF NOT EXISTS listing_rental_attributes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid REFERENCES listings(id) ON DELETE CASCADE NOT NULL,
  
  -- Rental period options
  price_per_day numeric,
  price_per_week numeric,
  price_per_month numeric,
  
  -- Vacation rental specific
  bedrooms integer,
  bathrooms integer,
  max_guests integer,
  surface_area numeric,
  has_wifi boolean DEFAULT false,
  has_parking boolean DEFAULT false,
  has_pool boolean DEFAULT false,
  has_air_conditioning boolean DEFAULT false,
  has_kitchen boolean DEFAULT false,
  has_tv boolean DEFAULT false,
  pet_friendly boolean DEFAULT false,
  smoking_allowed boolean DEFAULT false,
  
  -- Vehicle rental specific
  vehicle_brand text,
  vehicle_model text,
  vehicle_year integer,
  fuel_type text,
  transmission text,
  seats integer,
  mileage integer,
  has_gps boolean DEFAULT false,
  has_air_conditioning_vehicle boolean DEFAULT false,
  insurance_included boolean DEFAULT false,
  min_rental_days integer DEFAULT 1,
  
  -- Common
  available_from date,
  available_until date,
  deposit_required numeric,
  cancellation_policy text,
  additional_notes text,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE listing_rental_attributes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for listing_rental_attributes
CREATE POLICY "Anyone can view rental attributes"
  ON listing_rental_attributes FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert their rental attributes"
  ON listing_rental_attributes FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = listing_id
      AND listings.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own rental attributes"
  ON listing_rental_attributes FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = listing_id
      AND listings.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = listing_id
      AND listings.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own rental attributes"
  ON listing_rental_attributes FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = listing_id
      AND listings.user_id = auth.uid()
    )
  );

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_rental_attributes_listing_id 
  ON listing_rental_attributes(listing_id);

-- Update function for timestamp
CREATE OR REPLACE FUNCTION update_rental_attributes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_rental_attributes_timestamp
  BEFORE UPDATE ON listing_rental_attributes
  FOR EACH ROW
  EXECUTE FUNCTION update_rental_attributes_updated_at();
