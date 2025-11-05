/*
  # Disable Mandatory Moderation for Listings

  This migration disables the automatic moderation requirement that was preventing users from viewing listings.

  ## Changes
  - Drops the trigger that forces all new listings to 'pending' status
  - Allows listings to be created as 'active' by default
  - Users can now view listings immediately after creation
  - Moderation system remains available for admin use but is not mandatory

  ## Reasoning
  The current setup with mandatory moderation prevents users from viewing any listings because:
  1. New listings are automatically set to 'pending' status
  2. Only 'active' listings are visible to public users
  3. This creates a poor user experience where no listings are shown

  ## Note
  Admins can still manually moderate listings through the admin dashboard if needed.
*/

-- Drop the trigger that forces all listings to pending status
DROP TRIGGER IF EXISTS trigger_set_listing_pending ON listings;

-- Update existing pending listings to active so they become visible
UPDATE listings 
SET status = 'active', 
    reviewed_at = now(),
    moderation_notes = 'Auto-approved: Moderation requirement removed'
WHERE status = 'pending' AND moderation_notes = 'Awaiting moderation review by Buy&Go team';

-- Create a more flexible function that allows active status
CREATE OR REPLACE FUNCTION set_listing_status()
RETURNS TRIGGER AS $$
BEGIN
  -- If status is not explicitly set, default to 'active'
  IF NEW.status IS NULL THEN
    NEW.status := 'active';
  END IF;
  
  -- If no moderation notes provided, add default message
  IF NEW.moderation_notes IS NULL THEN
    NEW.moderation_notes := 'Listing published';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create new trigger that allows active status
CREATE TRIGGER trigger_set_listing_status
  BEFORE INSERT ON listings
  FOR EACH ROW
  EXECUTE FUNCTION set_listing_status();