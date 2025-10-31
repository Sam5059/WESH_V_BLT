/*
  # User Ratings and Reviews System

  1. New Table: user_reviews
    - `id` (uuid, primary key)
    - `reviewer_id` (uuid, foreign key to profiles) - Who wrote the review
    - `reviewee_id` (uuid, foreign key to profiles) - Who is being reviewed
    - `listing_id` (uuid, foreign key to listings) - Related listing
    - `rating` (integer, 1-5 stars)
    - `comment` (text)
    - `transaction_type` (buyer, seller)
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  2. Changes to Profiles
    - Add `rating_average` (numeric) - Average rating
    - Add `rating_count` (integer) - Total number of reviews
    - Add `reviews_as_seller` (integer)
    - Add `reviews_as_buyer` (integer)

  3. Security
    - Enable RLS on user_reviews table
    - Users can only review once per listing
    - Users cannot review themselves
    - Reviews are public

  4. Functions
    - update_user_rating() - Trigger to update profile ratings
    - can_review_user() - Check if user can leave a review
*/

-- Create user_reviews table
CREATE TABLE IF NOT EXISTS user_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewer_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  reviewee_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  listing_id uuid REFERENCES listings(id) ON DELETE CASCADE NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  transaction_type text NOT NULL CHECK (transaction_type IN ('buyer', 'seller')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT no_self_review CHECK (reviewer_id != reviewee_id),
  CONSTRAINT unique_review_per_listing UNIQUE (reviewer_id, listing_id, reviewee_id)
);

-- Add rating fields to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS rating_average numeric(3,2) DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS rating_count integer DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS reviews_as_seller integer DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS reviews_as_buyer integer DEFAULT 0;

-- Enable RLS on user_reviews
ALTER TABLE user_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_reviews
CREATE POLICY "Anyone can view reviews"
  ON user_reviews FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create reviews"
  ON user_reviews FOR INSERT
  TO authenticated
  WITH CHECK (
    reviewer_id = auth.uid()
    AND reviewer_id != reviewee_id
  );

CREATE POLICY "Users can update their own reviews"
  ON user_reviews FOR UPDATE
  TO authenticated
  USING (reviewer_id = auth.uid())
  WITH CHECK (reviewer_id = auth.uid());

CREATE POLICY "Users can delete their own reviews"
  ON user_reviews FOR DELETE
  TO authenticated
  USING (reviewer_id = auth.uid());

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_reviews_reviewer ON user_reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_user_reviews_reviewee ON user_reviews(reviewee_id);
CREATE INDEX IF NOT EXISTS idx_user_reviews_listing ON user_reviews(listing_id);
CREATE INDEX IF NOT EXISTS idx_user_reviews_rating ON user_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_user_reviews_created_at ON user_reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_rating_average ON profiles(rating_average DESC);

-- Function to update user ratings
CREATE OR REPLACE FUNCTION update_user_rating()
RETURNS TRIGGER AS $$
DECLARE
  target_user_id uuid;
BEGIN
  -- Determine which user's rating to update
  IF TG_OP = 'DELETE' THEN
    target_user_id := OLD.reviewee_id;
  ELSE
    target_user_id := NEW.reviewee_id;
  END IF;

  -- Update the reviewee's rating statistics
  UPDATE profiles
  SET
    rating_average = (
      SELECT ROUND(AVG(rating)::numeric, 2)
      FROM user_reviews
      WHERE reviewee_id = target_user_id
    ),
    rating_count = (
      SELECT COUNT(*)
      FROM user_reviews
      WHERE reviewee_id = target_user_id
    ),
    reviews_as_seller = (
      SELECT COUNT(*)
      FROM user_reviews
      WHERE reviewee_id = target_user_id
      AND transaction_type = 'seller'
    ),
    reviews_as_buyer = (
      SELECT COUNT(*)
      FROM user_reviews
      WHERE reviewee_id = target_user_id
      AND transaction_type = 'buyer'
    )
  WHERE id = target_user_id;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update ratings
DROP TRIGGER IF EXISTS trigger_update_user_rating ON user_reviews;
CREATE TRIGGER trigger_update_user_rating
  AFTER INSERT OR UPDATE OR DELETE ON user_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_user_rating();

-- Function to check if user can review another user
CREATE OR REPLACE FUNCTION can_review_user(
  reviewer_id_param uuid,
  reviewee_id_param uuid,
  listing_id_param uuid
)
RETURNS boolean AS $$
DECLARE
  existing_review_count integer;
  is_involved boolean;
BEGIN
  -- Check if reviewer is involved in the listing (buyer or seller)
  SELECT 
    user_id = reviewer_id_param OR user_id = reviewee_id_param
  INTO is_involved
  FROM listings
  WHERE id = listing_id_param;
  
  IF NOT is_involved THEN
    RETURN false;
  END IF;
  
  -- Check if review already exists
  SELECT COUNT(*) INTO existing_review_count
  FROM user_reviews
  WHERE reviewer_id = reviewer_id_param
    AND reviewee_id = reviewee_id_param
    AND listing_id = listing_id_param;
  
  RETURN existing_review_count = 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user reviews with details
CREATE OR REPLACE FUNCTION get_user_reviews(user_id_param uuid, limit_param integer DEFAULT 10)
RETURNS TABLE(
  id uuid,
  reviewer_name text,
  reviewer_avatar text,
  rating integer,
  comment text,
  transaction_type text,
  listing_title text,
  created_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ur.id,
    p.full_name as reviewer_name,
    p.avatar_url as reviewer_avatar,
    ur.rating,
    ur.comment,
    ur.transaction_type,
    l.title as listing_title,
    ur.created_at
  FROM user_reviews ur
  JOIN profiles p ON p.id = ur.reviewer_id
  LEFT JOIN listings l ON l.id = ur.listing_id
  WHERE ur.reviewee_id = user_id_param
  ORDER BY ur.created_at DESC
  LIMIT limit_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comments
COMMENT ON TABLE user_reviews IS 'User reviews and ratings for buyers and sellers';
COMMENT ON COLUMN profiles.rating_average IS 'Average rating from all reviews';
COMMENT ON COLUMN profiles.rating_count IS 'Total number of reviews received';
COMMENT ON COLUMN profiles.reviews_as_seller IS 'Number of reviews as a seller';
COMMENT ON COLUMN profiles.reviews_as_buyer IS 'Number of reviews as a buyer';
COMMENT ON FUNCTION update_user_rating IS 'Updates user rating statistics when reviews change';
COMMENT ON FUNCTION can_review_user IS 'Checks if a user can leave a review for another user';
COMMENT ON FUNCTION get_user_reviews IS 'Gets reviews for a user with reviewer details';
