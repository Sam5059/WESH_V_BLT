/*
  # Create brands and models tables

  1. New Tables
    - `brands`
      - `id` (uuid, primary key)
      - `name` (text) - Brand name
      - `category_id` (uuid, FK) - Associated category
      - `created_at` (timestamptz)
    
    - `models`
      - `id` (uuid, primary key)
      - `brand_id` (uuid, FK) - Associated brand
      - `name` (text) - Model name
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Public read access for authenticated users
*/

-- Table: brands
CREATE TABLE IF NOT EXISTS brands (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  category_id uuid REFERENCES categories(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(name, category_id)
);

ALTER TABLE brands ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view brands"
  ON brands FOR SELECT
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_brands_category_id ON brands(category_id);

-- Table: models
CREATE TABLE IF NOT EXISTS models (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id uuid NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(brand_id, name)
);

ALTER TABLE models ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view models"
  ON models FOR SELECT
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_models_brand_id ON models(brand_id);

-- Insert vehicle brands and models
DO $$
DECLARE
  v_category_id uuid;
  v_renault_id uuid;
  v_peugeot_id uuid;
  v_citroen_id uuid;
  v_volkswagen_id uuid;
  v_toyota_id uuid;
  v_hyundai_id uuid;
  v_kia_id uuid;
  v_nissan_id uuid;
  v_dacia_id uuid;
  v_fiat_id uuid;
BEGIN
  -- Get vehicles category ID
  SELECT id INTO v_category_id FROM categories WHERE slug = 'vehicules' LIMIT 1;

  IF v_category_id IS NOT NULL THEN
    -- Insert brands
    INSERT INTO brands (name, category_id) VALUES ('Renault', v_category_id) RETURNING id INTO v_renault_id;
    INSERT INTO brands (name, category_id) VALUES ('Peugeot', v_category_id) RETURNING id INTO v_peugeot_id;
    INSERT INTO brands (name, category_id) VALUES ('Citroën', v_category_id) RETURNING id INTO v_citroen_id;
    INSERT INTO brands (name, category_id) VALUES ('Volkswagen', v_category_id) RETURNING id INTO v_volkswagen_id;
    INSERT INTO brands (name, category_id) VALUES ('Toyota', v_category_id) RETURNING id INTO v_toyota_id;
    INSERT INTO brands (name, category_id) VALUES ('Hyundai', v_category_id) RETURNING id INTO v_hyundai_id;
    INSERT INTO brands (name, category_id) VALUES ('Kia', v_category_id) RETURNING id INTO v_kia_id;
    INSERT INTO brands (name, category_id) VALUES ('Nissan', v_category_id) RETURNING id INTO v_nissan_id;
    INSERT INTO brands (name, category_id) VALUES ('Dacia', v_category_id) RETURNING id INTO v_dacia_id;
    INSERT INTO brands (name, category_id) VALUES ('Fiat', v_category_id) RETURNING id INTO v_fiat_id;

    -- Renault models
    INSERT INTO models (brand_id, name) VALUES
      (v_renault_id, 'Clio'),
      (v_renault_id, 'Clio 4'),
      (v_renault_id, 'Clio 5'),
      (v_renault_id, 'Mégane'),
      (v_renault_id, 'Symbol'),
      (v_renault_id, 'Logan'),
      (v_renault_id, 'Sandero'),
      (v_renault_id, 'Duster'),
      (v_renault_id, 'Captur'),
      (v_renault_id, 'Kangoo');

    -- Peugeot models
    INSERT INTO models (brand_id, name) VALUES
      (v_peugeot_id, '208'),
      (v_peugeot_id, '2008'),
      (v_peugeot_id, '301'),
      (v_peugeot_id, '308'),
      (v_peugeot_id, '3008'),
      (v_peugeot_id, '508'),
      (v_peugeot_id, 'Partner'),
      (v_peugeot_id, 'Expert');

    -- Citroën models
    INSERT INTO models (brand_id, name) VALUES
      (v_citroen_id, 'C3'),
      (v_citroen_id, 'C4'),
      (v_citroen_id, 'C-Elysée'),
      (v_citroen_id, 'Berlingo'),
      (v_citroen_id, 'C3 Aircross'),
      (v_citroen_id, 'C5 Aircross');

    -- Volkswagen models
    INSERT INTO models (brand_id, name) VALUES
      (v_volkswagen_id, 'Polo'),
      (v_volkswagen_id, 'Golf'),
      (v_volkswagen_id, 'Golf 7'),
      (v_volkswagen_id, 'Passat'),
      (v_volkswagen_id, 'Tiguan'),
      (v_volkswagen_id, 'Touareg'),
      (v_volkswagen_id, 'Caddy');

    -- Toyota models
    INSERT INTO models (brand_id, name) VALUES
      (v_toyota_id, 'Corolla'),
      (v_toyota_id, 'Yaris'),
      (v_toyota_id, 'Auris'),
      (v_toyota_id, 'Hilux'),
      (v_toyota_id, 'Land Cruiser'),
      (v_toyota_id, 'RAV4'),
      (v_toyota_id, 'Prado');

    -- Hyundai models
    INSERT INTO models (brand_id, name) VALUES
      (v_hyundai_id, 'i10'),
      (v_hyundai_id, 'i20'),
      (v_hyundai_id, 'Accent'),
      (v_hyundai_id, 'Elantra'),
      (v_hyundai_id, 'Tucson'),
      (v_hyundai_id, 'Santa Fe'),
      (v_hyundai_id, 'Creta');

    -- Kia models
    INSERT INTO models (brand_id, name) VALUES
      (v_kia_id, 'Picanto'),
      (v_kia_id, 'Rio'),
      (v_kia_id, 'Cerato'),
      (v_kia_id, 'Sportage'),
      (v_kia_id, 'Sorento'),
      (v_kia_id, 'Seltos');

    -- Nissan models
    INSERT INTO models (brand_id, name) VALUES
      (v_nissan_id, 'Micra'),
      (v_nissan_id, 'Sunny'),
      (v_nissan_id, 'Sentra'),
      (v_nissan_id, 'Qashqai'),
      (v_nissan_id, 'X-Trail'),
      (v_nissan_id, 'Patrol'),
      (v_nissan_id, 'Navara');

    -- Dacia models
    INSERT INTO models (brand_id, name) VALUES
      (v_dacia_id, 'Logan'),
      (v_dacia_id, 'Sandero'),
      (v_dacia_id, 'Duster'),
      (v_dacia_id, 'Dokker');

    -- Fiat models
    INSERT INTO models (brand_id, name) VALUES
      (v_fiat_id, 'Panda'),
      (v_fiat_id, 'Punto'),
      (v_fiat_id, '500'),
      (v_fiat_id, 'Tipo'),
      (v_fiat_id, 'Doblo');
  END IF;
END $$;

-- Insert electronics brands and models
DO $$
DECLARE
  v_category_id uuid;
  v_apple_id uuid;
  v_samsung_id uuid;
  v_huawei_id uuid;
  v_xiaomi_id uuid;
  v_oppo_id uuid;
  v_sony_id uuid;
  v_lg_id uuid;
BEGIN
  -- Get electronics category ID
  SELECT id INTO v_category_id FROM categories WHERE slug = 'electronique' LIMIT 1;

  IF v_category_id IS NOT NULL THEN
    -- Insert brands
    INSERT INTO brands (name, category_id) VALUES ('Apple', v_category_id) RETURNING id INTO v_apple_id;
    INSERT INTO brands (name, category_id) VALUES ('Samsung', v_category_id) RETURNING id INTO v_samsung_id;
    INSERT INTO brands (name, category_id) VALUES ('Huawei', v_category_id) RETURNING id INTO v_huawei_id;
    INSERT INTO brands (name, category_id) VALUES ('Xiaomi', v_category_id) RETURNING id INTO v_xiaomi_id;
    INSERT INTO brands (name, category_id) VALUES ('Oppo', v_category_id) RETURNING id INTO v_oppo_id;
    INSERT INTO brands (name, category_id) VALUES ('Sony', v_category_id) RETURNING id INTO v_sony_id;
    INSERT INTO brands (name, category_id) VALUES ('LG', v_category_id) RETURNING id INTO v_lg_id;

    -- Apple models
    INSERT INTO models (brand_id, name) VALUES
      (v_apple_id, 'iPhone 11'),
      (v_apple_id, 'iPhone 12'),
      (v_apple_id, 'iPhone 12 Pro'),
      (v_apple_id, 'iPhone 13'),
      (v_apple_id, 'iPhone 13 Pro'),
      (v_apple_id, 'iPhone 14'),
      (v_apple_id, 'iPhone 14 Pro'),
      (v_apple_id, 'iPhone 14 Pro Max'),
      (v_apple_id, 'iPhone 15'),
      (v_apple_id, 'iPhone 15 Pro'),
      (v_apple_id, 'MacBook Air'),
      (v_apple_id, 'MacBook Pro'),
      (v_apple_id, 'iPad'),
      (v_apple_id, 'iPad Pro'),
      (v_apple_id, 'iPad Air');

    -- Samsung models
    INSERT INTO models (brand_id, name) VALUES
      (v_samsung_id, 'Galaxy S21'),
      (v_samsung_id, 'Galaxy S22'),
      (v_samsung_id, 'Galaxy S23'),
      (v_samsung_id, 'Galaxy S24'),
      (v_samsung_id, 'Galaxy A14'),
      (v_samsung_id, 'Galaxy A24'),
      (v_samsung_id, 'Galaxy A34'),
      (v_samsung_id, 'Galaxy A54'),
      (v_samsung_id, 'Galaxy Note 20'),
      (v_samsung_id, 'Galaxy Z Flip'),
      (v_samsung_id, 'Galaxy Z Fold');

    -- Huawei models
    INSERT INTO models (brand_id, name) VALUES
      (v_huawei_id, 'P30'),
      (v_huawei_id, 'P40'),
      (v_huawei_id, 'P50'),
      (v_huawei_id, 'Mate 20'),
      (v_huawei_id, 'Mate 30'),
      (v_huawei_id, 'Mate 40'),
      (v_huawei_id, 'Nova 9'),
      (v_huawei_id, 'Y9');

    -- Xiaomi models
    INSERT INTO models (brand_id, name) VALUES
      (v_xiaomi_id, 'Redmi Note 10'),
      (v_xiaomi_id, 'Redmi Note 11'),
      (v_xiaomi_id, 'Redmi Note 12'),
      (v_xiaomi_id, 'Mi 11'),
      (v_xiaomi_id, 'Mi 12'),
      (v_xiaomi_id, 'Poco X3'),
      (v_xiaomi_id, 'Poco X5'),
      (v_xiaomi_id, 'Poco F3');

    -- Oppo models
    INSERT INTO models (brand_id, name) VALUES
      (v_oppo_id, 'Find X3'),
      (v_oppo_id, 'Find X5'),
      (v_oppo_id, 'Reno 6'),
      (v_oppo_id, 'Reno 7'),
      (v_oppo_id, 'Reno 8'),
      (v_oppo_id, 'A57'),
      (v_oppo_id, 'A77');
  END IF;
END $$;
