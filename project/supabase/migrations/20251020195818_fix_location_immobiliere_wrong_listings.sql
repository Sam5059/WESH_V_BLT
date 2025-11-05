/*
  # Correction: Véhicules mal catégorisés dans Location Immobilière

  1. Problème
     - Des annonces de véhicules (BMW, Mercedes, Dacia) apparaissent dans "Location Immobilière"
     - Ces annonces sont mal catégorisées

  2. Solution
     - Déplacer les annonces de véhicules vers la catégorie "Voitures"
     - Nettoyer les données pour garantir la cohérence
*/

DO $$
DECLARE
  location_immobiliere_id UUID;
  voitures_cat_id UUID;
  affected_count INT := 0;
BEGIN
  -- Récupérer l'ID de Location Immobilière
  SELECT id INTO location_immobiliere_id
  FROM categories
  WHERE slug = 'location-immobiliere'
  LIMIT 1;

  -- Récupérer l'ID de la catégorie Voitures
  SELECT id INTO voitures_cat_id
  FROM categories
  WHERE slug = 'voitures'
  LIMIT 1;

  IF location_immobiliere_id IS NULL THEN
    RAISE NOTICE '❌ Catégorie Location Immobilière introuvable';
    RETURN;
  END IF;

  IF voitures_cat_id IS NULL THEN
    RAISE NOTICE '❌ Catégorie Voitures introuvable';
    RETURN;
  END IF;

  RAISE NOTICE '📍 Location Immobilière ID: %', location_immobiliere_id;
  RAISE NOTICE '🚗 Voitures ID: %', voitures_cat_id;

  -- Corriger les annonces de véhicules qui sont dans Location Immobilière
  WITH vehicle_listings AS (
    SELECT l.id, l.title
    FROM listings l
    JOIN categories c ON c.id = l.category_id
    WHERE l.status = 'active'
    AND (
      c.parent_id = location_immobiliere_id
      OR c.id = location_immobiliere_id
    )
    AND (
      l.title ILIKE '%BMW%'
      OR l.title ILIKE '%Mercedes%'
      OR l.title ILIKE '%Benz%'
      OR l.title ILIKE '%Dacia%'
      OR l.title ILIKE '%Serie%'
      OR l.title ILIKE '%voiture%'
      OR l.title ILIKE '%auto%'
      OR l.title ILIKE '%F3%'
      OR l.title ILIKE '%F4%'
    )
  )
  UPDATE listings
  SET 
    category_id = voitures_cat_id,
    updated_at = now()
  FROM vehicle_listings
  WHERE listings.id = vehicle_listings.id;

  GET DIAGNOSTICS affected_count = ROW_COUNT;

  RAISE NOTICE '✅ % annonce(s) de véhicules déplacées vers Voitures', affected_count;
END $$;
