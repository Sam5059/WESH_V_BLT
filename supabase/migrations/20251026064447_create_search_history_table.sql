/*
  # Create search_history table

  1. New Tables
    - `search_history`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `search_query` (text, the search term used)
      - `category_id` (uuid, optional category filter)
      - `filters` (jsonb, optional filters applied)
      - `results_count` (integer, number of results)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `search_history` table
    - Users can only view/create their own search history
    - Auto-cleanup old searches (keep last 50 per user)

  3. Indexes
    - Index on user_id and created_at for fast queries
*/

-- Create search_history table
CREATE TABLE IF NOT EXISTS search_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  search_query TEXT NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  filters JSONB DEFAULT '{}'::jsonb,
  results_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_search_history_user_id ON search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_search_history_created_at ON search_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_search_history_user_created ON search_history(user_id, created_at DESC);

-- Enable RLS
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own search history
CREATE POLICY "Users can view own search history"
  ON search_history
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own search history
CREATE POLICY "Users can create own search history"
  ON search_history
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own search history
CREATE POLICY "Users can delete own search history"
  ON search_history
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to auto-cleanup old searches (keep last 50 per user)
CREATE OR REPLACE FUNCTION cleanup_old_search_history()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM search_history
  WHERE user_id = NEW.user_id
  AND id NOT IN (
    SELECT id FROM search_history
    WHERE user_id = NEW.user_id
    ORDER BY created_at DESC
    LIMIT 50
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-cleanup after insert
CREATE TRIGGER trigger_cleanup_old_search_history
  AFTER INSERT ON search_history
  FOR EACH ROW
  EXECUTE FUNCTION cleanup_old_search_history();

-- Add comment
COMMENT ON TABLE search_history IS 'Stores user search history for quick access to previous searches';
