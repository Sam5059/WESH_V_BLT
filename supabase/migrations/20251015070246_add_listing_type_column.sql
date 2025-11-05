/*
  # Ajouter la colonne listing_type

  1. Modifications
    - Ajoute la colonne `listing_type` à la table `listings`
    - Valeurs possibles: 'sell', 'rent', 'offer'
    - Par défaut: 'sell'
*/

-- Ajouter la colonne listing_type si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listings' AND column_name = 'listing_type'
  ) THEN
    ALTER TABLE listings 
    ADD COLUMN listing_type text DEFAULT 'sell' 
    CHECK (listing_type IN ('sell', 'rent', 'offer'));
  END IF;
END $$;
