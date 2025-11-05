/*
  ═══════════════════════════════════════════════════════════════════
  🏷️ TABLE BRANDS AMÉLIORÉE - SUPPORT TOUTES CATÉGORIES
  ═══════════════════════════════════════════════════════════════════

  Cette migration améliore la table brands pour supporter TOUTES les catégories
  de l'application, pas seulement véhicules et électronique.

  Catégories supportées :
  - 🚗 Véhicules (voitures, motos, camions, etc.)
  - 📱 Électronique (téléphones, ordinateurs, tablettes)
  - 👕 Mode & Vêtements (Nike, Adidas, Zara, etc.)
  - 🏠 Maison & Jardin (meubles, électroménager)
  - 🎮 Loisirs & Hobbies (marques de jeux, sports)
  - 💼 Matériel Professionnel (outils, équipements)
  - 🐾 Animaux (races/types)
  - 📚 Livres & Musique (éditeurs, labels)
*/

-- ═══════════════════════════════════════════════════════════════════
-- ÉTAPE 1 : SUPPRIMER L'ANCIENNE TABLE BRANDS ET MODELS
-- ═══════════════════════════════════════════════════════════════════

DROP TABLE IF EXISTS models CASCADE;
DROP TABLE IF EXISTS brands CASCADE;

-- ═══════════════════════════════════════════════════════════════════
-- ÉTAPE 2 : CRÉER LA NOUVELLE TABLE BRANDS (UNIVERSELLE)
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Informations de base
  name TEXT NOT NULL,
  name_ar TEXT,
  name_en TEXT,
  slug TEXT UNIQUE NOT NULL,

  -- Catégorie de la marque
  category_type TEXT NOT NULL CHECK (
    category_type IN (
      'vehicles',           -- Véhicules (voitures, motos, camions)
      'electronics',        -- Électronique (téléphones, ordinateurs, TV)
      'fashion',            -- Mode & Vêtements (Nike, Zara, H&M)
      'home-appliances',    -- Électroménager (Samsung, LG, Bosch)
      'furniture',          -- Meubles (IKEA, etc.)
      'sports',             -- Équipements sportifs
      'gaming',             -- Jeux vidéo et consoles
      'professional',       -- Matériel professionnel
      'animals',            -- Races d'animaux
      'books',              -- Éditeurs de livres
      'music',              -- Labels de musique
      'beauty',             -- Cosmétiques et beauté
      'food',               -- Marques alimentaires
      'toys',               -- Jouets
      'other'               -- Autres
    )
  ),

  -- Métadonnées
  logo_url TEXT,
  description TEXT,
  country_origin TEXT,
  is_popular BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 999,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Contrainte unique : une marque par nom et catégorie
  CONSTRAINT brands_unique_name_category UNIQUE (name, category_type)
);

-- Index pour optimiser les recherches
CREATE INDEX idx_brands_category_type ON brands(category_type);
CREATE INDEX idx_brands_slug ON brands(slug);
CREATE INDEX idx_brands_name ON brands(name);
CREATE INDEX idx_brands_popular ON brands(is_popular) WHERE is_popular = TRUE;

-- ═══════════════════════════════════════════════════════════════════
-- ÉTAPE 3 : CRÉER LA TABLE MODELS (UNIVERSELLE)
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relation avec la marque
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,

  -- Informations du modèle
  name TEXT NOT NULL,
  name_ar TEXT,
  name_en TEXT,
  slug TEXT NOT NULL,

  -- Spécifications (flexible selon la catégorie)
  year_from INTEGER,        -- Année de début de production
  year_to INTEGER,          -- Année de fin (NULL si toujours produit)

  -- Métadonnées
  image_url TEXT,
  description TEXT,
  is_popular BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 999,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Contrainte unique : un modèle par nom et marque
  CONSTRAINT models_unique_name_brand UNIQUE (brand_id, name)
);

-- Index pour optimiser les recherches
CREATE INDEX idx_models_brand_id ON models(brand_id);
CREATE INDEX idx_models_slug ON models(slug);
CREATE INDEX idx_models_name ON models(name);
CREATE INDEX idx_models_popular ON models(is_popular) WHERE is_popular = TRUE;

-- ═══════════════════════════════════════════════════════════════════
-- ÉTAPE 4 : RLS (Row Level Security)
-- ═══════════════════════════════════════════════════════════════════

ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE models ENABLE ROW LEVEL SECURITY;

-- Tout le monde peut lire les marques et modèles
CREATE POLICY "Brands are viewable by everyone"
  ON brands FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Models are viewable by everyone"
  ON models FOR SELECT
  TO public
  USING (true);

-- Seuls les admins peuvent modifier (à implémenter avec admin_roles)
CREATE POLICY "Admins can manage brands"
  ON brands FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_roles
      WHERE user_id = auth.uid()
      AND role IN ('super_admin', 'admin')
    )
  );

CREATE POLICY "Admins can manage models"
  ON models FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_roles
      WHERE user_id = auth.uid()
      AND role IN ('super_admin', 'admin')
    )
  );

-- ═══════════════════════════════════════════════════════════════════
-- ÉTAPE 5 : INSÉRER LES MARQUES - VÉHICULES
-- ═══════════════════════════════════════════════════════════════════

INSERT INTO brands (name, slug, category_type, country_origin, is_popular, display_order) VALUES
-- Marques populaires en Algérie
('Volkswagen', 'volkswagen', 'vehicles', 'Allemagne', TRUE, 1),
('Peugeot', 'peugeot', 'vehicles', 'France', TRUE, 2),
('Renault', 'renault', 'vehicles', 'France', TRUE, 3),
('Hyundai', 'hyundai', 'vehicles', 'Corée du Sud', TRUE, 4),
('Kia', 'kia', 'vehicles', 'Corée du Sud', TRUE, 5),
('Toyota', 'toyota', 'vehicles', 'Japon', TRUE, 6),
('Nissan', 'nissan', 'vehicles', 'Japon', TRUE, 7),
('Dacia', 'dacia', 'vehicles', 'Roumanie', TRUE, 8),
('Fiat', 'fiat', 'vehicles', 'Italie', TRUE, 9),
('Ford', 'ford', 'vehicles', 'États-Unis', TRUE, 10),

-- Autres marques
('Mercedes-Benz', 'mercedes-benz', 'vehicles', 'Allemagne', TRUE, 11),
('BMW', 'bmw', 'vehicles', 'Allemagne', TRUE, 12),
('Audi', 'audi', 'vehicles', 'Allemagne', TRUE, 13),
('Citroën', 'citroen', 'vehicles', 'France', TRUE, 14),
('Opel', 'opel', 'vehicles', 'Allemagne', TRUE, 15),
('Seat', 'seat', 'vehicles', 'Espagne', TRUE, 16),
('Skoda', 'skoda', 'vehicles', 'République tchèque', TRUE, 17),
('Mazda', 'mazda', 'vehicles', 'Japon', TRUE, 18),
('Honda', 'honda', 'vehicles', 'Japon', TRUE, 19),
('Suzuki', 'suzuki', 'vehicles', 'Japon', TRUE, 20),
('Mitsubishi', 'mitsubishi', 'vehicles', 'Japon', TRUE, 21),
('Chevrolet', 'chevrolet', 'vehicles', 'États-Unis', TRUE, 22),
('Jeep', 'jeep', 'vehicles', 'États-Unis', TRUE, 23),
('Land Rover', 'land-rover', 'vehicles', 'Royaume-Uni', FALSE, 24),
('Volvo', 'volvo', 'vehicles', 'Suède', FALSE, 25);

-- ═══════════════════════════════════════════════════════════════════
-- ÉTAPE 6 : INSÉRER LES MARQUES - ÉLECTRONIQUE
-- ═══════════════════════════════════════════════════════════════════

INSERT INTO brands (name, slug, category_type, country_origin, is_popular, display_order) VALUES
-- Smartphones & Tablettes
('Samsung', 'samsung-electronics', 'electronics', 'Corée du Sud', TRUE, 1),
('Apple', 'apple', 'electronics', 'États-Unis', TRUE, 2),
('Xiaomi', 'xiaomi', 'electronics', 'Chine', TRUE, 3),
('Huawei', 'huawei', 'electronics', 'Chine', TRUE, 4),
('Oppo', 'oppo', 'electronics', 'Chine', TRUE, 5),
('Vivo', 'vivo', 'electronics', 'Chine', TRUE, 6),
('Realme', 'realme', 'electronics', 'Chine', TRUE, 7),
('OnePlus', 'oneplus', 'electronics', 'Chine', TRUE, 8),
('Nokia', 'nokia', 'electronics', 'Finlande', TRUE, 9),
('Motorola', 'motorola', 'electronics', 'États-Unis', TRUE, 10),

-- Ordinateurs & Laptops
('HP', 'hp', 'electronics', 'États-Unis', TRUE, 11),
('Dell', 'dell', 'electronics', 'États-Unis', TRUE, 12),
('Lenovo', 'lenovo', 'electronics', 'Chine', TRUE, 13),
('Asus', 'asus', 'electronics', 'Taïwan', TRUE, 14),
('Acer', 'acer', 'electronics', 'Taïwan', TRUE, 15),
('MSI', 'msi', 'electronics', 'Taïwan', TRUE, 16),
('Toshiba', 'toshiba', 'electronics', 'Japon', FALSE, 17),

-- TV & Audio
('LG', 'lg-electronics', 'electronics', 'Corée du Sud', TRUE, 18),
('Sony', 'sony', 'electronics', 'Japon', TRUE, 19),
('Philips', 'philips', 'electronics', 'Pays-Bas', TRUE, 20),
('TCL', 'tcl', 'electronics', 'Chine', TRUE, 21),
('Hisense', 'hisense', 'electronics', 'Chine', TRUE, 22);

-- ═══════════════════════════════════════════════════════════════════
-- ÉTAPE 7 : INSÉRER LES MARQUES - MODE & VÊTEMENTS
-- ═══════════════════════════════════════════════════════════════════

INSERT INTO brands (name, slug, category_type, country_origin, is_popular, display_order) VALUES
-- Sportswear
('Nike', 'nike', 'fashion', 'États-Unis', TRUE, 1),
('Adidas', 'adidas', 'fashion', 'Allemagne', TRUE, 2),
('Puma', 'puma', 'fashion', 'Allemagne', TRUE, 3),
('Reebok', 'reebok', 'fashion', 'Royaume-Uni', TRUE, 4),
('Under Armour', 'under-armour', 'fashion', 'États-Unis', TRUE, 5),
('New Balance', 'new-balance', 'fashion', 'États-Unis', TRUE, 6),

-- Fast Fashion
('Zara', 'zara', 'fashion', 'Espagne', TRUE, 7),
('H&M', 'hm', 'fashion', 'Suède', TRUE, 8),
('Pull & Bear', 'pull-bear', 'fashion', 'Espagne', TRUE, 9),
('Bershka', 'bershka', 'fashion', 'Espagne', TRUE, 10),
('Mango', 'mango', 'fashion', 'Espagne', TRUE, 11),
('Uniqlo', 'uniqlo', 'fashion', 'Japon', TRUE, 12),

-- Luxe
('Gucci', 'gucci', 'fashion', 'Italie', FALSE, 13),
('Louis Vuitton', 'louis-vuitton', 'fashion', 'France', FALSE, 14),
('Dior', 'dior', 'fashion', 'France', FALSE, 15),
('Chanel', 'chanel', 'fashion', 'France', FALSE, 16),
('Armani', 'armani', 'fashion', 'Italie', FALSE, 17),
('Versace', 'versace', 'fashion', 'Italie', FALSE, 18);

-- ═══════════════════════════════════════════════════════════════════
-- ÉTAPE 8 : INSÉRER LES MARQUES - ÉLECTROMÉNAGER
-- ═══════════════════════════════════════════════════════════════════

INSERT INTO brands (name, slug, category_type, country_origin, is_popular, display_order) VALUES
('Samsung', 'samsung-appliances', 'home-appliances', 'Corée du Sud', TRUE, 1),
('LG', 'lg-appliances', 'home-appliances', 'Corée du Sud', TRUE, 2),
('Bosch', 'bosch', 'home-appliances', 'Allemagne', TRUE, 3),
('Siemens', 'siemens', 'home-appliances', 'Allemagne', TRUE, 4),
('Whirlpool', 'whirlpool', 'home-appliances', 'États-Unis', TRUE, 5),
('Electrolux', 'electrolux', 'home-appliances', 'Suède', TRUE, 6),
('Beko', 'beko', 'home-appliances', 'Turquie', TRUE, 7),
('Candy', 'candy', 'home-appliances', 'Italie', TRUE, 8),
('Indesit', 'indesit', 'home-appliances', 'Italie', TRUE, 9),
('Haier', 'haier', 'home-appliances', 'Chine', TRUE, 10);

-- ═══════════════════════════════════════════════════════════════════
-- ÉTAPE 9 : INSÉRER LES MARQUES - MEUBLES
-- ═══════════════════════════════════════════════════════════════════

INSERT INTO brands (name, slug, category_type, country_origin, is_popular, display_order) VALUES
('IKEA', 'ikea', 'furniture', 'Suède', TRUE, 1),
('Maisons du Monde', 'maisons-du-monde', 'furniture', 'France', TRUE, 2),
('Conforama', 'conforama', 'furniture', 'France', TRUE, 3),
('But', 'but', 'furniture', 'France', TRUE, 4);

-- ═══════════════════════════════════════════════════════════════════
-- ÉTAPE 10 : INSÉRER LES MARQUES - SPORTS & GAMING
-- ═══════════════════════════════════════════════════════════════════

INSERT INTO brands (name, slug, category_type, country_origin, is_popular, display_order) VALUES
-- Équipements sportifs
('Decathlon', 'decathlon', 'sports', 'France', TRUE, 1),
('Wilson', 'wilson', 'sports', 'États-Unis', TRUE, 2),
('Head', 'head', 'sports', 'Autriche', TRUE, 3),

-- Gaming
('PlayStation', 'playstation', 'gaming', 'Japon', TRUE, 4),
('Xbox', 'xbox', 'gaming', 'États-Unis', TRUE, 5),
('Nintendo', 'nintendo', 'gaming', 'Japon', TRUE, 6),
('Razer', 'razer', 'gaming', 'Singapour', TRUE, 7),
('Logitech', 'logitech', 'gaming', 'Suisse', TRUE, 8);

-- ═══════════════════════════════════════════════════════════════════
-- ÉTAPE 11 : INSÉRER LES MARQUES - COSMÉTIQUES & BEAUTÉ
-- ═══════════════════════════════════════════════════════════════════

INSERT INTO brands (name, slug, category_type, country_origin, is_popular, display_order) VALUES
('L''Oréal', 'loreal', 'beauty', 'France', TRUE, 1),
('Maybelline', 'maybelline', 'beauty', 'États-Unis', TRUE, 2),
('Nivea', 'nivea', 'beauty', 'Allemagne', TRUE, 3),
('Garnier', 'garnier', 'beauty', 'France', TRUE, 4),
('MAC', 'mac', 'beauty', 'Canada', TRUE, 5),
('Estée Lauder', 'estee-lauder', 'beauty', 'États-Unis', FALSE, 6);

-- ═══════════════════════════════════════════════════════════════════
-- ÉTAPE 12 : INSÉRER LES MARQUES - MATÉRIEL PROFESSIONNEL
-- ═══════════════════════════════════════════════════════════════════

INSERT INTO brands (name, slug, category_type, country_origin, is_popular, display_order) VALUES
('Makita', 'makita', 'professional', 'Japon', TRUE, 1),
('DeWalt', 'dewalt', 'professional', 'États-Unis', TRUE, 2),
('Bosch', 'bosch-pro', 'professional', 'Allemagne', TRUE, 3),
('Hilti', 'hilti', 'professional', 'Liechtenstein', TRUE, 4),
('Stanley', 'stanley', 'professional', 'États-Unis', TRUE, 5);

-- ═══════════════════════════════════════════════════════════════════
-- ÉTAPE 13 : INSÉRER LES MARQUES - RACES D'ANIMAUX (Chiens populaires)
-- ═══════════════════════════════════════════════════════════════════

INSERT INTO brands (name, slug, category_type, is_popular, display_order) VALUES
('Berger Allemand', 'berger-allemand', 'animals', TRUE, 1),
('Golden Retriever', 'golden-retriever', 'animals', TRUE, 2),
('Labrador', 'labrador', 'animals', TRUE, 3),
('Husky', 'husky', 'animals', TRUE, 4),
('Bulldog', 'bulldog', 'animals', TRUE, 5),
('Caniche', 'caniche', 'animals', TRUE, 6),
('Chihuahua', 'chihuahua', 'animals', TRUE, 7),
('Chat Persan', 'chat-persan', 'animals', TRUE, 8),
('Chat Siamois', 'chat-siamois', 'animals', TRUE, 9);

-- ═══════════════════════════════════════════════════════════════════
-- ÉTAPE 14 : CRÉER FONCTION POUR OBTENIR MARQUES PAR CATÉGORIE
-- ═══════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION get_brands_by_category(category TEXT DEFAULT NULL)
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  category_type TEXT,
  country_origin TEXT,
  is_popular BOOLEAN,
  logo_url TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    b.id,
    b.name,
    b.slug,
    b.category_type,
    b.country_origin,
    b.is_popular,
    b.logo_url
  FROM brands b
  WHERE
    (category IS NULL OR b.category_type = category)
  ORDER BY
    b.display_order ASC,
    b.is_popular DESC,
    b.name ASC;
END;
$$;

-- ═══════════════════════════════════════════════════════════════════
-- ÉTAPE 15 : CRÉER FONCTION POUR OBTENIR MODÈLES D'UNE MARQUE
-- ═══════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION get_models_by_brand(brand_uuid UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  year_from INTEGER,
  year_to INTEGER,
  is_popular BOOLEAN
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.id,
    m.name,
    m.slug,
    m.year_from,
    m.year_to,
    m.is_popular
  FROM models m
  WHERE m.brand_id = brand_uuid
  ORDER BY
    m.display_order ASC,
    m.is_popular DESC,
    m.name ASC;
END;
$$;

-- ═══════════════════════════════════════════════════════════════════
-- ✅ TERMINÉ !
-- ═══════════════════════════════════════════════════════════════════

DO $$
DECLARE
  total_brands INTEGER;
  vehicles_count INTEGER;
  electronics_count INTEGER;
  fashion_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_brands FROM brands;
  SELECT COUNT(*) INTO vehicles_count FROM brands WHERE category_type = 'vehicles';
  SELECT COUNT(*) INTO electronics_count FROM brands WHERE category_type = 'electronics';
  SELECT COUNT(*) INTO fashion_count FROM brands WHERE category_type = 'fashion';

  RAISE NOTICE '═══════════════════════════════════════════';
  RAISE NOTICE '✅ TABLE BRANDS AMÉLIORÉE';
  RAISE NOTICE '═══════════════════════════════════════════';
  RAISE NOTICE 'Total marques: %', total_brands;
  RAISE NOTICE '  - Véhicules: %', vehicles_count;
  RAISE NOTICE '  - Électronique: %', electronics_count;
  RAISE NOTICE '  - Mode & Vêtements: %', fashion_count;
  RAISE NOTICE '';
  RAISE NOTICE 'Catégories supportées:';
  RAISE NOTICE '  🚗 vehicles';
  RAISE NOTICE '  📱 electronics';
  RAISE NOTICE '  👕 fashion';
  RAISE NOTICE '  🏠 home-appliances';
  RAISE NOTICE '  🪑 furniture';
  RAISE NOTICE '  ⚽ sports';
  RAISE NOTICE '  🎮 gaming';
  RAISE NOTICE '  💄 beauty';
  RAISE NOTICE '  🔧 professional';
  RAISE NOTICE '  🐾 animals';
  RAISE NOTICE '═══════════════════════════════════════════';
END $$;
