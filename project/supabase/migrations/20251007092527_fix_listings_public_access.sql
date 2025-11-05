/*
  # Fix Public Access to Active Listings

  1. Problem
    - Current RLS policy only allows authenticated users to view listings
    - Anonymous visitors cannot see active listings
    - This prevents search from working for non-logged-in users

  2. Solution
    - Drop the existing restrictive SELECT policy
    - Create new policies:
      - Public users can view active listings (no authentication required)
      - Authenticated users can view their own listings (all statuses)
    
  3. Security
    - Public users can ONLY see listings with status = 'active'
    - Users can see ALL their own listings regardless of status
    - No data leakage: inactive listings remain private
*/

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Anyone can view active listings" ON listings;

-- Create public read access for active listings
CREATE POLICY "Public can view active listings"
  ON listings
  FOR SELECT
  TO anon, authenticated
  USING (status = 'active');

-- Allow users to view their own listings regardless of status
CREATE POLICY "Users can view own listings"
  ON listings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);