/*
  # Create Communes Table

  ## Description
  Creates a comprehensive table of all Algerian communes (municipalities) organized by wilaya.
  This table provides a complete reference of all communes for location filtering.

  ## Tables Created
  - `communes`
    - `id` (uuid, primary key)
    - `wilaya_id` (integer, foreign key to wilayas)
    - `name` (text) - French name
    - `name_ar` (text) - Arabic name
    - `name_en` (text) - English name
    - `code` (text) - Official postal code
    - `created_at` (timestamptz)

  ## Security
  - Enable RLS on communes table
  - Allow public read access (communes are public data)
  - No write access for regular users

  ## Data Integrity
  - Foreign key constraint to wilayas table
  - Unique constraint on (wilaya_id, name) combination
*/

-- Create communes table
CREATE TABLE IF NOT EXISTS communes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wilaya_id integer NOT NULL REFERENCES wilayas(id),
  name text NOT NULL,
  name_ar text,
  name_en text,
  code text,
  created_at timestamptz DEFAULT now()
);

-- Add unique constraint
CREATE UNIQUE INDEX IF NOT EXISTS communes_wilaya_name_unique 
  ON communes(wilaya_id, name);

-- Enable RLS
ALTER TABLE communes ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Anyone can read communes"
  ON communes
  FOR SELECT
  TO authenticated
  USING (true);