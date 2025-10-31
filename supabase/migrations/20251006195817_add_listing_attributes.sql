/*
  # Add Category-Specific Attributes to Listings

  1. Changes
    - Add `attributes` JSONB column to `listings` table
    - This will store category-specific fields like:
      - Véhicules: marque, modèle, année, kilométrage, carburant, boîte de vitesses
      - Immobilier: surface, nombre de chambres, nombre de salles de bain, étage
      - Électronique: marque, modèle, état de la batterie, capacité de stockage
      - Mode: taille, couleur, matière
      - Emploi: type de contrat, niveau d'expérience, secteur
      - etc.

  2. Notes
    - JSONB allows flexible schema for different categories
    - Indexed for better search performance
    - Default empty object for existing listings
*/

-- Add attributes column to listings table
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS attributes JSONB DEFAULT '{}';

-- Create index on attributes for faster queries
CREATE INDEX IF NOT EXISTS idx_listings_attributes ON listings USING gin(attributes);

-- Add some example data structure comments
COMMENT ON COLUMN listings.attributes IS 
'Category-specific attributes stored as JSON. Examples:
Véhicules: {"marque": "Renault", "modele": "Clio", "annee": 2020, "kilometrage": 45000, "carburant": "Essence", "boite": "Manuelle"}
Immobilier: {"surface": 120, "chambres": 3, "sdb": 2, "etage": 5}
Électronique: {"marque": "Samsung", "modele": "Galaxy S21", "stockage": "128GB", "ram": "8GB"}
Mode: {"taille": "M", "couleur": "Bleu", "matiere": "Coton"}
Emploi: {"contrat": "CDI", "experience": "3-5 ans", "secteur": "IT"}';
