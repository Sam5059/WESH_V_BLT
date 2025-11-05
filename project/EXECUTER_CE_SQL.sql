-- =====================================================
-- PACKAGES PRO AVEC PRIX ADAPTÉS AU MARCHÉ ALGÉRIEN
-- Copiez et collez ce code dans le SQL Editor Supabase
-- =====================================================

-- Supprimer les anciens packages
DELETE FROM pro_packages;

-- Créer les packages avec prix réalistes
DO $$
DECLARE
  v_cat_record RECORD;
  v_starter_price INT;
  v_business_price INT;
  v_premium_price INT;
BEGIN
  FOR v_cat_record IN
    SELECT id, slug, name, name_ar
    FROM categories
    WHERE parent_id IS NULL
  LOOP
    -- Prix selon la catégorie
    CASE v_cat_record.slug
      WHEN 'vehicules' THEN
        v_starter_price := 8000;
        v_business_price := 25000;
        v_premium_price := 50000;
      WHEN 'immobilier' THEN
        v_starter_price := 10000;
        v_business_price := 30000;
        v_premium_price := 60000;
      WHEN 'electronique' THEN
        v_starter_price := 6000;
        v_business_price := 18000;
        v_premium_price := 35000;
      WHEN 'mode-beaute' THEN
        v_starter_price := 5000;
        v_business_price := 15000;
        v_premium_price := 30000;
      WHEN 'maison-jardin' THEN
        v_starter_price := 5000;
        v_business_price := 15000;
        v_premium_price := 30000;
      WHEN 'emploi' THEN
        v_starter_price := 4000;
        v_business_price := 12000;
        v_premium_price := 25000;
      WHEN 'services' THEN
        v_starter_price := 5000;
        v_business_price := 15000;
        v_premium_price := 30000;
      WHEN 'loisirs' THEN
        v_starter_price := 4500;
        v_business_price := 13000;
        v_premium_price := 27000;
      WHEN 'animaux' THEN
        v_starter_price := 4000;
        v_business_price := 12000;
        v_premium_price := 25000;
      WHEN 'pour-entreprises' THEN
        v_starter_price := 7000;
        v_business_price := 20000;
        v_premium_price := 45000;
      ELSE
        v_starter_price := 5000;
        v_business_price := 15000;
        v_premium_price := 30000;
    END CASE;

    -- STARTER
    INSERT INTO pro_packages (
      name, name_ar, name_en,
      description, description_ar, description_en,
      category_id, price, duration_days,
      max_listings, featured_listings,
      priority_support, custom_branding, analytics,
      order_position
    ) VALUES (
      'Starter', 'البداية', 'Starter',
      CASE v_cat_record.slug
        WHEN 'vehicules' THEN 'Pour concessionnaires débutants'
        WHEN 'immobilier' THEN 'Pour agents immobiliers'
        WHEN 'electronique' THEN 'Pour petits magasins'
        WHEN 'mode-beaute' THEN 'Pour créateurs et boutiques'
        WHEN 'maison-jardin' THEN 'Pour artisans'
        WHEN 'emploi' THEN 'Pour petites entreprises'
        WHEN 'services' THEN 'Pour freelances'
        WHEN 'loisirs' THEN 'Pour passionnés'
        WHEN 'animaux' THEN 'Pour éleveurs'
        WHEN 'pour-entreprises' THEN 'Pour startups'
        ELSE 'Idéal pour démarrer'
      END,
      'مثالي للبدء', 'Perfect to start',
      v_cat_record.id, v_starter_price, 30,
      15, 3, false, false, true, 1
    );

    -- BUSINESS (RECOMMANDÉ)
    INSERT INTO pro_packages (
      name, name_ar, name_en,
      description, description_ar, description_en,
      category_id, price, duration_days,
      max_listings, featured_listings,
      priority_support, custom_branding, analytics,
      order_position
    ) VALUES (
      'Business', 'الأعمال', 'Business',
      CASE v_cat_record.slug
        WHEN 'vehicules' THEN 'Pour concessionnaires établis'
        WHEN 'immobilier' THEN 'Pour agences immobilières'
        WHEN 'electronique' THEN 'Pour distributeurs'
        WHEN 'mode-beaute' THEN 'Pour boutiques établies'
        WHEN 'maison-jardin' THEN 'Pour magasins de meubles'
        WHEN 'emploi' THEN 'Pour entreprises moyennes'
        WHEN 'services' THEN 'Pour sociétés de services'
        WHEN 'loisirs' THEN 'Pour clubs et centres'
        WHEN 'animaux' THEN 'Pour animaleries'
        WHEN 'pour-entreprises' THEN 'Pour PME établies'
        ELSE 'Pour les professionnels'
      END,
      'للمحترفين المتقدمين', 'For professionals',
      v_cat_record.id, v_business_price, 30,
      75, 15, true, true, true, 2
    );

    -- PREMIUM
    INSERT INTO pro_packages (
      name, name_ar, name_en,
      description, description_ar, description_en,
      category_id, price, duration_days,
      max_listings, featured_listings,
      priority_support, custom_branding, analytics,
      order_position
    ) VALUES (
      'Premium', 'المتقدم', 'Premium',
      CASE v_cat_record.slug
        WHEN 'vehicules' THEN 'Solution complète pour grands concessionnaires'
        WHEN 'immobilier' THEN 'Pour promoteurs immobiliers'
        WHEN 'electronique' THEN 'Pour grossistes et importateurs'
        WHEN 'mode-beaute' THEN 'Pour grandes enseignes'
        WHEN 'maison-jardin' THEN 'Pour grossistes'
        WHEN 'emploi' THEN 'Pour grandes entreprises'
        WHEN 'services' THEN 'Pour sociétés nationales'
        WHEN 'loisirs' THEN 'Pour grandes structures'
        WHEN 'animaux' THEN 'Pour grands élevages'
        WHEN 'pour-entreprises' THEN 'Pour grandes entreprises'
        ELSE 'Solution d''entreprise complète'
      END,
      'حل كامل للشركات الكبرى', 'Complete enterprise solution',
      v_cat_record.id, v_premium_price, 30,
      NULL, 30, true, true, true, 3
    );
  END LOOP;
END $$;

-- Vérifier les packages créés
SELECT
  c.name as "Catégorie",
  pp.name as "Package",
  pp.price as "Prix DA/mois",
  pp.max_listings as "Annonces max",
  pp.featured_listings as "En vedette"
FROM pro_packages pp
JOIN categories c ON pp.category_id = c.id
ORDER BY c.order_position, pp.order_position;
