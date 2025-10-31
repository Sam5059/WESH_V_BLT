/*
  # Fix listings public access for authenticated users
  
  1. Changes
    - Drop existing restrictive policies
    - Create new policy allowing authenticated users to view ALL active listings
    - Keep policy allowing public (anon) users to view active listings
    - Users can still manage their own listings
  
  2. Security
    - Active listings are viewable by everyone (authenticated + anon)
    - Users can only modify their own listings
*/

-- Drop old restrictive policy for authenticated users
DROP POLICY IF EXISTS "Users can view own listings" ON listings;

-- Drop old authenticated policy if exists
DROP POLICY IF EXISTS "Anyone can view active listings" ON listings;

-- Create comprehensive policy for viewing active listings
-- This allows BOTH authenticated and anon users to see active listings
CREATE POLICY "Everyone can view active listings"
  ON listings
  FOR SELECT
  TO public
  USING (status = 'active');

-- Ensure users can still view their own listings regardless of status
CREATE POLICY "Users can view all own listings"
  ON listings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Log the change
DO $$
BEGIN
  RAISE NOTICE 'Listings policies updated: public access enabled for active listings';
END $$;
