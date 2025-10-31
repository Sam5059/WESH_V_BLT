/*
  # Fix Pro Stores Public Access

  1. Changes
    - Drop existing policies to avoid conflicts
    - Enable RLS on pro_stores table
    - Add policy for public read access to active stores
    - Add policy for store owners to manage their stores

  2. Security
    - Public users can view active stores
    - Only store owners can update/delete their stores
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view active pro stores" ON pro_stores;
DROP POLICY IF EXISTS "Store owners can view own stores" ON pro_stores;
DROP POLICY IF EXISTS "Store owners can update own stores" ON pro_stores;
DROP POLICY IF EXISTS "Authenticated users can create stores" ON pro_stores;
DROP POLICY IF EXISTS "Store owners can delete own stores" ON pro_stores;
DROP POLICY IF EXISTS "Pro stores are viewable by everyone" ON pro_stores;
DROP POLICY IF EXISTS "Pro stores can be created by authenticated users" ON pro_stores;
DROP POLICY IF EXISTS "Pro stores can be updated by owner" ON pro_stores;

-- Enable RLS
ALTER TABLE pro_stores ENABLE ROW LEVEL SECURITY;

-- Public can view active stores
CREATE POLICY "Anyone can view active pro stores"
  ON pro_stores
  FOR SELECT
  USING (is_active = true);

-- Store owners can view their own stores (even if inactive)
CREATE POLICY "Store owners can view own stores"
  ON pro_stores
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Store owners can update their own stores
CREATE POLICY "Store owners can update own stores"
  ON pro_stores
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Authenticated users can create stores
CREATE POLICY "Authenticated users can create stores"
  ON pro_stores
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Store owners can delete their own stores
CREATE POLICY "Store owners can delete own stores"
  ON pro_stores
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
