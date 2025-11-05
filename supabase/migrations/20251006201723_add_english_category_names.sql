/*
  # Add English Category Names

  1. Changes
    - Add `name_en` column to categories table for English translations
    - Update existing categories with English names
  
  2. Data Updates
    - Populate English names for all existing categories
*/

-- Add name_en column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'categories' AND column_name = 'name_en'
  ) THEN
    ALTER TABLE categories ADD COLUMN name_en text;
  END IF;
END $$;

-- Update categories with English names
UPDATE categories SET name_en = 'Vehicles' WHERE slug = 'vehicules';
UPDATE categories SET name_en = 'Real Estate' WHERE slug = 'immobilier';
UPDATE categories SET name_en = 'Electronics' WHERE slug = 'electronique';
UPDATE categories SET name_en = 'Home & Garden' WHERE slug = 'maison-jardin';
UPDATE categories SET name_en = 'Fashion & Beauty' WHERE slug = 'mode-beaute';
UPDATE categories SET name_en = 'Jobs' WHERE slug = 'emploi';
UPDATE categories SET name_en = 'Services' WHERE slug = 'services';
UPDATE categories SET name_en = 'Leisure & Hobbies' WHERE slug = 'loisirs';