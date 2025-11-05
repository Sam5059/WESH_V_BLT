/*
  # Add professional slug for custom URLs

  1. Changes
    - Add `pro_slug` column to profiles table
    - Add unique constraint on pro_slug
    - Add function to generate slug from full_name
    - Create index on pro_slug for fast lookups

  2. Security
    - Only authenticated users can update their own slug
    - Slug must be unique across all profiles
*/

-- Add pro_slug column to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'pro_slug'
  ) THEN
    ALTER TABLE profiles ADD COLUMN pro_slug text UNIQUE;
  END IF;
END $$;

-- Create index on pro_slug for fast lookups
CREATE INDEX IF NOT EXISTS idx_profiles_pro_slug ON profiles(pro_slug);

-- Function to generate slug from name
CREATE OR REPLACE FUNCTION generate_pro_slug(name text, user_id uuid)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  base_slug text;
  final_slug text;
  counter int := 0;
BEGIN
  -- Convert name to lowercase, replace spaces with hyphens, remove special chars
  base_slug := lower(regexp_replace(trim(name), '[^a-zA-Z0-9\s-]', '', 'g'));
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  base_slug := regexp_replace(base_slug, '-+', '-', 'g');
  
  -- Ensure slug is not empty
  IF base_slug = '' THEN
    base_slug := user_id::text;
  END IF;
  
  final_slug := base_slug;
  
  -- Check for uniqueness and add counter if needed
  WHILE EXISTS (SELECT 1 FROM profiles WHERE pro_slug = final_slug AND id != user_id) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$;

-- Trigger to auto-generate slug for professional users
CREATE OR REPLACE FUNCTION auto_generate_pro_slug()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Generate slug only for professional users without a slug
  IF NEW.user_type = 'professional' AND (NEW.pro_slug IS NULL OR NEW.pro_slug = '') THEN
    NEW.pro_slug := generate_pro_slug(NEW.full_name, NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger if it doesn't exist
DROP TRIGGER IF EXISTS trigger_auto_generate_pro_slug ON profiles;
CREATE TRIGGER trigger_auto_generate_pro_slug
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_pro_slug();

-- Generate slugs for existing professional users
UPDATE profiles
SET pro_slug = generate_pro_slug(full_name, id)
WHERE user_type = 'professional' AND (pro_slug IS NULL OR pro_slug = '');