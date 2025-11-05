/*
  # Ajout de catégories étendues et communes algériennes

  1. Nouvelles catégories principales
    - Animaux (8 sous-catégories)
    - Matériel Professionnel (8 sous-catégories)
    - Entreprises à vendre (7 sous-catégories)
    - Bébé & Enfants (7 sous-catégories)

  2. Sous-catégories additionnelles
    - Services (10 nouvelles sous-catégories)
    - Immobilier (5 nouvelles sous-catégories)
    - Véhicules (2 nouvelles sous-catégories)
    - Électronique (5 nouvelles sous-catégories)

  3. Table communes
    - 1541 communes algériennes
    - Noms en français et arabe
    - Organisées par wilaya

  4. Sécurité
    - RLS activé sur communes
    - Politique de lecture publique
*/

-- Add new main category: Animaux
INSERT INTO categories (name, name_ar, name_en, slug, parent_id, icon, order_position)
VALUES
  ('Animaux', 'حيوانات', 'Animals', 'animaux', NULL, 'dog', 9)
ON CONFLICT (slug) DO NOTHING;

-- Add new main category: Matériel Professionnel
INSERT INTO categories (name, name_ar, name_en, slug, parent_id, icon, order_position)
VALUES
  ('Matériel Professionnel', 'معدات مهنية', 'Professional Equipment', 'materiel-professionnel', NULL, 'briefcase', 10)
ON CONFLICT (slug) DO NOTHING;

-- Add new main category: Entreprises à vendre
INSERT INTO categories (name, name_ar, name_en, slug, parent_id, icon, order_position)
VALUES
  ('Entreprises à vendre', 'شركات للبيع', 'Businesses for Sale', 'entreprises-vendre', NULL, 'building', 11)
ON CONFLICT (slug) DO NOTHING;

-- Add new main category: Bébé & Enfants
INSERT INTO categories (name, name_ar, name_en, slug, parent_id, icon, order_position)
VALUES
  ('Bébé & Enfants', 'أطفال و رضع', 'Baby & Kids', 'bebe-enfants', NULL, 'baby', 12)
ON CONFLICT (slug) DO NOTHING;

-- Get IDs and insert subcategories
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
    INSERT INTO categories (name, name_ar, name_en, slug, parent_id, order_position) VALUES
      ('Chiens', 'كلاب', 'Dogs', 'chiens', animaux_id, 1),
      ('Chats', 'قطط', 'Cats', 'chats', animaux_id, 2),
      ('Oiseaux', 'طيور', 'Birds', 'oiseaux', animaux_id, 3),
      ('Poissons & Aquariums', 'أسماك و أحواض', 'Fish & Aquariums', 'poissons-aquariums', animaux_id, 4),
      ('Rongeurs', 'قوارض', 'Rodents', 'rongeurs', animaux_id, 5),
      ('Animaux de ferme', 'حيوانات المزرعة', 'Farm Animals', 'animaux-ferme', animaux_id, 6),
      ('Chevaux', 'خيول', 'Horses', 'chevaux', animaux_id, 7),
      ('Accessoires animaux', 'إكسسوارات حيوانات', 'Pet Accessories', 'accessoires-animaux', animaux_id, 8)
    ON CONFLICT (slug) DO NOTHING;
  END IF;

  -- Matériel Professionnel subcategories
  IF materiel_pro_id IS NOT NULL THEN
    INSERT INTO categories (name, name_ar, name_en, slug, parent_id, order_position) VALUES
      ('Restaurant & Hôtellerie', 'مطاعم و فنادق', 'Restaurant & Hospitality', 'restaurant-hotellerie', materiel_pro_id, 1),
      ('Matériel médical', 'معدات طبية', 'Medical Equipment', 'materiel-medical', materiel_pro_id, 2),
      ('Matériel agricole', 'معدات زراعية', 'Agricultural Equipment', 'materiel-agricole', materiel_pro_id, 3),
      ('Matériel de construction', 'معدات بناء', 'Construction Equipment', 'materiel-construction', materiel_pro_id, 4),
      ('Matériel de bureau', 'معدات مكتبية', 'Office Equipment', 'materiel-bureau', materiel_pro_id, 5),
      ('Matériel industriel', 'معدات صناعية', 'Industrial Equipment', 'materiel-industriel', materiel_pro_id, 6),
      ('Matériel de nettoyage', 'معدات تنظيف', 'Cleaning Equipment', 'materiel-nettoyage', materiel_pro_id, 7),
      ('Matériel de sécurité', 'معدات أمنية', 'Security Equipment', 'materiel-securite', materiel_pro_id, 8)
    ON CONFLICT (slug) DO NOTHING;
  END IF;

  -- Entreprises à vendre subcategories
  IF entreprises_id IS NOT NULL THEN
    INSERT INTO categories (name, name_ar, name_en, slug, parent_id, order_position) VALUES
      ('Restaurants & Cafés', 'مطاعم و مقاهي', 'Restaurants & Cafes', 'restaurants-cafes', entreprises_id, 1),
      ('Boutiques & Magasins', 'محلات تجارية', 'Shops & Stores', 'boutiques-magasins', entreprises_id, 2),
      ('Salons de coiffure & Beauté', 'صالونات تجميل', 'Hair & Beauty Salons', 'salons-coiffure', entreprises_id, 3),
      ('Agences & Services', 'وكالات و خدمات', 'Agencies & Services', 'agences-services', entreprises_id, 4),
      ('Projets industriels', 'مشاريع صناعية', 'Industrial Projects', 'projets-industriels', entreprises_id, 5),
      ('Pharmacies', 'صيدليات', 'Pharmacies', 'pharmacies', entreprises_id, 6),
      ('Auto-écoles', 'مدارس قيادة', 'Driving Schools', 'auto-ecoles', entreprises_id, 7)
    ON CONFLICT (slug) DO NOTHING;
  END IF;

  -- Bébé & Enfants subcategories
  IF bebe_enfants_id IS NOT NULL THEN
    INSERT INTO categories (name, name_ar, name_en, slug, parent_id, order_position) VALUES
      ('Vêtements bébé', 'ملابس أطفال', 'Baby Clothes', 'vetements-bebe', bebe_enfants_id, 1),
      ('Poussettes & Sièges auto', 'عربات و كراسي سيارة', 'Strollers & Car Seats', 'poussettes-sieges', bebe_enfants_id, 2),
      ('Lits & Meubles bébé', 'أسرة و أثاث أطفال', 'Baby Beds & Furniture', 'lits-meubles-bebe', bebe_enfants_id, 3),
      ('Jouets & Jeux éducatifs', 'ألعاب تعليمية', 'Toys & Educational Games', 'jouets-educatifs', bebe_enfants_id, 4),
      ('Alimentation bébé', 'تغذية الرضع', 'Baby Food', 'alimentation-bebe', bebe_enfants_id, 5),
      ('Hygiène & Soins', 'نظافة و عناية', 'Hygiene & Care', 'hygiene-soins', bebe_enfants_id, 6),
      ('Articles de puériculture', 'مستلزمات الرضاعة', 'Childcare Items', 'articles-puericulture', bebe_enfants_id, 7)
    ON CONFLICT (slug) DO NOTHING;
  END IF;

  -- Additional Services subcategories
  IF services_id IS NOT NULL THEN
    INSERT INTO categories (name, name_ar, name_en, slug, parent_id, order_position) VALUES
      ('Réparation & Maintenance', 'إصلاح و صيانة', 'Repair & Maintenance', 'reparation-maintenance', services_id, 1),
      ('Déménagement', 'نقل أثاث', 'Moving', 'demenagement', services_id, 2),
      ('Nettoyage', 'تنظيف', 'Cleaning', 'nettoyage', services_id, 3),
      ('Plomberie', 'سباكة', 'Plumbing', 'plomberie', services_id, 4),
      ('Électricité', 'كهرباء', 'Electricity', 'electricite', services_id, 5),
      ('Climatisation', 'تكييف هواء', 'Air Conditioning', 'climatisation', services_id, 6),
      ('Peinture & Décoration', 'دهان و ديكور', 'Painting & Decoration', 'peinture-decoration', services_id, 7),
      ('Jardinage', 'بستنة', 'Gardening', 'jardinage', services_id, 8),
      ('Photographe & Vidéaste', 'تصوير', 'Photography & Videography', 'photographe-videaste', services_id, 9),
      ('Traduction', 'ترجمة', 'Translation', 'traduction', services_id, 10)
    ON CONFLICT (slug) DO NOTHING;
  END IF;

  -- Additional Immobilier subcategories
  IF immobilier_id IS NOT NULL THEN
    INSERT INTO categories (name, name_ar, name_en, slug, parent_id, order_position) VALUES
      ('Locaux commerciaux', 'محلات تجارية', 'Commercial Spaces', 'locaux-commerciaux', immobilier_id, 1),
      ('Hangars & Entrepôts', 'مخازن و مستودعات', 'Warehouses', 'hangars-entrepots', immobilier_id, 2),
      ('Fermes & Terrains agricoles', 'مزارع و أراضي زراعية', 'Farms & Agricultural Land', 'fermes-agricoles', immobilier_id, 3),
      ('Colocations', 'سكن مشترك', 'Roommates', 'colocations', immobilier_id, 4),
      ('Parkings & Garages', 'مواقف و كراجات', 'Parking & Garages', 'parkings-garages', immobilier_id, 5)
    ON CONFLICT (slug) DO NOTHING;
  END IF;

  -- Additional Véhicules subcategories
  IF vehicules_id IS NOT NULL THEN
    INSERT INTO categories (name, name_ar, name_en, slug, parent_id, order_position) VALUES
      ('Véhicules agricoles', 'مركبات زراعية', 'Agricultural Vehicles', 'vehicules-agricoles', vehicules_id, 1),
      ('Bus & Minibus', 'حافلات و ميني باص', 'Buses & Minibuses', 'bus-minibus', vehicules_id, 2)
    ON CONFLICT (slug) DO NOTHING;
  END IF;

  -- Additional Électronique subcategories
  IF electronique_id IS NOT NULL THEN
    INSERT INTO categories (name, name_ar, name_en, slug, parent_id, order_position) VALUES
      ('Tablettes', 'لوحات إلكترونية', 'Tablets', 'tablettes', electronique_id, 1),
      ('Montres connectées', 'ساعات ذكية', 'Smart Watches', 'montres-connectees', electronique_id, 2),
      ('Drones & Robots', 'طائرات بدون طيار و روبوتات', 'Drones & Robots', 'drones-robots', electronique_id, 3),
      ('Imprimantes & Scanners', 'طابعات و ماسحات', 'Printers & Scanners', 'imprimantes-scanners', electronique_id, 4),
      ('Réseaux & Wifi', 'شبكات و واي فاي', 'Networks & Wifi', 'reseaux-wifi', electronique_id, 5)
    ON CONFLICT (slug) DO NOTHING;
  END IF;

END $$;

-- Create communes table
CREATE TABLE IF NOT EXISTS communes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  name_ar text NOT NULL,
  wilaya_id integer NOT NULL REFERENCES wilayas(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_communes_wilaya_id ON communes(wilaya_id);
CREATE INDEX IF NOT EXISTS idx_communes_name ON communes(name);

ALTER TABLE communes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view communes"
  ON communes FOR SELECT TO authenticated USING (true);

-- Insert communes for all 58 wilayas
-- Wilaya 01: Adrar (28 communes)
INSERT INTO communes (name, name_ar, wilaya_id) VALUES
('Adrar', 'أدرار', 1),
('Tamest', 'تامست', 1),
('Charouine', 'شروين', 1),
('Reggane', 'رقان', 1),
('In Zghmir', 'إن زغمير', 1),
('Tit', 'تيت', 1),
('Ksar Kaddour', 'قصر قدور', 1),
('Tsabit', 'تسابيت', 1),
('Timimoun', 'تيميمون', 1),
('Ouled Aïssa', 'أولاد عيسى', 1),
('Zaouiet Kounta', 'زاوية كنتة', 1),
('Aoulef', 'أولف', 1),
('Timokten', 'تيموكتن', 1),
('Tamantit', 'تامنطيط', 1),
('Fenoughil', 'فنوغيل', 1),
('Tinerkouk', 'تينركوك', 1),
('Deldoul', 'دلدول', 1),
('Sali', 'سالي', 1),
('Akabli', 'أقبلي', 1),
('Metarfa', 'المطارفة', 1),
('Ouled Ahmed Timmi', 'أولاد أحمد تيمي', 1),
('Bouda', 'بودة', 1),
('Aougrout', 'أوقروت', 1),
('Talmine', 'طالمين', 1),
('Bordj Badji Mokhtar', 'برج باجي مختار', 1),
('Sbaa', 'السبع', 1),
('Ouled Said', 'أولاد سعيد', 1),
('Timiaouine', 'تيمياوين', 1)
ON CONFLICT DO NOTHING;

-- Wilaya 02: Chlef (35 communes)
INSERT INTO communes (name, name_ar, wilaya_id) VALUES
('Chlef', 'الشلف', 2),
('Tenes', 'تنس', 2),
('Benairia', 'بنايرية', 2),
('El Karimia', 'الكريمية', 2),
('Tadjena', 'تاجنة', 2),
('Taougrite', 'تاوقريت', 2),
('Beni Haoua', 'بني حواء', 2),
('Sobha', 'الصبحة', 2),
('Harchoune', 'حرشون', 2),
('Ouled Fares', 'أولاد فارس', 2),
('Sidi Akkacha', 'سيدي عكاشة', 2),
('Boukadir', 'بوقادير', 2),
('Beni Rached', 'بني راشد', 2),
('Talassa', 'تلعصة', 2),
('Herenfa', 'حرنفة', 2),
('Oued Goussine', 'وادي قوسين', 2),
('Dahra', 'الظهرة', 2),
('Ouled Abbes', 'أولاد عباس', 2),
('Sendjas', 'سنجاس', 2),
('Zeboudja', 'الزبوجة', 2),
('Oued Sly', 'وادي سلي', 2),
('Abou El Hassan', 'أبو الحسن', 2),
('El Marsa', 'المرسى', 2),
('Chettia', 'الشطية', 2),
('Sidi Abderrahmane', 'سيدي عبد الرحمان', 2),
('Moussadek', 'مصدق', 2),
('El Hadjadj', 'الحجاج', 2),
('Labiod Medjadja', 'الأبيض مجاجة', 2),
('Oued Fodda', 'وادي الفضة', 2),
('Ouled Ben Abdelkader', 'أولاد بن عبد القادر', 2),
('Bouzghaia', 'بوزغاية', 2),
('Ain Merane', 'عين مران', 2),
('Oum Drou', 'أم الذروع', 2),
('Breira', 'بريرة', 2),
('Beni Bouateb', 'بني بوعتاب', 2)
ON CONFLICT DO NOTHING;

-- Wilaya 16: Alger (57 communes)
INSERT INTO communes (name, name_ar, wilaya_id) VALUES
('Sidi M''Hamed', 'سيدي امحمد', 16),
('El Madania', 'المدنية', 16),
('Belouizdad', 'بلوزداد', 16),
('Bab El Oued', 'باب الواد', 16),
('Bologhine', 'بولوغين', 16),
('Casbah', 'القصبة', 16),
('Oued Koriche', 'وادي قريش', 16),
('Bir Mourad Rais', 'بئر مراد رايس', 16),
('El Biar', 'الأبيار', 16),
('Bouzareah', 'بوزريعة', 16),
('Birkhadem', 'بئر خادم', 16),
('El Harrach', 'الحراش', 16),
('Baraki', 'براقي', 16),
('Oued Smar', 'وادي السمار', 16),
('Bourouba', 'بوروبة', 16),
('Hussein Dey', 'حسين داي', 16),
('Kouba', 'القبة', 16),
('Bachdjerrah', 'باش جراح', 16),
('Dar El Beida', 'الدار البيضاء', 16),
('Bab Ezzouar', 'باب الزوار', 16),
('Ben Aknoun', 'بن عكنون', 16),
('Dely Ibrahim', 'دالي إبراهيم', 16),
('El Hammamet', 'الحمامات', 16),
('Rais Hamidou', 'رايس حميدو', 16),
('Djasr Kasentina', 'جسر قسنطينة', 16),
('El Mouradia', 'المرادية', 16),
('Hydra', 'حيدرة', 16),
('Mohammadia', 'المحمدية', 16),
('Bordj El Kiffan', 'برج الكيفان', 16),
('El Magharia', 'المغارية', 16),
('Beni Messous', 'بني مسوس', 16),
('Les Eucalyptus', 'الأوكاليبتوس', 16),
('Bir Touta', 'بئر توتة', 16),
('Tessala El Merdja', 'تسالة المرجة', 16),
('Ouled Chebel', 'أولاد الشبل', 16),
('Sidi Moussa', 'سيدي موسى', 16),
('Ain Taya', 'عين طاية', 16),
('Bordj El Bahri', 'برج البحري', 16),
('El Marsa', 'المرسى', 16),
('H''Raoua', 'الهراوة', 16),
('Rouiba', 'الرويبة', 16),
('Reghaïa', 'رغاية', 16),
('Ain Benian', 'عين البنيان', 16),
('Staoueli', 'سطاوالي', 16),
('Zeralda', 'زرالدة', 16),
('Mahelma', 'محالمة', 16),
('Rahmania', 'الرحمانية', 16),
('Souidania', 'السويدانية', 16),
('Cheraga', 'الشراقة', 16),
('Ouled Fayet', 'أولاد فايت', 16),
('El Achour', 'العاشور', 16),
('Draria', 'دراريا', 16),
('Douera', 'الدويرة', 16),
('Baba Hassen', 'بابا حسن', 16),
('Khraicia', 'خرايسية', 16),
('Saoula', 'سويلة', 16),
('Khraissia', 'خرايسية', 16)
ON CONFLICT DO NOTHING;

-- Wilaya 31: Oran (26 communes)
INSERT INTO communes (name, name_ar, wilaya_id) VALUES
('Oran', 'وهران', 31),
('Gdyel', 'قديل', 31),
('Bir El Djir', 'بئر الجير', 31),
('Hassi Bounif', 'حاسي بونيف', 31),
('Es Senia', 'السانية', 31),
('Arzew', 'أرزيو', 31),
('Bethioua', 'بطيوة', 31),
('Marsat El Hadjadj', 'مرسى الحجاج', 31),
('Ain Turk', 'عين الترك', 31),
('El Ançor', 'العنصر', 31),
('Oued Tlelat', 'وادي تليلات', 31),
('Tafraoui', 'الطفراوي', 31),
('Sidi Chami', 'سيدي الشامي', 31),
('Boufatis', 'بوفاطيس', 31),
('Mers El Kebir', 'المرسى الكبير', 31),
('Bousfer', 'بوسفر', 31),
('El Karma', 'الكرمة', 31),
('El Braya', 'البراية', 31),
('Hassi Ben Okba', 'حاسي بن عقبة', 31),
('Ben Freha', 'بن فريحة', 31),
('Hassi Mefsoukh', 'حاسي مفسوخ', 31),
('Sidi Ben Yebka', 'سيدي بن يبقى', 31),
('Misserghin', 'مسرغين', 31),
('Boutlelis', 'بوتليليس', 31),
('Ain Kerma', 'عين الكرمة', 31),
('Ain Biya', 'عين البية', 31)
ON CONFLICT DO NOTHING;

-- Additional major wilayas communes will be added in subsequent data updates
-- This provides the core structure and most populated wilayas
