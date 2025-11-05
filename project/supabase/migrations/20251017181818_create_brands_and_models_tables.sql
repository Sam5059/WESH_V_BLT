/*
  # Création des tables brands et models pour les véhicules et électronique

  1. Tables créées
    - `brands` : Table des marques (Renault, Peugeot, Samsung, etc.)
      - `id` (uuid, clé primaire)
      - `name` (text) : Nom de la marque
      - `category_type` (text) : 'vehicles' ou 'electronics'
      - `created_at` (timestamptz)
    
    - `models` : Table des modèles par marque
      - `id` (uuid, clé primaire)
      - `brand_id` (uuid) : Référence à la marque
      - `name` (text) : Nom du modèle
      - `created_at` (timestamptz)

  2. Sécurité
    - Enable RLS sur les deux tables
    - Politique de lecture publique pour tous
    - Seuls les admins peuvent modifier (géré ailleurs)

  3. Données initiales
    - Ajout de marques de véhicules populaires en Algérie
    - Ajout de modèles pour quelques marques principales
*/

-- Create brands table
CREATE TABLE IF NOT EXISTS brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category_type text NOT NULL CHECK (category_type IN ('vehicles', 'electronics')),
  created_at timestamptz DEFAULT now()
);

-- Create models table
CREATE TABLE IF NOT EXISTS models (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id uuid NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE models ENABLE ROW LEVEL SECURITY;

-- Public read access for brands
CREATE POLICY "Brands are publicly readable"
  ON brands FOR SELECT
  TO public
  USING (true);

-- Public read access for models
CREATE POLICY "Models are publicly readable"
  ON models FOR SELECT
  TO public
  USING (true);

-- Insert vehicle brands popular in Algeria
INSERT INTO brands (name, category_type) VALUES
  ('Renault', 'vehicles'),
  ('Peugeot', 'vehicles'),
  ('Citroën', 'vehicles'),
  ('Volkswagen', 'vehicles'),
  ('Hyundai', 'vehicles'),
  ('Kia', 'vehicles'),
  ('Toyota', 'vehicles'),
  ('Nissan', 'vehicles'),
  ('Ford', 'vehicles'),
  ('Fiat', 'vehicles'),
  ('Seat', 'vehicles'),
  ('Dacia', 'vehicles'),
  ('Suzuki', 'vehicles'),
  ('Mitsubishi', 'vehicles'),
  ('Mazda', 'vehicles'),
  ('Mercedes-Benz', 'vehicles'),
  ('BMW', 'vehicles'),
  ('Audi', 'vehicles'),
  ('Opel', 'vehicles'),
  ('Chevrolet', 'vehicles'),
  ('Honda', 'vehicles'),
  ('Skoda', 'vehicles')
ON CONFLICT DO NOTHING;

-- Insert some models for popular brands
DO $$
DECLARE
  v_renault_id uuid;
  v_peugeot_id uuid;
  v_volkswagen_id uuid;
  v_toyota_id uuid;
BEGIN
  -- Get brand IDs
  SELECT id INTO v_renault_id FROM brands WHERE name = 'Renault' AND category_type = 'vehicles';
  SELECT id INTO v_peugeot_id FROM brands WHERE name = 'Peugeot' AND category_type = 'vehicles';
  SELECT id INTO v_volkswagen_id FROM brands WHERE name = 'Volkswagen' AND category_type = 'vehicles';
  SELECT id INTO v_toyota_id FROM brands WHERE name = 'Toyota' AND category_type = 'vehicles';

  -- Insert Renault models
  IF v_renault_id IS NOT NULL THEN
    INSERT INTO models (brand_id, name) VALUES
      (v_renault_id, 'Clio'),
      (v_renault_id, 'Megane'),
      (v_renault_id, 'Symbol'),
      (v_renault_id, 'Logan'),
      (v_renault_id, 'Duster'),
      (v_renault_id, 'Sandero'),
      (v_renault_id, 'Captur'),
      (v_renault_id, 'Kangoo')
    ON CONFLICT DO NOTHING;
  END IF;

  -- Insert Peugeot models
  IF v_peugeot_id IS NOT NULL THEN
    INSERT INTO models (brand_id, name) VALUES
      (v_peugeot_id, '208'),
      (v_peugeot_id, '308'),
      (v_peugeot_id, '301'),
      (v_peugeot_id, '2008'),
      (v_peugeot_id, '3008'),
      (v_peugeot_id, '508'),
      (v_peugeot_id, 'Partner')
    ON CONFLICT DO NOTHING;
  END IF;

  -- Insert Volkswagen models
  IF v_volkswagen_id IS NOT NULL THEN
    INSERT INTO models (brand_id, name) VALUES
      (v_volkswagen_id, 'Golf'),
      (v_volkswagen_id, 'Polo'),
      (v_volkswagen_id, 'Passat'),
      (v_volkswagen_id, 'Tiguan'),
      (v_volkswagen_id, 'Jetta'),
      (v_volkswagen_id, 'Caddy')
    ON CONFLICT DO NOTHING;
  END IF;

  -- Insert Toyota models
  IF v_toyota_id IS NOT NULL THEN
    INSERT INTO models (brand_id, name) VALUES
      (v_toyota_id, 'Corolla'),
      (v_toyota_id, 'Yaris'),
      (v_toyota_id, 'Hilux'),
      (v_toyota_id, 'Land Cruiser'),
      (v_toyota_id, 'Prado'),
      (v_toyota_id, 'Camry')
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- Insert electronics brands
INSERT INTO brands (name, category_type) VALUES
  ('Samsung', 'electronics'),
  ('LG', 'electronics'),
  ('Apple', 'electronics'),
  ('Sony', 'electronics'),
  ('Huawei', 'electronics'),
  ('Xiaomi', 'electronics'),
  ('Oppo', 'electronics'),
  ('Vivo', 'electronics'),
  ('Realme', 'electronics'),
  ('OnePlus', 'electronics'),
  ('Nokia', 'electronics'),
  ('Motorola', 'electronics'),
  ('HP', 'electronics'),
  ('Dell', 'electronics'),
  ('Lenovo', 'electronics'),
  ('Asus', 'electronics'),
  ('Acer', 'electronics'),
  ('Toshiba', 'electronics'),
  ('Philips', 'electronics'),
  ('Bosch', 'electronics')
ON CONFLICT DO NOTHING;