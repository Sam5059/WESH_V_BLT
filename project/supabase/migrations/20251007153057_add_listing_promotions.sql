/*
  # Add Listing Promotions System

  1. New Table: listing_promotions
    - Individual listing promotions

  2. New Table: promotion_packages
    - Available promotion types for purchase

  3. Changes to user_subscriptions
    - Add remaining listings counts

  4. Security
    - Enable RLS on all tables

  5. Functions
    - Promotion management functions
*/

-- Create listing_promotions table
CREATE TABLE IF NOT EXISTS listing_promotions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid REFERENCES listings(id) ON DELETE CASCADE NOT NULL,
  promotion_type text NOT NULL CHECK (promotion_type IN ('featured', 'urgent', 'top_listing', 'highlighted')),
  starts_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL,
  is_active boolean DEFAULT true,
  price_paid numeric DEFAULT 0,
  payment_method text,
  created_at timestamptz DEFAULT now()
);

-- Create promotion_packages table
CREATE TABLE IF NOT EXISTS promotion_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  name_ar text,
  name_en text,
  promotion_type text NOT NULL CHECK (promotion_type IN ('featured', 'urgent', 'top_listing', 'highlighted')),
  duration_days integer NOT NULL DEFAULT 7,
  price numeric NOT NULL DEFAULT 0,
  description text,
  description_ar text,
  description_en text,
  features jsonb DEFAULT '[]'::jsonb,
  is_active boolean DEFAULT true,
  order_position integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Add fields to user_subscriptions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_subscriptions' AND column_name = 'listings_remaining'
  ) THEN
    ALTER TABLE user_subscriptions ADD COLUMN listings_remaining integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_subscriptions' AND column_name = 'featured_listings_remaining'
  ) THEN
    ALTER TABLE user_subscriptions ADD COLUMN featured_listings_remaining integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_subscriptions' AND column_name = 'refresh_count'
  ) THEN
    ALTER TABLE user_subscriptions ADD COLUMN refresh_count integer DEFAULT 0;
  END IF;
END $$;

-- Enable RLS
ALTER TABLE listing_promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotion_packages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for listing_promotions
CREATE POLICY "Users can view promotions on their listings"
  ON listing_promotions FOR SELECT
  TO authenticated
  USING (
    listing_id IN (
      SELECT id FROM listings WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Public can view active promotions"
  ON listing_promotions FOR SELECT
  TO public
  USING (is_active = true AND expires_at > now());

CREATE POLICY "Users can create promotions for their listings"
  ON listing_promotions FOR INSERT
  TO authenticated
  WITH CHECK (
    listing_id IN (
      SELECT id FROM listings WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their listing promotions"
  ON listing_promotions FOR UPDATE
  TO authenticated
  USING (
    listing_id IN (
      SELECT id FROM listings WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all promotions"
  ON listing_promotions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- RLS Policies for promotion_packages
CREATE POLICY "Public can view active packages"
  ON promotion_packages FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Admins can manage promotion packages"
  ON promotion_packages FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_listing_promotions_listing_id ON listing_promotions(listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_promotions_active ON listing_promotions(is_active, expires_at);
CREATE INDEX IF NOT EXISTS idx_listing_promotions_type ON listing_promotions(promotion_type);
CREATE INDEX IF NOT EXISTS idx_promotion_packages_type ON promotion_packages(promotion_type, is_active);

-- Function to check if user can promote listing
CREATE OR REPLACE FUNCTION can_promote_listing(
  p_user_id uuid,
  p_listing_id uuid,
  p_promotion_type text
)
RETURNS boolean AS $$
DECLARE
  is_owner boolean;
  is_pro boolean;
  has_subscription boolean;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM listings
    WHERE id = p_listing_id AND user_id = p_user_id
  ) INTO is_owner;
  
  IF NOT is_owner THEN
    RETURN false;
  END IF;
  
  SELECT user_type = 'professional' INTO is_pro
  FROM profiles
  WHERE id = p_user_id;
  
  IF p_promotion_type IN ('featured', 'highlighted') AND is_pro THEN
    SELECT EXISTS(
      SELECT 1 FROM user_subscriptions
      WHERE user_id = p_user_id
      AND is_active = true
      AND expires_at > now()
      AND featured_listings_remaining > 0
    ) INTO has_subscription;
    
    RETURN has_subscription;
  END IF;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get active promotions for a listing
CREATE OR REPLACE FUNCTION get_active_promotions(p_listing_id uuid)
RETURNS TABLE(
  promotion_type text,
  expires_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    lp.promotion_type,
    lp.expires_at
  FROM listing_promotions lp
  WHERE lp.listing_id = p_listing_id
  AND lp.is_active = true
  AND lp.expires_at > now()
  ORDER BY lp.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to expire old promotions
CREATE OR REPLACE FUNCTION expire_promotions()
RETURNS integer AS $$
DECLARE
  expired_count integer;
BEGIN
  UPDATE listing_promotions
  SET is_active = false
  WHERE is_active = true
  AND expires_at <= now();
  
  GET DIAGNOSTICS expired_count = ROW_COUNT;
  
  RETURN expired_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert promotion packages
INSERT INTO promotion_packages (name, name_ar, name_en, promotion_type, duration_days, price, description, order_position) VALUES
  ('Mise en avant 7 jours', 'ابراز 7 ايام', 'Featured 7 days', 'featured', 7, 500, 'Votre annonce apparait en tete des resultats', 1),
  ('Mise en avant 14 jours', 'ابراز 14 يوم', 'Featured 14 days', 'featured', 14, 800, 'Visibilite maximale pendant 2 semaines', 2),
  ('Mise en avant 30 jours', 'ابراز 30 يوم', 'Featured 30 days', 'featured', 30, 1500, 'Un mois complet en tete de liste', 3),
  ('Urgent 7 jours', 'عاجل 7 ايام', 'Urgent 7 days', 'urgent', 7, 300, 'Badge URGENT rouge sur votre annonce', 4),
  ('Top annonce 3 jours', 'اعلى اعلان 3 ايام', 'Top Listing 3 days', 'top_listing', 3, 200, 'Position fixe en tete pendant 3 jours', 5),
  ('Surligne 7 jours', 'مميز 7 ايام', 'Highlighted 7 days', 'highlighted', 7, 250, 'Fond colore pour se demarquer', 6)
ON CONFLICT DO NOTHING;

-- Comments
COMMENT ON TABLE listing_promotions IS 'Individual listing promotions';
COMMENT ON TABLE promotion_packages IS 'Available promotion packages';
COMMENT ON FUNCTION can_promote_listing IS 'Checks if user can promote listing';
COMMENT ON FUNCTION get_active_promotions IS 'Returns active promotions for listing';
COMMENT ON FUNCTION expire_promotions IS 'Marks expired promotions as inactive';