/*
  # Add attributes column to listings

  1. Changes
    - Add `attributes` column to listings table (JSONB type)
    - This column will store category-specific attributes like:
      - Vehicles: brand_id, model_id, year, mileage, fuel_type, transmission
      - Electronics: brand_id, model_id, storage, color, warranty
      - Real estate: surface_area, rooms, bathrooms, floor
      - etc.

  2. Security
    - No RLS changes needed (inherits from listings table)
*/

-- Add attributes column to listings
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listings' AND column_name = 'attributes'
  ) THEN
    ALTER TABLE listings ADD COLUMN attributes jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Create index for better performance on JSONB queries
CREATE INDEX IF NOT EXISTS idx_listings_attributes ON listings USING gin(attributes);

-- Add helpful comment
COMMENT ON COLUMN listings.attributes IS 'Category-specific attributes stored as JSONB. Examples: {"brand_id": "uuid", "model_id": "uuid", "year": 2020, "mileage": 45000, "fuel_type": "diesel"}';
