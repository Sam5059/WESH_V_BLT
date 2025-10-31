/*
  # KPI and Statistics System

  1. New Table: user_statistics
    - `id` (uuid, primary key)
    - `user_id` (uuid, foreign key to profiles)
    - `total_listings` (integer)
    - `active_listings` (integer)
    - `sold_listings` (integer)
    - `total_views` (integer)
    - `total_favorites` (integer)
    - `total_messages_sent` (integer)
    - `total_messages_received` (integer)
    - `response_rate` (numeric)
    - `last_active` (timestamptz)
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  2. New Table: platform_statistics (Admin only)
    - `id` (uuid, primary key)
    - `date` (date, unique)
    - `new_users` (integer)
    - `new_listings` (integer)
    - `active_users` (integer)
    - `total_views` (integer)
    - `total_messages` (integer)
    - `pending_moderation` (integer)
    - `approved_listings` (integer)
    - `rejected_listings` (integer)
    - `total_reports` (integer)

  3. Security
    - Enable RLS
    - Users can only view their own statistics
    - Admins can view all statistics and platform stats

  4. Functions
    - refresh_user_statistics() - Update user stats
    - refresh_platform_statistics() - Update platform stats (admin only)
    - get_user_dashboard_data() - Get dashboard data for user
*/

-- Create user_statistics table
CREATE TABLE IF NOT EXISTS user_statistics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  total_listings integer DEFAULT 0,
  active_listings integer DEFAULT 0,
  sold_listings integer DEFAULT 0,
  rejected_listings integer DEFAULT 0,
  total_views integer DEFAULT 0,
  total_favorites integer DEFAULT 0,
  total_messages_sent integer DEFAULT 0,
  total_messages_received integer DEFAULT 0,
  response_rate numeric(5,2) DEFAULT 0,
  avg_response_time_hours numeric(10,2) DEFAULT 0,
  last_active timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create platform_statistics table (for admin KPIs)
CREATE TABLE IF NOT EXISTS platform_statistics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date UNIQUE NOT NULL DEFAULT CURRENT_DATE,
  new_users integer DEFAULT 0,
  total_users integer DEFAULT 0,
  new_listings integer DEFAULT 0,
  total_listings integer DEFAULT 0,
  active_users integer DEFAULT 0,
  total_views integer DEFAULT 0,
  total_messages integer DEFAULT 0,
  pending_moderation integer DEFAULT 0,
  approved_listings integer DEFAULT 0,
  rejected_listings integer DEFAULT 0,
  flagged_listings integer DEFAULT 0,
  total_reports integer DEFAULT 0,
  new_reports integer DEFAULT 0,
  avg_rating numeric(3,2) DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_statistics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_statistics
CREATE POLICY "Users can view their own statistics"
  ON user_statistics FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all user statistics"
  ON user_statistics FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'moderator')
    )
  );

-- RLS Policies for platform_statistics
CREATE POLICY "Admins can view platform statistics"
  ON platform_statistics FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'moderator')
    )
  );

CREATE POLICY "Admins can manage platform statistics"
  ON platform_statistics FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_statistics_user ON user_statistics(user_id);
CREATE INDEX IF NOT EXISTS idx_user_statistics_updated ON user_statistics(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_platform_statistics_date ON platform_statistics(date DESC);

-- Function to refresh user statistics
CREATE OR REPLACE FUNCTION refresh_user_statistics(user_id_param uuid)
RETURNS void AS $$
BEGIN
  INSERT INTO user_statistics (user_id, total_listings, active_listings, sold_listings, rejected_listings, total_views, total_favorites, updated_at)
  SELECT
    user_id_param,
    COUNT(*) as total_listings,
    COUNT(*) FILTER (WHERE status = 'active') as active_listings,
    COUNT(*) FILTER (WHERE status = 'sold') as sold_listings,
    COUNT(*) FILTER (WHERE status = 'rejected') as rejected_listings,
    COALESCE(SUM(views), 0) as total_views,
    COALESCE(SUM((SELECT COUNT(*) FROM favorites WHERE favorites.listing_id = listings.id)), 0) as total_favorites,
    now() as updated_at
  FROM listings
  WHERE user_id = user_id_param
  ON CONFLICT (user_id)
  DO UPDATE SET
    total_listings = EXCLUDED.total_listings,
    active_listings = EXCLUDED.active_listings,
    sold_listings = EXCLUDED.sold_listings,
    rejected_listings = EXCLUDED.rejected_listings,
    total_views = EXCLUDED.total_views,
    total_favorites = EXCLUDED.total_favorites,
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to refresh platform statistics
CREATE OR REPLACE FUNCTION refresh_platform_statistics()
RETURNS void AS $$
DECLARE
  stat_date date := CURRENT_DATE;
BEGIN
  INSERT INTO platform_statistics (
    date,
    new_users,
    total_users,
    new_listings,
    total_listings,
    active_users,
    pending_moderation,
    approved_listings,
    rejected_listings,
    flagged_listings,
    total_reports,
    new_reports,
    avg_rating
  )
  SELECT
    stat_date,
    (SELECT COUNT(*) FROM profiles WHERE DATE(created_at) = stat_date),
    (SELECT COUNT(*) FROM profiles),
    (SELECT COUNT(*) FROM listings WHERE DATE(created_at) = stat_date),
    (SELECT COUNT(*) FROM listings),
    (SELECT COUNT(*) FROM profiles WHERE DATE(updated_at) = stat_date),
    (SELECT COUNT(*) FROM listings WHERE status = 'pending'),
    (SELECT COUNT(*) FROM listings WHERE status = 'active' AND reviewed_at IS NOT NULL),
    (SELECT COUNT(*) FROM listings WHERE status = 'rejected'),
    (SELECT COUNT(*) FROM listings WHERE status = 'flagged'),
    (SELECT COUNT(*) FROM reports),
    (SELECT COUNT(*) FROM reports WHERE DATE(created_at) = stat_date),
    (SELECT ROUND(AVG(rating_average)::numeric, 2) FROM profiles WHERE rating_count > 0)
  ON CONFLICT (date)
  DO UPDATE SET
    new_users = EXCLUDED.new_users,
    total_users = EXCLUDED.total_users,
    new_listings = EXCLUDED.new_listings,
    total_listings = EXCLUDED.total_listings,
    active_users = EXCLUDED.active_users,
    pending_moderation = EXCLUDED.pending_moderation,
    approved_listings = EXCLUDED.approved_listings,
    rejected_listings = EXCLUDED.rejected_listings,
    flagged_listings = EXCLUDED.flagged_listings,
    total_reports = EXCLUDED.total_reports,
    new_reports = EXCLUDED.new_reports,
    avg_rating = EXCLUDED.avg_rating;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user dashboard data
CREATE OR REPLACE FUNCTION get_user_dashboard_data(user_id_param uuid)
RETURNS TABLE(
  total_listings integer,
  active_listings integer,
  sold_listings integer,
  rejected_listings integer,
  pending_listings integer,
  total_views integer,
  total_favorites integer,
  rating_average numeric,
  rating_count integer
) AS $$
BEGIN
  -- Refresh statistics first
  PERFORM refresh_user_statistics(user_id_param);
  
  RETURN QUERY
  SELECT
    COALESCE(us.total_listings, 0)::integer,
    COALESCE(us.active_listings, 0)::integer,
    COALESCE(us.sold_listings, 0)::integer,
    COALESCE(us.rejected_listings, 0)::integer,
    (SELECT COUNT(*)::integer FROM listings WHERE user_id = user_id_param AND status = 'pending'),
    COALESCE(us.total_views, 0)::integer,
    COALESCE(us.total_favorites, 0)::integer,
    COALESCE(p.rating_average, 0),
    COALESCE(p.rating_count, 0)::integer
  FROM profiles p
  LEFT JOIN user_statistics us ON us.user_id = p.id
  WHERE p.id = user_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get platform dashboard data (admin only)
CREATE OR REPLACE FUNCTION get_platform_dashboard_data()
RETURNS TABLE(
  total_users integer,
  new_users_today integer,
  total_listings integer,
  pending_moderation integer,
  total_reports integer,
  new_reports_today integer,
  avg_rating numeric
) AS $$
BEGIN
  -- Refresh platform statistics first
  PERFORM refresh_platform_statistics();
  
  RETURN QUERY
  SELECT
    (SELECT COUNT(*)::integer FROM profiles),
    (SELECT COUNT(*)::integer FROM profiles WHERE DATE(created_at) = CURRENT_DATE),
    (SELECT COUNT(*)::integer FROM listings),
    (SELECT COUNT(*)::integer FROM listings WHERE status = 'pending'),
    (SELECT COUNT(*)::integer FROM reports),
    (SELECT COUNT(*)::integer FROM reports WHERE DATE(created_at) = CURRENT_DATE),
    (SELECT ROUND(AVG(rating_average)::numeric, 2) FROM profiles WHERE rating_count > 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create initial statistics for existing users
INSERT INTO user_statistics (user_id)
SELECT id FROM profiles
ON CONFLICT (user_id) DO NOTHING;

-- Comments
COMMENT ON TABLE user_statistics IS 'User-specific statistics and KPIs';
COMMENT ON TABLE platform_statistics IS 'Platform-wide statistics for admin dashboard (Buy&Go team only)';
COMMENT ON FUNCTION refresh_user_statistics IS 'Refreshes statistics for a specific user';
COMMENT ON FUNCTION refresh_platform_statistics IS 'Refreshes platform-wide statistics (admin only)';
COMMENT ON FUNCTION get_user_dashboard_data IS 'Gets dashboard data for a user';
COMMENT ON FUNCTION get_platform_dashboard_data IS 'Gets platform dashboard data for admins';
