/*
  # Fix listings-profiles relationship

  ## Description
  This migration fixes the relationship between listings and profiles tables to enable
  proper joins in Supabase queries.

  ## Changes
  1. Add a foreign key from listings.user_id to profiles.id (which already references auth.users.id)
  2. This creates a proper relationship path that Supabase can use for joins

  ## Note
  Since profiles.id already references auth.users.id, and listings.user_id references auth.users.id,
  we're creating an explicit relationship that Supabase PostgREST can detect.
*/

-- Drop the existing foreign key constraint on listings.user_id
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'listings_user_id_fkey'
    AND table_name = 'listings'
  ) THEN
    ALTER TABLE listings DROP CONSTRAINT listings_user_id_fkey;
  END IF;
END $$;

-- Add new foreign key that references profiles instead of auth.users
-- This allows Supabase to properly join listings with profiles
ALTER TABLE listings 
  ADD CONSTRAINT listings_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES profiles(id) 
  ON DELETE CASCADE;

-- Create index for better join performance
CREATE INDEX IF NOT EXISTS listings_user_id_idx ON listings(user_id);