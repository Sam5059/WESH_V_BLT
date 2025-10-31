/*
  # Ajout des champs de dates pour les locations et services

  1. Nouveaux champs
    - `available_from` (date) : Date de début de disponibilité/période
    - `available_to` (date) : Date de fin de disponibilité/période
    - `is_date_flexible` (boolean) : Dates flexibles ou non

  2. Modifications
    - Ajout des champs à la table `listings`
    - Mise à jour de l'index de recherche

  3. Utilisation
    - Location Vacances : Période de disponibilité
    - Location Véhicules : Dates de location souhaitées
    - Location Immobilière : Disponibilité du bien
    - Services/RDV : Dates de rendez-vous disponibles
    - Emploi : Date de début souhaitée
*/

-- Ajouter les colonnes de dates à la table listings
DO $$
BEGIN
  -- available_from: Date de début de disponibilité ou période souhaitée
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listings' AND column_name = 'available_from'
  ) THEN
    ALTER TABLE listings ADD COLUMN available_from date;
  END IF;

  -- available_to: Date de fin de disponibilité ou période souhaitée
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listings' AND column_name = 'available_to'
  ) THEN
    ALTER TABLE listings ADD COLUMN available_to date;
  END IF;

  -- is_date_flexible: Indique si les dates sont flexibles
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listings' AND column_name = 'is_date_flexible'
  ) THEN
    ALTER TABLE listings ADD COLUMN is_date_flexible boolean DEFAULT true;
  END IF;
END $$;

-- Créer un index sur les dates pour améliorer les performances de recherche
CREATE INDEX IF NOT EXISTS idx_listings_available_dates
ON listings (available_from, available_to)
WHERE available_from IS NOT NULL;

-- Commenter les colonnes pour la documentation
COMMENT ON COLUMN listings.available_from IS 'Date de début de disponibilité, période de location ou date de RDV (pour locations, services, emplois)';
COMMENT ON COLUMN listings.available_to IS 'Date de fin de disponibilité ou période de location (optionnel)';
COMMENT ON COLUMN listings.is_date_flexible IS 'Indique si les dates sont flexibles (true par défaut)';
