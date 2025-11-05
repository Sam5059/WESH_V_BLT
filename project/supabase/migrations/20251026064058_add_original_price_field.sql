/*
  # Add original_price field for promotions

  1. Changes
    - Add `original_price` column to `listings` table
    - This field stores the original price before discount/promotion
    - Allows displaying promotional prices with strikethrough effect

  2. Purpose
    - Enable promotional pricing display
    - Show original price vs. discounted price
    - Calculate discount percentage automatically
*/

-- Add original_price column to listings table
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS original_price NUMERIC;

-- Add comment explaining the field
COMMENT ON COLUMN listings.original_price IS 'Original price before discount/promotion. If set and greater than price, indicates a promotional offer.';
