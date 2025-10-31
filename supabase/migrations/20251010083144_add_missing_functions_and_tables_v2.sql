/*
  # Add missing functions and tables
  
  This migration adds:
  1. increment_listing_views function
  2. pro_packages table
  
  ## Changes
  - Create increment_listing_views function for view counting
  - Create pro_packages table for professional packages
  - Add RLS policies
*/

-- Create increment_listing_views function
CREATE OR REPLACE FUNCTION increment_listing_views(listing_id_param UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE listings
  SET views_count = COALESCE(views_count, 0) + 1
  WHERE id = listing_id_param;
END;
$$;

-- Create pro_packages table if it doesn't exist
CREATE TABLE IF NOT EXISTS pro_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_ar TEXT,
  name_en TEXT,
  description TEXT,
  description_ar TEXT,
  description_en TEXT,
  price DECIMAL(10, 2) NOT NULL,
  duration_days INTEGER NOT NULL,
  max_listings INTEGER,
  featured_listings INTEGER DEFAULT 0,
  priority_support BOOLEAN DEFAULT false,
  custom_branding BOOLEAN DEFAULT false,
  analytics BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  order_position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on pro_packages
ALTER TABLE pro_packages ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Anyone can view active pro packages" ON pro_packages;

-- Allow everyone to read active packages
CREATE POLICY "Anyone can view active pro packages"
  ON pro_packages FOR SELECT
  TO public
  USING (is_active = true);

-- Insert default pro packages if table is empty
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pro_packages LIMIT 1) THEN
    INSERT INTO pro_packages (name, name_ar, name_en, description, description_ar, description_en, price, duration_days, max_listings, featured_listings, order_position)
    VALUES 
      ('Pack Basique', 'الباقة الأساسية', 'Basic Pack', 'Idéal pour démarrer avec 10 annonces par mois', 'مثالي للبدء مع 10 إعلانات شهريًا', 'Perfect to start with 10 ads per month', 2999.00, 30, 10, 2, 1),
      ('Pack Standard', 'الباقة القياسية', 'Standard Pack', 'Pour les professionnels avec 30 annonces et support prioritaire', 'للمحترفين مع 30 إعلان ودعم ذو أولوية', 'For professionals with 30 ads and priority support', 5999.00, 30, 30, 5, 2),
      ('Pack Premium', 'الباقة المتميزة', 'Premium Pack', 'Solution complète: annonces illimitées, branding personnalisé et analytics', 'حل كامل: إعلانات غير محدودة، علامة تجارية مخصصة وتحليلات', 'Complete solution: unlimited ads, custom branding and analytics', 12999.00, 30, NULL, 10, 3);
    
    -- Update Standard package with priority support
    UPDATE pro_packages SET priority_support = true WHERE name = 'Pack Standard';
    
    -- Update Premium package with all features
    UPDATE pro_packages 
    SET priority_support = true, custom_branding = true, analytics = true 
    WHERE name = 'Pack Premium';
  END IF;
END $$;
