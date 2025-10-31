/*
  # Add more categories for individuals and professionals

  1. New Main Categories
    - Animaux (Animals)
    - Matériel Professionnel (Professional Equipment)
    - Entreprises à vendre (Businesses for Sale)
    
  2. Extended Subcategories for Existing Categories
    - More detailed subcategories for services
    - Professional equipment subcategories
    - More property types
    - Additional vehicle categories
    - Baby & Kids category
    
  3. All categories include Arabic translations
*/

-- Add new main category: Animaux
INSERT INTO categories (name, name_ar, slug, parent_id, icon, order_position)
VALUES 
  ('Animaux', 'حيوانات', 'animaux', NULL, 'dog', 9)
ON CONFLICT (slug) DO NOTHING;

-- Add new main category: Matériel Professionnel
INSERT INTO categories (name, name_ar, slug, parent_id, icon, order_position)
VALUES 
  ('Matériel Professionnel', 'معدات مهنية', 'materiel-professionnel', NULL, 'briefcase', 10)
ON CONFLICT (slug) DO NOTHING;

-- Add new main category: Entreprises à vendre
INSERT INTO categories (name, name_ar, slug, parent_id, icon, order_position)
VALUES 
  ('Entreprises à vendre', 'شركات للبيع', 'entreprises-vendre', NULL, 'building', 11)
ON CONFLICT (slug) DO NOTHING;

-- Add new main category: Bébé & Enfants
INSERT INTO categories (name, name_ar, slug, parent_id, icon, order_position)
VALUES 
  ('Bébé & Enfants', 'أطفال و رضع', 'bebe-enfants', NULL, 'baby', 12)
ON CONFLICT (slug) DO NOTHING;

-- Get IDs for new categories
DO $$
DECLARE
  animaux_id uuid;
  materiel_pro_id uuid;
  entreprises_id uuid;
  bebe_enfants_id uuid;
  services_id uuid;
  immobilier_id uuid;
  vehicules_id uuid;
  electronique_id uuid;
BEGIN
  -- Get category IDs
  SELECT id INTO animaux_id FROM categories WHERE slug = 'animaux';
  SELECT id INTO materiel_pro_id FROM categories WHERE slug = 'materiel-professionnel';
  SELECT id INTO entreprises_id FROM categories WHERE slug = 'entreprises-vendre';
  SELECT id INTO bebe_enfants_id FROM categories WHERE slug = 'bebe-enfants';
  SELECT id INTO services_id FROM categories WHERE slug = 'services';
  SELECT id INTO immobilier_id FROM categories WHERE slug = 'immobilier';
  SELECT id INTO vehicules_id FROM categories WHERE slug = 'vehicules';
  SELECT id INTO electronique_id FROM categories WHERE slug = 'electronique';

  -- Animaux subcategories
  IF animaux_id IS NOT NULL THEN
    INSERT INTO categories (name, name_ar, slug, parent_id) VALUES
      ('Chiens', 'كلاب', 'chiens', animaux_id),
      ('Chats', 'قطط', 'chats', animaux_id),
      ('Oiseaux', 'طيور', 'oiseaux', animaux_id),
      ('Poissons & Aquariums', 'أسماك و أحواض', 'poissons-aquariums', animaux_id),
      ('Rongeurs', 'قوارض', 'rongeurs', animaux_id),
      ('Animaux de ferme', 'حيوانات المزرعة', 'animaux-ferme', animaux_id),
      ('Chevaux', 'خيول', 'chevaux', animaux_id),
      ('Accessoires animaux', 'إكسسوارات حيوانات', 'accessoires-animaux', animaux_id)
    ON CONFLICT (slug) DO NOTHING;
  END IF;

  -- Matériel Professionnel subcategories
  IF materiel_pro_id IS NOT NULL THEN
    INSERT INTO categories (name, name_ar, slug, parent_id) VALUES
      ('Restaurant & Hôtellerie', 'مطاعم و فنادق', 'restaurant-hotellerie', materiel_pro_id),
      ('Matériel médical', 'معدات طبية', 'materiel-medical', materiel_pro_id),
      ('Matériel agricole', 'معدات زراعية', 'materiel-agricole', materiel_pro_id),
      ('Matériel de construction', 'معدات بناء', 'materiel-construction', materiel_pro_id),
      ('Matériel de bureau', 'معدات مكتبية', 'materiel-bureau', materiel_pro_id),
      ('Matériel industriel', 'معدات صناعية', 'materiel-industriel', materiel_pro_id),
      ('Matériel de nettoyage', 'معدات تنظيف', 'materiel-nettoyage', materiel_pro_id),
      ('Matériel de sécurité', 'معدات أمنية', 'materiel-securite', materiel_pro_id)
    ON CONFLICT (slug) DO NOTHING;
  END IF;

  -- Entreprises à vendre subcategories
  IF entreprises_id IS NOT NULL THEN
    INSERT INTO categories (name, name_ar, slug, parent_id) VALUES
      ('Restaurants & Cafés', 'مطاعم و مقاهي', 'restaurants-cafes', entreprises_id),
      ('Boutiques & Magasins', 'محلات تجارية', 'boutiques-magasins', entreprises_id),
      ('Salons de coiffure & Beauté', 'صالونات تجميل', 'salons-coiffure', entreprises_id),
      ('Agences & Services', 'وكالات و خدمات', 'agences-services', entreprises_id),
      ('Projets industriels', 'مشاريع صناعية', 'projets-industriels', entreprises_id),
      ('Pharmacies', 'صيدليات', 'pharmacies', entreprises_id),
      ('Auto-écoles', 'مدارس قيادة', 'auto-ecoles', entreprises_id)
    ON CONFLICT (slug) DO NOTHING;
  END IF;

  -- Bébé & Enfants subcategories
  IF bebe_enfants_id IS NOT NULL THEN
    INSERT INTO categories (name, name_ar, slug, parent_id) VALUES
      ('Vêtements bébé', 'ملابس أطفال', 'vetements-bebe', bebe_enfants_id),
      ('Poussettes & Sièges auto', 'عربات و كراسي سيارة', 'poussettes-sieges', bebe_enfants_id),
      ('Lits & Meubles bébé', 'أسرة و أثاث أطفال', 'lits-meubles-bebe', bebe_enfants_id),
      ('Jouets & Jeux éducatifs', 'ألعاب تعليمية', 'jouets-educatifs', bebe_enfants_id),
      ('Alimentation bébé', 'تغذية الرضع', 'alimentation-bebe', bebe_enfants_id),
      ('Hygiène & Soins', 'نظافة و عناية', 'hygiene-soins', bebe_enfants_id),
      ('Articles de puériculture', 'مستلزمات الرضاعة', 'articles-puericulture', bebe_enfants_id)
    ON CONFLICT (slug) DO NOTHING;
  END IF;

  -- Additional Services subcategories
  IF services_id IS NOT NULL THEN
    INSERT INTO categories (name, name_ar, slug, parent_id) VALUES
      ('Réparation & Maintenance', 'إصلاح و صيانة', 'reparation-maintenance', services_id),
      ('Déménagement', 'نقل أثاث', 'demenagement', services_id),
      ('Nettoyage', 'تنظيف', 'nettoyage', services_id),
      ('Plomberie', 'سباكة', 'plomberie', services_id),
      ('Électricité', 'كهرباء', 'electricite', services_id),
      ('Climatisation', 'تكييف هواء', 'climatisation', services_id),
      ('Peinture & Décoration', 'دهان و ديكور', 'peinture-decoration', services_id),
      ('Jardinage', 'بستنة', 'jardinage', services_id),
      ('Photographe & Vidéaste', 'تصوير', 'photographe-videaste', services_id),
      ('Traduction', 'ترجمة', 'traduction', services_id)
    ON CONFLICT (slug) DO NOTHING;
  END IF;

  -- Additional Immobilier subcategories
  IF immobilier_id IS NOT NULL THEN
    INSERT INTO categories (name, name_ar, slug, parent_id) VALUES
      ('Locaux commerciaux', 'محلات تجارية', 'locaux-commerciaux', immobilier_id),
      ('Hangars & Entrepôts', 'مخازن و مستودعات', 'hangars-entrepots', immobilier_id),
      ('Fermes & Terrains agricoles', 'مزارع و أراضي زراعية', 'fermes-agricoles', immobilier_id),
      ('Colocations', 'سكن مشترك', 'colocations', immobilier_id),
      ('Parkings & Garages', 'مواقف و كراجات', 'parkings-garages', immobilier_id)
    ON CONFLICT (slug) DO NOTHING;
  END IF;

  -- Additional Véhicules subcategories
  IF vehicules_id IS NOT NULL THEN
    INSERT INTO categories (name, name_ar, slug, parent_id) VALUES
      ('Véhicules agricoles', 'مركبات زراعية', 'vehicules-agricoles', vehicules_id),
      ('Bus & Minibus', 'حافلات و ميني باص', 'bus-minibus', vehicules_id)
    ON CONFLICT (slug) DO NOTHING;
  END IF;

  -- Additional Électronique subcategories
  IF electronique_id IS NOT NULL THEN
    INSERT INTO categories (name, name_ar, slug, parent_id) VALUES
      ('Tablettes', 'لوحات إلكترونية', 'tablettes', electronique_id),
      ('Montres connectées', 'ساعات ذكية', 'montres-connectees', electronique_id),
      ('Drones & Robots', 'طائرات بدون طيار و روبوتات', 'drones-robots', electronique_id),
      ('Imprimantes & Scanners', 'طابعات و ماسحات', 'imprimantes-scanners', electronique_id),
      ('Réseaux & Wifi', 'شبكات و واي فاي', 'reseaux-wifi', electronique_id)
    ON CONFLICT (slug) DO NOTHING;
  END IF;

END $$;
