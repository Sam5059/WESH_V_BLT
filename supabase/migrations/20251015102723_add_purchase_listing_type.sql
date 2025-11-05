/*
  # Ajout du type "purchase" pour les demandes d'achat

  Modifie la contrainte pour autoriser le type 'purchase' (wanted/demandes)
*/

-- Supprimer l'ancienne contrainte
ALTER TABLE listings DROP CONSTRAINT IF EXISTS listings_listing_type_check;

-- Ajouter la nouvelle contrainte avec 'purchase'
ALTER TABLE listings ADD CONSTRAINT listings_listing_type_check
  CHECK (listing_type = ANY (ARRAY['sale'::text, 'rent'::text, 'service'::text, 'job'::text, 'purchase'::text]));
