/*
  # Add listing type field to listings table

  1. Changes
    - Add `listing_type` column to listings table with three possible values:
      - 'sale' (vente)
      - 'purchase' (achat/recherche)
      - 'rent' (location)
    - Default value is 'sale' for existing listings
    - Add index on listing_type for faster filtering

  2. Notes
    - This enables users to differentiate between:
      - Items/services for sale
      - Items/services wanted to purchase
      - Items/services for rent
*/

-- Add listing_type column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listings' AND column_name = 'listing_type'
  ) THEN
    ALTER TABLE listings ADD COLUMN listing_type text DEFAULT 'sale' CHECK (listing_type IN ('sale', 'purchase', 'rent'));
  END IF;
END $$;

-- Create index for faster filtering
CREATE INDEX IF NOT EXISTS idx_listings_type ON listings(listing_type) WHERE status = 'active';

-- Add comment
COMMENT ON COLUMN listings.listing_type IS 'Type of listing: sale (vente), purchase (recherche/achat), or rent (location)';