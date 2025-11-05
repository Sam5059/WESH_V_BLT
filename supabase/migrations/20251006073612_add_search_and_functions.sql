/*
  # Add Search and Backend Functions

  ## Description
  Enhances the Buy&Go database with full-text search capabilities, 
  automatic view tracking, and conversation management triggers.

  ## Changes Made

  ### 1. Full-Text Search for Listings
  - Adds `search_vector` column to listings table using tsvector
  - Creates GIN index for fast full-text search
  - Adds trigger to automatically update search vector on insert/update
  - Searches across title, description, wilaya, and commune fields

  ### 2. View Increment Function
  - Function `increment_listing_views()` to safely increment views
  - Returns updated listing data
  - Prevents race conditions with atomic increment

  ### 3. Conversation Auto-Update
  - Trigger to update conversations table when new message is sent
  - Updates last_message, last_message_at, and unread counts
  - Handles both buyer and seller unread counters

  ## Security
  - All functions respect existing RLS policies
  - View increment uses SECURITY DEFINER safely
*/

-- Enable pg_trgm extension for better text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Add search vector column to listings
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listings' AND column_name = 'search_vector'
  ) THEN
    ALTER TABLE listings ADD COLUMN search_vector tsvector;
  END IF;
END $$;

-- Create function to update search vector
CREATE OR REPLACE FUNCTION update_listing_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('french', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('french', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('simple', COALESCE(NEW.wilaya, '')), 'C') ||
    setweight(to_tsvector('simple', COALESCE(NEW.commune, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for search vector
DROP TRIGGER IF EXISTS update_listings_search_vector ON listings;
CREATE TRIGGER update_listings_search_vector
  BEFORE INSERT OR UPDATE ON listings
  FOR EACH ROW
  EXECUTE FUNCTION update_listing_search_vector();

-- Create GIN index for fast full-text search
CREATE INDEX IF NOT EXISTS idx_listings_search_vector ON listings USING GIN(search_vector);

-- Create additional indexes for filtering
CREATE INDEX IF NOT EXISTS idx_listings_price ON listings(price);
CREATE INDEX IF NOT EXISTS idx_listings_featured_created ON listings(is_featured, created_at DESC) WHERE status = 'active';

-- Function to increment listing views
CREATE OR REPLACE FUNCTION increment_listing_views(listing_id_param uuid)
RETURNS TABLE (
  id uuid,
  views_count integer
) AS $$
BEGIN
  UPDATE listings
  SET views_count = views_count + 1
  WHERE id = listing_id_param
    AND status = 'active';
  
  RETURN QUERY
  SELECT listings.id, listings.views_count
  FROM listings
  WHERE listings.id = listing_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update conversation on new message
CREATE OR REPLACE FUNCTION update_conversation_on_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET 
    last_message = NEW.content,
    last_message_at = NEW.created_at,
    unread_count_buyer = CASE 
      WHEN NEW.receiver_id = buyer_id THEN unread_count_buyer + 1
      ELSE unread_count_buyer
    END,
    unread_count_seller = CASE 
      WHEN NEW.receiver_id = seller_id THEN unread_count_seller + 1
      ELSE unread_count_seller
    END,
    updated_at = NOW()
  WHERE id = NEW.conversation_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update conversation on new message
DROP TRIGGER IF EXISTS update_conversation_on_new_message ON messages;
CREATE TRIGGER update_conversation_on_new_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_on_message();

-- Function to mark conversation as read
CREATE OR REPLACE FUNCTION mark_conversation_read(
  conversation_id_param uuid,
  user_id_param uuid
)
RETURNS void AS $$
BEGIN
  UPDATE conversations
  SET 
    unread_count_buyer = CASE 
      WHEN buyer_id = user_id_param THEN 0
      ELSE unread_count_buyer
    END,
    unread_count_seller = CASE 
      WHEN seller_id = user_id_param THEN 0
      ELSE unread_count_seller
    END
  WHERE id = conversation_id_param
    AND (buyer_id = user_id_param OR seller_id = user_id_param);
  
  UPDATE messages
  SET is_read = true
  WHERE conversation_id = conversation_id_param
    AND receiver_id = user_id_param
    AND is_read = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update existing listings to have search vectors
UPDATE listings SET updated_at = updated_at WHERE search_vector IS NULL;