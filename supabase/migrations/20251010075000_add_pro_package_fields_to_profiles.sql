/*
  # Add PRO Package Fields to Profiles

  1. Changes
    - Add `has_active_pro_package` (boolean) - Whether the user has an active PRO package
    - Add `pro_package_expires_at` (timestamptz) - When the PRO package expires
    - Add `pro_package_type` (text) - Type of PRO package (basic, standard, premium)
    - Default values for existing profiles
    - Add index for faster filtering

  2. Notes
    - Professional users must have an active PRO package to publish listings
    - When package expires, listings remain active but new ones cannot be created
    - Expired packages can be renewed
*/

-- Add has_active_pro_package column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'has_active_pro_package'
  ) THEN
    ALTER TABLE profiles ADD COLUMN has_active_pro_package boolean DEFAULT false;
  END IF;
END $$;

-- Add pro_package_expires_at column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'pro_package_expires_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN pro_package_expires_at timestamptz;
  END IF;
END $$;

-- Add pro_package_type column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'pro_package_type'
  ) THEN
    ALTER TABLE profiles ADD COLUMN pro_package_type text CHECK (pro_package_type IN ('basic', 'standard', 'premium'));
  END IF;
END $$;

-- Create indexes for faster filtering
CREATE INDEX IF NOT EXISTS idx_profiles_has_active_pro ON profiles(has_active_pro_package);
CREATE INDEX IF NOT EXISTS idx_profiles_pro_expires_at ON profiles(pro_package_expires_at);

-- Add comments
COMMENT ON COLUMN profiles.has_active_pro_package IS 'Whether the professional user has an active PRO package';
COMMENT ON COLUMN profiles.pro_package_expires_at IS 'Date when the PRO package expires';
COMMENT ON COLUMN profiles.pro_package_type IS 'Type of PRO package: basic, standard, or premium';
