/*
  # Fix increment_listing_views function

  ## Description
  Fixes the ambiguous column reference error in the increment_listing_views function
  by properly qualifying the column names.

  ## Changes
  - Updates the function to use proper table qualification for the id column
*/

-- Drop and recreate the function with fixed column references
CREATE OR REPLACE FUNCTION increment_listing_views(listing_id_param uuid)
RETURNS TABLE (
  id uuid,
  views_count integer
) AS $$
BEGIN
  UPDATE listings
  SET views_count = listings.views_count + 1
  WHERE listings.id = listing_id_param
    AND listings.status = 'active';
  
  RETURN QUERY
  SELECT listings.id, listings.views_count
  FROM listings
  WHERE listings.id = listing_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;