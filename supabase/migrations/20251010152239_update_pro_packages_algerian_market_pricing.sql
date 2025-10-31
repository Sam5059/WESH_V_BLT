/*
  # Mise à jour des forfaits PRO avec tarifs réalistes du marché algérien
  
  Basé sur l'analyse du marché algérien (style Ouedkniss), voici les tarifs adaptés:
  
  1. Modifications
    - Suppression des anciens forfaits avec prix trop élevés
    - Création de forfaits avec tarification réaliste du marché algérien
    - Prix plus accessibles pour encourager l'adoption
    
  2. Nouveaux Forfaits par Catégorie (Tarifs Algériens Réalistes)
    
    **🚗 Véhicules** (Catégorie Premium - forte demande)
    - Pack 3 mois: 3,000 DA (1 annonce, 90 jours, à la une)
    - Pack Mensuel: 5,000 DA (5 annonces/mois, rafraîchissement)
    - Pack Pro 6 mois: 12,000 DA (illimité, 6 mois, stats)
    
    **🏠 Immobilier** (Catégorie Premium - forte demande, cycle long)
    - Pack 3 mois: 4,000 DA (1 annonce, 90 jours, à la une)
    - Pack Mensuel: 6,000 DA (3 annonces/mois, rafraîchissement)
    - Pack Pro 6 mois: 15,000 DA (illimité, 6 mois, stats)
    
    **📱 Électronique** (Catégorie Standard - rotation rapide)
    - Pack 1 mois: 1,500 DA (3 annonces, 30 jours)
    - Pack 3 mois: 3,500 DA (10 annonces, 90 jours)
    - Pack Mensuel: 5,000 DA (illimité/mois, rafraîchissement)
    
    **👗 Mode & Beauté** (Catégorie Standard - rotation rapide)
    - Pack 1 mois: 1,500 DA (5 annonces, 30 jours)
    - Pack 3 mois: 3,500 DA (15 annonces, 90 jours)
    - Pack Mensuel: 5,000 DA (illimité/mois, rafraîchissement)
    
    **🏡 Maison & Jardin** (Catégorie Standard)
    - Pack 1 mois: 1,500 DA (3 annonces, 30 jours)
    - Pack 3 mois: 3,500 DA (10 annonces, 90 jours)
    - Pack Mensuel: 5,000 DA (illimité/mois, rafraîchissement)
    
    **💼 Emploi** (Catégorie Accessible - service public)
    - Pack 1 mois: 1,000 DA (5 annonces, 30 jours)
    - Pack 3 mois: 2,500 DA (illimité, 90 jours)
    - Pack 6 mois: 4,000 DA (illimité, 180 jours, stats)
    
    **🔧 Services** (Catégorie Accessible)
    - Pack 1 mois: 1,000 DA (5 annonces, 30 jours)
    - Pack 3 mois: 2,500 DA (illimité, 90 jours)
    - Pack 6 mois: 4,000 DA (illimité, 180 jours, stats)
    
    **🎮 Loisirs & Hobbies** (Catégorie Accessible)
    - Pack 1 mois: 1,000 DA (5 annonces, 30 jours)
    - Pack 3 mois: 2,500 DA (illimité, 90 jours)
    - Pack 6 mois: 4,000 DA (illimité, 180 jours, stats)
    
  3. Logique de Tarification
    - Véhicules: Prix moyen car forte demande + valeur élevée des biens
    - Immobilier: Prix plus élevé car cycle de vente long (3-6 mois minimum)
    - Électronique/Mode: Prix modérés car rotation rapide
    - Emploi/Services/Loisirs: Prix accessibles pour favoriser l'emploi et les services
*/

-- Supprimer tous les anciens forfaits
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
  -- 🚗 VÉHICULES (Premium)
  -- ========================================
  INSERT INTO pro_packages (category_id, name, name_ar, name_en, description, description_ar, description_en, price, duration_days, max_listings, featured_listings, priority_support, custom_branding, analytics, is_active, order_position) VALUES
  (cat_vehicules, 'Pack Pro 6 Mois Véhicules', 'باقة محترف 6 أشهر مركبات', 'Pro 6 Months Vehicles', 'Annonces illimitées pendant 6 mois avec statistiques avancées', 'إعلانات غير محدودة لمدة 6 أشهر مع إحصائيات متقدمة', 'Unlimited ads for 6 months with advanced stats', 12000.00, 180, NULL, 10, true, true, true, true, 1),
  (cat_vehicules, 'Pack Mensuel Véhicules', 'باقة شهرية مركبات', 'Monthly Vehicles Pack', '5 annonces par mois avec rafraîchissement automatique', '5 إعلانات شهريا مع تحديث تلقائي', '5 ads per month with auto-refresh', 5000.00, 30, 5, 3, false, true, false, true, 2),
  (cat_vehicules, 'Pack 3 Mois Véhicule', 'باقة 3 أشهر مركبة', '3 Months Vehicle Pack', '1 annonce véhicule mise en avant pendant 3 mois', 'إعلان مركبة واحد مميز لمدة 3 أشهر', '1 featured vehicle ad for 3 months', 3000.00, 90, 1, 1, false, false, false, true, 3);

  -- ========================================
  -- 🏠 IMMOBILIER (Premium - cycle long)
  -- ========================================
  INSERT INTO pro_packages (category_id, name, name_ar, name_en, description, description_ar, description_en, price, duration_days, max_listings, featured_listings, priority_support, custom_branding, analytics, is_active, order_position) VALUES
  (cat_immobilier, 'Pack Pro 6 Mois Immobilier', 'باقة محترف 6 أشهر عقارات', 'Pro 6 Months Real Estate', 'Annonces illimitées 6 mois - Idéal agences immobilières', 'إعلانات غير محدودة 6 أشهر - مثالي للوكالات العقارية', 'Unlimited ads 6 months - Perfect for agencies', 15000.00, 180, NULL, 10, true, true, true, true, 1),
  (cat_immobilier, 'Pack Mensuel Immobilier', 'باقة شهرية عقارات', 'Monthly Real Estate Pack', '3 biens immobiliers avec rafraîchissement et visibilité maximale', '3 عقارات مع تحديث ورؤية قصوى', '3 properties with refresh and max visibility', 6000.00, 30, 3, 2, true, true, false, true, 2),
  (cat_immobilier, 'Pack 3 Mois Bien Immobilier', 'باقة 3 أشهر عقار', '3 Months Property Pack', '1 bien immobilier en vedette pendant 3 mois', 'عقار واحد مميز لمدة 3 أشهر', '1 featured property for 3 months', 4000.00, 90, 1, 1, false, false, false, true, 3);

  -- ========================================
  -- 📱 ÉLECTRONIQUE (Standard - rotation rapide)
  -- ========================================
  INSERT INTO pro_packages (category_id, name, name_ar, name_en, description, description_ar, description_en, price, duration_days, max_listings, featured_listings, priority_support, custom_branding, analytics, is_active, order_position) VALUES
  (cat_electronique, 'Pack Mensuel Électronique', 'باقة شهرية إلكترونيات', 'Monthly Electronics Pack', 'Annonces illimitées avec rafraîchissement quotidien', 'إعلانات غير محدودة مع تحديث يومي', 'Unlimited ads with daily refresh', 5000.00, 30, NULL, 5, true, true, true, true, 1),
  (cat_electronique, 'Pack 3 Mois Électronique', 'باقة 3 أشهر إلكترونيات', '3 Months Electronics Pack', '10 annonces électronique sur 3 mois', '10 إعلانات إلكترونيات لمدة 3 أشهر', '10 electronics ads for 3 months', 3500.00, 90, 10, 3, false, false, false, true, 2),
  (cat_electronique, 'Pack Starter Électronique', 'باقة البداية إلكترونيات', 'Starter Electronics Pack', '3 annonces électronique pour 1 mois', '3 إعلانات إلكترونيات لمدة شهر', '3 electronics ads for 1 month', 1500.00, 30, 3, 1, false, false, false, true, 3);

  -- ========================================
  -- 👗 MODE & BEAUTÉ (Standard - rotation rapide)
  -- ========================================
  INSERT INTO pro_packages (category_id, name, name_ar, name_en, description, description_ar, description_en, price, duration_days, max_listings, featured_listings, priority_support, custom_branding, analytics, is_active, order_position) VALUES
  (cat_mode, 'Pack Mensuel Mode & Beauté', 'باقة شهرية موضة وجمال', 'Monthly Fashion Pack', 'Illimité - Parfait pour boutiques et influenceurs', 'غير محدود - مثالي للمحلات والمؤثرين', 'Unlimited - Perfect for shops and influencers', 5000.00, 30, NULL, 5, true, true, true, true, 1),
  (cat_mode, 'Pack 3 Mois Mode', 'باقة 3 أشهر موضة', '3 Months Fashion Pack', '15 articles mode pendant 3 mois', '15 منتج موضة لمدة 3 أشهر', '15 fashion items for 3 months', 3500.00, 90, 15, 3, false, false, false, true, 2),
  (cat_mode, 'Pack Starter Mode', 'باقة البداية موضة', 'Starter Fashion Pack', '5 articles mode pour 1 mois', '5 منتجات موضة لمدة شهر', '5 fashion items for 1 month', 1500.00, 30, 5, 1, false, false, false, true, 3);

  -- ========================================
  -- 🏡 MAISON & JARDIN (Standard)
  -- ========================================
  INSERT INTO pro_packages (category_id, name, name_ar, name_en, description, description_ar, description_en, price, duration_days, max_listings, featured_listings, priority_support, custom_branding, analytics, is_active, order_position) VALUES
  (cat_maison, 'Pack Mensuel Maison', 'باقة شهرية منزل', 'Monthly Home Pack', 'Annonces illimitées maison & jardin', 'إعلانات غير محدودة منزل وحديقة', 'Unlimited home & garden ads', 5000.00, 30, NULL, 5, true, true, true, true, 1),
  (cat_maison, 'Pack 3 Mois Maison', 'باقة 3 أشهر منزل', '3 Months Home Pack', '10 articles maison & jardin sur 3 mois', '10 منتجات منزل وحديقة لمدة 3 أشهر', '10 home items for 3 months', 3500.00, 90, 10, 3, false, false, false, true, 2),
  (cat_maison, 'Pack Starter Maison', 'باقة البداية منزل', 'Starter Home Pack', '3 articles maison pour 1 mois', '3 منتجات منزل لمدة شهر', '3 home items for 1 month', 1500.00, 30, 3, 1, false, false, false, true, 3);

  -- ========================================
  -- 💼 EMPLOI (Accessible - service public)
  -- ========================================
  INSERT INTO pro_packages (category_id, name, name_ar, name_en, description, description_ar, description_en, price, duration_days, max_listings, featured_listings, priority_support, custom_branding, analytics, is_active, order_position) VALUES
  (cat_emploi, 'Pack Pro 6 Mois Emploi', 'باقة محترف 6 أشهر توظيف', 'Pro 6 Months Jobs', 'Offres illimitées 6 mois avec statistiques - Idéal recruteurs', 'عروض غير محدودة 6 أشهر مع إحصائيات', 'Unlimited offers 6 months with stats', 4000.00, 180, NULL, 5, true, true, true, true, 1),
  (cat_emploi, 'Pack 3 Mois Emploi', 'باقة 3 أشهر توظيف', '3 Months Jobs Pack', 'Offres d''emploi illimitées pendant 3 mois', 'عروض عمل غير محدودة لمدة 3 أشهر', 'Unlimited job offers for 3 months', 2500.00, 90, NULL, 3, false, false, false, true, 2),
  (cat_emploi, 'Pack Mensuel Emploi', 'باقة شهرية توظيف', 'Monthly Jobs Pack', '5 offres d''emploi pour 1 mois', '5 عروض عمل لمدة شهر', '5 job offers for 1 month', 1000.00, 30, 5, 1, false, false, false, true, 3);

  -- ========================================
  -- 🔧 SERVICES (Accessible)
  -- ========================================
  INSERT INTO pro_packages (category_id, name, name_ar, name_en, description, description_ar, description_en, price, duration_days, max_listings, featured_listings, priority_support, custom_branding, analytics, is_active, order_position) VALUES
  (cat_services, 'Pack Pro 6 Mois Services', 'باقة محترف 6 أشهر خدمات', 'Pro 6 Months Services', 'Services illimités 6 mois - Artisans et professionnels', 'خدمات غير محدودة 6 أشهر - حرفيين ومحترفين', 'Unlimited services 6 months', 4000.00, 180, NULL, 5, true, true, true, true, 1),
  (cat_services, 'Pack 3 Mois Services', 'باقة 3 أشهر خدمات', '3 Months Services Pack', 'Services illimités pendant 3 mois', 'خدمات غير محدودة لمدة 3 أشهر', 'Unlimited services for 3 months', 2500.00, 90, NULL, 3, false, false, false, true, 2),
  (cat_services, 'Pack Mensuel Services', 'باقة شهرية خدمات', 'Monthly Services Pack', '5 annonces services pour 1 mois', '5 إعلانات خدمات لمدة شهر', '5 service ads for 1 month', 1000.00, 30, 5, 1, false, false, false, true, 3);

  -- ========================================
  -- 🎮 LOISIRS & HOBBIES (Accessible)
  -- ========================================
  INSERT INTO pro_packages (category_id, name, name_ar, name_en, description, description_ar, description_en, price, duration_days, max_listings, featured_listings, priority_support, custom_branding, analytics, is_active, order_position) VALUES
  (cat_loisirs, 'Pack Pro 6 Mois Loisirs', 'باقة محترف 6 أشهر ترفيه', 'Pro 6 Months Leisure', 'Annonces illimitées 6 mois avec statistiques', 'إعلانات غير محدودة 6 أشهر مع إحصائيات', 'Unlimited ads 6 months with stats', 4000.00, 180, NULL, 5, true, true, true, true, 1),
  (cat_loisirs, 'Pack 3 Mois Loisirs', 'باقة 3 أشهر ترفيه', '3 Months Leisure Pack', 'Annonces illimitées pendant 3 mois', 'إعلانات غير محدودة لمدة 3 أشهر', 'Unlimited ads for 3 months', 2500.00, 90, NULL, 3, false, false, false, true, 2),
  (cat_loisirs, 'Pack Mensuel Loisirs', 'باقة شهرية ترفيه', 'Monthly Leisure Pack', '5 annonces loisirs pour 1 mois', '5 إعلانات ترفيه لمدة شهر', '5 leisure ads for 1 month', 1000.00, 30, 5, 1, false, false, false, true, 3);

END $$;
