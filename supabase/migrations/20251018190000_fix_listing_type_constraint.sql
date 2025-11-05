/*
  # Correction de la contrainte listing_type

  ## Description
  Rétablit la contrainte CHECK sur listing_type pour valider les valeurs
  possibles : sale, rent, purchase, service, job

  ## Modifications
  1. Supprimer l'ancienne contrainte si elle existe
  2. Ajouter la nouvelle contrainte avec toutes les valeurs valides

  ## Sécurité
  - Contrainte au niveau base de données pour garantir l'intégrité
*/

-- ============================================
-- 1. Supprimer l'ancienne contrainte
-- ============================================

ALTER TABLE listings DROP CONSTRAINT IF EXISTS listings_listing_type_check;

-- ============================================
-- 2. Ajouter la nouvelle contrainte
-- ============================================

ALTER TABLE listings ADD CONSTRAINT listings_listing_type_check
  CHECK (listing_type IN ('sale', 'rent', 'purchase', 'service', 'job'));

-- ============================================
-- 3. Commentaire
-- ============================================

COMMENT ON CONSTRAINT listings_listing_type_check ON listings IS
  'Valide que listing_type est l''une des valeurs : sale, rent, purchase, service, job';
