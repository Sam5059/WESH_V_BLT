/*
  # Ajouter personnalisation du store professionnel

  1. Modifications
    - Ajouter colonnes de personnalisation au profil professionnel:
      - `store_banner_url` - URL de la bannière du store
      - `store_logo_url` - URL du logo personnalisé
      - `store_primary_color` - Couleur primaire (#HEX)
      - `store_description` - Description du business (rich text)
      - `store_opening_hours` - Horaires d'ouverture (JSON)
      - `whatsapp_number` - Numéro WhatsApp
      - `facebook_url` - Page Facebook
      - `instagram_url` - Compte Instagram
      - `website_url` - Site web externe
      - `business_category` - Catégorie de business
      - `years_in_business` - Années d'expérience
      - `store_address` - Adresse physique complète
      - `store_latitude` - Latitude pour carte
      - `store_longitude` - Longitude pour carte
      
  2. Notes
    - Tous les champs sont optionnels
    - Couleurs par défaut si non spécifiées
    - JSON structure pour horaires: {lun: "9h-18h", mar: "9h-18h", ...}
*/

-- Ajouter colonnes de personnalisation visuelle
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS store_banner_url TEXT,
ADD COLUMN IF NOT EXISTS store_logo_url TEXT,
ADD COLUMN IF NOT EXISTS store_primary_color TEXT DEFAULT '#2563EB',
ADD COLUMN IF NOT EXISTS store_description TEXT;

-- Ajouter colonnes de contact
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS whatsapp_number TEXT,
ADD COLUMN IF NOT EXISTS facebook_url TEXT,
ADD COLUMN IF NOT EXISTS instagram_url TEXT,
ADD COLUMN IF NOT EXISTS website_url TEXT;

-- Ajouter informations business
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS business_category TEXT,
ADD COLUMN IF NOT EXISTS years_in_business INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS store_opening_hours JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS store_address TEXT,
ADD COLUMN IF NOT EXISTS store_latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS store_longitude DOUBLE PRECISION;

-- Ajouter des exemples pour les professionnels existants
UPDATE profiles 
SET 
  store_description = 'Professionnel de confiance avec des années d''expérience dans le domaine. Nous offrons les meilleurs produits et services à nos clients.',
  business_category = 'Commerce Général',
  years_in_business = 5,
  store_opening_hours = '{"lundi": "9h00-18h00", "mardi": "9h00-18h00", "mercredi": "9h00-18h00", "jeudi": "9h00-18h00", "vendredi": "9h00-18h00", "samedi": "9h00-13h00", "dimanche": "Fermé"}'::jsonb
WHERE user_type = 'professional' 
AND store_description IS NULL;