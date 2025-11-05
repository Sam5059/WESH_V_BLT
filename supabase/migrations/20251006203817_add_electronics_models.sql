/*
  # Add Electronics Models

  1. Changes
    - Add popular smartphone and electronics models
    - Models for Samsung, Apple, Xiaomi, Huawei
    - Multilingual support for all models
*/

-- Insert Samsung models
INSERT INTO models (brand_id, name, name_ar, name_en)
SELECT id, 'Galaxy S24', 'غالاكسي إس 24', 'Galaxy S24' FROM brands WHERE name = 'Samsung' AND category_type = 'electronics'
UNION ALL
SELECT id, 'Galaxy S23', 'غالاكسي إس 23', 'Galaxy S23' FROM brands WHERE name = 'Samsung' AND category_type = 'electronics'
UNION ALL
SELECT id, 'Galaxy A54', 'غالاكسي إيه 54', 'Galaxy A54' FROM brands WHERE name = 'Samsung' AND category_type = 'electronics'
UNION ALL
SELECT id, 'Galaxy A34', 'غالاكسي إيه 34', 'Galaxy A34' FROM brands WHERE name = 'Samsung' AND category_type = 'electronics'
UNION ALL
SELECT id, 'Galaxy A14', 'غالاكسي إيه 14', 'Galaxy A14' FROM brands WHERE name = 'Samsung' AND category_type = 'electronics'
UNION ALL
SELECT id, 'Galaxy M34', 'غالاكسي إم 34', 'Galaxy M34' FROM brands WHERE name = 'Samsung' AND category_type = 'electronics'
UNION ALL
SELECT id, 'Galaxy Z Fold 5', 'غالاكسي زد فولد 5', 'Galaxy Z Fold 5' FROM brands WHERE name = 'Samsung' AND category_type = 'electronics'
UNION ALL
SELECT id, 'Galaxy Z Flip 5', 'غالاكسي زد فليب 5', 'Galaxy Z Flip 5' FROM brands WHERE name = 'Samsung' AND category_type = 'electronics'
ON CONFLICT DO NOTHING;

-- Insert Apple models
INSERT INTO models (brand_id, name, name_ar, name_en)
SELECT id, 'iPhone 15 Pro Max', 'آيفون 15 برو ماكس', 'iPhone 15 Pro Max' FROM brands WHERE name = 'Apple' AND category_type = 'electronics'
UNION ALL
SELECT id, 'iPhone 15 Pro', 'آيفون 15 برو', 'iPhone 15 Pro' FROM brands WHERE name = 'Apple' AND category_type = 'electronics'
UNION ALL
SELECT id, 'iPhone 15', 'آيفون 15', 'iPhone 15' FROM brands WHERE name = 'Apple' AND category_type = 'electronics'
UNION ALL
SELECT id, 'iPhone 14', 'آيفون 14', 'iPhone 14' FROM brands WHERE name = 'Apple' AND category_type = 'electronics'
UNION ALL
SELECT id, 'iPhone 13', 'آيفون 13', 'iPhone 13' FROM brands WHERE name = 'Apple' AND category_type = 'electronics'
UNION ALL
SELECT id, 'iPhone SE', 'آيفون إس إي', 'iPhone SE' FROM brands WHERE name = 'Apple' AND category_type = 'electronics'
UNION ALL
SELECT id, 'iPad Pro', 'آيباد برو', 'iPad Pro' FROM brands WHERE name = 'Apple' AND category_type = 'electronics'
UNION ALL
SELECT id, 'MacBook Air', 'ماك بوك إير', 'MacBook Air' FROM brands WHERE name = 'Apple' AND category_type = 'electronics'
UNION ALL
SELECT id, 'MacBook Pro', 'ماك بوك برو', 'MacBook Pro' FROM brands WHERE name = 'Apple' AND category_type = 'electronics'
ON CONFLICT DO NOTHING;

-- Insert Xiaomi models
INSERT INTO models (brand_id, name, name_ar, name_en)
SELECT id, 'Redmi Note 13 Pro', 'ريدمي نوت 13 برو', 'Redmi Note 13 Pro' FROM brands WHERE name = 'Xiaomi' AND category_type = 'electronics'
UNION ALL
SELECT id, 'Redmi Note 13', 'ريدمي نوت 13', 'Redmi Note 13' FROM brands WHERE name = 'Xiaomi' AND category_type = 'electronics'
UNION ALL
SELECT id, 'Redmi 13C', 'ريدمي 13 سي', 'Redmi 13C' FROM brands WHERE name = 'Xiaomi' AND category_type = 'electronics'
UNION ALL
SELECT id, 'Poco X6 Pro', 'بوكو إكس 6 برو', 'Poco X6 Pro' FROM brands WHERE name = 'Xiaomi' AND category_type = 'electronics'
UNION ALL
SELECT id, 'Poco M6 Pro', 'بوكو إم 6 برو', 'Poco M6 Pro' FROM brands WHERE name = 'Xiaomi' AND category_type = 'electronics'
UNION ALL
SELECT id, 'Mi 13', 'مي 13', 'Mi 13' FROM brands WHERE name = 'Xiaomi' AND category_type = 'electronics'
UNION ALL
SELECT id, 'Mi 14', 'مي 14', 'Mi 14' FROM brands WHERE name = 'Xiaomi' AND category_type = 'electronics'
ON CONFLICT DO NOTHING;

-- Insert Huawei models
INSERT INTO models (brand_id, name, name_ar, name_en)
SELECT id, 'P60 Pro', 'بي 60 برو', 'P60 Pro' FROM brands WHERE name = 'Huawei' AND category_type = 'electronics'
UNION ALL
SELECT id, 'Mate 60 Pro', 'ميت 60 برو', 'Mate 60 Pro' FROM brands WHERE name = 'Huawei' AND category_type = 'electronics'
UNION ALL
SELECT id, 'Nova 11', 'نوفا 11', 'Nova 11' FROM brands WHERE name = 'Huawei' AND category_type = 'electronics'
UNION ALL
SELECT id, 'Y9', 'واي 9', 'Y9' FROM brands WHERE name = 'Huawei' AND category_type = 'electronics'
UNION ALL
SELECT id, 'MatePad', 'ميت باد', 'MatePad' FROM brands WHERE name = 'Huawei' AND category_type = 'electronics'
ON CONFLICT DO NOTHING;

-- Insert Oppo models
INSERT INTO models (brand_id, name, name_ar, name_en)
SELECT id, 'Reno 11', 'رينو 11', 'Reno 11' FROM brands WHERE name = 'Oppo' AND category_type = 'electronics'
UNION ALL
SELECT id, 'Find X6', 'فايند إكس 6', 'Find X6' FROM brands WHERE name = 'Oppo' AND category_type = 'electronics'
UNION ALL
SELECT id, 'A78', 'إيه 78', 'A78' FROM brands WHERE name = 'Oppo' AND category_type = 'electronics'
UNION ALL
SELECT id, 'A58', 'إيه 58', 'A58' FROM brands WHERE name = 'Oppo' AND category_type = 'electronics'
ON CONFLICT DO NOTHING;