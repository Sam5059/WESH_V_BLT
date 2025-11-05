/*
  # Listing Moderation and Reports System

  1. Changes to Listings
    - Add 'pending' status for new listings awaiting moderation
    - Add 'rejected' status for listings that failed moderation
    - Add 'moderation_notes' field for moderator feedback
    - Add 'reviewed_at' timestamp
    - Add 'reviewed_by' reference to moderator

  2. New Table: reports
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
    - Enable RLS on reports table
    - Users can create reports
    - Only admins/moderators can view all reports
    - Users can view their own reports
*/

-- Update listings status constraint to include pending and rejected
ALTER TABLE listings DROP CONSTRAINT IF EXISTS listings_status_check;
ALTER TABLE listings ADD CONSTRAINT listings_status_check 
  CHECK (status IN ('active', 'sold', 'pending', 'rejected', 'flagged', 'hidden'));

-- Add moderation fields to listings
ALTER TABLE listings ADD COLUMN IF NOT EXISTS moderation_notes text;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS reviewed_at timestamptz;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS reviewed_by uuid REFERENCES profiles(id) ON DELETE SET NULL;

-- Create reports table
CREATE TABLE IF NOT EXISTS reports (
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

-- Enable RLS on reports
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for reports
CREATE POLICY "Users can create reports"
  ON reports FOR INSERT
  TO authenticated
  WITH CHECK (reporter_id = auth.uid());

CREATE POLICY "Users can view their own reports"
  ON reports FOR SELECT
  TO authenticated
  USING (reporter_id = auth.uid());

CREATE POLICY "Admins can view all reports"
  ON reports FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'moderator')
    )
  );

CREATE POLICY "Admins can update reports"
  ON reports FOR UPDATE
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
CREATE INDEX IF NOT EXISTS idx_reports_listing ON reports(listing_id);
CREATE INDEX IF NOT EXISTS idx_reports_reporter ON reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_reviewed_at ON listings(reviewed_at);

-- Function to set new listings as pending
CREATE OR REPLACE FUNCTION set_listing_pending()
RETURNS TRIGGER AS $$
BEGIN
  -- All new listings start as pending
  NEW.status := 'pending';
  NEW.moderation_notes := 'Awaiting moderation review by Buy&Go team';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new listings
DROP TRIGGER IF EXISTS trigger_set_listing_pending ON listings;
CREATE TRIGGER trigger_set_listing_pending
  BEFORE INSERT ON listings
  FOR EACH ROW
  EXECUTE FUNCTION set_listing_pending();

-- Function to get pending moderation count
CREATE OR REPLACE FUNCTION get_pending_moderation_count()
RETURNS integer AS $$
BEGIN
  RETURN (SELECT COUNT(*)::integer FROM listings WHERE status = 'pending');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to approve listing
CREATE OR REPLACE FUNCTION approve_listing(
  listing_id_param uuid,
  moderator_id_param uuid,
  notes_param text DEFAULT NULL
)
RETURNS boolean AS $$
DECLARE
  is_moderator boolean;
BEGIN
  -- Check if user is admin/moderator
  SELECT role IN ('admin', 'moderator') INTO is_moderator
  FROM profiles
  WHERE id = moderator_id_param;
  
  IF NOT is_moderator THEN
    RAISE EXCEPTION 'User is not authorized to approve listings';
  END IF;
  
  -- Update listing
  UPDATE listings
  SET 
    status = 'active',
    reviewed_by = moderator_id_param,
    reviewed_at = now(),
    moderation_notes = COALESCE(notes_param, 'Approved by Buy&Go team')
  WHERE id = listing_id_param;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reject listing
CREATE OR REPLACE FUNCTION reject_listing(
  listing_id_param uuid,
  moderator_id_param uuid,
  reason_param text
)
RETURNS boolean AS $$
DECLARE
  is_moderator boolean;
BEGIN
  -- Check if user is admin/moderator
  SELECT role IN ('admin', 'moderator') INTO is_moderator
  FROM profiles
  WHERE id = moderator_id_param;
  
  IF NOT is_moderator THEN
    RAISE EXCEPTION 'User is not authorized to reject listings';
  END IF;
  
  -- Update listing
  UPDATE listings
  SET 
    status = 'rejected',
    reviewed_by = moderator_id_param,
    reviewed_at = now(),
    moderation_notes = reason_param
  WHERE id = listing_id_param;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comments
COMMENT ON TABLE reports IS 'User reports for flagging inappropriate or suspicious listings';
COMMENT ON COLUMN listings.moderation_notes IS 'Internal notes from moderators about the listing';
COMMENT ON COLUMN listings.reviewed_at IS 'When the listing was reviewed by a moderator';
COMMENT ON COLUMN listings.reviewed_by IS 'Which moderator reviewed the listing';
COMMENT ON FUNCTION set_listing_pending IS 'Automatically sets new listings to pending status for moderation';
COMMENT ON FUNCTION get_pending_moderation_count IS 'Returns count of listings awaiting moderation';
COMMENT ON FUNCTION approve_listing IS 'Approves a listing and sets it to active';
COMMENT ON FUNCTION reject_listing IS 'Rejects a listing with a reason';
