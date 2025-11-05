/*
  # Création table reports et fonction de modération

  1. Tables
    - `reports` - Signalements d'annonces
      - `id` (uuid, primary key)
      - `listing_id` (uuid, foreign key)
      - `reporter_id` (uuid, foreign key to profiles)
      - `reason` (text)
      - `description` (text)
      - `status` (text) - pending, resolved, dismissed
      - `created_at` (timestamp)
      - `resolved_at` (timestamp)
      - `resolved_by` (uuid)

  2. Functions
    - `get_moderation_stats()` - Retourne les statistiques de modération

  3. Security
    - RLS enabled
    - Policies pour admins uniquement
*/

-- Table reports
CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid REFERENCES listings(id) ON DELETE CASCADE,
  reporter_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  reason text NOT NULL,
  description text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
  created_at timestamptz DEFAULT now(),
  resolved_at timestamptz,
  resolved_by uuid REFERENCES profiles(id)
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS reports_listing_id_idx ON reports(listing_id);
CREATE INDEX IF NOT EXISTS reports_status_idx ON reports(status);
CREATE INDEX IF NOT EXISTS reports_created_at_idx ON reports(created_at DESC);

-- Enable RLS
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Policy: Admins peuvent tout voir
CREATE POLICY "Admins can view all reports"
  ON reports FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin', 'moderator')
    )
  );

-- Policy: Users authentifiés peuvent créer des signalements
CREATE POLICY "Authenticated users can create reports"
  ON reports FOR INSERT
  TO authenticated
  WITH CHECK (reporter_id = auth.uid());

-- Policy: Admins peuvent mettre à jour les signalements
CREATE POLICY "Admins can update reports"
  ON reports FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin', 'moderator')
    )
  );

-- Fonction get_moderation_stats
CREATE OR REPLACE FUNCTION get_moderation_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  -- Vérifier si l'utilisateur est admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'super_admin', 'moderator')
  ) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT json_build_object(
    'pending_reports', (SELECT COUNT(*) FROM reports WHERE status = 'pending'),
    'resolved_reports', (SELECT COUNT(*) FROM reports WHERE status = 'resolved'),
    'pending_listings', (SELECT COUNT(*) FROM listings WHERE status = 'pending_approval'),
    'active_listings', (SELECT COUNT(*) FROM listings WHERE status = 'active'),
    'total_users', (SELECT COUNT(*) FROM profiles)
  ) INTO result;

  RETURN result;
END;
$$;
