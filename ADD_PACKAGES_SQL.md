# Script SQL à Exécuter dans Supabase

Copiez et collez ce code dans le **SQL Editor** de votre Dashboard Supabase:

```sql
-- Ajouter packages PRO pour toutes les catégories
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
```

## Instructions

1. Ouvrez votre **Dashboard Supabase**
2. Allez dans **SQL Editor**
3. Créez une nouvelle requête
4. Copiez-collez le code SQL ci-dessus
5. Cliquez sur **Run**

Cela créera automatiquement 3 packages (Starter, Business, Premium) pour chaque catégorie principale de votre base de données.

## Vérification

Après l'exécution, vérifiez avec:

```sql
SELECT
  c.name as categorie,
  pp.name as package,
  pp.price,
  pp.max_listings
FROM pro_packages pp
JOIN categories c ON pp.category_id = c.id
ORDER BY c.name, pp.order_position;
```
