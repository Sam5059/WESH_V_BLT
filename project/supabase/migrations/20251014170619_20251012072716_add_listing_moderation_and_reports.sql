/*
  # Listing Moderation and Reports System

  1. Changes to Listings
    - Add 'pending' status for new listings awaiting moderation
    - Add 'rejected' status for listings that failed moderation
    - Add 'moderation_notes' field for moderator feedback
    - Add 'reviewed_at' timestamp
    - Add 'reviewed_by' reference to moderator

  2. New Table: listing_reports
    - `id` (uuid, primary key)
    - `listing_id` (uuid, foreign key to listings)
    - `reporter_id` (uuid, foreign key to profiles)
    - `reason` (text, check constraint)
    - `description` (text)
    - `status` (pending, reviewed, resolved, dismissed)
    - `reviewed_by` (uuid, foreign key to profiles)
    - `reviewed_at` (timestamptz)
    - `resolution_notes` (text)
    - `created_at` (timestamptz)

  3. Security
    - Enable RLS on listing_reports table
    - Users can create reports
    - Only admins/moderators can view all reports
    - Users can view their own reports
*/

-- Update listings status constraint to include pending and rejected
ALTER TABLE listings DROP CONSTRAINT IF EXISTS listings_status_check;
ALTER TABLE listings ADD CONSTRAINT listings_status_check 
  CHECK (status IN ('active', 'sold', 'pending', 'rejected', 'flagged', 'hidden', 'expired', 'suspended'));

-- Add moderation fields to listings
ALTER TABLE listings ADD COLUMN IF NOT EXISTS moderation_notes text;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS reviewed_at timestamptz;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS reviewed_by uuid REFERENCES profiles(id) ON DELETE SET NULL;

-- Create listing_reports table
CREATE TABLE IF NOT EXISTS listing_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid REFERENCES listings(id) ON DELETE CASCADE NOT NULL,
  reporter_id uuid REFERENCES profiles(id) ON DELETE SET NULL NOT NULL,
  reason text NOT NULL CHECK (reason IN ('spam', 'scam', 'inappropriate', 'duplicate', 'wrong_category', 'fake', 'offensive', 'other')),
  description text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  reviewed_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  resolution_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on listing_reports
ALTER TABLE listing_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for listing_reports
CREATE POLICY "Users can create reports"
  ON listing_reports FOR INSERT
  TO authenticated
  WITH CHECK (reporter_id = auth.uid());

CREATE POLICY "Users can view their own reports"
  ON listing_reports FOR SELECT
  TO authenticated
  USING (reporter_id = auth.uid());

CREATE POLICY "Admins can view all reports"
  ON listing_reports FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'moderator')
    )
  );

CREATE POLICY "Admins can update reports"
  ON listing_reports FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'moderator')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'moderator')
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_listing_reports_listing ON listing_reports(listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_reports_reporter ON listing_reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_listing_reports_status ON listing_reports(status);
CREATE INDEX IF NOT EXISTS idx_listing_reports_created_at ON listing_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_listings_reviewed_at ON listings(reviewed_at);

-- Update get_moderation_stats function to use listing_reports
CREATE OR REPLACE FUNCTION get_moderation_stats()
RETURNS TABLE(
  pending_reports integer,
  total_reports integer,
  banned_users integer,
  flagged_listings integer,
  actions_today integer
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*)::integer FROM listing_reports WHERE status = 'pending'),
    (SELECT COUNT(*)::integer FROM listing_reports),
    (SELECT COUNT(*)::integer FROM profiles WHERE is_banned = true),
    (SELECT COUNT(*)::integer FROM listings WHERE status = 'flagged'),
    (SELECT COUNT(*)::integer FROM moderation_actions WHERE created_at > now() - interval '24 hours');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comments
COMMENT ON TABLE listing_reports IS 'User reports for flagging inappropriate or suspicious listings';
COMMENT ON COLUMN listings.moderation_notes IS 'Internal notes from moderators about the listing';
COMMENT ON COLUMN listings.reviewed_at IS 'When the listing was reviewed by a moderator';
COMMENT ON COLUMN listings.reviewed_by IS 'Which moderator reviewed the listing';