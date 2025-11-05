/*
  # Système de Réservations de Véhicules

  1. Nouvelles Tables
    - `vehicle_reservations` - Réservations de véhicules/locations
      - `id` (uuid, primary key)
      - `user_id` (uuid) - Utilisateur qui réserve
      - `listing_id` (uuid) - Véhicule/Location réservé
      - `start_date` (date) - Date de début
      - `end_date` (date) - Date de fin
      - `total_days` (integer) - Nombre de jours
      - `daily_rate` (numeric) - Tarif journalier
      - `total_amount` (numeric) - Montant total
      - `status` (enum) - pending, confirmed, cancelled, completed
      - `pickup_location` (text) - Lieu de prise en charge
      - `dropoff_location` (text) - Lieu de retour
      - `notes` (text) - Notes additionnelles
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Modifications
    - Ajouter des champs de réservation à `cart_items` et `order_items`

  3. Sécurité
    - RLS pour que les utilisateurs ne voient que leurs réservations
    - Les propriétaires voient les réservations de leurs véhicules
*/

-- Enum pour le statut des réservations
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'reservation_status_enum') THEN
    CREATE TYPE reservation_status_enum AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
  END IF;
END $$;

-- Table: vehicle_reservations
CREATE TABLE IF NOT EXISTS vehicle_reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  listing_id uuid NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  start_date date NOT NULL,
  end_date date NOT NULL,
  total_days integer NOT NULL CHECK (total_days > 0),
  daily_rate numeric(10, 2) NOT NULL CHECK (daily_rate >= 0),
  total_amount numeric(10, 2) NOT NULL CHECK (total_amount >= 0),
  status reservation_status_enum NOT NULL DEFAULT 'pending',
  pickup_location text,
  dropoff_location text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  -- Contrainte: end_date doit être après start_date
  CONSTRAINT valid_date_range CHECK (end_date > start_date)
);

-- Ajouter les champs de réservation à cart_items
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cart_items' AND column_name = 'reservation_start_date'
  ) THEN
    ALTER TABLE cart_items ADD COLUMN reservation_start_date date;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cart_items' AND column_name = 'reservation_end_date'
  ) THEN
    ALTER TABLE cart_items ADD COLUMN reservation_end_date date;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cart_items' AND column_name = 'reservation_notes'
  ) THEN
    ALTER TABLE cart_items ADD COLUMN reservation_notes text;
  END IF;
END $$;

-- Ajouter les champs de réservation à order_items
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'order_items' AND column_name = 'reservation_start_date'
  ) THEN
    ALTER TABLE order_items ADD COLUMN reservation_start_date date;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'order_items' AND column_name = 'reservation_end_date'
  ) THEN
    ALTER TABLE order_items ADD COLUMN reservation_end_date date;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'order_items' AND column_name = 'reservation_notes'
  ) THEN
    ALTER TABLE order_items ADD COLUMN reservation_notes text;
  END IF;
END $$;

-- Indexes pour performance
CREATE INDEX IF NOT EXISTS idx_vehicle_reservations_user_id ON vehicle_reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_reservations_listing_id ON vehicle_reservations(listing_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_reservations_dates ON vehicle_reservations(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_vehicle_reservations_status ON vehicle_reservations(status);

-- Function: Calculer le nombre de jours entre deux dates
CREATE OR REPLACE FUNCTION calculate_reservation_days(p_start_date date, p_end_date date)
RETURNS integer AS $$
BEGIN
  RETURN (p_end_date - p_start_date);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function: Vérifier la disponibilité d'un véhicule
CREATE OR REPLACE FUNCTION check_vehicle_availability(
  p_listing_id uuid,
  p_start_date date,
  p_end_date date,
  p_exclude_reservation_id uuid DEFAULT NULL
)
RETURNS boolean AS $$
DECLARE
  v_conflict_count integer;
BEGIN
  SELECT COUNT(*) INTO v_conflict_count
  FROM vehicle_reservations
  WHERE listing_id = p_listing_id
    AND status IN ('pending', 'confirmed')
    AND (id != p_exclude_reservation_id OR p_exclude_reservation_id IS NULL)
    AND (
      (start_date <= p_start_date AND end_date > p_start_date)
      OR (start_date < p_end_date AND end_date >= p_end_date)
      OR (start_date >= p_start_date AND end_date <= p_end_date)
    );

  RETURN v_conflict_count = 0;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-update updated_at sur vehicle_reservations
DROP TRIGGER IF EXISTS update_vehicle_reservations_updated_at ON vehicle_reservations;
CREATE TRIGGER update_vehicle_reservations_updated_at
  BEFORE UPDATE ON vehicle_reservations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================

ALTER TABLE vehicle_reservations ENABLE ROW LEVEL SECURITY;

-- Les utilisateurs peuvent voir leurs propres réservations
CREATE POLICY "Users can view own reservations"
  ON vehicle_reservations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Les propriétaires peuvent voir les réservations de leurs listings
CREATE POLICY "Owners can view reservations for their listings"
  ON vehicle_reservations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = vehicle_reservations.listing_id
      AND listings.user_id = auth.uid()
    )
  );

-- Les utilisateurs peuvent créer leurs propres réservations
CREATE POLICY "Users can create own reservations"
  ON vehicle_reservations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Les utilisateurs peuvent mettre à jour leurs propres réservations
CREATE POLICY "Users can update own reservations"
  ON vehicle_reservations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Les propriétaires peuvent mettre à jour le statut des réservations
CREATE POLICY "Owners can update reservation status"
  ON vehicle_reservations FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = vehicle_reservations.listing_id
      AND listings.user_id = auth.uid()
    )
  );

-- Les utilisateurs peuvent annuler leurs réservations
CREATE POLICY "Users can delete own reservations"
  ON vehicle_reservations FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON vehicle_reservations TO authenticated;
