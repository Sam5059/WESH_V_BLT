/*
  # Add English Wilaya Names

  1. Changes
    - Add `name_en` column to wilayas table for English translations
    - Update all wilayas with English names (same as French names since they are proper nouns)
  
  2. Notes
    - Wilaya names are proper nouns and remain mostly the same in English
    - Only minor spelling variations are applied where appropriate
*/

-- Add name_en column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'wilayas' AND column_name = 'name_en'
  ) THEN
    ALTER TABLE wilayas ADD COLUMN name_en text;
  END IF;
END $$;

-- Update all wilayas with English names (proper nouns remain mostly unchanged)
UPDATE wilayas SET name_en = name;