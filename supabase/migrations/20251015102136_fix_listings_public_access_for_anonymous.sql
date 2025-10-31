/*
  # Correction accès public aux annonces actives

  Permet à TOUS les utilisateurs (même non connectés) de voir les annonces actives
*/

-- Supprimer l'ancienne policy restrictive
DROP POLICY IF EXISTS "Anyone can view active listings" ON listings;

-- Créer une nouvelle policy qui autorise TOUT LE MONDE à voir les annonces actives
CREATE POLICY "Public can view active listings"
  ON listings
  FOR SELECT
  TO public
  USING (status = 'active');

-- Les utilisateurs authentifiés peuvent aussi voir leurs propres annonces (tous statuts)
CREATE POLICY "Users can view own listings"
  ON listings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
