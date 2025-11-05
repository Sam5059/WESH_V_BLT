/*
  # Create PRO Packages System

  1. New Tables
    - `pro_packages`
      - `id` (uuid, primary key)
      - `category_id` (uuid, foreign key to categories)
      - `name` (text) - Package name
      - `price` (numeric) - Price in DA
      - `duration_days` (integer) - Duration in days
      - `features` (jsonb) - List of features
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `user_subscriptions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `package_id` (uuid, foreign key to pro_packages)
      - `category_id` (uuid, foreign key to categories)
      - `starts_at` (timestamptz)
      - `expires_at` (timestamptz)
      - `is_active` (boolean)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Users can read all packages
    - Users can view their own subscriptions
    - Only authenticated users can create subscriptions
*/

-- Create pro_packages table
CREATE TABLE IF NOT EXISTS pro_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES categories(id) ON DELETE CASCADE,
  name text NOT NULL,
  price numeric NOT NULL DEFAULT 0,
  duration_days integer NOT NULL DEFAULT 30,
  features jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  package_id uuid REFERENCES pro_packages(id) ON DELETE CASCADE NOT NULL,
  category_id uuid REFERENCES categories(id) ON DELETE CASCADE NOT NULL,
  starts_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE pro_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policies for pro_packages
CREATE POLICY "Anyone can view packages"
  ON pro_packages FOR SELECT
  TO authenticated, anon
  USING (true);

-- Policies for user_subscriptions
CREATE POLICY "Users can view own subscriptions"
  ON user_subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own subscriptions"
  ON user_subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions"
  ON user_subscriptions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Insert default PRO packages for each category
INSERT INTO pro_packages (category_id, name, price, duration_days, features)
SELECT 
  id,
  'PRO ' || name,
  CASE 
    WHEN name = 'Véhicules' THEN 5000
    WHEN name = 'Immobilier' THEN 8000
    WHEN name = 'Électronique' THEN 3000
    WHEN name = 'Maison & Jardin' THEN 2500
    WHEN name = 'Mode & Beauté' THEN 2000
    WHEN name = 'Loisirs & Divertissement' THEN 2000
    WHEN name = 'Emploi & Services' THEN 3500
    WHEN name = 'Animaux' THEN 1500
    ELSE 2000
  END,
  30,
  jsonb_build_array(
    'Annonces illimitées',
    'Apparaît en tête des résultats',
    'Badge PRO',
    'Statistiques détaillées',
    'Support prioritaire',
    'Plus de photos (jusqu''à 10)'
  )
FROM categories
WHERE parent_id IS NULL
ON CONFLICT DO NOTHING;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_active ON user_subscriptions(is_active, expires_at);
CREATE INDEX IF NOT EXISTS idx_pro_packages_category ON pro_packages(category_id);

-- Function to check if user has active PRO subscription for a category
CREATE OR REPLACE FUNCTION has_active_pro_subscription(p_user_id uuid, p_category_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM user_subscriptions
    WHERE user_id = p_user_id
      AND category_id = p_category_id
      AND is_active = true
      AND expires_at > now()
  );
END;
$$;
