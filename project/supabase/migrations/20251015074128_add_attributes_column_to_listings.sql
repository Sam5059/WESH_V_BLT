/*
  # Ajouter la colonne attributes à la table listings

  1. Modifications
    - Ajouter la colonne `attributes` de type JSONB à la table `listings`
    - Cette colonne stockera les attributs spécifiques aux catégories (marque, modèle, année, etc.)
    - Valeur par défaut: {} (objet JSON vide)

  2. Notes
    - Cette colonne est nécessaire pour stocker les informations spécifiques aux catégories
    - Utilisée pour les véhicules (marque, modèle, année, kilométrage, carburant, etc.)
    - Utilisée pour les locations (chambres, salles de bain, équipements, etc.)
*/

-- Ajouter la colonne attributes si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'listings' AND column_name = 'attributes'
  ) THEN
    ALTER TABLE listings ADD COLUMN attributes JSONB DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Créer un index sur la colonne attributes pour améliorer les performances des requêtes
CREATE INDEX IF NOT EXISTS idx_listings_attributes ON listings USING gin(attributes);
