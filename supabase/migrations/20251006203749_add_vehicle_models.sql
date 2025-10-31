/*
  # Add Vehicle Models

  1. Changes
    - Add popular vehicle models for major brands
    - Models are added with multilingual support (French, Arabic, English)
    - Focus on models popular in Algeria

  2. Notes
    - Model names are generally the same across languages (brand names)
    - Arabic translations use phonetic transliteration for model names
*/

-- Insert Renault models
INSERT INTO models (brand_id, name, name_ar, name_en)
SELECT id, 'Clio', 'كليو', 'Clio' FROM brands WHERE name = 'Renault' AND category_type = 'vehicles'
UNION ALL
SELECT id, 'Mégane', 'ميغان', 'Megane' FROM brands WHERE name = 'Renault' AND category_type = 'vehicles'
UNION ALL
SELECT id, 'Symbol', 'سيمبول', 'Symbol' FROM brands WHERE name = 'Renault' AND category_type = 'vehicles'
UNION ALL
SELECT id, 'Logan', 'لوغان', 'Logan' FROM brands WHERE name = 'Renault' AND category_type = 'vehicles'
UNION ALL
SELECT id, 'Captur', 'كابتور', 'Captur' FROM brands WHERE name = 'Renault' AND category_type = 'vehicles'
UNION ALL
SELECT id, 'Duster', 'داستر', 'Duster' FROM brands WHERE name = 'Renault' AND category_type = 'vehicles'
UNION ALL
SELECT id, 'Kadjar', 'كادجار', 'Kadjar' FROM brands WHERE name = 'Renault' AND category_type = 'vehicles'
ON CONFLICT DO NOTHING;

-- Insert Peugeot models
INSERT INTO models (brand_id, name, name_ar, name_en)
SELECT id, '208', '208', '208' FROM brands WHERE name = 'Peugeot' AND category_type = 'vehicles'
UNION ALL
SELECT id, '308', '308', '308' FROM brands WHERE name = 'Peugeot' AND category_type = 'vehicles'
UNION ALL
SELECT id, '301', '301', '301' FROM brands WHERE name = 'Peugeot' AND category_type = 'vehicles'
UNION ALL
SELECT id, '2008', '2008', '2008' FROM brands WHERE name = 'Peugeot' AND category_type = 'vehicles'
UNION ALL
SELECT id, '3008', '3008', '3008' FROM brands WHERE name = 'Peugeot' AND category_type = 'vehicles'
UNION ALL
SELECT id, '5008', '5008', '5008' FROM brands WHERE name = 'Peugeot' AND category_type = 'vehicles'
UNION ALL
SELECT id, 'Partner', 'بارتنر', 'Partner' FROM brands WHERE name = 'Peugeot' AND category_type = 'vehicles'
ON CONFLICT DO NOTHING;

-- Insert Volkswagen models
INSERT INTO models (brand_id, name, name_ar, name_en)
SELECT id, 'Golf', 'غولف', 'Golf' FROM brands WHERE name = 'Volkswagen' AND category_type = 'vehicles'
UNION ALL
SELECT id, 'Polo', 'بولو', 'Polo' FROM brands WHERE name = 'Volkswagen' AND category_type = 'vehicles'
UNION ALL
SELECT id, 'Passat', 'باسات', 'Passat' FROM brands WHERE name = 'Volkswagen' AND category_type = 'vehicles'
UNION ALL
SELECT id, 'Tiguan', 'تيغوان', 'Tiguan' FROM brands WHERE name = 'Volkswagen' AND category_type = 'vehicles'
UNION ALL
SELECT id, 'Touareg', 'توارق', 'Touareg' FROM brands WHERE name = 'Volkswagen' AND category_type = 'vehicles'
UNION ALL
SELECT id, 'Caddy', 'كادي', 'Caddy' FROM brands WHERE name = 'Volkswagen' AND category_type = 'vehicles'
ON CONFLICT DO NOTHING;

-- Insert Toyota models
INSERT INTO models (brand_id, name, name_ar, name_en)
SELECT id, 'Corolla', 'كورولا', 'Corolla' FROM brands WHERE name = 'Toyota' AND category_type = 'vehicles'
UNION ALL
SELECT id, 'Yaris', 'ياريس', 'Yaris' FROM brands WHERE name = 'Toyota' AND category_type = 'vehicles'
UNION ALL
SELECT id, 'Hilux', 'هايلوكس', 'Hilux' FROM brands WHERE name = 'Toyota' AND category_type = 'vehicles'
UNION ALL
SELECT id, 'Land Cruiser', 'لاند كروزر', 'Land Cruiser' FROM brands WHERE name = 'Toyota' AND category_type = 'vehicles'
UNION ALL
SELECT id, 'RAV4', 'راف4', 'RAV4' FROM brands WHERE name = 'Toyota' AND category_type = 'vehicles'
UNION ALL
SELECT id, 'Prado', 'برادو', 'Prado' FROM brands WHERE name = 'Toyota' AND category_type = 'vehicles'
ON CONFLICT DO NOTHING;

-- Insert Hyundai models
INSERT INTO models (brand_id, name, name_ar, name_en)
SELECT id, 'i10', 'i10', 'i10' FROM brands WHERE name = 'Hyundai' AND category_type = 'vehicles'
UNION ALL
SELECT id, 'i20', 'i20', 'i20' FROM brands WHERE name = 'Hyundai' AND category_type = 'vehicles'
UNION ALL
SELECT id, 'Accent', 'أكسنت', 'Accent' FROM brands WHERE name = 'Hyundai' AND category_type = 'vehicles'
UNION ALL
SELECT id, 'Elantra', 'إلنترا', 'Elantra' FROM brands WHERE name = 'Hyundai' AND category_type = 'vehicles'
UNION ALL
SELECT id, 'Tucson', 'توسان', 'Tucson' FROM brands WHERE name = 'Hyundai' AND category_type = 'vehicles'
UNION ALL
SELECT id, 'Santa Fe', 'سانتا في', 'Santa Fe' FROM brands WHERE name = 'Hyundai' AND category_type = 'vehicles'
ON CONFLICT DO NOTHING;

-- Insert Kia models
INSERT INTO models (brand_id, name, name_ar, name_en)
SELECT id, 'Picanto', 'بيكانتو', 'Picanto' FROM brands WHERE name = 'Kia' AND category_type = 'vehicles'
UNION ALL
SELECT id, 'Rio', 'ريو', 'Rio' FROM brands WHERE name = 'Kia' AND category_type = 'vehicles'
UNION ALL
SELECT id, 'Cerato', 'سيراتو', 'Cerato' FROM brands WHERE name = 'Kia' AND category_type = 'vehicles'
UNION ALL
SELECT id, 'Sportage', 'سبورتاج', 'Sportage' FROM brands WHERE name = 'Kia' AND category_type = 'vehicles'
UNION ALL
SELECT id, 'Sorento', 'سورنتو', 'Sorento' FROM brands WHERE name = 'Kia' AND category_type = 'vehicles'
ON CONFLICT DO NOTHING;