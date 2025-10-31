/*
  # Correction complète: Catégories et sous-catégories

  Cette migration assure que TOUTES les catégories et sous-catégories sont présentes:

  1. Catégories principales (12 au total)
    - Véhicules, Immobilier, Électronique, Mode & Beauté
    - Maison & Jardin, Loisirs & Divertissement, Emploi & Services, Animaux
    - Matériel Professionnel, Entreprises à vendre, Bébé & Enfants

  2. Toutes leurs sous-catégories (57+ au total)

  3. Sécurité: ON CONFLICT DO NOTHING pour éviter les doublons
*/

-- ============================================
-- ÉTAPE 1: CRÉER TOUTES LES CATÉGORIES PRINCIPALES
-- ============================================

INSERT INTO categories (name, name_ar, name_en, slug, parent_id, icon, order_position) VALUES
  ('Véhicules', 'مركبات', 'Vehicles', 'vehicules', NULL, 'car', 1),
  ('Immobilier', 'عقارات', 'Real Estate', 'immobilier', NULL, 'home', 2),
  ('Électronique', 'إلكترونيات', 'Electronics', 'electronique', NULL, 'smartphone', 3),
  ('Mode & Beauté', 'موضة و جمال', 'Fashion & Beauty', 'mode-beaute', NULL, 'shirt', 4),
  ('Maison & Jardin', 'منزل و حديقة', 'Home & Garden', 'maison-jardin', NULL, 'home', 5),
  ('Loisirs & Divertissement', 'ترفيه و تسلية', 'Leisure & Entertainment', 'loisirs-divertissement', NULL, 'gamepad', 6),
  ('Emploi & Services', 'وظائف و خدمات', 'Jobs & Services', 'emploi-services', NULL, 'briefcase', 7),
  ('Animaux', 'حيوانات', 'Animals', 'animaux', NULL, 'dog', 8),
  ('Matériel Professionnel', 'معدات مهنية', 'Professional Equipment', 'materiel-professionnel', NULL, 'briefcase', 9),
  ('Entreprises à vendre', 'شركات للبيع', 'Businesses for Sale', 'entreprises-vendre', NULL, 'building', 10),
  ('Bébé & Enfants', 'أطفال و رضع', 'Baby & Kids', 'bebe-enfants', NULL, 'baby', 11),
  ('Services', 'خدمات', 'Services', 'services', NULL, 'tool', 12)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  icon = EXCLUDED.icon,
  order_position = EXCLUDED.order_position;

-- ============================================
-- ÉTAPE 2: CRÉER TOUTES LES SOUS-CATÉGORIES
-- ============================================

DO $$
DECLARE
  vehicules_id uuid;
  immobilier_id uuid;
  electronique_id uuid;
  mode_beaute_id uuid;
  maison_jardin_id uuid;
  loisirs_id uuid;
  emploi_services_id uuid;
  animaux_id uuid;
  materiel_pro_id uuid;
  entreprises_id uuid;
  bebe_enfants_id uuid;
  services_id uuid;
BEGIN
  -- Récupérer tous les IDs
  SELECT id INTO vehicules_id FROM categories WHERE slug = 'vehicules';
  SELECT id INTO immobilier_id FROM categories WHERE slug = 'immobilier';
  SELECT id INTO electronique_id FROM categories WHERE slug = 'electronique';
  SELECT id INTO mode_beaute_id FROM categories WHERE slug = 'mode-beaute';
  SELECT id INTO maison_jardin_id FROM categories WHERE slug = 'maison-jardin';
  SELECT id INTO loisirs_id FROM categories WHERE slug = 'loisirs-divertissement';
  SELECT id INTO emploi_services_id FROM categories WHERE slug = 'emploi-services';
  SELECT id INTO animaux_id FROM categories WHERE slug = 'animaux';
  SELECT id INTO materiel_pro_id FROM categories WHERE slug = 'materiel-professionnel';
  SELECT id INTO entreprises_id FROM categories WHERE slug = 'entreprises-vendre';
  SELECT id INTO bebe_enfants_id FROM categories WHERE slug = 'bebe-enfants';
  SELECT id INTO services_id FROM categories WHERE slug = 'services';

  -- ============================================
  -- VÉHICULES (10 sous-catégories)
  -- ============================================
  IF vehicules_id IS NOT NULL THEN
    INSERT INTO categories (name, name_ar, name_en, slug, parent_id, order_position) VALUES
      ('Voitures', 'سيارات', 'Cars', 'voitures', vehicules_id, 1),
      ('Motos', 'دراجات نارية', 'Motorcycles', 'motos', vehicules_id, 2),
      ('Camions', 'شاحنات', 'Trucks', 'camions', vehicules_id, 3),
      ('Véhicules utilitaires', 'مركبات نفعية', 'Commercial Vehicles', 'vehicules-utilitaires', vehicules_id, 4),
      ('Pièces & Accessoires auto', 'قطع غيار و إكسسوارات', 'Auto Parts & Accessories', 'pieces-accessoires-auto', vehicules_id, 5),
      ('Véhicules agricoles', 'مركبات زراعية', 'Agricultural Vehicles', 'vehicules-agricoles', vehicules_id, 6),
      ('Bus & Minibus', 'حافلات و ميني باص', 'Buses & Minibuses', 'bus-minibus', vehicules_id, 7),
      ('Vélos & Trottinettes', 'دراجات هوائية و كهربائية', 'Bikes & Scooters', 'velos-trottinettes', vehicules_id, 8),
      ('Bateaux', 'قوارب', 'Boats', 'bateaux', vehicules_id, 9),
      ('Caravanes & Camping-cars', 'قوافل و عربات تخييم', 'Caravans & Motorhomes', 'caravanes-camping-cars', vehicules_id, 10)
    ON CONFLICT (slug) DO NOTHING;
  END IF;

  -- ============================================
  -- IMMOBILIER (10 sous-catégories)
  -- ============================================
  IF immobilier_id IS NOT NULL THEN
    INSERT INTO categories (name, name_ar, name_en, slug, parent_id, order_position) VALUES
      ('Appartements', 'شقق', 'Apartments', 'appartements', immobilier_id, 1),
      ('Maisons & Villas', 'منازل و فيلات', 'Houses & Villas', 'maisons-villas', immobilier_id, 2),
      ('Terrains', 'أراضي', 'Land', 'terrains', immobilier_id, 3),
      ('Bureaux', 'مكاتب', 'Offices', 'bureaux', immobilier_id, 4),
      ('Locaux commerciaux', 'محلات تجارية', 'Commercial Spaces', 'locaux-commerciaux', immobilier_id, 5),
      ('Hangars & Entrepôts', 'مخازن و مستودعات', 'Warehouses', 'hangars-entrepots', immobilier_id, 6),
      ('Fermes & Terrains agricoles', 'مزارع و أراضي زراعية', 'Farms & Agricultural Land', 'fermes-agricoles', immobilier_id, 7),
      ('Colocations', 'سكن مشترك', 'Roommates', 'colocations', immobilier_id, 8),
      ('Parkings & Garages', 'مواقف و كراجات', 'Parking & Garages', 'parkings-garages', immobilier_id, 9),
      ('Locations vacances', 'إيجارات عطل', 'Vacation Rentals', 'locations-vacances', immobilier_id, 10)
    ON CONFLICT (slug) DO NOTHING;
  END IF;

  -- ============================================
  -- ÉLECTRONIQUE (10 sous-catégories)
  -- ============================================
  IF electronique_id IS NOT NULL THEN
    INSERT INTO categories (name, name_ar, name_en, slug, parent_id, order_position) VALUES
      ('Téléphones', 'هواتف', 'Phones', 'telephones', electronique_id, 1),
      ('Ordinateurs', 'حواسيب', 'Computers', 'ordinateurs', electronique_id, 2),
      ('Tablettes', 'لوحات إلكترونية', 'Tablets', 'tablettes', electronique_id, 3),
      ('TV & Audio', 'تلفزيون و صوتيات', 'TV & Audio', 'tv-audio', electronique_id, 4),
      ('Appareils photo', 'كاميرات', 'Cameras', 'appareils-photo', electronique_id, 5),
      ('Consoles & Jeux vidéo', 'أجهزة ألعاب', 'Gaming Consoles', 'consoles-jeux-video', electronique_id, 6),
      ('Montres connectées', 'ساعات ذكية', 'Smart Watches', 'montres-connectees', electronique_id, 7),
      ('Drones & Robots', 'طائرات بدون طيار و روبوتات', 'Drones & Robots', 'drones-robots', electronique_id, 8),
      ('Imprimantes & Scanners', 'طابعات و ماسحات', 'Printers & Scanners', 'imprimantes-scanners', electronique_id, 9),
      ('Réseaux & Wifi', 'شبكات و واي فاي', 'Networks & Wifi', 'reseaux-wifi', electronique_id, 10)
    ON CONFLICT (slug) DO NOTHING;
  END IF;

  -- ============================================
  -- MODE & BEAUTÉ (6 sous-catégories)
  -- ============================================
  IF mode_beaute_id IS NOT NULL THEN
    INSERT INTO categories (name, name_ar, name_en, slug, parent_id, order_position) VALUES
      ('Vêtements femme', 'ملابس نسائية', 'Women''s Clothing', 'vetements-femme', mode_beaute_id, 1),
      ('Vêtements homme', 'ملابس رجالية', 'Men''s Clothing', 'vetements-homme', mode_beaute_id, 2),
      ('Chaussures', 'أحذية', 'Shoes', 'chaussures', mode_beaute_id, 3),
      ('Accessoires de mode', 'إكسسوارات موضة', 'Fashion Accessories', 'accessoires-mode', mode_beaute_id, 4),
      ('Bijoux & Montres', 'مجوهرات و ساعات', 'Jewelry & Watches', 'bijoux-montres', mode_beaute_id, 5),
      ('Produits de beauté', 'منتجات تجميل', 'Beauty Products', 'produits-beaute', mode_beaute_id, 6)
    ON CONFLICT (slug) DO NOTHING;
  END IF;

  -- ============================================
  -- MAISON & JARDIN (5 sous-catégories)
  -- ============================================
  IF maison_jardin_id IS NOT NULL THEN
    INSERT INTO categories (name, name_ar, name_en, slug, parent_id, order_position) VALUES
      ('Meubles', 'أثاث', 'Furniture', 'meubles', maison_jardin_id, 1),
      ('Électroménager', 'أجهزة منزلية', 'Home Appliances', 'electromenager', maison_jardin_id, 2),
      ('Décoration', 'ديكور', 'Decoration', 'decoration', maison_jardin_id, 3),
      ('Bricolage & Outils', 'أدوات صيانة', 'DIY & Tools', 'bricolage-outils', maison_jardin_id, 4),
      ('Jardinage', 'بستنة', 'Gardening', 'jardinage-maison', maison_jardin_id, 5)
    ON CONFLICT (slug) DO NOTHING;
  END IF;

  -- ============================================
  -- LOISIRS & DIVERTISSEMENT (5 sous-catégories)
  -- ============================================
  IF loisirs_id IS NOT NULL THEN
    INSERT INTO categories (name, name_ar, name_en, slug, parent_id, order_position) VALUES
      ('Sports & Fitness', 'رياضة و لياقة', 'Sports & Fitness', 'sports-fitness', loisirs_id, 1),
      ('Livres & Magazines', 'كتب و مجلات', 'Books & Magazines', 'livres-magazines', loisirs_id, 2),
      ('Musique & Instruments', 'موسيقى و آلات', 'Music & Instruments', 'musique-instruments', loisirs_id, 3),
      ('Collections', 'مقتنيات', 'Collectibles', 'collections', loisirs_id, 4),
      ('Billetterie', 'تذاكر', 'Tickets', 'billetterie', loisirs_id, 5)
    ON CONFLICT (slug) DO NOTHING;
  END IF;

  -- ============================================
  -- EMPLOI & SERVICES (5 sous-catégories)
  -- ============================================
  IF emploi_services_id IS NOT NULL THEN
    INSERT INTO categories (name, name_ar, name_en, slug, parent_id, order_position) VALUES
      ('Offres d''emploi', 'عروض عمل', 'Job Offers', 'offres-emploi', emploi_services_id, 1),
      ('Demandes d''emploi', 'طلبات عمل', 'Job Requests', 'demandes-emploi', emploi_services_id, 2),
      ('Cours particuliers', 'دروس خصوصية', 'Private Lessons', 'cours-particuliers', emploi_services_id, 3),
      ('Services aux entreprises', 'خدمات للشركات', 'Business Services', 'services-entreprises', emploi_services_id, 4),
      ('Événementiel', 'تنظيم الفعاليات', 'Events', 'evenementiel', emploi_services_id, 5)
    ON CONFLICT (slug) DO NOTHING;
  END IF;

  -- ============================================
  -- ANIMAUX (8 sous-catégories)
  -- ============================================
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

  -- ============================================
  -- MATÉRIEL PROFESSIONNEL (8 sous-catégories)
  -- ============================================
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

  -- ============================================
  -- ENTREPRISES À VENDRE (7 sous-catégories)
  -- ============================================
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

  -- ============================================
  -- BÉBÉ & ENFANTS (7 sous-catégories)
  -- ============================================
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

  -- ============================================
  -- SERVICES (10 sous-catégories)
  -- ============================================
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

END $$;
