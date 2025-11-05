/*
  # Nettoyage définitif : Véhicules dans Location Immobilière

  1. Contexte
     - Location Immobilière = locations de maisons/appartements pour vacances
     - Côte algérienne (été), ski (hiver), sud algérien (automne), hauts plateaux (printemps)
     - Les voitures ne doivent PAS être dans cette catégorie

  2. Actions
     - Supprimer TOUTES les annonces de véhicules de Location Immobilière
     - Ces véhicules devraient être dans "Location Véhicules"

  3. Sécurité
     - Vérifie que la catégorie existe avant suppression
     - Log les suppressions
     - N'utilise que les tables existantes (listings, categories)
*/

DO $$
DECLARE
  location_immobiliere_id UUID;
  location_vehicules_id UUID;
  deleted_count INT := 0;
  moved_count INT := 0;
BEGIN
  -- Récupérer l'ID de Location Immobilière
  SELECT id INTO location_immobiliere_id
  FROM categories
  WHERE slug = 'location-immobiliere'
  LIMIT 1;

  -- Récupérer l'ID de Location Véhicules
  SELECT id INTO location_vehicules_id
  FROM categories
  WHERE slug = 'location-vehicules'
  LIMIT 1;

  IF location_immobiliere_id IS NULL THEN
    RAISE NOTICE 'Catégorie Location Immobilière introuvable';
    RETURN;
  END IF;

  RAISE NOTICE 'Location Immobilière ID: %', location_immobiliere_id;
  RAISE NOTICE 'Location Véhicules ID: %', COALESCE(location_vehicules_id::text, 'NULL');

  -- Option 1: Si Location Véhicules existe, déplacer les voitures
  IF location_vehicules_id IS NOT NULL THEN
    UPDATE listings
    SET
      category_id = location_vehicules_id,
      listing_type = 'rent',
      updated_at = now()
    WHERE status = 'active'
    AND category_id = location_immobiliere_id
    AND (
      -- Marques de véhicules
      title ~* 'BMW|Mercedes|Benz|Dacia|Peugeot|Renault|Toyota|Volkswagen|Audi|Ford|Fiat|Hyundai|Kia|Nissan|Mazda|Honda|Suzuki|Mitsubishi|Chevrolet|Opel|Citroen|Seat|Skoda|Volvo|Land Rover|Porsche|Jaguar|Alfa Romeo'
      OR title ~* 'voiture|auto|vehicule|car|4x4|suv|berline|citadine|break'
      OR title ~* 'serie|type|modele|model'
      -- Patterns typiques de voitures
      OR title ~* '\d{3}[- ]?(CI|TDI|HDI|GTI|GTE|TSI|TFSI|SDI)'
      OR title ~* 'F[0-9]|X[0-9]|A[0-9]|C[0-9]|S[0-9]|M[0-9]'
      -- Attributs véhicules (vérification JSON sécurisée)
      OR (attributes IS NOT NULL AND (
        attributes::text LIKE '%fuel%'
        OR attributes::text LIKE '%mileage%'
        OR attributes::text LIKE '%transmission%'
      ))
    );

    GET DIAGNOSTICS moved_count = ROW_COUNT;
    RAISE NOTICE 'Annonces de véhicules déplacées vers Location Véhicules: %', moved_count;

  ELSE
    -- Option 2: Si Location Véhicules n'existe pas, supprimer les voitures
    DELETE FROM listings
    WHERE status = 'active'
    AND category_id = location_immobiliere_id
    AND (
      title ~* 'BMW|Mercedes|Benz|Dacia|Peugeot|Renault|Toyota|Volkswagen|Audi|Ford|Fiat|Hyundai|Kia|Nissan|Mazda|Honda|Suzuki|Mitsubishi|Chevrolet|Opel|Citroen|Seat|Skoda|Volvo|Land Rover|Porsche|Jaguar|Alfa Romeo'
      OR title ~* 'voiture|auto|vehicule|car|4x4|suv|berline|citadine|break'
      OR (attributes IS NOT NULL AND (
        attributes::text LIKE '%fuel%'
        OR attributes::text LIKE '%mileage%'
        OR attributes::text LIKE '%transmission%'
      ))
    );

    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Annonces de véhicules supprimées de Location Immobilière: %', deleted_count;
  END IF;

  -- Afficher un résumé des annonces restantes dans Location Immobilière
  DECLARE
    remaining_count INT;
  BEGIN
    SELECT COUNT(*) INTO remaining_count
    FROM listings
    WHERE status = 'active'
    AND category_id = location_immobiliere_id;

    RAISE NOTICE 'Total annonces restantes dans Location Immobilière: %', remaining_count;
  END;

END $$;
