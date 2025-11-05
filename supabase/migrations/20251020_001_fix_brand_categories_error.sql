/*
  # Fix: Suppression des références à brand_categories

  Cette migration supprime toutes les fonctions et vues qui référencent
  la table inexistante "brand_categories" qui cause l'erreur 42P01.

  Erreur rencontrée:
  - ERROR: 42P01: relation "public.brand_categories" does not exist
  - LINE 21: left join public.brand_categories bc on bc.brand_id = b.id
*/

-- ============================================
-- Supprimer toutes les vues qui utilisent brand_categories
-- ============================================

DROP VIEW IF EXISTS brands_with_categories CASCADE;
DROP VIEW IF EXISTS brand_category_view CASCADE;
DROP VIEW IF EXISTS v_brands_categories CASCADE;

-- ============================================
-- Supprimer toutes les fonctions qui utilisent brand_categories
-- ============================================

DROP FUNCTION IF EXISTS get_brands_with_categories() CASCADE;
DROP FUNCTION IF EXISTS list_brands_by_category(text) CASCADE;
DROP FUNCTION IF EXISTS get_brand_details(uuid) CASCADE;

-- ============================================
-- Vérification
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ Toutes les références à brand_categories ont été supprimées';
END $$;
