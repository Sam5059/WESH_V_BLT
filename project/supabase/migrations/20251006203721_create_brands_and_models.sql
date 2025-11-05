/*
  # Create Brands and Models Tables with Multilingual Support

  1. New Tables
    - `brands`
      - `id` (uuid, primary key)
      - `name` (text) - Brand name in French
      - `name_ar` (text) - Brand name in Arabic
      - `name_en` (text) - Brand name in English
      - `category_type` (text) - Category type (vehicles, electronics, fashion)
      - `created_at` (timestamp)
    
    - `models`
      - `id` (uuid, primary key)
      - `brand_id` (uuid, foreign key to brands)
      - `name` (text) - Model name in French
      - `name_ar` (text) - Model name in Arabic
      - `name_en` (text) - Model name in English
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add public read access policies (brands and models are public data)
    - Only authenticated users can suggest new brands/models (future feature)

  3. Indexes
    - Add indexes on brand_id for faster model lookups
    - Add indexes on category_type for filtering
*/

-- Create brands table
CREATE TABLE IF NOT EXISTS brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  name_ar text,
  name_en text,
  category_type text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create models table
CREATE TABLE IF NOT EXISTS models (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id uuid REFERENCES brands(id) ON DELETE CASCADE,
  name text NOT NULL,
  name_ar text,
  name_en text,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_brands_category_type ON brands(category_type);
CREATE INDEX IF NOT EXISTS idx_models_brand_id ON models(brand_id);

-- Enable RLS
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE models ENABLE ROW LEVEL SECURITY;

-- Public read access for brands
CREATE POLICY "Brands are publicly readable"
  ON brands
  FOR SELECT
  TO public
  USING (true);

-- Public read access for models
CREATE POLICY "Models are publicly readable"
  ON models
  FOR SELECT
  TO public
  USING (true);

-- Insert vehicle brands with multilingual names
INSERT INTO brands (name, name_ar, name_en, category_type) VALUES
  ('Renault', 'رينو', 'Renault', 'vehicles'),
  ('Peugeot', 'بيجو', 'Peugeot', 'vehicles'),
  ('Citroën', 'سيتروين', 'Citroën', 'vehicles'),
  ('Volkswagen', 'فولكس فاجن', 'Volkswagen', 'vehicles'),
  ('Mercedes-Benz', 'مرسيدس بنز', 'Mercedes-Benz', 'vehicles'),
  ('BMW', 'بي إم دبليو', 'BMW', 'vehicles'),
  ('Audi', 'أودي', 'Audi', 'vehicles'),
  ('Toyota', 'تويوتا', 'Toyota', 'vehicles'),
  ('Hyundai', 'هيونداي', 'Hyundai', 'vehicles'),
  ('Kia', 'كيا', 'Kia', 'vehicles'),
  ('Nissan', 'نيسان', 'Nissan', 'vehicles'),
  ('Ford', 'فورد', 'Ford', 'vehicles'),
  ('Opel', 'أوبل', 'Opel', 'vehicles'),
  ('Fiat', 'فيات', 'Fiat', 'vehicles'),
  ('Seat', 'سيات', 'Seat', 'vehicles'),
  ('Skoda', 'سكودا', 'Skoda', 'vehicles'),
  ('Dacia', 'داتشيا', 'Dacia', 'vehicles'),
  ('Mazda', 'مازدا', 'Mazda', 'vehicles'),
  ('Honda', 'هوندا', 'Honda', 'vehicles'),
  ('Suzuki', 'سوزوكي', 'Suzuki', 'vehicles')
ON CONFLICT DO NOTHING;

-- Insert electronics brands with multilingual names
INSERT INTO brands (name, name_ar, name_en, category_type) VALUES
  ('Samsung', 'سامسونج', 'Samsung', 'electronics'),
  ('Apple', 'أبل', 'Apple', 'electronics'),
  ('Huawei', 'هواوي', 'Huawei', 'electronics'),
  ('Xiaomi', 'شاومي', 'Xiaomi', 'electronics'),
  ('Oppo', 'أوبو', 'Oppo', 'electronics'),
  ('Vivo', 'فيفو', 'Vivo', 'electronics'),
  ('Realme', 'ريلمي', 'Realme', 'electronics'),
  ('OnePlus', 'ون بلس', 'OnePlus', 'electronics'),
  ('Sony', 'سوني', 'Sony', 'electronics'),
  ('LG', 'إل جي', 'LG', 'electronics'),
  ('Nokia', 'نوكيا', 'Nokia', 'electronics'),
  ('Motorola', 'موتورولا', 'Motorola', 'electronics'),
  ('Asus', 'أسوس', 'Asus', 'electronics'),
  ('Lenovo', 'لينوفو', 'Lenovo', 'electronics'),
  ('HP', 'إتش بي', 'HP', 'electronics'),
  ('Dell', 'ديل', 'Dell', 'electronics'),
  ('Acer', 'أيسر', 'Acer', 'electronics'),
  ('Microsoft', 'مايكروسوفت', 'Microsoft', 'electronics'),
  ('Google', 'جوجل', 'Google', 'electronics'),
  ('Infinix', 'إنفينيكس', 'Infinix', 'electronics')
ON CONFLICT DO NOTHING;

-- Insert fashion brands with multilingual names
INSERT INTO brands (name, name_ar, name_en, category_type) VALUES
  ('Zara', 'زارا', 'Zara', 'fashion'),
  ('H&M', 'إتش آند إم', 'H&M', 'fashion'),
  ('Nike', 'نايكي', 'Nike', 'fashion'),
  ('Adidas', 'أديداس', 'Adidas', 'fashion'),
  ('Puma', 'بوما', 'Puma', 'fashion'),
  ('Mango', 'مانجو', 'Mango', 'fashion'),
  ('Pull & Bear', 'بول آند بير', 'Pull & Bear', 'fashion'),
  ('Bershka', 'بيرشكا', 'Bershka', 'fashion'),
  ('Stradivarius', 'ستراديفاريوس', 'Stradivarius', 'fashion'),
  ('LC Waikiki', 'إل سي وايكيكي', 'LC Waikiki', 'fashion'),
  ('Defacto', 'ديفاكتو', 'Defacto', 'fashion'),
  ('Koton', 'كوتون', 'Koton', 'fashion'),
  ('New Balance', 'نيو بالانس', 'New Balance', 'fashion'),
  ('Reebok', 'ريبوك', 'Reebok', 'fashion'),
  ('Lacoste', 'لاكوست', 'Lacoste', 'fashion'),
  ('Levis', 'ليفايز', 'Levis', 'fashion'),
  ('Calvin Klein', 'كالفن كلاين', 'Calvin Klein', 'fashion'),
  ('Tommy Hilfiger', 'تومي هيلفيغر', 'Tommy Hilfiger', 'fashion'),
  ('Ralph Lauren', 'رالف لورين', 'Ralph Lauren', 'fashion'),
  ('Guess', 'غس', 'Guess', 'fashion')
ON CONFLICT DO NOTHING;