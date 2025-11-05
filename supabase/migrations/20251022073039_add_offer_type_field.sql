/*
  # Ajout du type d'offre pour les annonces

  1. Nouveau champ
    - `offer_type` (text) : Type d'offre (sale, free, exchange, rent)

  2. Modifications
    - Ajout du champ à la table `listings`
    - Valeurs possibles :
      - 'sale' : À vendre (par défaut)
      - 'free' : À donner / Gratuit
      - 'exchange' : À échanger
      - 'rent' : À louer

  3. Utilisation
    - Permet de distinguer les annonces gratuites des ventes
    - Utile pour les animaux, meubles, livres, etc.
    - Affichage d'une étiquette différente sur la photo
*/

-- Ajouter le champ offer_type
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listings' AND column_name = 'offer_type'
  ) THEN
    ALTER TABLE listings ADD COLUMN offer_type text DEFAULT 'sale';
  END IF;
END $$;

-- Ajouter une contrainte pour valider les valeurs
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'listings_offer_type_check'
  ) THEN
    ALTER TABLE listings
    ADD CONSTRAINT listings_offer_type_check
    CHECK (offer_type IN ('sale', 'free', 'exchange', 'rent'));
  END IF;
END $$;

-- Créer un index pour améliorer les performances de recherche
CREATE INDEX IF NOT EXISTS idx_listings_offer_type
ON listings (offer_type);

-- Commenter la colonne pour la documentation
COMMENT ON COLUMN listings.offer_type IS 'Type d''offre : sale (vendre), free (donner), exchange (échanger), rent (louer)';

-- Mettre à jour les annonces de location existantes
UPDATE listings
SET offer_type = 'rent'
WHERE listing_type = 'rent' AND offer_type = 'sale';
