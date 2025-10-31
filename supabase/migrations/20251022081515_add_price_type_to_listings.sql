/*
  # Ajout du type de prix aux annonces
  
  1. Modifications
    - Ajout de la colonne `price_type` à la table `listings`
    - Valeurs possibles: 'fixed' (prix fixe), 'quote' (sur devis), 'free' (gratuit)
    - Par défaut: 'fixed'
    
  2. Catégories concernées par "sur devis":
    - Services (tous): plomberie, électricité, nettoyage, etc.
    - Emploi & Services: cours particuliers, événementiel, etc.
    - Travaux: construction, rénovation, etc.
    - Professionnels: devis personnalisés
    
  3. Logique:
    - price_type = 'quote' → Afficher "Sur devis" au lieu du prix
    - price_type = 'fixed' → Afficher le prix normal
    - price_type = 'free' → Afficher "Gratuit"
    - Le champ price peut être NULL quand price_type = 'quote' ou 'free'
*/

-- Ajouter la colonne price_type
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS price_type TEXT DEFAULT 'fixed' 
CHECK (price_type IN ('fixed', 'quote', 'free'));

-- Créer un index pour les recherches par type de prix
CREATE INDEX IF NOT EXISTS idx_listings_price_type ON listings(price_type);

-- Mettre à jour les annonces existantes selon leur catégorie
-- Services → Sur devis
UPDATE listings 
SET price_type = 'quote'
WHERE category_id IN (
  SELECT id FROM categories 
  WHERE slug LIKE '%service%' 
     OR slug LIKE '%emploi%'
     OR slug LIKE '%reparation%'
     OR slug LIKE '%maintenance%'
     OR slug LIKE '%cours%'
     OR slug LIKE '%traduction%'
     OR slug LIKE '%evenementiel%'
     OR parent_id IN (
       SELECT id FROM categories WHERE slug IN ('services', 'emploi-services')
     )
);

-- Rendre le champ price nullable pour les annonces sur devis
ALTER TABLE listings 
ALTER COLUMN price DROP NOT NULL;

-- Commentaires sur les colonnes
COMMENT ON COLUMN listings.price_type IS 'Type de tarification: fixed (prix fixe), quote (sur devis), free (gratuit)';
COMMENT ON COLUMN listings.price IS 'Prix en DA. Peut être NULL si price_type = quote ou free';
