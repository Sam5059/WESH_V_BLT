/*
  # Fix listings-profiles relationship
  
  This migration adds a foreign key relationship between listings.user_id and profiles.id
  to allow Supabase to perform JOINs between these tables.
  
  ## Changes
  1. Add foreign key constraint from listings.user_id to profiles.id
  2. This enables queries like: listings.select('*, profiles(full_name, avatar_url)')
*/

-- Add foreign key relationship between listings and profiles
-- First, check if constraint already exists and drop it if needed
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'listings_profile_id_fkey'
  ) THEN
    ALTER TABLE listings DROP CONSTRAINT listings_profile_id_fkey;
  END IF;
END $$;

-- Add the foreign key constraint
ALTER TABLE listings
ADD CONSTRAINT listings_profile_id_fkey
FOREIGN KEY (user_id)
REFERENCES profiles(id)
ON DELETE CASCADE;
