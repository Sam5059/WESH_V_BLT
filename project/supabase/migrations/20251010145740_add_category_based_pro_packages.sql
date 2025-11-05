/*
  # Ajouter des forfaits PRO par catégorie
  
  1. Modifications
    - Ajout du champ category_id à pro_packages (optionnel, NULL = toutes catégories)
    - Suppression des anciens forfaits génériques
    - Création de forfaits PRO spécifiques par catégorie avec tarification différenciée
    
  2. Nouveaux Forfaits par Catégorie
    
    **Véhicules** (Catégorie Premium - forte demande)
    - Pack 5 annonces: 19,900 DA / 90 jours
    - Pack 20 annonces: 59,900 DA / 30 jours
    - Pack Illimité: 24,900 DA / 30 jours
    
    **Immobilier** (Catégorie Premium - forte demande)
    - Pack 5 annonces: 19,900 DA / 90 jours
    - Pack 20 annonces: 59,900 DA / 30 jours
    - Pack Illimité: 24,900 DA / 30 jours
    
    **Électronique** (Catégorie Standard)
    - Pack 5 annonces: 14,850 DA / 90 jours
    - Pack 20 annonces: 47,250 DA / 30 jours
    - Pack Illimité: 18,900 DA / 30 jours
    
    **Mode & Beauté** (Catégorie Standard)
    - Pack 5 annonces: 14,850 DA / 90 jours
    - Pack 20 annonces: 47,250 DA / 30 jours
    - Pack Illimité: 18,900 DA / 30 jours
    
    **Maison & Jardin** (Catégorie Standard)
    - Pack 5 annonces: 14,850 DA / 90 jours
    - Pack 20 annonces: 47,250 DA / 30 jours
    - Pack Illimité: 18,900 DA / 30 jours
    
    **Emploi** (Catégorie Économique)
    - Pack 5 annonces: 9,900 DA / 90 jours
    - Pack 20 annonces: 29,900 DA / 30 jours
    - Pack Illimité: 12,900 DA / 30 jours
    
    **Services** (Catégorie Économique)
    - Pack 5 annonces: 9,900 DA / 90 jours
    - Pack 20 annonces: 29,900 DA / 30 jours
    - Pack Illimité: 12,900 DA / 30 jours
    
    **Loisirs & Hobbies** (Catégorie Économique)
    - Pack 5 annonces: 9,900 DA / 90 jours
    - Pack 20 annonces: 29,900 DA / 30 jours
    - Pack Illimité: 12,900 DA / 30 jours
*/

-- Ajouter la colonne category_id à pro_packages
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'pro_packages' AND column_name = 'category_id'
  ) THEN
    ALTER TABLE pro_packages ADD COLUMN category_id uuid REFERENCES categories(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Supprimer les anciens forfaits
DELETE FROM pro_packages;

-- Obtenir les IDs des catégories
DO $$
DECLARE
  cat_vehicules uuid;
  cat_immobilier uuid;
  cat_electronique uuid;
  cat_mode uuid;
  cat_maison uuid;
  cat_emploi uuid;
  cat_services uuid;
  cat_loisirs uuid;
BEGIN
  -- Récupérer les IDs
  SELECT id INTO cat_vehicules FROM categories WHERE slug = 'vehicules';
  SELECT id INTO cat_immobilier FROM categories WHERE slug = 'immobilier';
  SELECT id INTO cat_electronique FROM categories WHERE slug = 'electronique';
  SELECT id INTO cat_mode FROM categories WHERE slug = 'mode-beaute';
  SELECT id INTO cat_maison FROM categories WHERE slug = 'maison-jardin';
  SELECT id INTO cat_emploi FROM categories WHERE slug = 'emploi';
  SELECT id INTO cat_services FROM categories WHERE slug = 'services';
  SELECT id INTO cat_loisirs FROM categories WHERE slug = 'loisirs';

  -- ========================================
  -- VÉHICULES (Premium)
  -- ========================================
  INSERT INTO pro_packages (category_id, name, name_ar, name_en, description, description_ar, description_en, price, duration_days, max_listings, featured_listings, priority_support, custom_branding, analytics, is_active, order_position) VALUES
  (cat_vehicules, 'Pack Véhicules Illimité', 'باقة المركبات غير محدودة', 'Vehicles Unlimited Pack', 'Annonces illimitées pour véhicules avec rafraîchissement auto', 'منشورات غير محدودة للمركبات مع تحديث تلقائي', 'Unlimited vehicle listings with auto-refresh', 24900.00, 30, NULL, 10, true, true, true, true, 1),
  (cat_vehicules, 'Pack 5 Véhicules', 'باقة 5 مركبات', '5 Vehicles Pack', '5 annonces véhicules valables 3 mois', '5 إعلانات مركبات صالحة لمدة 3 أشهر', '5 vehicle ads valid for 3 months', 19900.00, 90, 5, 2, false, false, false, true, 2),
  (cat_vehicules, 'Pack 20 Véhicules', 'باقة 20 مركبة', '20 Vehicles Pack', '20 annonces véhicules avec support prioritaire', '20 إعلان مركبة مع دعم ذو أولوية', '20 vehicle ads with priority support', 59900.00, 30, 20, 5, true, false, true, true, 3);

  -- ========================================
  -- IMMOBILIER (Premium)
  -- ========================================
  INSERT INTO pro_packages (category_id, name, name_ar, name_en, description, description_ar, description_en, price, duration_days, max_listings, featured_listings, priority_support, custom_branding, analytics, is_active, order_position) VALUES
  (cat_immobilier, 'Pack Immobilier Illimité', 'باقة العقارات غير محدودة', 'Real Estate Unlimited Pack', 'Annonces immobilières illimitées avec visibilité maximale', 'منشورات عقارية غير محدودة مع رؤية قصوى', 'Unlimited real estate listings with maximum visibility', 24900.00, 30, NULL, 10, true, true, true, true, 1),
  (cat_immobilier, 'Pack 5 Biens Immobiliers', 'باقة 5 عقارات', '5 Properties Pack', '5 annonces immobilières valables 3 mois', '5 إعلانات عقارية صالحة لمدة 3 أشهر', '5 property ads valid for 3 months', 19900.00, 90, 5, 2, false, false, false, true, 2),
  (cat_immobilier, 'Pack 20 Biens Immobiliers', 'باقة 20 عقار', '20 Properties Pack', '20 annonces immobilières avec analytics avancés', '20 إعلان عقاري مع تحليلات متقدمة', '20 property ads with advanced analytics', 59900.00, 30, 20, 5, true, false, true, true, 3);

  -- ========================================
  -- ÉLECTRONIQUE (Standard)
  -- ========================================
  INSERT INTO pro_packages (category_id, name, name_ar, name_en, description, description_ar, description_en, price, duration_days, max_listings, featured_listings, priority_support, custom_branding, analytics, is_active, order_position) VALUES
  (cat_electronique, 'Pack Électronique Illimité', 'باقة الإلكترونيات غير محدودة', 'Electronics Unlimited Pack', 'Annonces électronique illimitées avec rafraîchissement', 'منشورات إلكترونيات غير محدودة مع تحديث', 'Unlimited electronics listings with refresh', 18900.00, 30, NULL, 10, true, true, true, true, 1),
  (cat_electronique, 'Pack 5 Électronique', 'باقة 5 إلكترونيات', '5 Electronics Pack', '5 annonces électronique sur 3 mois', '5 إعلانات إلكترونيات لمدة 3 أشهر', '5 electronics ads for 3 months', 14850.00, 90, 5, 2, false, false, false, true, 2),
  (cat_electronique, 'Pack 20 Électronique', 'باقة 20 إلكترونيات', '20 Electronics Pack', '20 annonces électronique avec support', '20 إعلان إلكترونيات مع دعم', '20 electronics ads with support', 47250.00, 30, 20, 5, true, false, true, true, 3);

  -- ========================================
  -- MODE & BEAUTÉ (Standard)
  -- ========================================
  INSERT INTO pro_packages (category_id, name, name_ar, name_en, description, description_ar, description_en, price, duration_days, max_listings, featured_listings, priority_support, custom_branding, analytics, is_active, order_position) VALUES
  (cat_mode, 'Pack Mode & Beauté Illimité', 'باقة الموضة والجمال غير محدودة', 'Fashion & Beauty Unlimited', 'Annonces mode illimitées avec badge premium', 'منشورات موضة غير محدودة مع شارة مميزة', 'Unlimited fashion listings with premium badge', 18900.00, 30, NULL, 10, true, true, true, true, 1),
  (cat_mode, 'Pack 5 Mode & Beauté', 'باقة 5 موضة وجمال', '5 Fashion Pack', '5 annonces mode valables 3 mois', '5 إعلانات موضة صالحة لمدة 3 أشهر', '5 fashion ads valid for 3 months', 14850.00, 90, 5, 2, false, false, false, true, 2),
  (cat_mode, 'Pack 20 Mode & Beauté', 'باقة 20 موضة وجمال', '20 Fashion Pack', '20 annonces mode avec analytics', '20 إعلان موضة مع تحليلات', '20 fashion ads with analytics', 47250.00, 30, 20, 5, true, false, true, true, 3);

  -- ========================================
  -- MAISON & JARDIN (Standard)
  -- ========================================
  INSERT INTO pro_packages (category_id, name, name_ar, name_en, description, description_ar, description_en, price, duration_days, max_listings, featured_listings, priority_support, custom_branding, analytics, is_active, order_position) VALUES
  (cat_maison, 'Pack Maison Illimité', 'باقة المنزل غير محدودة', 'Home Unlimited Pack', 'Annonces maison & jardin illimitées', 'منشورات منزل وحديقة غير محدودة', 'Unlimited home & garden listings', 18900.00, 30, NULL, 10, true, true, true, true, 1),
  (cat_maison, 'Pack 5 Maison', 'باقة 5 منزل', '5 Home Pack', '5 annonces maison & jardin sur 3 mois', '5 إعلانات منزل وحديقة لمدة 3 أشهر', '5 home ads for 3 months', 14850.00, 90, 5, 2, false, false, false, true, 2),
  (cat_maison, 'Pack 20 Maison', 'باقة 20 منزل', '20 Home Pack', '20 annonces maison avec support', '20 إعلان منزل مع دعم', '20 home ads with support', 47250.00, 30, 20, 5, true, false, true, true, 3);

  -- ========================================
  -- EMPLOI (Économique)
  -- ========================================
  INSERT INTO pro_packages (category_id, name, name_ar, name_en, description, description_ar, description_en, price, duration_days, max_listings, featured_listings, priority_support, custom_branding, analytics, is_active, order_position) VALUES
  (cat_emploi, 'Pack Emploi Illimité', 'باقة التوظيف غير محدودة', 'Jobs Unlimited Pack', 'Offres d''emploi illimitées avec visibilité maximale', 'عروض عمل غير محدودة مع رؤية قصوى', 'Unlimited job offers with maximum visibility', 12900.00, 30, NULL, 10, true, true, true, true, 1),
  (cat_emploi, 'Pack 5 Emploi', 'باقة 5 وظائف', '5 Jobs Pack', '5 offres d''emploi valables 3 mois', '5 عروض عمل صالحة لمدة 3 أشهر', '5 job offers valid for 3 months', 9900.00, 90, 5, 2, false, false, false, true, 2),
  (cat_emploi, 'Pack 20 Emploi', 'باقة 20 وظيفة', '20 Jobs Pack', '20 offres d''emploi avec support', '20 عرض عمل مع دعم', '20 job offers with support', 29900.00, 30, 20, 5, true, false, true, true, 3);

  -- ========================================
  -- SERVICES (Économique)
  -- ========================================
  INSERT INTO pro_packages (category_id, name, name_ar, name_en, description, description_ar, description_en, price, duration_days, max_listings, featured_listings, priority_support, custom_branding, analytics, is_active, order_position) VALUES
  (cat_services, 'Pack Services Illimité', 'باقة الخدمات غير محدودة', 'Services Unlimited Pack', 'Annonces services illimitées avec rafraîchissement', 'منشورات خدمات غير محدودة مع تحديث', 'Unlimited service listings with refresh', 12900.00, 30, NULL, 10, true, true, true, true, 1),
  (cat_services, 'Pack 5 Services', 'باقة 5 خدمات', '5 Services Pack', '5 annonces services sur 3 mois', '5 إعلانات خدمات لمدة 3 أشهر', '5 service ads for 3 months', 9900.00, 90, 5, 2, false, false, false, true, 2),
  (cat_services, 'Pack 20 Services', 'باقة 20 خدمة', '20 Services Pack', '20 annonces services avec analytics', '20 إعلان خدمة مع تحليلات', '20 service ads with analytics', 29900.00, 30, 20, 5, true, false, true, true, 3);

  -- ========================================
  -- LOISIRS & HOBBIES (Économique)
  -- ========================================
  INSERT INTO pro_packages (category_id, name, name_ar, name_en, description, description_ar, description_en, price, duration_days, max_listings, featured_listings, priority_support, custom_branding, analytics, is_active, order_position) VALUES
  (cat_loisirs, 'Pack Loisirs Illimité', 'باقة الترفيه غير محدودة', 'Leisure Unlimited Pack', 'Annonces loisirs illimitées', 'منشورات ترفيه غير محدودة', 'Unlimited leisure listings', 12900.00, 30, NULL, 10, true, true, true, true, 1),
  (cat_loisirs, 'Pack 5 Loisirs', 'باقة 5 ترفيه', '5 Leisure Pack', '5 annonces loisirs sur 3 mois', '5 إعلانات ترفيه لمدة 3 أشهر', '5 leisure ads for 3 months', 9900.00, 90, 5, 2, false, false, false, true, 2),
  (cat_loisirs, 'Pack 20 Loisirs', 'باقة 20 ترفيه', '20 Leisure Pack', '20 annonces loisirs avec support', '20 إعلان ترفيه مع دعم', '20 leisure ads with support', 29900.00, 30, 20, 5, true, false, true, true, 3);

END $$;
