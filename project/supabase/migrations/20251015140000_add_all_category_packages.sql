/*
  # Ajouter packages PRO pour toutes les catégories

  Crée 3 packages (Starter, Business, Premium) pour chaque catégorie principale
*/

DO $$
DECLARE
  v_cat_record RECORD;
BEGIN
  FOR v_cat_record IN
    SELECT id, slug, name, name_ar
    FROM categories
    WHERE parent_id IS NULL
  LOOP
    -- Starter
    INSERT INTO pro_packages (
      name, name_ar, name_en,
      description, description_ar, description_en,
      category_id, price, duration_days,
      max_listings, featured_listings,
      priority_support, custom_branding, analytics,
      order_position
    ) VALUES (
      'Starter', 'البداية', 'Starter',
      'Idéal pour démarrer', 'مثالي للبدء', 'Perfect to start',
      v_cat_record.id, 5000, 30,
      10, 2, false, false, false, 1
    ) ON CONFLICT DO NOTHING;

    -- Business
    INSERT INTO pro_packages (
      name, name_ar, name_en,
      description, description_ar, description_en,
      category_id, price, duration_days,
      max_listings, featured_listings,
      priority_support, custom_branding, analytics,
      order_position
    ) VALUES (
      'Business', 'الأعمال', 'Business',
      'Pour les professionnels', 'للمحترفين', 'For professionals',
      v_cat_record.id, 15000, 30,
      50, 10, true, true, true, 2
    ) ON CONFLICT DO NOTHING;

    -- Premium
    INSERT INTO pro_packages (
      name, name_ar, name_en,
      description, description_ar, description_en,
      category_id, price, duration_days,
      max_listings, featured_listings,
      priority_support, custom_branding, analytics,
      order_position
    ) VALUES (
      'Premium', 'المتقدم', 'Premium',
      'Solution complète', 'حل كامل', 'Complete solution',
      v_cat_record.id, 30000, 30,
      NULL, 25, true, true, true, 3
    ) ON CONFLICT DO NOTHING;
  END LOOP;
END $$;
