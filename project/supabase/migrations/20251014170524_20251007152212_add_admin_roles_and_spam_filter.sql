/*
  # Admin Roles and Spam Filter System

  1. Changes to Profiles
    - Add `role` field (user, admin, moderator)
    - Add `is_banned` field
    - Add `banned_reason` field
    - Add `banned_at` field

  2. New Table: blocked_keywords
    - `id` (uuid, primary key)
    - `keyword` (text, unique)
    - `category` (spam, scam, inappropriate)
    - `severity` (low, medium, high, critical)
    - `auto_action` (flag, hide, block)
    - `created_at` (timestamptz)

  3. New Table: moderation_actions
    - `id` (uuid, primary key)
    - `moderator_id` (uuid, foreign key to profiles)
    - `target_type` (listing, user, report)
    - `target_id` (uuid)
    - `action` (approve, reject, ban, warn, delete)
    - `reason` (text)
    - `created_at` (timestamptz)

  4. Security
    - Enable RLS on all tables
    - Only admins can manage blocked keywords
    - Only admins/moderators can perform moderation actions
    - Users can see actions taken on their content

  5. Functions
    - check_content_for_spam() - Automatic spam detection
    - get_moderation_stats() - Dashboard statistics
*/

-- Add role and ban fields to profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'role'
  ) THEN
    ALTER TABLE profiles ADD COLUMN role text DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'is_banned'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_banned boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'banned_reason'
  ) THEN
    ALTER TABLE profiles ADD COLUMN banned_reason text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'banned_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN banned_at timestamptz;
  END IF;
END $$;

-- Create blocked_keywords table
CREATE TABLE IF NOT EXISTS blocked_keywords (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword text UNIQUE NOT NULL,
  category text NOT NULL CHECK (category IN ('spam', 'scam', 'inappropriate', 'forbidden')),
  severity text NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  auto_action text NOT NULL DEFAULT 'flag' CHECK (auto_action IN ('flag', 'hide', 'block')),
  created_at timestamptz DEFAULT now()
);

-- Create moderation_actions table
CREATE TABLE IF NOT EXISTS moderation_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  moderator_id uuid REFERENCES profiles(id) ON DELETE SET NULL NOT NULL,
  target_type text NOT NULL CHECK (target_type IN ('listing', 'user', 'report', 'message')),
  target_id uuid NOT NULL,
  action text NOT NULL CHECK (action IN ('approve', 'reject', 'ban', 'warn', 'delete', 'hide')),
  reason text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE blocked_keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_actions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for blocked_keywords
CREATE POLICY "Admins can manage blocked keywords"
  ON blocked_keywords FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'moderator')
    )
  );

CREATE POLICY "Public can read blocked keywords for validation"
  ON blocked_keywords FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for moderation_actions
CREATE POLICY "Admins can create moderation actions"
  ON moderation_actions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'moderator')
    )
  );

CREATE POLICY "Admins can view all moderation actions"
  ON moderation_actions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'moderator')
    )
  );

CREATE POLICY "Users can view actions on their content"
  ON moderation_actions FOR SELECT
  TO authenticated
  USING (
    target_type = 'user' AND target_id = auth.uid()
    OR (
      target_type = 'listing' AND target_id IN (
        SELECT id FROM listings WHERE user_id = auth.uid()
      )
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_blocked_keywords_keyword ON blocked_keywords(keyword);
CREATE INDEX IF NOT EXISTS idx_blocked_keywords_category ON blocked_keywords(category);
CREATE INDEX IF NOT EXISTS idx_moderation_actions_target ON moderation_actions(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_moderation_actions_moderator ON moderation_actions(moderator_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_is_banned ON profiles(is_banned);

-- Function to check content for spam
CREATE OR REPLACE FUNCTION check_content_for_spam(content_text text)
RETURNS TABLE(
  has_spam boolean,
  matched_keywords text[],
  max_severity text,
  suggested_action text
) AS $$
DECLARE
  keyword_record RECORD;
  matches text[] := '{}';
  highest_severity text := 'low';
  action text := 'flag';
BEGIN
  FOR keyword_record IN
    SELECT keyword, severity, auto_action
    FROM blocked_keywords
    WHERE content_text ILIKE '%' || keyword || '%'
  LOOP
    matches := array_append(matches, keyword_record.keyword);
    
    IF keyword_record.severity = 'critical' THEN
      highest_severity := 'critical';
      action := keyword_record.auto_action;
    ELSIF keyword_record.severity = 'high' AND highest_severity != 'critical' THEN
      highest_severity := 'high';
      action := keyword_record.auto_action;
    ELSIF keyword_record.severity = 'medium' AND highest_severity NOT IN ('critical', 'high') THEN
      highest_severity := 'medium';
    END IF;
  END LOOP;

  RETURN QUERY SELECT
    array_length(matches, 1) > 0,
    matches,
    highest_severity,
    action;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get moderation statistics
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

-- Add flagged status to listings
DO $$
BEGIN
  ALTER TABLE listings DROP CONSTRAINT IF EXISTS listings_status_check;
  ALTER TABLE listings ADD CONSTRAINT listings_status_check 
    CHECK (status IN ('active', 'sold', 'flagged', 'hidden', 'expired', 'suspended'));
END $$;

-- Insert common spam keywords
INSERT INTO blocked_keywords (keyword, category, severity, auto_action) VALUES
  ('western union', 'scam', 'critical', 'block'),
  ('moneygram', 'scam', 'critical', 'block'),
  ('bitcoin wallet', 'scam', 'high', 'flag'),
  ('send money first', 'scam', 'critical', 'block'),
  ('envoyez argent', 'scam', 'critical', 'block'),
  ('100% gratuit', 'spam', 'medium', 'flag'),
  ('cliquez ici', 'spam', 'low', 'flag'),
  ('offre limitée', 'spam', 'low', 'flag'),
  ('prix cassé', 'spam', 'low', 'flag'),
  ('whatsapp only', 'spam', 'medium', 'flag')
ON CONFLICT (keyword) DO NOTHING;

-- Comments
COMMENT ON TABLE blocked_keywords IS 'Keywords that trigger spam/scam detection';
COMMENT ON TABLE moderation_actions IS 'Log of all moderation actions by admins/moderators';
COMMENT ON FUNCTION check_content_for_spam IS 'Checks text content for spam keywords and returns severity';
COMMENT ON FUNCTION get_moderation_stats IS 'Returns statistics for moderation dashboard';