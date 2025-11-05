/*
  # Add Professional Profile Fields

  ## Summary
  This migration adds comprehensive professional fields to the profiles table to support
  full professional accounts without creating a separate table.

  ## Changes Made

  ### 1. Legal Information (Informations légales)
  - `company_name` (text) - Raison sociale / Nom de l'entreprise
  - `legal_form` (text) - Forme juridique (SARL, EURL, SNC, etc.)
  - `trade_register_number` (text) - Numéro du Registre du Commerce (NRC/SIRET)
  - `tax_id` (text) - Numéro d'identification fiscale (NIF)
  - `professional_address` (text) - Adresse professionnelle complète
  - `professional_wilaya` (text) - Wilaya du siège social
  - `professional_commune` (text) - Commune du siège social

  ### 2. Contact Information (Informations de contact)
  - `professional_email` (text) - Email professionnel
  - `professional_phone` (text) - Téléphone fixe professionnel
  - `website_url` (text) - Site web
  - `facebook_url` (text) - Page Facebook
  - `instagram_url` (text) - Compte Instagram

  ### 3. Business Information (Informations commerciales)
  - `business_description` (text) - Description de l'activité
  - `business_category` (text) - Secteur d'activité principal
  - `opening_hours` (jsonb) - Horaires d'ouverture au format JSON
  - `logo_url` (text) - URL du logo professionnel
  - `cover_image_url` (text) - Image de couverture

  ### 4. Statistics & Performance (Statistiques)
  - `average_rating` (numeric) - Note moyenne (calculée)
  - `total_reviews` (integer) - Nombre total d'avis
  - `total_sales` (integer) - Nombre total de ventes
  - `response_rate` (numeric) - Taux de réponse aux messages
  - `response_time_hours` (integer) - Temps de réponse moyen en heures

  ### 5. Verification & Status (Vérification)
  - `is_verified_professional` (boolean) - Professionnel vérifié par l'admin
  - `verification_documents_submitted` (boolean) - Documents soumis pour vérification
  - `verification_date` (timestamptz) - Date de vérification

  ## Security
  - All fields are optional (can be NULL)
  - Only authenticated users can update their own profile
  - Professional verification requires admin approval

  ## Notes
  - These fields are only required for professional accounts
  - Individual users will have these fields as NULL
  - opening_hours format: {"monday": "9:00-18:00", "tuesday": "9:00-18:00", ...}
*/

-- Legal Information
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'company_name') THEN
    ALTER TABLE profiles ADD COLUMN company_name text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'legal_form') THEN
    ALTER TABLE profiles ADD COLUMN legal_form text CHECK (legal_form IN ('SARL', 'EURL', 'SNC', 'SPA', 'SCS', 'Auto-entrepreneur', 'Autre'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'trade_register_number') THEN
    ALTER TABLE profiles ADD COLUMN trade_register_number text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'tax_id') THEN
    ALTER TABLE profiles ADD COLUMN tax_id text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'professional_address') THEN
    ALTER TABLE profiles ADD COLUMN professional_address text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'professional_wilaya') THEN
    ALTER TABLE profiles ADD COLUMN professional_wilaya text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'professional_commune') THEN
    ALTER TABLE profiles ADD COLUMN professional_commune text;
  END IF;
END $$;

-- Contact Information
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'professional_email') THEN
    ALTER TABLE profiles ADD COLUMN professional_email text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'professional_phone') THEN
    ALTER TABLE profiles ADD COLUMN professional_phone text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'website_url') THEN
    ALTER TABLE profiles ADD COLUMN website_url text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'facebook_url') THEN
    ALTER TABLE profiles ADD COLUMN facebook_url text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'instagram_url') THEN
    ALTER TABLE profiles ADD COLUMN instagram_url text;
  END IF;
END $$;

-- Business Information
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'business_description') THEN
    ALTER TABLE profiles ADD COLUMN business_description text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'business_category') THEN
    ALTER TABLE profiles ADD COLUMN business_category text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'opening_hours') THEN
    ALTER TABLE profiles ADD COLUMN opening_hours jsonb;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'logo_url') THEN
    ALTER TABLE profiles ADD COLUMN logo_url text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'cover_image_url') THEN
    ALTER TABLE profiles ADD COLUMN cover_image_url text;
  END IF;
END $$;

-- Statistics
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'average_rating') THEN
    ALTER TABLE profiles ADD COLUMN average_rating numeric(3, 2) DEFAULT 0 CHECK (average_rating >= 0 AND average_rating <= 5);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'total_reviews') THEN
    ALTER TABLE profiles ADD COLUMN total_reviews integer DEFAULT 0;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'total_sales') THEN
    ALTER TABLE profiles ADD COLUMN total_sales integer DEFAULT 0;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'response_rate') THEN
    ALTER TABLE profiles ADD COLUMN response_rate numeric(5, 2) DEFAULT 0 CHECK (response_rate >= 0 AND response_rate <= 100);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'response_time_hours') THEN
    ALTER TABLE profiles ADD COLUMN response_time_hours integer DEFAULT 24;
  END IF;
END $$;

-- Verification
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'is_verified_professional') THEN
    ALTER TABLE profiles ADD COLUMN is_verified_professional boolean DEFAULT false;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'verification_documents_submitted') THEN
    ALTER TABLE profiles ADD COLUMN verification_documents_submitted boolean DEFAULT false;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'verification_date') THEN
    ALTER TABLE profiles ADD COLUMN verification_date timestamptz;
  END IF;
END $$;

-- Create indexes for professional fields
CREATE INDEX IF NOT EXISTS idx_profiles_company_name ON profiles(company_name);
CREATE INDEX IF NOT EXISTS idx_profiles_verified_professional ON profiles(is_verified_professional);
CREATE INDEX IF NOT EXISTS idx_profiles_business_category ON profiles(business_category);
CREATE INDEX IF NOT EXISTS idx_profiles_average_rating ON profiles(average_rating DESC);

-- Add comments
COMMENT ON COLUMN profiles.company_name IS 'Nom de la société / Raison sociale';
COMMENT ON COLUMN profiles.legal_form IS 'Forme juridique (SARL, EURL, etc.)';
COMMENT ON COLUMN profiles.trade_register_number IS 'Numéro du Registre du Commerce (NRC)';
COMMENT ON COLUMN profiles.tax_id IS 'Numéro d''identification fiscale (NIF)';
COMMENT ON COLUMN profiles.professional_address IS 'Adresse complète du siège social';
COMMENT ON COLUMN profiles.business_description IS 'Description de l''activité professionnelle';
COMMENT ON COLUMN profiles.opening_hours IS 'Horaires d''ouverture au format JSON';
COMMENT ON COLUMN profiles.is_verified_professional IS 'Badge de vérification professionnel (validé par admin)';
COMMENT ON COLUMN profiles.average_rating IS 'Note moyenne calculée sur les avis clients (0-5)';
COMMENT ON COLUMN profiles.response_rate IS 'Taux de réponse aux messages en pourcentage (0-100)';
