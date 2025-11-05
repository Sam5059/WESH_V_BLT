/*
  # Add category_type to brands table
  
  This migration adds a category_type column to the brands table
  to simplify brand filtering by category type (vehicles, electronics, etc.)
  
  ## Changes
  1. Add category_type column
  2. Populate it based on existing category_id relationships
*/

-- Add category_type column to brands
ALTER TABLE brands
ADD COLUMN IF NOT EXISTS category_type TEXT;

-- Update category_type based on category relationships
-- First, let's update brands for vehicles categories
UPDATE brands b
SET category_type = 'vehicles'
FROM categories c
WHERE b.category_id = c.id 
AND c.slug IN ('vehicules', 'voitures', 'motos', 'camions', 'pieces-auto');

-- Update for electronics
UPDATE brands b
SET category_type = 'electronics'
FROM categories c
WHERE b.category_id = c.id 
AND c.slug IN ('electronique', 'smartphones', 'ordinateurs', 'tv-audio', 'photo-camera');

-- Update for fashion
UPDATE brands b
SET category_type = 'fashion'
FROM categories c
WHERE b.category_id = c.id 
AND c.slug IN ('mode-beaute', 'vetements', 'chaussures', 'accessoires');

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_brands_category_type ON brands(category_type);
