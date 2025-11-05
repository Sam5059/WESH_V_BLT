/*
  # Add user type field to profiles

  1. Changes
    - Add `user_type` column to profiles table:
      - 'individual' (particulier)
      - 'professional' (professionnel/PRO)
    - Default value is 'individual' for existing profiles
    - Add index for faster filtering

  2. Notes
    - This enables differentiation between regular users and professional sellers
    - Pro users get special badge and features
*/

-- Add user_type column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'user_type'
  ) THEN
    ALTER TABLE profiles ADD COLUMN user_type text DEFAULT 'individual' CHECK (user_type IN ('individual', 'professional'));
  END IF;
END $$;

-- Create index for faster filtering
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON profiles(user_type);

-- Add comment
COMMENT ON COLUMN profiles.user_type IS 'Type of user account: individual (particulier) or professional (PRO)';